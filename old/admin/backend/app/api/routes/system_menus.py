"""System Menu management routes."""

import uuid

from fastapi import APIRouter, Request
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.api.permission import require_permission
from app.core.audit import log_operation
from app.core.exceptions import BusinessException
from app.crud.permission import build_menu_tree
from app.models.base import get_datetime_utc
from app.models.link import RoleMenu
from app.models.menu import Menu, MenuCreate, MenuPublic, MenuUpdate
from app.schemas.response import ResponseModel, success

router = APIRouter(prefix="/system/menus", tags=["system-menus"])


@router.get(
    "",
    response_model=ResponseModel[list[dict]],
    dependencies=[require_permission("sys:menu:list")],
)
async def list_menus(
    session: SessionDep,
) -> ResponseModel[list[dict]]:
    """Get all menus as a tree."""
    menus = list(session.exec(select(Menu).order_by(Menu.sort_order)).all())
    tree = build_menu_tree(menus)
    return success(tree)


@router.post(
    "",
    response_model=ResponseModel[MenuPublic],
    dependencies=[require_permission("sys:menu:add")],
)
@log_operation("菜单管理", "新增菜单")
async def create_menu(
    body: MenuCreate,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[MenuPublic]:
    """Create a new menu."""
    # Hierarchy validation
    if body.parent_id:
        parent = session.get(Menu, body.parent_id)
        if not parent:
            raise BusinessException(404, "父菜单不存在")
        if parent.menu_type == "BTN":
            raise BusinessException(400, "不可在按钮下创建子菜单")
    if body.menu_type == "BTN" and body.parent_id:
        parent = session.get(Menu, body.parent_id)
        if parent and parent.menu_type != "MENU":
            raise BusinessException(400, "按钮必须挂在菜单下")

    menu = Menu(
        parent_id=body.parent_id,
        name=body.name,
        menu_type=body.menu_type,
        permission=body.permission,
        path=body.path,
        component=body.component,
        icon=body.icon,
        sort_order=body.sort_order,
        visible=body.visible,
        status=body.status,
    )
    session.add(menu)
    session.commit()
    session.refresh(menu)

    return success(MenuPublic(
        id=menu.id, parent_id=menu.parent_id, name=menu.name,
        menu_type=menu.menu_type, permission=menu.permission,
        path=menu.path, component=menu.component, icon=menu.icon,
        sort_order=menu.sort_order, visible=menu.visible, status=menu.status,
        created_at=menu.created_at,
    ))


@router.put(
    "/{menu_id}",
    response_model=ResponseModel[None],
    dependencies=[require_permission("sys:menu:edit")],
)
@log_operation("菜单管理", "编辑菜单")
async def update_menu(
    menu_id: uuid.UUID,
    body: MenuUpdate,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[None]:
    """Update a menu."""
    menu = session.get(Menu, menu_id)
    if not menu:
        raise BusinessException(404, "菜单不存在")

    # Circular reference check
    if body.parent_id is not None:
        if body.parent_id == menu_id:
            raise BusinessException(400, "不可将自身设为父菜单")
        # Check if target parent is a descendant of this menu
        if _is_descendant(session, menu_id, body.parent_id):
            raise BusinessException(400, "检测到循环引用")

    if body.parent_id is not None:
        menu.parent_id = body.parent_id
    if body.name is not None:
        menu.name = body.name
    if body.menu_type is not None:
        menu.menu_type = body.menu_type
    if body.permission is not None:
        menu.permission = body.permission
    if body.path is not None:
        menu.path = body.path
    if body.component is not None:
        menu.component = body.component
    if body.icon is not None:
        menu.icon = body.icon
    if body.sort_order is not None:
        menu.sort_order = body.sort_order
    if body.visible is not None:
        menu.visible = body.visible
    if body.status is not None:
        menu.status = body.status
    menu.updated_at = get_datetime_utc()

    session.add(menu)
    session.commit()
    return success(message="菜单更新成功")


@router.delete(
    "/{menu_id}",
    response_model=ResponseModel[None],
    dependencies=[require_permission("sys:menu:del")],
)
@log_operation("菜单管理", "删除菜单")
async def delete_menu(
    menu_id: uuid.UUID,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[None]:
    """Delete a menu."""
    menu = session.get(Menu, menu_id)
    if not menu:
        raise BusinessException(404, "菜单不存在")

    # Check children
    child_count = session.exec(
        select(func.count()).select_from(Menu).where(Menu.parent_id == menu_id)
    ).one()
    if child_count > 0:
        raise BusinessException(400, "该菜单含有子菜单，不可删除")

    # Check role references
    role_ref_count = session.exec(
        select(func.count()).select_from(RoleMenu).where(RoleMenu.menu_id == menu_id)
    ).one()
    if role_ref_count > 0:
        raise BusinessException(400, "该菜单已被角色引用，不可删除")

    session.delete(menu)
    session.commit()
    return success(message="菜单删除成功")


def _is_descendant(session, ancestor_id: uuid.UUID, target_id: uuid.UUID) -> bool:
    """Check if target_id is a descendant of ancestor_id."""
    visited: set[uuid.UUID] = set()
    queue = [target_id]
    while queue:
        current_id = queue.pop(0)
        if current_id in visited:
            continue
        visited.add(current_id)
        menu = session.get(Menu, current_id)
        if not menu or not menu.parent_id:
            continue
        if menu.parent_id == ancestor_id:
            return True
        queue.append(menu.parent_id)
    return False
