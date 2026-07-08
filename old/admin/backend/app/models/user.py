"""User model and schemas."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.models.base import created_at_field, pk_field, updated_at_field
from app.models.link import UserRole
from app.models.role import RolePublic


class UserBase(SQLModel):
    username: str = Field(unique=True, index=True, max_length=64)
    real_name: str | None = Field(default=None, max_length=64)
    email: str | None = Field(default=None, max_length=255)  # SM4 encrypted
    phone: str | None = Field(default=None, max_length=255)  # SM4 encrypted
    avatar: str | None = Field(default=None, max_length=500)
    status: int = Field(default=1)  # 1=active, 0=disabled
    is_superadmin: bool = Field(default=False)


class User(UserBase, table=True):
    id: uuid.UUID = pk_field()
    password_hash: str = Field(max_length=500)
    login_fail_count: int = Field(default=0)
    locked_until: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    last_login_ip: str | None = Field(default=None, max_length=45)
    last_login_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    created_at: datetime | None = created_at_field()
    updated_at: datetime | None = updated_at_field()
    created_by: uuid.UUID | None = Field(default=None)

    roles: list["Role"] = Relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="users", link_model=UserRole,
    )


class UserCreate(SQLModel):
    username: str = Field(min_length=2, max_length=64)
    password: str = Field(min_length=8, max_length=128)
    real_name: str | None = Field(default=None, max_length=64)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=32)
    avatar: str | None = Field(default=None, max_length=500)
    status: int = 1
    role_ids: list[uuid.UUID] = []


class UserUpdate(SQLModel):
    real_name: str | None = None
    email: str | None = None
    phone: str | None = None
    avatar: str | None = None
    status: int | None = None
    role_ids: list[uuid.UUID] | None = None


class UserPublic(SQLModel):
    id: uuid.UUID
    username: str
    real_name: str | None = None
    email: str | None = None  # masked
    phone: str | None = None  # masked
    avatar: str | None = None
    status: int
    is_superadmin: bool
    created_at: datetime | None = None
    roles: list[RolePublic] = []


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class ResetPassword(SQLModel):
    new_password: str = Field(min_length=8, max_length=128)


class UpdateMe(SQLModel):
    real_name: str | None = None
    email: str | None = None
    phone: str | None = None
    avatar: str | None = None
