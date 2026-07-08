"""动态 RBAC（NFR-6.3）：权限从 DB 解析、缓存可失效。"""

from sqlmodel import Session, select

from app.core.db import engine
from app.core.rbac.models import Menu
from app.core.security import rbac
from app.core.store import k_perms, store


def test_perms_resolved_from_db(client):  # client 夹具确保已 seed_rbac
    with Session(engine) as s:
        admin = rbac.perms_for_roles(s, ["管理员"])
        assert "*" in admin
        assert rbac.has_perm_set(admin, "sys:user:write")  # 全权放行任意权限码

        auditor = rbac.perms_for_roles(s, ["审计员"])
        assert auditor == {"sys:log:read"}
        assert rbac.has_perm_set(auditor, "sys:log:read")
        assert not rbac.has_perm_set(auditor, "sys:user:write")  # 越权被拒


def test_unknown_role_has_no_perms(client):
    with Session(engine) as s:
        assert rbac.perms_for_roles(s, ["不存在的角色"]) == set()
def test_invalidate_clears_cache(client):
    with Session(engine) as s:
        rbac.perms_for_roles(s, ["审计员"])  # 触发缓存
        assert store.get(k_perms("审计员")) is not None
        rbac.invalidate_perms("审计员")
        assert store.get(k_perms("审计员")) is None


def test_button_perms_parented_under_nav_menus(client):
    """按钮权限挂到对应导航菜单下（目录/菜单/按钮 三级树）；全部权限保留顶级。"""
    with Session(engine) as s:
        by_code = {m.code: m for m in s.exec(select(Menu)).all()}
    assert by_code["sys:user:read"].parent_id == "m-nav-users"
    assert by_code["sys:user:write"].parent_id == "m-nav-users"
    assert by_code["sys:role:write"].parent_id == "m-nav-roles"
    assert by_code["sys:menu:read"].parent_id == "m-nav-menus"
    assert by_code["sys:dict:write"].parent_id == "m-nav-dicts"
    assert by_code["sys:log:read"].parent_id == "m-nav-logs"
    assert by_code["*"].parent_id is None  # 全部权限保留顶级
