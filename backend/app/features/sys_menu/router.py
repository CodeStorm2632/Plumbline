"""菜单管理路由：/api/sys/menus。x-trace 回指 FR-6.3.*。"""

from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, get_current_user, get_session, require_perms
from app.features.sys_menu import service
from app.features.sys_menu.schemas import MenuCreate, MenuOut, MenuUpdate

router = APIRouter(prefix="/api/sys/menus", tags=["sys_menu"])

READ = require_perms("sys:menu:read")
WRITE = require_perms("sys:menu:write")


@router.get(
    "",
    response_model=list[MenuOut],
    operation_id="listSysMenus",
    openapi_extra={"x-trace": ["FR-6.3.1"]},
)
def list_menus(session=Depends(get_session), user: CurrentUser = Depends(READ)):
    return service.list_menus(session)


@router.get(
    "/my",
    response_model=list[MenuOut],
    operation_id="listMySysMenus",
    openapi_extra={"x-trace": ["FR-6.3.5", "NFR-6.3"]},
)
def list_my_menus(session=Depends(get_session), user: CurrentUser = Depends(get_current_user)):
    return service.list_menus_for_roles(session, roles=user.roles)


@router.post(
    "",
    response_model=MenuOut,
    status_code=201,
    operation_id="createSysMenu",
    openapi_extra={"x-trace": ["FR-6.3.2", "FR-6.3.4"]},
)
def create_menu(body: MenuCreate, session=Depends(get_session), user: CurrentUser = Depends(WRITE)):
    return service.create_menu(session, actor=user.name, body=body)


@router.put(
    "/{menu_id}",
    response_model=MenuOut,
    operation_id="updateSysMenu",
    openapi_extra={"x-trace": ["FR-6.3.2", "FR-6.3.4", "NFR-6.3"]},
)
def update_menu(
    menu_id: str, body: MenuUpdate, session=Depends(get_session), user: CurrentUser = Depends(WRITE)
):
    return service.update_menu(session, actor=user.name, menu_id=menu_id, body=body)


@router.delete(
    "/{menu_id}",
    status_code=204,
    operation_id="deleteSysMenu",
    openapi_extra={"x-trace": ["FR-6.3.3", "NFR-6.1", "NFR-6.3"]},
)
def delete_menu(menu_id: str, session=Depends(get_session), user: CurrentUser = Depends(WRITE)):
    service.delete_menu(session, actor=user.name, menu_id=menu_id)
