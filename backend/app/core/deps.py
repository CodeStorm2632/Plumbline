"""依赖：DB 会话 + 认证（SM2-JWT → Redis 白名单 → 角色）+ 权限守卫。"""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException, status
from sqlmodel import select

from app.core.db import get_session  # re-export
from app.core.models import not_deleted
from app.core.security import crypto
from app.core.security.rbac import has_perm_set, perms_for_roles
from app.core.store import k_token, k_user_block, store
from app.features.auth.models import User

__all__ = ["get_session", "get_current_user", "require_roles", "require_perms", "CurrentUser"]


@dataclass
class CurrentUser:
    id: str
    name: str
    roles: list[str]


def get_current_user(
    authorization: str = Header(default=""), session=Depends(get_session)
) -> CurrentUser:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "缺少 Bearer Token")
    token = authorization[7:]
    payload = crypto.verify_jwt(token)  # SM2 验签 + 过期校验
    if not payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token 无效或过期")
    jti = payload.get("jti", "")
    if store.get(k_token(jti)) != "1":  # Redis 白名单（支持即时吊销）
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token 已吊销")
    user_id = payload["sub"]
    if store.get(k_user_block(user_id)) == "1":  # 账号已禁用/删除，即时拦截
        raise HTTPException(status.HTTP_403_FORBIDDEN, "账号已禁用")
    row = session.exec(select(User).where(User.id == user_id, not_deleted(User))).first()
    if not row or row.status != "active":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "账号已禁用")
    return CurrentUser(id=row.id, name=row.username, roles=row.roles)


def require_roles(*roles: str):
    def _dep(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if "管理员" in user.roles or any(r in user.roles for r in roles):
            return user
        raise HTTPException(status.HTTP_403_FORBIDDEN, "角色不足")

    return _dep


def require_perms(*perms: str):
    def _dep(
        user: CurrentUser = Depends(get_current_user), session=Depends(get_session)
    ) -> CurrentUser:
        granted = perms_for_roles(session, user.roles)  # DB + 缓存解析按钮级权限
        if all(has_perm_set(granted, p) for p in perms):
            return user
        raise HTTPException(status.HTTP_403_FORBIDDEN, "权限不足")

    return _dep
