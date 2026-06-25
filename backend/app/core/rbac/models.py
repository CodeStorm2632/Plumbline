"""动态 RBAC 表：角色 / 菜单(权限载体) / 角色-菜单关联（NFR-6.3）。

跨切片的权限模型放 core（与 core/audit 同例），使 core/security/rbac.py 可查询而不依赖 features；
features/sys_role、features/sys_menu 切片再对这些表做 CRUD。
"""

from __future__ import annotations

from sqlmodel import Field, SQLModel

from app.core.models import SysBase


class Role(SysBase, table=True):
    id: str = Field(primary_key=True)
    code: str = Field(index=True, unique=True)  # 角色码，User.roles_csv 存的就是它
    name: str
    remark: str = ""


class Menu(SysBase, table=True):
    id: str = Field(primary_key=True)
    code: str = Field(index=True, unique=True)
    name: str
    parent_id: str | None = Field(default=None, index=True)
    type: str = "menu"  # dir | menu | button
    perm_code: str | None = None  # button 节点的按钮级权限码，如 sys:user:write；"*" = 全权
    path: str | None = None
    icon: str | None = None
    order_no: int = 0  # 排序（避开 SQL 保留字 order）


class RoleMenu(SQLModel, table=True):  # 关联表：角色被授予哪些菜单/权限
    id: int | None = Field(default=None, primary_key=True)
    role_id: str = Field(index=True)
    menu_id: str = Field(index=True)
