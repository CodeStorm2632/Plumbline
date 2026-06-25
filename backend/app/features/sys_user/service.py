"""用户管理 service：写→审计 三段式；敏感字段加密落库 + 脱敏出参 + 信封入参；软删除。"""

from __future__ import annotations

import secrets

from fastapi import HTTPException, status
from sqlmodel import select

from app.core.audit.service import write_audit
from app.core.models import not_deleted, soft_delete, stamp_create, stamp_update
from app.core.security import crypto
from app.core.security.envelope import open_field
from app.core.security.masking import mask_email, mask_phone
from app.core.security.rbac import data_scope
from app.features.auth.models import User
from app.features.auth.service import revoke_user
from app.features.sys_user.schemas import (
    PasswordReset,
    RoleAssign,
    StatusUpdate,
    SysUserCreate,
    SysUserOut,
    SysUserUpdate,
)


def _to_out(u: User) -> SysUserOut:
    return SysUserOut(
        id=u.id,
        username=u.username,
        roles=u.roles,
        status=u.status,
        phone=mask_phone(crypto.decrypt_field(u.phone_enc)),
        email=mask_email(crypto.decrypt_field(u.email_enc)),
    )


def _get_active(session, user_id: str) -> User:
    u = session.get(User, user_id)
    if not u or u.is_deleted:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "用户不存在")
    return u


def list_users(
    session,
    *,
    actor_roles: list[str],
    actor_id: str,
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[SysUserOut]:
    stmt = select(User).where(not_deleted(User))
    if q:
        stmt = stmt.where(User.username.contains(q))
    scope = data_scope(actor_roles, actor_id)  # 水平越权：非管理员仅本人
    if scope.get("owner_or_assignee"):
        stmt = stmt.where(User.id == scope["owner_or_assignee"])
    rows = session.exec(stmt.offset(offset).limit(limit)).all()
    return [_to_out(r) for r in rows]


def create_user(session, *, actor: str, body: SysUserCreate) -> SysUserOut:
    # 全表查重（含软删用户）——username 有唯一索引不区分 is_deleted，不查等于放行后撞 500
    if session.exec(select(User).where(User.username == body.username)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "用户名已存在")
    u = User(
        id=f"u-{secrets.token_hex(4)}",
        username=body.username,
        password_hash=crypto.hash_password(body.password),
        phone_enc=crypto.encrypt_field(open_field(body.phone)),  # 解信封→SM4 密文落库
        email_enc=crypto.encrypt_field(open_field(body.email)),
        roles_csv=",".join(body.roles),
        status="active",
    )
    stamp_create(u, actor)
    session.add(u)
    # 审计不落敏感明文（NFR 安全约定）：仅记用户名与角色
    write_audit(
        session,
        entity_id=u.id,
        actor=actor,
        action="create_user",
        after={"username": u.username, "roles": u.roles},
    )
    session.commit()
    session.refresh(u)
    return _to_out(u)


def update_user(session, *, actor: str, user_id: str, body: SysUserUpdate) -> SysUserOut:
    u = _get_active(session, user_id)
    if body.phone is not None:
        u.phone_enc = crypto.encrypt_field(open_field(body.phone))
    if body.email is not None:
        u.email_enc = crypto.encrypt_field(open_field(body.email))
    stamp_update(u, actor)
    session.add(u)
    write_audit(session, entity_id=u.id, actor=actor, action="update_user")
    session.commit()
    session.refresh(u)
    return _to_out(u)


def reset_password(session, *, actor: str, user_id: str, body: PasswordReset) -> SysUserOut:
    u = _get_active(session, user_id)
    u.password_hash = crypto.hash_password(body.password)
    stamp_update(u, actor)
    session.add(u)
    write_audit(session, entity_id=u.id, actor=actor, action="reset_password")  # 不记口令
    session.commit()
    session.refresh(u)
    return _to_out(u)


def set_status(session, *, actor: str, user_id: str, body: StatusUpdate) -> SysUserOut:
    u = _get_active(session, user_id)
    before = u.status
    u.status = body.status
    stamp_update(u, actor)
    session.add(u)
    write_audit(
        session,
        entity_id=u.id,
        actor=actor,
        action="set_status",
        before={"status": before},
        after={"status": u.status},
    )
    session.commit()
    if u.status == "disabled":
        revoke_user(u.id)  # 持有 Token 的用户立即被拦截（FR-6.1.5）
    session.refresh(u)
    return _to_out(u)


def assign_roles(session, *, actor: str, user_id: str, body: RoleAssign) -> SysUserOut:
    u = _get_active(session, user_id)
    before = u.roles
    u.roles_csv = ",".join(body.roles)
    stamp_update(u, actor)
    session.add(u)
    write_audit(
        session,
        entity_id=u.id,
        actor=actor,
        action="assign_roles",
        before={"roles": before},
        after={"roles": u.roles},
    )
    session.commit()
    session.refresh(u)
    return _to_out(u)


def delete_user(session, *, actor: str, user_id: str) -> None:
    u = _get_active(session, user_id)
    soft_delete(session, u, actor, entity_id=u.id, action="delete_user")  # 逻辑删除+审计
    session.commit()
    revoke_user(u.id)
