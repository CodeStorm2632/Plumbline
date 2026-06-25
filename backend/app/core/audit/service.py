"""审计：操作日志 + 登录日志（只增不改，NFR-4）。"""
from __future__ import annotations

from app.core.audit.models import AuditRecord, LoginLog


def write_audit(session, *, entity_id: str, actor: str, action: str,
                reason: str = "", before: dict | None = None, after: dict | None = None) -> None:
    session.add(AuditRecord(entity_id=entity_id, actor=actor, action=action,
                            reason=reason, before=before or {}, after=after or {}))


def write_login(session, *, username: str, ok: bool, ip: str = "", ua: str = "",
                detail: str = "") -> None:
    session.add(LoginLog(username=username, success=ok, ip=ip, user_agent=ua, detail=detail))
