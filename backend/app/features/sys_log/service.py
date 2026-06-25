"""日志查询 service：操作日志 + 登录日志，过滤分页 + 脱敏（FR-6.4.*, NFR-6.6）。"""

from __future__ import annotations

import re
from datetime import datetime

from sqlmodel import select

from app.core.audit.models import AuditRecord, LoginLog
from app.features.sys_log.schemas import AuditLogOut, LoginLogOut

_PHONE_RE = re.compile(r"(?<!\d)(\d{3})\d{4}(\d{4})(?!\d)")
_SENSITIVE_KEYS = {"password", "password_hash", "phone_enc", "email_enc", "token", "secret", "key"}


def _mask_payload(v):
    if isinstance(v, dict):
        return {k: ("***" if k in _SENSITIVE_KEYS else _mask_payload(val)) for k, val in v.items()}
    if isinstance(v, list):
        return [_mask_payload(x) for x in v]
    if isinstance(v, str):
        return _mask_text(v)
    return v


def _mask_text(s: str) -> str:
    """脱敏自由文本中的手机号样式串（防日志泄露明文，NFR-6.6）。"""
    return _PHONE_RE.sub(r"\1****\2", s or "")


def list_audit(
    session,
    *,
    entity_id: str | None = None,
    actor: str | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[AuditLogOut]:
    stmt = select(AuditRecord)
    if entity_id:
        stmt = stmt.where(AuditRecord.entity_id == entity_id)
    if actor:
        stmt = stmt.where(AuditRecord.actor == actor)
    if start:
        stmt = stmt.where(AuditRecord.ts >= start)
    if end:
        stmt = stmt.where(AuditRecord.ts <= end)
    stmt = stmt.order_by(AuditRecord.ts.desc()).offset(offset).limit(limit)
    rows = session.exec(stmt).all()
    out = []
    for r in rows:
        o = AuditLogOut.model_validate(r, from_attributes=True)
        o.before = _mask_payload(o.before)
        o.after = _mask_payload(o.after)
        out.append(o)
    return out


def list_login(
    session,
    *,
    username: str | None = None,
    success: bool | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[LoginLogOut]:
    stmt = select(LoginLog)
    if username:
        stmt = stmt.where(LoginLog.username == username)
    if success is not None:
        stmt = stmt.where(LoginLog.success == success)
    if start:
        stmt = stmt.where(LoginLog.ts >= start)
    if end:
        stmt = stmt.where(LoginLog.ts <= end)
    stmt = stmt.order_by(LoginLog.ts.desc()).offset(offset).limit(limit)
    rows = session.exec(stmt).all()
    out = []
    for r in rows:
        o = LoginLogOut.model_validate(r, from_attributes=True)
        o.detail = _mask_text(o.detail)  # 脱敏自由文本
        out.append(o)
    return out
