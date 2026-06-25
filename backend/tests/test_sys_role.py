"""角色管理切片：CRUD + 越权 403 + 校验 422 + 软删/引用守卫 + 分配菜单失效缓存。"""

from sqlmodel import Session, select

from app.core.db import engine
from app.core.rbac.models import Menu, Role
from app.core.security import rbac
from tests.conftest import auth_header


def _admin(client):
    return auth_header(client, "admin", "Admin@123")


def test_role_crud_and_guards(client):
    h = _admin(client)
    r = client.post("/api/sys/roles", headers=h, json={"code": "ops", "name": "运维"})
    assert r.status_code == 201 and r.json()["code"] == "ops"

    assert any(x["code"] == "ops" for x in client.get("/api/sys/roles", headers=h).json())

    # 垂直越权：auditor 无 sys:role:write
    ha = auth_header(client, "auditor", "Auditor@123")
    assert (
        client.post("/api/sys/roles", headers=ha, json={"code": "x", "name": "y"}).status_code
        == 403
    )

    # 校验：缺 code → 422
    assert client.post("/api/sys/roles", headers=h, json={"name": "无码"}).status_code == 422


def test_soft_delete_and_in_use_guard(client):
    h = _admin(client)
    rid = client.post("/api/sys/roles", headers=h, json={"code": "tmp", "name": "临时"}).json()[
        "id"
    ]
    # 未被引用 → 可软删，记录保留
    assert client.delete(f"/api/sys/roles/{rid}", headers=h).status_code == 204
    with Session(engine) as s:
        assert s.get(Role, rid).is_deleted is True

    # 被用户引用的角色不可删（管理员被 admin 用户引用）
    with Session(engine) as s:
        admin_role = s.exec(select(Role).where(Role.code == "管理员")).first()
    assert client.delete(f"/api/sys/roles/{admin_role.id}", headers=h).status_code == 409


def test_assign_menus_invalidates_cache(client):
    h = _admin(client)
    rid = client.post(
        "/api/sys/roles", headers=h, json={"code": "logv", "name": "日志查看"}
    ).json()["id"]
    with Session(engine) as s:
        log_menu = s.exec(select(Menu).where(Menu.perm_code == "sys:log:read")).first()
        # 分配前：无权限
        assert rbac.perms_for_roles(s, ["logv"]) == set()

    r = client.post(f"/api/sys/roles/{rid}/menus", headers=h, json={"menu_ids": [log_menu.id]})
    assert r.status_code == 200 and r.json()["menu_ids"] == [log_menu.id]

    with Session(engine) as s:
        # 分配后：缓存已失效，权限即时生效
        assert rbac.perms_for_roles(s, ["logv"]) == {"sys:log:read"}
