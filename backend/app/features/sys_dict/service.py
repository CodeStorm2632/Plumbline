"""字典管理 service：字典类型 CRUD + 字典项 CRUD + 公开下拉（FR-6.5.*）。"""

from __future__ import annotations

import secrets

from fastapi import HTTPException, status
from sqlmodel import select

from app.core.audit.service import write_audit
from app.core.models import not_deleted, soft_delete, stamp_create, stamp_update
from app.features.sys_dict.models import Dict, DictItem
from app.features.sys_dict.schemas import (
    DictCreate,
    DictItemCreate,
    DictItemOut,
    DictItemUpdate,
    DictOut,
    DictUpdate,
)


# ── 内部工具 ──────────────────────────────────────────────────────────────


def _dict_to_out(d: Dict) -> DictOut:
    return DictOut(id=d.id, code=d.code, name=d.name, remark=d.remark)


def _item_to_out(i: DictItem) -> DictItemOut:
    return DictItemOut(
        id=i.id,
        type_code=i.type_code,
        label=i.label,
        value=i.value,
        order_no=i.order_no,
        status=i.status,
    )


def _get_active_dict(session, dict_id: str) -> Dict:
    d = session.get(Dict, dict_id)
    if not d or d.is_deleted:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "字典类型不存在")
    return d


def _get_active_item(session, item_id: str) -> DictItem:
    i = session.get(DictItem, item_id)
    if not i or i.is_deleted:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "字典项不存在")
    return i


# ── 字典类型 ──────────────────────────────────────────────────────────────


def list_dicts(session, *, q: str | None = None, limit: int = 50, offset: int = 0) -> list[DictOut]:
    stmt = select(Dict).where(not_deleted(Dict))
    if q:
        stmt = stmt.where(Dict.name.contains(q))
    rows = session.exec(stmt.offset(offset).limit(limit)).all()
    return [_dict_to_out(d) for d in rows]


def create_dict(session, *, actor: str, body: DictCreate) -> DictOut:
    # 全表查重 code（含软删记录——code 有唯一索引，过滤软删会放行后撞 500）
    if session.exec(select(Dict).where(Dict.code == body.code)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "字典编码已存在")
    d = Dict(
        id=f"d-{body.code}-{secrets.token_hex(3)}",
        code=body.code,
        name=body.name,
        remark=body.remark,
    )
    stamp_create(d, actor)
    session.add(d)
    write_audit(
        session,
        entity_id=d.id,
        actor=actor,
        action="create_dict",
        after={"code": d.code, "name": d.name},
    )
    session.commit()
    session.refresh(d)
    return _dict_to_out(d)


def update_dict(session, *, actor: str, dict_id: str, body: DictUpdate) -> DictOut:
    d = _get_active_dict(session, dict_id)
    if body.name is not None:
        d.name = body.name
    if body.remark is not None:
        d.remark = body.remark
    stamp_update(d, actor)
    session.add(d)
    write_audit(session, entity_id=d.id, actor=actor, action="update_dict")
    session.commit()
    session.refresh(d)
    return _dict_to_out(d)


def delete_dict(session, *, actor: str, dict_id: str) -> None:
    """软删字典类型，并级联软删其所有字典项。"""
    d = _get_active_dict(session, dict_id)
    # 级联软删所有字典项
    items = session.exec(
        select(DictItem).where(DictItem.type_code == d.code, not_deleted(DictItem))
    ).all()
    for item in items:
        soft_delete(session, item, actor, entity_id=item.id, action="delete_dict_item_cascade")
    soft_delete(session, d, actor, entity_id=d.id, action="delete_dict")
    session.commit()


# ── 字典项 ────────────────────────────────────────────────────────────────


def list_items(session, type_code: str, *, limit: int = 100, offset: int = 0) -> list[DictItemOut]:
    stmt = (
        select(DictItem)
        .where(DictItem.type_code == type_code, not_deleted(DictItem))
        .order_by(DictItem.order_no)
    )
    rows = session.exec(stmt.offset(offset).limit(limit)).all()
    return [_item_to_out(i) for i in rows]


def create_item(session, *, actor: str, body: DictItemCreate) -> DictItemOut:
    # 确认所属字典类型存在（且未被软删）
    parent = session.exec(
        select(Dict).where(Dict.code == body.type_code, not_deleted(Dict))
    ).first()
    if not parent:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "字典类型不存在")
    item = DictItem(
        id=f"di-{body.type_code}-{secrets.token_hex(4)}",
        type_code=body.type_code,
        label=body.label,
        value=body.value,
        order_no=body.order_no,
    )
    stamp_create(item, actor)
    session.add(item)
    write_audit(
        session,
        entity_id=item.id,
        actor=actor,
        action="create_dict_item",
        after={"type_code": item.type_code, "label": item.label, "value": item.value},
    )
    session.commit()
    session.refresh(item)
    return _item_to_out(item)


def update_item(session, *, actor: str, item_id: str, body: DictItemUpdate) -> DictItemOut:
    item = _get_active_item(session, item_id)
    if body.label is not None:
        item.label = body.label
    if body.value is not None:
        item.value = body.value
    if body.order_no is not None:
        item.order_no = body.order_no
    if body.status is not None:
        item.status = body.status
    stamp_update(item, actor)
    session.add(item)
    write_audit(session, entity_id=item.id, actor=actor, action="update_dict_item")
    session.commit()
    session.refresh(item)
    return _item_to_out(item)


def delete_item(session, *, actor: str, item_id: str) -> None:
    item = _get_active_item(session, item_id)
    soft_delete(session, item, actor, entity_id=item.id, action="delete_dict_item")
    session.commit()


def get_items_by_code(session, type_code: str) -> list[DictItemOut]:
    """公开接口：仅返回 status=active 且未软删的项（FR-6.5.3）。"""
    rows = session.exec(
        select(DictItem)
        .where(
            DictItem.type_code == type_code,
            DictItem.status == "active",
            not_deleted(DictItem),
        )
        .order_by(DictItem.order_no)
    ).all()
    return [_item_to_out(i) for i in rows]
