"""Role model and schemas."""

import uuid
from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel

from app.models.base import created_at_field, pk_field, updated_at_field
from app.models.link import RoleMenu, UserRole


class RoleBase(SQLModel):
    name: str = Field(max_length=64)
    code: str = Field(unique=True, index=True, max_length=64)
    data_scope: str = Field(default="SELF", max_length=16)  # ALL / SELF
    status: int = Field(default=1)  # 1=active, 0=disabled
    sort_order: int = Field(default=0)
    remark: str | None = Field(default=None, max_length=255)


class Role(RoleBase, table=True):
    id: uuid.UUID = pk_field()
    created_at: datetime | None = created_at_field()
    updated_at: datetime | None = updated_at_field()
    created_by: uuid.UUID | None = Field(default=None)

    users: list["User"] = Relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="roles", link_model=UserRole,
    )
    menus: list["Menu"] = Relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="roles", link_model=RoleMenu,
    )


class RoleCreate(SQLModel):
    name: str = Field(min_length=1, max_length=64)
    code: str = Field(min_length=1, max_length=64)
    data_scope: str = "SELF"
    status: int = 1
    sort_order: int = 0
    remark: str | None = None
    menu_ids: list[uuid.UUID] = []


class RoleUpdate(SQLModel):
    name: str | None = None
    code: str | None = None
    data_scope: str | None = None
    status: int | None = None
    sort_order: int | None = None
    remark: str | None = None


class RolePublic(SQLModel):
    id: uuid.UUID
    name: str
    code: str
    data_scope: str
    status: int
    sort_order: int
    remark: str | None = None
    created_at: datetime | None = None
