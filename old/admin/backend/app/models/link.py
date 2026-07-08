"""Association / link table models for many-to-many relationships."""

import uuid

from sqlmodel import Field, SQLModel


class UserRole(SQLModel, table=True):
    __tablename__ = "user_role"  # type: ignore[assignment]
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True, ondelete="CASCADE")
    role_id: uuid.UUID = Field(foreign_key="role.id", primary_key=True, ondelete="CASCADE")


class RoleMenu(SQLModel, table=True):
    __tablename__ = "role_menu"  # type: ignore[assignment]
    role_id: uuid.UUID = Field(foreign_key="role.id", primary_key=True, ondelete="CASCADE")
    menu_id: uuid.UUID = Field(foreign_key="menu.id", primary_key=True, ondelete="CASCADE")
