"""Base model utilities shared across all models."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlmodel import Field


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


def uuid_pk() -> uuid.UUID:
    return uuid.uuid4()


# Common field factories
def pk_field() -> uuid.UUID:
    return Field(default_factory=uuid_pk, primary_key=True)  # type: ignore[call-overload]


def created_at_field() -> datetime | None:
    return Field(  # type: ignore[call-overload]
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )


def updated_at_field() -> datetime | None:
    return Field(  # type: ignore[call-overload]
        default=None,
        sa_type=DateTime(timezone=True),
    )
