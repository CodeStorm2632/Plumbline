"""字典管理表模型（FR-6.5.1 / FR-6.5.2）。"""

from __future__ import annotations

from sqlmodel import Field

from app.core.models import SysBase


class Dict(SysBase, table=True):
    """字典类型表。"""

    __tablename__ = "sys_dict"

    id: str = Field(primary_key=True)
    code: str = Field(index=True, unique=True)
    name: str
    remark: str = ""


class DictItem(SysBase, table=True):
    """字典项表，隶属某字典类型（通过 type_code 关联）。"""

    __tablename__ = "sys_dict_item"

    id: str = Field(primary_key=True)
    type_code: str = Field(index=True)  # 关联 Dict.code
    label: str
    value: str
    order_no: int = 0
    status: str = "active"  # active | disabled
