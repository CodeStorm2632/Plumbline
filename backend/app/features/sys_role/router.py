"""角色管理路由：/api/sys/roles。x-trace 回指 FR-6.2.*。"""

from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, get_session, require_perms
from app.features.sys_role import service
from app.features.sys_role.schemas import MenuAssign, RoleCreate, RoleOut, RoleUpdate

router = APIRouter(prefix="/api/sys/roles", tags=["sys_role"])

READ = require_perms("sys:role:read")
WRITE = require_perms("sys:role:write")


@router.get(
    "",
    response_model=list[RoleOut],
    operation_id="listSysRoles",
    openapi_extra={"x-trace": ["FR-6.2.1"]},
)
def list_roles(
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
    session=Depends(get_session),
    user: CurrentUser = Depends(READ),
):
    return service.list_roles(session, q=q, limit=limit, offset=offset)


@router.post(
    "",
    response_model=RoleOut,
    status_code=201,
    operation_id="createSysRole",
    openapi_extra={"x-trace": ["FR-6.2.2"]},
)
def create_role(body: RoleCreate, session=Depends(get_session), user: CurrentUser = Depends(WRITE)):
    return service.create_role(session, actor=user.name, body=body)


@router.put(
    "/{role_id}",
    response_model=RoleOut,
    operation_id="updateSysRole",
    openapi_extra={"x-trace": ["FR-6.2.2"]},
)
def update_role(
    role_id: str, body: RoleUpdate, session=Depends(get_session), user: CurrentUser = Depends(WRITE)
):
    return service.update_role(session, actor=user.name, role_id=role_id, body=body)


@router.delete(
    "/{role_id}",
    status_code=204,
    operation_id="deleteSysRole",
    openapi_extra={"x-trace": ["FR-6.2.3", "NFR-6.1"]},
)
def delete_role(role_id: str, session=Depends(get_session), user: CurrentUser = Depends(WRITE)):
    service.delete_role(session, actor=user.name, role_id=role_id)


@router.post(
    "/{role_id}/menus",
    response_model=RoleOut,
    operation_id="assignSysRoleMenus",
    openapi_extra={"x-trace": ["FR-6.2.4", "NFR-6.3"]},
)
def assign_menus(
    role_id: str, body: MenuAssign, session=Depends(get_session), user: CurrentUser = Depends(WRITE)
):
    return service.assign_menus(session, actor=user.name, role_id=role_id, body=body)
