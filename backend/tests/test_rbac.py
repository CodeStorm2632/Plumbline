"""动态 RBAC（NFR-6.3）：权限从 DB 解析、缓存可失效。"""

from sqlmodel import Session

from app.core.db import engine
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
