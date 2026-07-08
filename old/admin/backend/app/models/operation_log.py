"""Operation log model."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Text
from sqlmodel import Field, SQLModel

from app.models.base import get_datetime_utc, pk_field


class OperationLog(SQLModel, table=True):
    __tablename__ = "operation_log"  # type: ignore[assignment]
    id: uuid.UUID = pk_field()
    user_id: uuid.UUID | None = Field(default=None)
    username: str | None = Field(default=None, max_length=64)
    module: str = Field(max_length=64)
    action: str = Field(max_length=64)
    method: str = Field(max_length=10)
    url: str = Field(max_length=500)
    ip: str | None = Field(default=None, max_length=45)
    request_params: str | None = Field(default=None, sa_type=Text)  # SM4 encrypted
    response_code: int | None = Field(default=None)
    error_msg: str | None = Field(default=None, sa_type=Text)
    cost_time_ms: int | None = Field(default=None)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )


class OperationLogPublic(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID | None = None
    username: str | None = None
    module: str
    action: str
    method: str
    url: str
    ip: str | None = None
    request_params: str | None = None  # decrypted for display
    response_code: int | None = None
    error_msg: str | None = None
    cost_time_ms: int | None = None
    created_at: datetime | None = None
