"""用户管理路由：/api/sys/users。按钮级权限守卫 + x-trace 回指 FR-6.1.*。"""

from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, get_session, require_perms
from app.features.sys_user import service
from app.features.sys_user.schemas import (
    PasswordReset,
    RoleAssign,
    StatusUpdate,
    SysUserCreate,
    SysUserOut,
    SysUserUpdate,
)

router = APIRouter(prefix="/api/sys/users", tags=["sys_user"])

READ = require_perms("sys:user:read")
WRITE = require_perms("sys:user:write")


@router.get(
    "",
    response_model=list[SysUserOut],
    operation_id="listSysUsers",
    openapi_extra={"x-trace": ["FR-6.1.1", "NFR-6.6"]},
)
def list_users(
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
    session=Depends(get_session),
    user: CurrentUser = Depends(READ),
):
    return service.list_users(
        session, actor_roles=user.roles, actor_id=user.id, q=q, limit=limit, offset=offset
    )


@router.post(
    "",
    response_model=SysUserOut,
    status_code=201,
    operation_id="createSysUser",
    openapi_extra={"x-trace": ["FR-6.1.2", "NFR-6.5", "NFR-6.7"]},
)
def create_user(
    body: SysUserCreate, session=Depends(get_session), user: CurrentUser = Depends(WRITE)
):
    return service.create_user(session, actor=user.name, body=body)


@router.put(
    "/{user_id}",
    response_model=SysUserOut,
    operation_id="updateSysUser",
    openapi_extra={"x-trace": ["FR-6.1.3", "NFR-6.5"]},
)
def update_user(
    user_id: str,
    body: SysUserUpdate,
    session=Depends(get_session),
    user: CurrentUser = Depends(WRITE),
):
    return service.update_user(session, actor=user.name, user_id=user_id, body=body)


@router.post(
    "/{user_id}/password",
    response_model=SysUserOut,
    operation_id="resetSysUserPassword",
    openapi_extra={"x-trace": ["FR-6.1.4"]},
)
def reset_password(
    user_id: str,
    body: PasswordReset,
    session=Depends(get_session),
    user: CurrentUser = Depends(WRITE),
):
    return service.reset_password(session, actor=user.name, user_id=user_id, body=body)


@router.post(
    "/{user_id}/status",
    response_model=SysUserOut,
    operation_id="setSysUserStatus",
    openapi_extra={"x-trace": ["FR-6.1.5", "NFR-6.4"]},
)
def set_status(
    user_id: str,
    body: StatusUpdate,
    session=Depends(get_session),
    user: CurrentUser = Depends(WRITE),
):
    return service.set_status(session, actor=user.name, user_id=user_id, body=body)


@router.delete(
    "/{user_id}",
    status_code=204,
    operation_id="deleteSysUser",
    openapi_extra={"x-trace": ["FR-6.1.6", "NFR-6.1"]},
)
def delete_user(user_id: str, session=Depends(get_session), user: CurrentUser = Depends(WRITE)):
    service.delete_user(session, actor=user.name, user_id=user_id)


@router.post(
    "/{user_id}/roles",
    response_model=SysUserOut,
    operation_id="assignSysUserRoles",
    openapi_extra={"x-trace": ["FR-6.1.7"]},
)
def assign_roles(
    user_id: str, body: RoleAssign, session=Depends(get_session), user: CurrentUser = Depends(WRITE)
):
    return service.assign_roles(session, actor=user.name, user_id=user_id, body=body)
