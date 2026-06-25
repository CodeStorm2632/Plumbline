"""角色管理 入/出 DTO。"""

from pydantic import BaseModel, Field


class RoleOut(BaseModel):
    id: str
    code: str
    name: str
    remark: str = ""
    menu_ids: list[str] = []  # 该角色已授予的菜单/权限 id


class RoleCreate(BaseModel):
    code: str = Field(min_length=1)
    name: str = Field(min_length=1)
    remark: str = ""


class RoleUpdate(BaseModel):
    name: str | None = None
    remark: str | None = None


class MenuAssign(BaseModel):
    menu_ids: list[str]
