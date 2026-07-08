"""System Role management routes."""

import uuid

from fastapi import APIRouter, Request
from pydantic import BaseModel
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, PaginationDep, SessionDep
from app.api.permission import require_permission
from app.core.audit import log_operation
from app.core.exceptions import BusinessException
from app.models.base import get_datetime_utc
from app.models.link import RoleMenu, UserRole
from app.models.role import Role, RoleCreate, RolePublic, RoleUpdate
from app.schemas.response import PageResponseModel, ResponseModel, page_response, success

router = APIRouter(prefix="/system/roles", tags=["system-roles"])


@router.get(
    "",
    response_model=PageResponseModel[RolePublic],
    dependencies=[require_permission("sys:role:list")],
)
async def list_roles(
    session: SessionDep,
    pagination: PaginationDep,
    name: str | None = None,
    code: str | None = None,
    status: int | None = None,
) -> PageResponseModel[RolePublic]:
    """List roles with pagination and filters."""
    stmt = select(Role)
    count_stmt = select(func.count()).select_from(Role)

    if name:
        stmt = stmt.where(col(Role.name).contains(name))
        count_stmt = count_stmt.where(col(Role.name).contains(name))
    if code:
        stmt = stmt.where(col(Role.code).contains(code))
        count_stmt = count_stmt.where(col(Role.code).contains(code))
    if status is not None:
        stmt = stmt.where(Role.status == status)
        count_stmt = count_stmt.where(Role.status == status)

    total = session.exec(count_stmt).one()
    roles = session.exec(
        stmt.offset(pagination.offset).limit(pagination.size).order_by(Role.sort_order)
    ).all()

    items = [
        RolePublic(
            id=r.id, name=r.name, code=r.code, data_scope=r.data_scope,
            status=r.status, sort_order=r.sort_order, remark=r.remark,
            created_at=r.created_at,
        )
        for r in roles
    ]
    return page_response(items=items, total=total, page=pagination.page, size=pagination.size)


@router.post(
    "",
    response_model=ResponseModel[RolePublic],
    dependencies=[require_permission("sys:role:add")],
)
@log_operation("角色管理", "新增角色")
async def create_role(
    body: RoleCreate,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[RolePublic]:
    """Create a new role."""
    existing = session.exec(select(Role).where(Role.code == body.code)).first()
    if existing:
        raise BusinessException(409, "角色标识已存在")

    role = Role(
        name=body.name,
        code=body.code,
        data_scope=body.data_scope,
        status=body.status,
        sort_order=body.sort_order,
        remark=body.remark,
        created_by=current_user.id,
    )
    session.add(role)
    session.flush()

    # Assign menus
    for mid in body.menu_ids:
        session.add(RoleMenu(role_id=role.id, menu_id=mid))
    session.commit()
    session.refresh(role)

    return success(RolePublic(
        id=role.id, name=role.name, code=role.code, data_scope=role.data_scope,
        status=role.status, sort_order=role.sort_order, remark=role.remark,
        created_at=role.created_at,
    ))


@router.get(
    "/{role_id}",
    response_model=ResponseModel[dict],
    dependencies=[require_permission("sys:role:list")],
)
async def get_role(
    role_id: uuid.UUID,
    session: SessionDep,
) -> ResponseModel[dict]:
    """Get role detail with assigned menu IDs."""
    role = session.get(Role, role_id)
    if not role:
        raise BusinessException(404, "角色不存在")

    menu_ids_stmt = select(RoleMenu.menu_id).where(RoleMenu.role_id == role_id)
    menu_ids = list(session.exec(menu_ids_stmt).all())

    return success({
        "id": str(role.id),
        "name": role.name,
        "code": role.code,
        "data_scope": role.data_scope,
        "status": role.status,
        "sort_order": role.sort_order,
        "remark": role.remark,
        "created_at": role.created_at.isoformat() if role.created_at else None,
        "menu_ids": [str(mid) for mid in menu_ids],
    })


@router.put(
    "/{role_id}",
    response_model=ResponseModel[None],
    dependencies=[require_permission("sys:role:edit")],
)
@log_operation("角色管理", "编辑角色")
async def update_role(
    role_id: uuid.UUID,
    body: RoleUpdate,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[None]:
    """Update a role."""
    role = session.get(Role, role_id)
    if not role:
        raise BusinessException(404, "角色不存在")

    if body.name is not None:
        role.name = body.name
    if body.code is not None:
        # Check uniqueness if code changed
        if body.code != role.code:
            existing = session.exec(select(Role).where(Role.code == body.code)).first()
            if existing:
                raise BusinessException(409, "角色标识已存在")
        role.code = body.code
    if body.data_scope is not None:
        role.data_scope = body.data_scope
    if body.status is not None:
        role.status = body.status
    if body.sort_order is not None:
        role.sort_order = body.sort_order
    if body.remark is not None:
        role.remark = body.remark

    role.updated_at = get_datetime_utc()
    session.add(role)
    session.commit()
    return success(message="角色更新成功")


@router.delete(
    "/{role_id}",
    response_model=ResponseModel[None],
    dependencies=[require_permission("sys:role:del")],
)
@log_operation("角色管理", "删除角色")
async def delete_role(
    role_id: uuid.UUID,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[None]:
    """Delete a role."""
    role = session.get(Role, role_id)
    if not role:
        raise BusinessException(404, "角色不存在")

    # Check if role has users
    user_count = session.exec(
        select(func.count()).select_from(UserRole).where(UserRole.role_id == role_id)
    ).one()
    if user_count > 0:
        raise BusinessException(400, "该角色已绑定用户，不可删除")

    # Check if it's a built-in role
    if role.code == "superadmin":
        raise BusinessException(400, "不可删除内置角色")

    # Remove menu links
    old_links = session.exec(
        select(RoleMenu).where(RoleMenu.role_id == role_id)
    ).all()
    for link in old_links:
        session.delete(link)

    session.delete(role)
    session.commit()
    return success(message="角色删除成功")


class AssignMenusBody(BaseModel):
    menu_ids: list[uuid.UUID] = []


@router.put(
    "/{role_id}/menus",
    response_model=ResponseModel[None],
    dependencies=[require_permission("sys:role:menu")],
)
@log_operation("角色管理", "分配菜单权限")
async def assign_menus(
    role_id: uuid.UUID,
    body: AssignMenusBody,
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[None]:
    """Assign menus to a role (full replacement)."""
    role = session.get(Role, role_id)
    if not role:
        raise BusinessException(404, "角色不存在")

    # Remove old menu links
    old_links = session.exec(
        select(RoleMenu).where(RoleMenu.role_id == role_id)
    ).all()
    for link in old_links:
        session.delete(link)

    # Add new menu links
    for mid in body.menu_ids:
        session.add(RoleMenu(role_id=role_id, menu_id=mid))

    session.commit()
    return success(message="菜单权限分配成功")
