"""字典管理入/出 DTO（FR-6.5.1 / FR-6.5.2 / FR-6.5.3）。"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# ── 字典类型 ──────────────────────────────────────────────────────────────


class DictOut(BaseModel):
    id: str
    code: str
    name: str
    remark: str = ""


class DictCreate(BaseModel):
    code: str = Field(min_length=1)
    name: str = Field(min_length=1)
    remark: str = ""


class DictUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    remark: str | None = None


# ── 字典项 ────────────────────────────────────────────────────────────────


class DictItemOut(BaseModel):
    id: str
    type_code: str
    label: str
    value: str
    order_no: int = 0
    status: str = "active"


class DictItemCreate(BaseModel):
    type_code: str = Field(min_length=1)
    label: str = Field(min_length=1)
    value: str = Field(min_length=1)
    order_no: int = 0


class DictItemUpdate(BaseModel):
    label: str | None = Field(default=None, min_length=1)
    value: str | None = Field(default=None, min_length=1)
    order_no: int | None = None
    status: Literal["active", "disabled"] | None = None
