"""RBAC：角色 → 按钮级权限映射 + 数据范围过滤。

动态 RBAC（NFR-6.3）：权限码不再硬编码，而是从 DB 的 角色→角色菜单→菜单.perm_code 聚合，
并按角色缓存到 store（Redis/内存），角色或菜单写操作后失效缓存即时生效。
`ROLE_PERMISSIONS` 仅保留为**种子初值**：seed 时灌进 Role/Menu/RoleMenu 表。
"""

from __future__ import annotations

from sqlmodel import select

from app.core.models import not_deleted
from app.core.rbac.models import Menu, Role, RoleMenu
from app.core.store import k_perms, store

# 角色 → 权限码（按钮级）种子初值。权限码 = "资源:动作"；"*" = 全权。
ROLE_PERMISSIONS: dict[str, set[str]] = {
    "管理员": {"*"},
    "审计员": {"sys:log:read"},  # 演示非管理员：只读日志（用于越权用例）
}

ROLE_NAV_MENUS: dict[str, set[str]] = {
    "管理员": {
        "nav-access",
        "nav-users",
        "nav-roles",
        "nav-menus",
        "nav-basic",
        "nav-dicts",
        "nav-monitor",
        "nav-logs",
    },
    "审计员": {"nav-monitor", "nav-logs"},
}

BASE_NAV_MENUS = [
    {
        "code": "nav-access",
        "name": "权限管理",
        "type": "dir",
        "parent_id": None,
        "path": None,
        "icon": "shield",
        "order_no": 10,
    },
    {
        "code": "nav-users",
        "name": "用户管理",
        "type": "menu",
        "parent_id": "m-nav-access",
        "path": "users",
        "icon": "users",
        "order_no": 11,
    },
    {
        "code": "nav-roles",
        "name": "角色管理",
        "type": "menu",
        "parent_id": "m-nav-access",
        "path": "roles",
        "icon": "shield",
        "order_no": 12,
    },
    {
        "code": "nav-menus",
        "name": "菜单管理",
        "type": "menu",
        "parent_id": "m-nav-access",
        "path": "menus",
        "icon": "menu",
        "order_no": 13,
    },
    {
        "code": "nav-basic",
        "name": "基础数据",
        "type": "dir",
        "parent_id": None,
        "path": None,
        "icon": "book",
        "order_no": 20,
    },
    {
        "code": "nav-dicts",
        "name": "字典管理",
        "type": "menu",
        "parent_id": "m-nav-basic",
        "path": "dicts",
        "icon": "book",
        "order_no": 21,
    },
    {
        "code": "nav-monitor",
        "name": "监控",
        "type": "dir",
        "parent_id": None,
        "path": None,
        "icon": "logs",
        "order_no": 30,
    },
    {
        "code": "nav-logs",
        "name": "日志管理",
        "type": "menu",
        "parent_id": "m-nav-monitor",
        "path": "logs",
        "icon": "logs",
        "order_no": 31,
    },
]

BASE_MENU_PERMS = [
    ("*", "全部权限"),
    ("sys:user:read", "用户查看"),
    ("sys:user:write", "用户维护"),
    ("sys:role:read", "角色查看"),
    ("sys:role:write", "角色维护"),
    ("sys:menu:read", "菜单查看"),
    ("sys:menu:write", "菜单维护"),
    ("sys:dict:read", "字典查看"),
    ("sys:dict:write", "字典维护"),
    ("sys:log:read", "日志查看"),
]

# 按钮权限码 → 归属的导航「菜单」节点 id：把按钮权限挂到对应菜单下，形成 目录/菜单/按钮 三级树。
# "*"（全部权限）无对应具体菜单，保留为顶级节点。
PERM_PARENT: dict[str, str] = {
    "sys:user:read": "m-nav-users",
    "sys:user:write": "m-nav-users",
    "sys:role:read": "m-nav-roles",
    "sys:role:write": "m-nav-roles",
    "sys:menu:read": "m-nav-menus",
    "sys:menu:write": "m-nav-menus",
    "sys:dict:read": "m-nav-dicts",
    "sys:dict:write": "m-nav-dicts",
    "sys:log:read": "m-nav-logs",
}
PERMS_TTL = 600  # 角色权限缓存 10 分钟（写操作会主动失效）


# ---- 动态权限解析（DB + 缓存）------------------------------------------------
def _role_perms_db(session, role_code: str) -> set[str]:
    role = session.exec(select(Role).where(Role.code == role_code, not_deleted(Role))).first()
    if not role:
        return set()
    menu_ids = session.exec(select(RoleMenu.menu_id).where(RoleMenu.role_id == role.id)).all()
    if not menu_ids:
        return set()
    menus = session.exec(
        select(Menu).where(Menu.id.in_(menu_ids), Menu.type == "button", not_deleted(Menu))
    ).all()
    return {m.perm_code for m in menus if m.perm_code}


def _role_perms_cached(session, role_code: str) -> set[str]:
    ck = k_perms(role_code)
    cached = store.get(ck)
    if cached is not None:
        return {p for p in cached.split(",") if p}
    perms = _role_perms_db(session, role_code)
    store.set(ck, ",".join(sorted(perms)), ttl=PERMS_TTL)
    return perms


def perms_for_roles(session, roles: list[str]) -> set[str]:
    """解析角色集合的权限码并集（带缓存）。含 '*' 表示全权。"""
    out: set[str] = set()
    for code in roles:
        out |= _role_perms_cached(session, code)
    return out


def has_perm_set(granted: set[str], perm: str) -> bool:
    return "*" in granted or perm in granted


def invalidate_perms(role_code: str | None = None) -> None:
    """角色/菜单写操作后调用：失效某角色或（保守地）全部已知角色的权限缓存。"""
    if role_code:
        store.delete(k_perms(role_code))
    else:
        store.delete_prefix("rbac:perms:")


def data_scope(roles: list[str], user_id: str) -> dict:
    """返回数据范围过滤条件（示意，防水平越权）。管理员看全部；其余仅本人相关。"""
    if "管理员" in roles:
        return {}  # 无过滤
    return {"owner_or_assignee": user_id}


# ---- 种子：把 ROLE_PERMISSIONS 灌进 Role/Menu/RoleMenu 表 ---------------------
def seed_rbac(session) -> None:
    """幂等：为系统权限码建 button 菜单，按角色建关联。"""
    menu_by_perm: dict[str, Menu] = {}
    menu_by_code: dict[str, Menu] = {}

    for nav in BASE_NAV_MENUS:
        m = session.exec(select(Menu).where(Menu.code == nav["code"])).first()
        if not m:
            m = Menu(
                id=f"m-{nav['code']}",
                code=nav["code"],
                name=nav["name"],
                type=nav["type"],
                parent_id=nav["parent_id"],
                path=nav["path"],
                icon=nav["icon"],
                order_no=nav["order_no"],
            )
            session.add(m)
        else:
            m.name = nav["name"]
            m.type = nav["type"]
            m.parent_id = nav["parent_id"]
            m.path = nav["path"]
            m.icon = nav["icon"]
            m.order_no = nav["order_no"]
            session.add(m)
        menu_by_code[nav["code"]] = m
    for perm, name in BASE_MENU_PERMS:
        m = session.exec(select(Menu).where(Menu.code == perm)).first()
        if not m:
            m = Menu(
                id=f"m-{perm}",
                code=perm,
                name=name,
                type="button",
                perm_code=perm,
                parent_id=PERM_PARENT.get(perm),
            )
            session.add(m)
        else:
            m.name = name
            m.type = "button"
            m.perm_code = perm
            m.path = None
            m.parent_id = PERM_PARENT.get(perm)
            session.add(m)
        menu_by_perm[perm] = m
        menu_by_code[perm] = m

    for role_code, perms in ROLE_PERMISSIONS.items():
        role = session.exec(select(Role).where(Role.code == role_code)).first()
        if not role:
            role = Role(id=f"r-{role_code}", code=role_code, name=role_code)
            session.add(role)

        for nav_code in ROLE_NAV_MENUS.get(role_code, set()):
            menu = menu_by_code.get(nav_code)
            if not menu:
                continue
            exists = session.exec(
                select(RoleMenu).where(RoleMenu.role_id == role.id, RoleMenu.menu_id == menu.id)
            ).first()
            if not exists:
                session.add(RoleMenu(role_id=role.id, menu_id=menu.id))

        for perm in perms:
            menu = menu_by_perm.get(perm)
            if not menu:
                continue
            exists = session.exec(
                select(RoleMenu).where(RoleMenu.role_id == role.id, RoleMenu.menu_id == menu.id)
            ).first()
            if not exists:
                session.add(RoleMenu(role_id=role.id, menu_id=menu.id))
    session.commit()
