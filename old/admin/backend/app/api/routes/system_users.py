"""System User management routes."""

import uuid

from fastapi import APIRouter, Request
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, PaginationDep, RedisDep, SessionDep
from app.api.permission import DataScopeFilter, require_permission
from app.core.audit import log_operation
from app.core.exceptions import BusinessException
from app.core.masking import mask_email, mask_phone
from app.core.password_policy import validate_password_strength
from app.core.security import hash_password
from app.core.sm4 import sm4_decrypt, sm4_encrypt
from app.core.token_store import revoke_all_user_tokens
from app.models.base import get_datetime_utc
from app.models.link import UserRole
from app.models.role import Role, RolePublic
from app.models.user import (
    ResetPassword,
    User,
    UserCreate,
    UserPublic,
    UserUpdate,
)
from app.schemas.response import PageResponseModel, ResponseModel, page_response, success

router = APIRouter(prefix="/system/users", tags=["system-users"])


@router.get(
    "",
    response_model=PageResponseModel[UserPublic],
    dependencies=[require_permission("sys:user:list")],
)
async def list_users(
    session: SessionDep,
    pagination: PaginationDep,
    data_scope: DataScopeFilter,
    username: str | None = None,
    status: int | None = None,
    phone: str | None = None,
) -> PageResponseModel[UserPublic]:
    """List users with pagination and filters."""
    stmt = select(User)
    count_stmt = select(func.count()).select_from(User)

    if data_scope["scope"] == "SELF":
        stmt = stmt.where(User.created_by == data_scope["user_id"])
        count_stmt = count_stmt.where(User.created_by == data_scope["user_id"])
    if username:
        stmt = stmt.where(col(User.username).contains(username))
        count_stmt = count_stmt.where(col(User.username).contains(username))
    if status is not None:
        stmt = stmt.where(User.status == status)
        count_stmt = count_stmt.where(User.status == status)

    total = session.exec(count_stmt).one()
    users = session.exec(
        stmt.offset(pagination.offset).limit(pagination.size).order_by(User.created_at)
    ).all()

    items = []
    for u in users:
        # Fetch roles for this user
        role_stmt = (
            select(Role)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == u.id)
        )
        user_roles = session.exec(role_stmt).all()
        roles_public = [
            RolePublic(
                id=r.id,
                name=r.name,
                code=r.code,
                data_scope=r.data_scope,
                status=r.status,
                sort_order=r.sort_order,
                remark=r.remark,
                created_at=r.created_at,
            )
            for r in user_roles
        ]
        items.append(UserPublic(
            id=u.id,
            username=u.username,
            real_name=u.real_name,
            email=mask_email(sm4_decrypt(u.email)) if u.email else None,
            phone=mask_phone(sm4_decrypt(u.phone)) if u.phone else None,
            avatar=u.avatar,
            status=u.status,
            is_superadmin=u.is_superadmin,
            created_at=u.created_at,
            roles=roles_public,
        ))

    return page_response(items=items, total=total, page=pagination.page, size=pagination.size)


@router.post(
    "",
    response_model=ResponseModel[UserPublic],
    dependencies=[require_permission("sys:user:add")],
)
@log_operation("用户管理", "新增用户")
async def create_user(
    body: UserCreate,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[UserPublic]:
    """Create a new user."""
    # Check username uniqueness
    existing = session.exec(
        select(User).where(User.username == body.username)
    ).first()
    if existing:
        raise BusinessException(409, "用户名已存在")

    # Validate password
    error = validate_password_strength(body.password)
    if error:
        raise BusinessException(422, error)

    user = User(
        username=body.username,
        password_hash=hash_password(body.password),
        real_name=body.real_name,
        email=sm4_encrypt(body.email) if body.email else None,
        phone=sm4_encrypt(body.phone) if body.phone else None,
        avatar=body.avatar,
        status=body.status,
        created_by=current_user.id,
    )
    session.add(user)
    session.flush()

    # Assign roles
    for rid in body.role_ids:
        role = session.get(Role, rid)
        if role:
            session.add(UserRole(user_id=user.id, role_id=rid))
    session.commit()
    session.refresh(user)

    return success(UserPublic(
        id=user.id, username=user.username, real_name=user.real_name,
        email=mask_email(body.email) if body.email else None,
        phone=mask_phone(body.phone) if body.phone else None,
        avatar=user.avatar, status=user.status, is_superadmin=user.is_superadmin,
        created_at=user.created_at,
    ))


@router.get(
    "/{user_id}",
    response_model=ResponseModel[dict],
    dependencies=[require_permission("sys:user:list")],
)
async def get_user(
    user_id: uuid.UUID,
    session: SessionDep,
) -> ResponseModel[dict]:
    """Get user detail with role list."""
    user = session.get(User, user_id)
    if not user:
        raise BusinessException(404, "用户不存在")

    role_ids_stmt = select(UserRole.role_id).where(UserRole.user_id == user_id)
    role_ids = list(session.exec(role_ids_stmt).all())

    return success({
        "id": str(user.id),
        "username": user.username,
        "real_name": user.real_name,
        "email": sm4_decrypt(user.email) if user.email else None,
        "phone": sm4_decrypt(user.phone) if user.phone else None,
        "avatar": user.avatar,
        "status": user.status,
        "is_superadmin": user.is_superadmin,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "role_ids": [str(rid) for rid in role_ids],
    })


@router.put(
    "/{user_id}",
    response_model=ResponseModel[None],
    dependencies=[require_permission("sys:user:edit")],
)
@log_operation("用户管理", "编辑用户")
async def update_user(
    user_id: uuid.UUID,
    body: UserUpdate,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[None]:
    """Update a user."""
    user = session.get(User, user_id)
    if not user:
        raise BusinessException(404, "用户不存在")
    if user.is_superadmin and user.id != current_user.id:
        raise BusinessException(403, "不可编辑其他超级管理员")

    if body.real_name is not None:
        user.real_name = body.real_name
    if body.email is not None:
        user.email = sm4_encrypt(body.email) if body.email else None
    if body.phone is not None:
        user.phone = sm4_encrypt(body.phone) if body.phone else None
    if body.avatar is not None:
        user.avatar = body.avatar
    if body.status is not None:
        user.status = body.status
    user.updated_at = get_datetime_utc()
    session.add(user)

    # Update roles if provided
    if body.role_ids is not None:
        # Remove old roles
        old_links = session.exec(
            select(UserRole).where(UserRole.user_id == user_id)
        ).all()
        for link in old_links:
            session.delete(link)
        # Add new roles
        for rid in body.role_ids:
            session.add(UserRole(user_id=user_id, role_id=rid))

    session.commit()
    return success(message="用户更新成功")


@router.delete(
    "/{user_id}",
    response_model=ResponseModel[None],
    dependencies=[require_permission("sys:user:del")],
)
@log_operation("用户管理", "删除用户")
async def delete_user(
    user_id: uuid.UUID,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[None]:
    """Delete a user."""
    user = session.get(User, user_id)
    if not user:
        raise BusinessException(404, "用户不存在")
    if user.id == current_user.id:
        raise BusinessException(400, "不可删除自身账户")
    if user.is_superadmin:
        raise BusinessException(400, "不可删除超级管理员")

    # Remove role links
    old_links = session.exec(
        select(UserRole).where(UserRole.user_id == user_id)
    ).all()
    for link in old_links:
        session.delete(link)

    session.delete(user)
    session.commit()
    return success(message="用户删除成功")


@router.put(
    "/{user_id}/reset-password",
    response_model=ResponseModel[None],
    dependencies=[require_permission("sys:user:resetPwd")],
)
@log_operation("用户管理", "重置密码")
async def reset_password(
    user_id: uuid.UUID,
    body: ResetPassword,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
    redis: RedisDep,
) -> ResponseModel[None]:
    """Reset a user's password."""
    user = session.get(User, user_id)
    if not user:
        raise BusinessException(404, "用户不存在")

    error = validate_password_strength(body.new_password)
    if error:
        raise BusinessException(422, error)

    user.password_hash = hash_password(body.new_password)
    user.updated_at = get_datetime_utc()
    session.add(user)
    session.commit()

    # Revoke all tokens for this user
    await revoke_all_user_tokens(redis, str(user_id))

    return success(message="密码重置成功")


@router.put(
    "/{user_id}/status",
    response_model=ResponseModel[None],
    dependencies=[require_permission("sys:user:edit")],
)
@log_operation("用户管理", "修改用户状态")
async def change_user_status(
    user_id: uuid.UUID,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
    redis: RedisDep,
    status: int = 1,
) -> ResponseModel[None]:
    """Enable/disable a user."""
    user = session.get(User, user_id)
    if not user:
        raise BusinessException(404, "用户不存在")
    if user.is_superadmin:
        raise BusinessException(400, "不可修改超级管理员状态")

    user.status = status
    user.updated_at = get_datetime_utc()
    session.add(user)
    session.commit()

    # If disabled, revoke all tokens
    if status == 0:
        await revoke_all_user_tokens(redis, str(user_id))

    return success(message="用户状态更新成功")
