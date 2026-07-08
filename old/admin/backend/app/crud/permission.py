"""User permission helper: collect all permission codes for a user."""

import uuid

from sqlmodel import Session, select

from app.models.link import RoleMenu, UserRole
from app.models.menu import Menu
from app.models.role import Role


def get_user_permissions(session: Session, user_id: uuid.UUID) -> set[str]:
    """Collect all permission codes for a user via User→UserRole→Role→RoleMenu→Menu."""
    stmt = (
        select(Menu.permission)
        .join(RoleMenu, RoleMenu.menu_id == Menu.id)
        .join(Role, Role.id == RoleMenu.role_id)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
        .where(Role.status == 1)
        .where(Menu.status == 1)
        .where(Menu.permission.isnot(None))  # type: ignore[union-attr]
    )
    results = session.exec(stmt).all()
    return {p for p in results if p}


def get_user_roles(session: Session, user_id: uuid.UUID) -> list[Role]:
    """Get all active roles for a user."""
    stmt = (
        select(Role)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
        .where(Role.status == 1)
    )
    return list(session.exec(stmt).all())


def get_user_menus(session: Session, user_id: uuid.UUID) -> list[Menu]:
    """Get all menus accessible to a user (DIR + MENU only, for sidebar)."""
    stmt = (
        select(Menu)
        .join(RoleMenu, RoleMenu.menu_id == Menu.id)
        .join(Role, Role.id == RoleMenu.role_id)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
        .where(Role.status == 1)
        .where(Menu.status == 1)
        .where(Menu.menu_type.in_(["DIR", "MENU"]))  # type: ignore[union-attr]
        .where(Menu.visible == True)  # noqa: E712
    )
    menus = list(session.exec(stmt).all())
    # Deduplicate
    seen: set[uuid.UUID] = set()
    unique: list[Menu] = []
    for m in menus:
        if m.id not in seen:
            seen.add(m.id)
            unique.append(m)
    return unique


def build_menu_tree(menus: list[Menu]) -> list[dict]:
    """Convert flat menu list to nested tree structure."""
    menu_map: dict[uuid.UUID, dict] = {}
    for m in menus:
        menu_map[m.id] = {
            "id": str(m.id),
            "parent_id": str(m.parent_id) if m.parent_id else None,
            "name": m.name,
            "menu_type": m.menu_type,
            "permission": m.permission,
            "path": m.path,
            "component": m.component,
            "icon": m.icon,
            "sort_order": m.sort_order,
            "visible": m.visible,
            "status": m.status,
            "children": [],
        }

    roots: list[dict] = []
    for m in menus:
        node = menu_map[m.id]
        if m.parent_id and m.parent_id in menu_map:
            menu_map[m.parent_id]["children"].append(node)
        else:
            roots.append(node)

    def sort_children(nodes: list[dict]) -> None:
        nodes.sort(key=lambda x: x["sort_order"])
        for n in nodes:
            sort_children(n["children"])

    sort_children(roots)
    return roots
