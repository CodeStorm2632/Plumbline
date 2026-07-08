"""Database initialization: seed superadmin, default role, and system menus."""

import logging
import uuid

from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import hash_password
from app.models.base import get_datetime_utc
from app.models.link import RoleMenu, UserRole
from app.models.menu import Menu
from app.models.role import Role
from app.models.user import User

logger = logging.getLogger(__name__)


def _create_default_menus(session: Session) -> list[uuid.UUID]:
    """Create default system management menu tree. Returns list of all menu IDs."""
    existing = session.exec(select(Menu).limit(1)).first()
    if existing:
        return []

    now = get_datetime_utc()
    menu_ids: list[uuid.UUID] = []

    # --- System Management directory ---
    sys_dir_id = uuid.uuid4()
    session.add(Menu(
        id=sys_dir_id, parent_id=None, name="系统管理", menu_type="DIR",
        path="/system", icon="Settings", sort_order=1, visible=True, status=1,
        created_at=now,
    ))
    menu_ids.append(sys_dir_id)

    # User management
    user_menu_id = uuid.uuid4()
    session.add(Menu(
        id=user_menu_id, parent_id=sys_dir_id, name="用户管理", menu_type="MENU",
        permission="sys:user:list", path="/system/users", component="system/users",
        icon="Users", sort_order=1, visible=True, status=1, created_at=now,
    ))
    menu_ids.append(user_menu_id)

    for i, (name, perm) in enumerate([
        ("新增用户", "sys:user:add"),
        ("编辑用户", "sys:user:edit"),
        ("删除用户", "sys:user:del"),
        ("重置密码", "sys:user:resetPwd"),
    ], start=1):
        btn_id = uuid.uuid4()
        session.add(Menu(
            id=btn_id, parent_id=user_menu_id, name=name, menu_type="BTN",
            permission=perm, sort_order=i, visible=True, status=1, created_at=now,
        ))
        menu_ids.append(btn_id)

    # Role management
    role_menu_id = uuid.uuid4()
    session.add(Menu(
        id=role_menu_id, parent_id=sys_dir_id, name="角色管理", menu_type="MENU",
        permission="sys:role:list", path="/system/roles", component="system/roles",
        icon="Shield", sort_order=2, visible=True, status=1, created_at=now,
    ))
    menu_ids.append(role_menu_id)

    for i, (name, perm) in enumerate([
        ("新增角色", "sys:role:add"),
        ("编辑角色", "sys:role:edit"),
        ("删除角色", "sys:role:del"),
        ("分配菜单", "sys:role:menu"),
    ], start=1):
        btn_id = uuid.uuid4()
        session.add(Menu(
            id=btn_id, parent_id=role_menu_id, name=name, menu_type="BTN",
            permission=perm, sort_order=i, visible=True, status=1, created_at=now,
        ))
        menu_ids.append(btn_id)

    # Menu management
    menu_menu_id = uuid.uuid4()
    session.add(Menu(
        id=menu_menu_id, parent_id=sys_dir_id, name="菜单管理", menu_type="MENU",
        permission="sys:menu:list", path="/system/menus", component="system/menus",
        icon="Menu", sort_order=3, visible=True, status=1, created_at=now,
    ))
    menu_ids.append(menu_menu_id)

    for i, (name, perm) in enumerate([
        ("新增菜单", "sys:menu:add"),
        ("编辑菜单", "sys:menu:edit"),
        ("删除菜单", "sys:menu:del"),
    ], start=1):
        btn_id = uuid.uuid4()
        session.add(Menu(
            id=btn_id, parent_id=menu_menu_id, name=name, menu_type="BTN",
            permission=perm, sort_order=i, visible=True, status=1, created_at=now,
        ))
        menu_ids.append(btn_id)

    # Log management
    log_menu_id = uuid.uuid4()
    session.add(Menu(
        id=log_menu_id, parent_id=sys_dir_id, name="日志管理", menu_type="MENU",
        permission="sys:log:list", path="/system/logs", component="system/logs",
        icon="FileText", sort_order=4, visible=True, status=1, created_at=now,
    ))
    menu_ids.append(log_menu_id)

    btn_id = uuid.uuid4()
    session.add(Menu(
        id=btn_id, parent_id=log_menu_id, name="清空日志", menu_type="BTN",
        permission="sys:log:del", sort_order=1, visible=True, status=1, created_at=now,
    ))
    menu_ids.append(btn_id)

    # --- Dashboard ---
    dash_id = uuid.uuid4()
    session.add(Menu(
        id=dash_id, parent_id=None, name="仪表盘", menu_type="MENU",
        path="/dashboard", component="dashboard", icon="LayoutDashboard",
        sort_order=0, visible=True, status=1, created_at=now,
    ))
    menu_ids.append(dash_id)

    session.flush()
    return menu_ids


def seed_initial_data(session: Session) -> None:
    """Create superadmin user, superadmin role, and default menus if not exist."""
    # Check if superadmin already exists
    user = session.exec(
        select(User).where(User.username == settings.FIRST_SUPERADMIN_USERNAME)
    ).first()
    if user:
        logger.info("Superadmin already exists, skipping seed")
        return

    now = get_datetime_utc()

    # Create default menus
    menu_ids = _create_default_menus(session)

    # Create superadmin role
    role_id = uuid.uuid4()
    role = Role(
        id=role_id,
        name="超级管理员",
        code="superadmin",
        data_scope="ALL",
        status=1,
        sort_order=0,
        remark="系统内置超级管理员角色",
        created_at=now,
    )
    session.add(role)
    session.flush()

    # Assign all menus to superadmin role
    for mid in menu_ids:
        session.add(RoleMenu(role_id=role_id, menu_id=mid))

    # Create superadmin user
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        username=settings.FIRST_SUPERADMIN_USERNAME,
        password_hash=hash_password(settings.FIRST_SUPERADMIN_PASSWORD),
        real_name="超级管理员",
        is_superadmin=True,
        status=1,
        created_at=now,
    )
    session.add(user)
    session.flush()

    # Assign superadmin role to user
    session.add(UserRole(user_id=user_id, role_id=role_id))

    session.commit()
    logger.info("Initial data seeded: superadmin user + role + %d menus", len(menu_ids))
