"""系统表公共基类与软删除/审计字段约定（NFR-6.1 / NFR-6.2）。

所有 `features/sys_*` 的表继承 `SysBase`，统一带：
  - 审计字段四件套：created_at / updated_at / created_by / updated_by
  - 软删除标记：is_deleted（逻辑删除，保留原始数据，绝不物理删）

查询统一用 `not_deleted(Model)` 过滤；写操作用 stamp_*；删除用 soft_delete（连带审计）。
"""

from __future__ import annotations

from datetime import datetime

from sqlmodel import Field, SQLModel

from app.core.audit.service import write_audit


class SysBase(SQLModel):
    """非 table 的混入基类。子表 `class X(SysBase, table=True)` 继承本字段集。"""

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str | None = None
    updated_by: str | None = None
    is_deleted: bool = Field(default=False, index=True)


def not_deleted(model):
    """软删除过滤条件：`select(Model).where(not_deleted(Model))`。"""
    return model.is_deleted == False  # noqa: E712


def stamp_create(obj, actor: str):
    """新建时填创建人/更新人。"""
    obj.created_by = actor
    obj.updated_by = actor
    return obj


def stamp_update(obj, actor: str):
    """更新时刷新 updated_at 并记更新人。"""
    obj.updated_at = datetime.utcnow()
    obj.updated_by = actor
    return obj


def _redact_audit_payload(data: dict) -> dict:
    redacted = dict(data)
    for key in ("password_hash", "phone_enc", "email_enc"):
        if key in redacted:
            redacted[key] = "***"
    return redacted


def soft_delete(session, obj, actor: str, *, entity_id: str, action: str = "delete"):
    """逻辑删除：置 is_deleted + 记更新人 + 写审计（只增不改）。不物理删除。"""
    before = _redact_audit_payload(obj.model_dump(mode="json"))
    obj.is_deleted = True
    stamp_update(obj, actor)
    session.add(obj)
    write_audit(
        session,
        entity_id=entity_id,
        actor=actor,
        action=action,
        before=before,
        after=_redact_audit_payload(obj.model_dump(mode="json")),
    )
    return obj
