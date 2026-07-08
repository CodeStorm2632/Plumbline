"""Menu model and schemas."""

import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from app.models.base import created_at_field, pk_field, updated_at_field
from app.models.link import RoleMenu


class MenuBase(SQLModel):
    parent_id: uuid.UUID | None = Field(default=None, foreign_key="menu.id")
    name: str = Field(max_length=64)
    menu_type: str = Field(max_length=16)  # DIR / MENU / BTN
    permission: str | None = Field(default=None, max_length=128)
    path: str | None = Field(default=None, max_length=255)
    component: str | None = Field(default=None, max_length=255)
    icon: str | None = Field(default=None, max_length=64)
    sort_order: int = Field(default=0)
    visible: bool = Field(default=True)
    status: int = Field(default=1)  # 1=active, 0=disabled


class Menu(MenuBase, table=True):
    id: uuid.UUID = pk_field()
    created_at: datetime | None = created_at_field()
    updated_at: datetime | None = updated_at_field()

    children: list["Menu"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    parent: Optional["Menu"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "Menu.id"},
    )
    roles: list["Role"] = Relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="menus", link_model=RoleMenu,
    )


class MenuCreate(SQLModel):
    parent_id: uuid.UUID | None = None
    name: str = Field(min_length=1, max_length=64)
    menu_type: str = Field(max_length=16)  # DIR / MENU / BTN
    permission: str | None = None
    path: str | None = None
    component: str | None = None
    icon: str | None = None
    sort_order: int = 0
    visible: bool = True
    status: int = 1


class MenuUpdate(SQLModel):
    parent_id: uuid.UUID | None = None
    name: str | None = None
    menu_type: str | None = None
    permission: str | None = None
    path: str | None = None
    component: str | None = None
    icon: str | None = None
    sort_order: int | None = None
    visible: bool | None = None
    status: int | None = None


class MenuPublic(SQLModel):
    id: uuid.UUID
    parent_id: uuid.UUID | None = None
    name: str
    menu_type: str
    permission: str | None = None
    path: str | None = None
    component: str | None = None
    icon: str | None = None
    sort_order: int
    visible: bool
    status: int
    created_at: datetime | None = None
    children: list["MenuPublic"] = []
