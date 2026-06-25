"""登录编排：验证码 → 锁定检查 → 状态检查 → 验密 → 发 JWT → 白名单 → 审计。"""

from __future__ import annotations

import secrets

from fastapi import HTTPException, status
from sqlmodel import select

from app.core.audit.service import write_login
from app.core.config import settings
from app.core.models import not_deleted
from app.core.security import crypto
from app.core.security.captcha import verify_captcha
from app.core.security.masking import mask_email, mask_phone
from app.core.store import k_lock, k_token, k_user_block, store
from app.features.auth.models import User
from app.features.auth.schemas import TokenOut, UserOut


def login(session, req, *, ip: str = "", ua: str = "") -> TokenOut:
    # 1) 验证码
    if not verify_captcha(req.captcha_id, req.captcha_code):
        write_login(session, username=req.username, ok=False, ip=ip, ua=ua, detail="验证码错误")
        session.commit()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "验证码错误或过期")

    # 2) 锁定检查
    fails = int(store.get(k_lock(req.username)) or 0)
    if fails >= settings.MAX_FAILED:
        write_login(session, username=req.username, ok=False, ip=ip, ua=ua, detail="账户锁定")
        session.commit()
        raise HTTPException(
            status.HTTP_423_LOCKED,
            f"连续失败 {settings.MAX_FAILED} 次，账户锁定 {settings.LOCK_MINUTES} 分钟",
        )

    # 3) 验密
    user = session.exec(
        select(User).where(User.username == req.username, not_deleted(User))
    ).first()
    if not user or not crypto.verify_password(req.password, user.password_hash):
        n = store.incr(k_lock(req.username), ttl=settings.LOCK_MINUTES * 60)
        write_login(
            session,
            username=req.username,
            ok=False,
            ip=ip,
            ua=ua,
            detail=f"密码错误({n}/{settings.MAX_FAILED})",
        )
        session.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "用户名或密码错误")

    # 4) 状态检查（禁用账号拒绝登录，FR-6.1.5）
    if user.status != "active":
        write_login(session, username=req.username, ok=False, ip=ip, ua=ua, detail="账号已禁用")
        session.commit()
        raise HTTPException(status.HTTP_403_FORBIDDEN, "账号已禁用")

    # 5) 成功：清零失败计数，发 JWT，写白名单
    store.delete(k_lock(req.username))
    jti = secrets.token_urlsafe(12)
    token = crypto.sign_jwt(
        {"sub": user.id, "name": user.username, "roles": user.roles, "jti": jti},
        ttl=settings.JWT_TTL,
    )
    store.set(k_token(jti), "1", ttl=settings.JWT_TTL)
    write_login(session, username=req.username, ok=True, ip=ip, ua=ua)
    session.commit()
    return TokenOut(access_token=token, roles=user.roles)


def revoke_user(user_id: str) -> None:
    """立即禁止已持有 Token 访问（set_status 禁用时调用）。
    写 block 标记到 store；get_current_user 在白名单验证前先检查此标记。"""
    store.set(k_user_block(user_id), "1", ttl=settings.JWT_TTL)


def logout(token: str) -> None:
    payload = crypto.verify_jwt(token)
    if payload and payload.get("jti"):
        store.delete(k_token(payload["jti"]))  # 即时吊销


def me(user) -> UserOut:
    return UserOut(id=user.id, username=user.name, roles=user.roles)


def me_full(session, user) -> UserOut:
    row = session.get(User, user.id)
    return UserOut(
        id=row.id,
        username=row.username,
        roles=row.roles,
        phone=mask_phone(crypto.decrypt_field(row.phone_enc)),
        email=mask_email(crypto.decrypt_field(row.email_enc)),
    )
