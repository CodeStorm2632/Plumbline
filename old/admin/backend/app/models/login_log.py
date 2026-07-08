"""Login log model."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel

from app.models.base import get_datetime_utc, pk_field


class LoginLog(SQLModel, table=True):
    __tablename__ = "login_log"  # type: ignore[assignment]
    id: uuid.UUID = pk_field()
    username: str = Field(max_length=64, index=True)
    ip: str | None = Field(default=None, max_length=45)
    browser: str | None = Field(default=None, max_length=128)
    os: str | None = Field(default=None, max_length=128)
    status: int = Field(default=1)  # 1=success, 0=fail
    fail_reason: str | None = Field(default=None, max_length=255)
    login_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )


class LoginLogPublic(SQLModel):
    id: uuid.UUID
    username: str
    ip: str | None = None
    browser: str | None = None
    os: str | None = None
    status: int
    fail_reason: str | None = None
    login_at: datetime | None = None
