"""菜单管理入/出 DTO（FR-6.3.*）。"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, model_validator

MenuType = Literal["dir", "menu", "button"]


class MenuOut(BaseModel):
    id: str
    code: str
    name: str
    parent_id: str | None = None
    type: str
    perm_code: str | None = None
    path: str | None = None
    icon: str | None = None
    order_no: int = 0
    children: list["MenuOut"] = []

    model_config = {"from_attributes": True}


class MenuCreate(BaseModel):
    code: str = Field(min_length=1)
    name: str = Field(min_length=1)
    parent_id: str | None = None
    type: MenuType = "menu"
    perm_code: str | None = None
    path: str | None = None
    icon: str | None = None
    order_no: int = 0

    @model_validator(mode="after")
    def validate_perm_code(self):
        if self.type == "button" and not self.perm_code:
            raise ValueError("按钮节点必须填写 perm_code")
        if self.type != "button":
            self.perm_code = None
        return self


class MenuUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    parent_id: str | None = None
    type: MenuType | None = None
    perm_code: str | None = Field(default=None, min_length=1)
    path: str | None = None
    icon: str | None = None
    order_no: int | None = None

    @model_validator(mode="after")
    def validate_perm_code(self):
        if self.type == "button" and not self.perm_code:
            raise ValueError("按钮节点必须填写 perm_code")
        if self.type in {"dir", "menu"}:
            self.perm_code = None
        return self
