"""Permission and data scope dependency injection factories."""

import uuid
from typing import Annotated

from fastapi import Depends

from app.api.deps import CurrentUser, SessionDep
from app.core.exceptions import BusinessException
from app.crud.permission import get_user_permissions, get_user_roles


def require_permission(permission_code: str):
    """Dependency factory: require a specific permission code."""

    async def _check(
        current_user: CurrentUser,
        session: SessionDep,
    ) -> None:
        if current_user.is_superadmin:
            return
        user_perms = get_user_permissions(session, current_user.id)
        if permission_code not in user_perms:
            raise BusinessException(403, f"无权限: {permission_code}")

    return Depends(_check)


def get_data_scope_filter():
    """Dependency: return data scope filter based on user's roles.

    Returns a dict with:
      - scope: "ALL" or "SELF"
      - user_id: UUID of the current user (for SELF filtering)
    """

    async def _get_scope(
        current_user: CurrentUser,
        session: SessionDep,
    ) -> dict:
        if current_user.is_superadmin:
            return {"scope": "ALL", "user_id": current_user.id}

        roles = get_user_roles(session, current_user.id)
        # Multiple roles: take the widest scope
        scopes = {r.data_scope for r in roles}
        if "ALL" in scopes:
            return {"scope": "ALL", "user_id": current_user.id}
        return {"scope": "SELF", "user_id": current_user.id}

    return Depends(_get_scope)


DataScopeFilter = Annotated[dict, get_data_scope_filter()]
