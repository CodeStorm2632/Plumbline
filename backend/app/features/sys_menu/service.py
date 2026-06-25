"""菜单管理 service：树形 CRUD + 级联软删 + 按钮权限缓存失效（FR-6.3.*）。"""

from __future__ import annotations

import secrets

from fastapi import HTTPException, status
from sqlmodel import select

from app.core.audit.service import write_audit
from app.core.models import not_deleted, stamp_create, stamp_update
from app.core.rbac.models import Menu
from app.core.security.rbac import invalidate_perms
from app.features.sys_menu.schemas import MenuCreate, MenuOut, MenuUpdate


def _to_out(m: Menu) -> MenuOut:
    return MenuOut.model_validate(m)


def _get_active(session, menu_id: str) -> Menu:
    m = session.get(Menu, menu_id)
    if not m or m.is_deleted:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "菜单节点不存在")
    return m


def _validate_parent(session, parent_id: str | None, *, self_id: str | None = None) -> None:
    if not parent_id:
        return
    if parent_id == self_id:
        raise HTTPException(status.HTTP_409_CONFLICT, "父节点不能是自身")
    _get_active(session, parent_id)
    if self_id and any(x.id == parent_id for x in _all_descendants(session, self_id)):
        raise HTTPException(status.HTTP_409_CONFLICT, "父节点不能是自身子节点")


def _build_tree(flat: list[Menu]) -> list[MenuOut]:
    nodes: dict[str, MenuOut] = {m.id: _to_out(m) for m in flat}
    roots: list[MenuOut] = []
    for m in flat:
        out = nodes[m.id]
        if m.parent_id and m.parent_id in nodes:
            nodes[m.parent_id].children.append(out)
        else:
            roots.append(out)

    def sort_tree(items: list[MenuOut]) -> list[MenuOut]:
        items.sort(key=lambda x: x.order_no)
        for item in items:
            sort_tree(item.children)
        return items

    return sort_tree(roots)


def _all_descendants(session, parent_id: str) -> list[Menu]:
    result: list[Menu] = []
    queue = [parent_id]
    while queue:
        pid = queue.pop()
        children = session.exec(select(Menu).where(Menu.parent_id == pid, not_deleted(Menu))).all()
        for c in children:
            result.append(c)
            queue.append(c.id)
    return result


def list_menus(session) -> list[MenuOut]:
    rows = session.exec(select(Menu).where(not_deleted(Menu))).all()
    return _build_tree(list(rows))


def create_menu(session, *, actor: str, body: MenuCreate) -> MenuOut:
    if session.exec(select(Menu).where(Menu.code == body.code)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "菜单码已存在")
    _validate_parent(session, body.parent_id)
    m = Menu(
        id=f"m-{body.code}-{secrets.token_hex(3)}",
        code=body.code,
        name=body.name,
        parent_id=body.parent_id,
        type=body.type,
        perm_code=body.perm_code,
        path=body.path,
        icon=body.icon,
        order_no=body.order_no,
    )
    stamp_create(m, actor)
    session.add(m)
    write_audit(
        session,
        entity_id=m.id,
        actor=actor,
        action="create_menu",
        after={"code": m.code, "name": m.name, "type": m.type},
    )
    session.commit()
    session.refresh(m)
    return _to_out(m)


def update_menu(session, *, actor: str, menu_id: str, body: MenuUpdate) -> MenuOut:
    m = _get_active(session, menu_id)
    old_type, old_perm = m.type, m.perm_code
    if body.parent_id is not None:
        _validate_parent(session, body.parent_id, self_id=menu_id)
        m.parent_id = body.parent_id
    if body.name is not None:
        m.name = body.name
    if body.type is not None:
        m.type = body.type
    if body.perm_code is not None:
        m.perm_code = body.perm_code
    if m.type != "button":
        m.perm_code = None
    if body.path is not None:
        m.path = body.path
    if body.icon is not None:
        m.icon = body.icon
    if body.order_no is not None:
        m.order_no = body.order_no
    changed_perm = old_type != m.type or old_perm != m.perm_code
    stamp_update(m, actor)
    session.add(m)
    write_audit(session, entity_id=m.id, actor=actor, action="update_menu")
    session.commit()
    session.refresh(m)
    if changed_perm:
        invalidate_perms(None)
    return _to_out(m)


def delete_menu(session, *, actor: str, menu_id: str) -> None:
    root = _get_active(session, menu_id)
    descendants = _all_descendants(session, menu_id)
    targets = [root] + descendants
    has_button_perms = any(n.type == "button" and n.perm_code for n in targets)
    before_summary = [{"id": n.id, "code": n.code, "is_deleted": n.is_deleted} for n in targets]

    for node in targets:
        node.is_deleted = True
        stamp_update(node, actor)
        session.add(node)

    write_audit(
        session,
        entity_id=menu_id,
        actor=actor,
        action="delete_menu",
        before={"nodes": before_summary},
        after={"deleted_count": len(targets)},
    )
    session.commit()
    if has_button_perms:
        invalidate_perms(None)
