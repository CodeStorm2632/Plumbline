"""角色管理 service：CRUD（软删）+ 分配菜单/权限（写后失效权限缓存，NFR-6.3）。"""

from __future__ import annotations

import secrets

from fastapi import HTTPException, status
from sqlmodel import select

from app.core.audit.service import write_audit
from app.core.models import not_deleted, soft_delete, stamp_create, stamp_update
from app.core.rbac.models import Menu, Role, RoleMenu
from app.core.security.rbac import invalidate_perms
from app.features.auth.models import User
from app.features.sys_role.schemas import MenuAssign, RoleCreate, RoleOut, RoleUpdate


def _menu_ids(session, role_id: str) -> list[str]:
    return list(session.exec(select(RoleMenu.menu_id).where(RoleMenu.role_id == role_id)).all())


def _to_out(session, r: Role) -> RoleOut:
    return RoleOut(
        id=r.id, code=r.code, name=r.name, remark=r.remark, menu_ids=_menu_ids(session, r.id)
    )


def _get_active(session, role_id: str) -> Role:
    r = session.get(Role, role_id)
    if not r or r.is_deleted:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "角色不存在")
    return r


def list_roles(session, *, q: str | None = None, limit: int = 50, offset: int = 0) -> list[RoleOut]:
    stmt = select(Role).where(not_deleted(Role))
    if q:
        stmt = stmt.where(Role.name.contains(q))
    rows = session.exec(stmt.offset(offset).limit(limit)).all()
    return [_to_out(session, r) for r in rows]


def create_role(session, *, actor: str, body: RoleCreate) -> RoleOut:
    # 全表查重（含软删角色）——code 有唯一索引不区分 is_deleted，过滤软删会放行后撞 500
    if session.exec(select(Role).where(Role.code == body.code)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "角色码已存在")
    # PK 用随机后缀，避免软删后同 code 重建时 PK 碰撞
    r = Role(
        id=f"r-{body.code}-{secrets.token_hex(3)}",
        code=body.code,
        name=body.name,
        remark=body.remark,
    )
    stamp_create(r, actor)
    session.add(r)
    write_audit(
        session,
        entity_id=r.id,
        actor=actor,
        action="create_role",
        after={"code": r.code, "name": r.name},
    )
    session.commit()
    session.refresh(r)
    return _to_out(session, r)


def update_role(session, *, actor: str, role_id: str, body: RoleUpdate) -> RoleOut:
    r = _get_active(session, role_id)
    if body.name is not None:
        r.name = body.name
    if body.remark is not None:
        r.remark = body.remark
    stamp_update(r, actor)
    session.add(r)
    write_audit(session, entity_id=r.id, actor=actor, action="update_role")
    session.commit()
    session.refresh(r)
    return _to_out(session, r)


def delete_role(session, *, actor: str, role_id: str) -> None:
    r = _get_active(session, role_id)
    # 被用户引用时给出提示，不直接删（FR-6.2.3）
    in_use = session.exec(select(User).where(not_deleted(User))).all()
    if any(r.code in u.roles for u in in_use):
        raise HTTPException(status.HTTP_409_CONFLICT, "角色已被用户引用，无法删除")
    soft_delete(session, r, actor, entity_id=r.id, action="delete_role")
    invalidate_perms(r.code)
    session.commit()


def assign_menus(session, *, actor: str, role_id: str, body: MenuAssign) -> RoleOut:
    r = _get_active(session, role_id)
    valid = (
        set(
            session.exec(select(Menu.id).where(Menu.id.in_(body.menu_ids), not_deleted(Menu))).all()
        )
        if body.menu_ids
        else set()
    )
    before = _menu_ids(session, r.id)
    for rm in session.exec(select(RoleMenu).where(RoleMenu.role_id == r.id)).all():
        session.delete(rm)
    for mid in valid:
        session.add(RoleMenu(role_id=r.id, menu_id=mid))
    stamp_update(r, actor)
    session.add(r)
    write_audit(
        session,
        entity_id=r.id,
        actor=actor,
        action="assign_menus",
        before={"menu_ids": before},
        after={"menu_ids": sorted(valid)},
    )
    invalidate_perms(r.code)  # 权限即时生效（失效缓存）
    session.commit()
    session.refresh(r)
    return _to_out(session, r)
