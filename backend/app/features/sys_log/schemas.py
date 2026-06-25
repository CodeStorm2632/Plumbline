"""日志查询 出参 DTO（只读）。"""

from datetime import datetime

from pydantic import BaseModel


class AuditLogOut(BaseModel):
    id: int
    entity_id: str
    actor: str
    action: str
    reason: str
    before: dict
    after: dict
    ts: datetime


class LoginLogOut(BaseModel):
    id: int
    username: str
    success: bool
    ip: str
    user_agent: str
    detail: str  # 已脱敏
    ts: datetime
