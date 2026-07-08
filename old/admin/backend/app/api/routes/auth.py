"""Authentication routes: captcha, login, logout, me."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Request
from sqlmodel import select

from app.api.deps import CurrentUser, RedisDep, SessionDep
from app.core.captcha import generate_captcha, verify_captcha
from app.core.exceptions import BusinessException
from app.core.jwt import create_token, verify_token
from app.core.masking import mask_email, mask_phone
from app.core.password_policy import validate_password_strength
from app.core.security import hash_password, verify_password
from app.core.sm2_crypto import get_sm2_public_key_hex, sm2_decrypt as sm2_dec
from app.core.sm4 import sm4_decrypt, sm4_encrypt
from app.core.token_store import (
    revoke_other_tokens,
    revoke_token,
    store_token,
)
from app.crud.login_log import record_login_log
from app.crud.permission import (
    build_menu_tree,
    get_user_menus,
    get_user_permissions,
    get_user_roles,
)
from app.models.base import get_datetime_utc
from app.models.user import UpdateMe, UpdatePassword, User
from app.schemas.auth import (
    CaptchaResponse,
    LoginRequest,
    TokenResponse,
    UserMeResponse,
)
from app.schemas.response import ResponseModel, success

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/captcha", response_model=ResponseModel[CaptchaResponse])
async def get_captcha(redis: RedisDep) -> ResponseModel[CaptchaResponse]:
    """Generate a CAPTCHA image."""
    captcha_id, captcha_image = await generate_captcha(redis)
    return success(CaptchaResponse(captcha_id=captcha_id, captcha_image=captcha_image))


@router.get("/sm2-public-key", response_model=ResponseModel[dict])
async def get_sm2_public_key() -> ResponseModel[dict]:
    """Return the server SM2 public key (x‖y hex) for login encryption."""
    return success({"public_key": get_sm2_public_key_hex()})


@router.post("/login", response_model=ResponseModel[TokenResponse])
async def login(
    body: LoginRequest,
    request: Request,
    session: SessionDep,
    redis: RedisDep,
) -> ResponseModel[TokenResponse]:
    """Login with username, password, and captcha (SM2 encrypted)."""
    from app.core.config import settings

    # 0. Decrypt SM2-encrypted credentials
    try:
        username = sm2_dec(body.username)
        password = sm2_dec(body.password)
    except Exception:
        raise BusinessException(400, "请求数据解密失败")

    # 1. Verify captcha
    if not await verify_captcha(redis, body.captcha_id, body.captcha_code):
        raise BusinessException(400, "验证码错误或已过期")

    # 2. Find user
    user = session.exec(
        select(User).where(User.username == username)
    ).first()
    if not user:
        record_login_log(session, request, username, 0, "用户不存在")
        raise BusinessException(401, "用户名或密码错误")

    # 3. Check account lock
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        record_login_log(session, request, username, 0, "账户已锁定")
        raise BusinessException(403, "账户已锁定，请稍后再试")

    # 4. Check disabled
    if user.status == 0:
        record_login_log(session, request, username, 0, "账户已禁用")
        raise BusinessException(403, "账户已被禁用")

    # 5. Verify password
    if not verify_password(password, user.password_hash):
        user.login_fail_count += 1
        if user.login_fail_count >= settings.LOGIN_MAX_FAILURES:
            user.locked_until = datetime.now(timezone.utc) + timedelta(
                minutes=settings.LOGIN_LOCK_MINUTES
            )
            record_login_log(session, request, username, 0, "密码错误-账户已锁定")
        else:
            record_login_log(session, request, username, 0, "密码错误")
        session.add(user)
        session.commit()
        raise BusinessException(401, "用户名或密码错误")

    # 6. Login success — reset fail count
    user.login_fail_count = 0
    user.locked_until = None
    user.last_login_ip = request.client.host if request.client else None
    user.last_login_at = get_datetime_utc()
    session.add(user)
    session.commit()

    # 7. Generate JWT + store in Redis
    jti = str(uuid.uuid4())
    token = create_token(str(user.id), jti)
    await store_token(redis, str(user.id), jti)

    # 8. Record login log
    record_login_log(session, request, username, 1)

    return success(TokenResponse(access_token=token))


@router.post("/logout", response_model=ResponseModel[None])
async def logout(
    current_user: CurrentUser,
    redis: RedisDep,
    request: Request,
) -> ResponseModel[None]:
    """Logout: revoke current token."""
    from fastapi.security import HTTPBearer

    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        token_str = auth[7:]
        payload = verify_token(token_str)
        if payload and payload.get("jti"):
            await revoke_token(redis, str(current_user.id), payload["jti"])
    return success(message="登出成功")


@router.get("/me", response_model=ResponseModel[UserMeResponse])
async def get_me(
    current_user: CurrentUser,
    session: SessionDep,
) -> ResponseModel[UserMeResponse]:
    """Get current user info with roles, permissions, and menu tree."""
    roles = get_user_roles(session, current_user.id)

    if current_user.is_superadmin:
        # Superadmin gets all permissions
        from sqlmodel import select as sel

        from app.models.menu import Menu

        all_menus = list(session.exec(sel(Menu).where(Menu.status == 1)).all())
        permissions = {m.permission for m in all_menus if m.permission}
        sidebar_menus = [m for m in all_menus if m.menu_type in ("DIR", "MENU") and m.visible]
    else:
        permissions = get_user_permissions(session, current_user.id)
        sidebar_menus = get_user_menus(session, current_user.id)

    menu_tree = build_menu_tree(sidebar_menus)

    return success(UserMeResponse(
        id=current_user.id,
        username=current_user.username,
        real_name=current_user.real_name,
        email=mask_email(sm4_decrypt(current_user.email)) if current_user.email else None,
        phone=mask_phone(sm4_decrypt(current_user.phone)) if current_user.phone else None,
        avatar=current_user.avatar,
        is_superadmin=current_user.is_superadmin,
        roles=[r.code for r in roles],
        permissions=sorted(permissions),
        menus=menu_tree,
    ))


@router.put("/me", response_model=ResponseModel[None])
async def update_me(
    body: UpdateMe,
    current_user: CurrentUser,
    session: SessionDep,
) -> ResponseModel[None]:
    """Update current user's profile."""
    if body.real_name is not None:
        current_user.real_name = body.real_name
    if body.email is not None:
        current_user.email = sm4_encrypt(body.email) if body.email else None
    if body.phone is not None:
        current_user.phone = sm4_encrypt(body.phone) if body.phone else None
    if body.avatar is not None:
        current_user.avatar = body.avatar
    current_user.updated_at = get_datetime_utc()
    session.add(current_user)
    session.commit()
    return success(message="个人信息更新成功")


@router.put("/me/password", response_model=ResponseModel[None])
async def change_password(
    body: UpdatePassword,
    current_user: CurrentUser,
    session: SessionDep,
    redis: RedisDep,
    request: Request,
) -> ResponseModel[None]:
    """Change current user's password."""
    if not verify_password(body.current_password, current_user.password_hash):
        raise BusinessException(400, "原密码错误")

    error = validate_password_strength(body.new_password)
    if error:
        raise BusinessException(422, error)

    current_user.password_hash = hash_password(body.new_password)
    current_user.updated_at = get_datetime_utc()
    session.add(current_user)
    session.commit()

    # Revoke other tokens, keep current
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        payload = verify_token(auth[7:])
        if payload and payload.get("jti"):
            await revoke_other_tokens(redis, str(current_user.id), payload["jti"])

    return success(message="密码修改成功")
