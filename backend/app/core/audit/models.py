from datetime import datetime

from sqlmodel import JSON, Column, Field, SQLModel


class AuditRecord(SQLModel, table=True):       # 操作日志（只增不改）
    id: int | None = Field(default=None, primary_key=True)
    entity_id: str = Field(index=True)
    actor: str
    action: str
    reason: str = ""
    before: dict = Field(default_factory=dict, sa_column=Column(JSON))
    after: dict = Field(default_factory=dict, sa_column=Column(JSON))
    ts: datetime = Field(default_factory=datetime.utcnow, index=True)


class LoginLog(SQLModel, table=True):          # 登录日志
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    success: bool
    ip: str = ""
    user_agent: str = ""
    detail: str = ""
    ts: datetime = Field(default_factory=datetime.utcnow, index=True)
