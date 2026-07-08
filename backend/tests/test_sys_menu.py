"""菜单管理切片：树形展示 + 越权 403 + 校验 422 + 级联软删 + 权限缓存失效。"""

from sqlmodel import Session, select

from app.core.audit.models import AuditRecord
from app.core.db import engine
from app.core.rbac.models import Menu
from app.core.security import rbac
from app.core.store import k_perms, store
from tests.conftest import auth_header


def _admin(client):
    store.delete(k_perms("管理员"))
    return auth_header(client, "admin", "Admin@123")


def test_menu_tree_create_and_guard(client):
    h = _admin(client)
    parent = client.post(
        "/api/sys/menus",
        headers=h,
        json={"code": "p1-dir", "name": "P1目录", "type": "dir", "order_no": 1},
    )
    assert parent.status_code == 201
    pid = parent.json()["id"]
    child = client.post(
        "/api/sys/menus",
        headers=h,
        json={
            "code": "p1-button",
            "name": "P1按钮",
            "type": "button",
            "parent_id": pid,
            "perm_code": "sys:p1:write",
            "order_no": 2,
        },
    )
    assert child.status_code == 201

    tree = client.get("/api/sys/menus", headers=h).json()
    node = next(x for x in tree if x["id"] == pid)
    assert node["children"][0]["perm_code"] == "sys:p1:write"

    ha = auth_header(client, "auditor", "Auditor@123")
    assert (
        client.post("/api/sys/menus", headers=ha, json={"code": "x", "name": "x"}).status_code
        == 403
    )
    assert client.post("/api/sys/menus", headers=h, json={"name": "缺码"}).status_code == 422
    assert (
        client.post(
            "/api/sys/menus",
            headers=h,
            json={"code": "orphan", "name": "孤儿", "parent_id": "missing"},
        ).status_code
        == 404
    )
    assert client.put(f"/api/sys/menus/{pid}", headers=h, json={"name": ""}).status_code == 422
    assert (
        client.post(
            "/api/sys/menus", headers=h, json={"code": "bad-type", "name": "坏类型", "type": "x"}
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/api/sys/menus",
            headers=h,
            json={"code": "bad-button", "name": "坏按钮", "type": "button"},
        ).status_code
        == 422
    )

    with Session(engine) as s:
        assert s.exec(
            select(AuditRecord).where(
                AuditRecord.entity_id == child.json()["id"], AuditRecord.action == "create_menu"
            )
        ).first()


def test_menu_cascade_soft_delete_and_cache_invalidation(client):
    h = _admin(client)
    pid = client.post(
        "/api/sys/menus", headers=h, json={"code": "tmp-dir", "name": "临时目录", "type": "dir"}
    ).json()["id"]
    cid = client.post(
        "/api/sys/menus",
        headers=h,
        json={
            "code": "tmp-button",
            "name": "临时按钮",
            "type": "button",
            "parent_id": pid,
            "perm_code": "sys:tmp:write",
        },
    ).json()["id"]
    store.set(k_perms("审计员"), "stale", ttl=600)

    assert client.delete(f"/api/sys/menus/{pid}", headers=h).status_code == 204
    assert store.get(k_perms("审计员")) is None
    assert all(x["id"] != pid for x in client.get("/api/sys/menus", headers=h).json())

    with Session(engine) as s:
        assert s.get(Menu, pid).is_deleted is True
        assert s.get(Menu, cid).is_deleted is True
        assert s.exec(
            select(AuditRecord).where(
                AuditRecord.entity_id == pid, AuditRecord.action == "delete_menu"
            )
        ).first()


def test_menu_update_invalidates_dynamic_role_cache(client):
    h = _admin(client)
    mid = client.post(
        "/api/sys/menus",
        headers=h,
        json={
            "code": "dynamic-btn",
            "name": "动态按钮",
            "type": "button",
            "perm_code": "sys:dynamic:write",
        },
    ).json()["id"]
    rid = client.post("/api/sys/roles", headers=h, json={"code": "dyn", "name": "动态角色"}).json()[
        "id"
    ]
    assert (
        client.post(f"/api/sys/roles/{rid}/menus", headers=h, json={"menu_ids": [mid]}).status_code
        == 200
    )

    with Session(engine) as s:
        assert rbac.perms_for_roles(s, ["dyn"]) == {"sys:dynamic:write"}
        assert store.get(k_perms("dyn")) == "sys:dynamic:write"

    assert (
        client.put(
            f"/api/sys/menus/{mid}",
            headers=h,
            json={"name": "动态按钮", "type": "button", "perm_code": "sys:dynamic:new"},
        ).status_code
        == 200
    )
    assert store.get(k_perms("dyn")) is None
    with Session(engine) as s:
        assert rbac.perms_for_roles(s, ["dyn"]) == {"sys:dynamic:new"}
        assert s.exec(
            select(AuditRecord).where(
                AuditRecord.entity_id == mid, AuditRecord.action == "update_menu"
            )
        ).first()

    assert (
        client.put(
            f"/api/sys/menus/{mid}", headers=h, json={"name": "动态菜单", "type": "menu"}
        ).status_code
        == 200
    )
    assert store.get(k_perms("dyn")) is None
    with Session(engine) as s:
        assert rbac.perms_for_roles(s, ["dyn"]) == set()


def test_list_my_menus_filters_by_role(client):
    admin_headers = _admin(client)
    admin_rows = client.get("/api/sys/menus/my", headers=admin_headers)
    assert admin_rows.status_code == 200
    admin_names = {node["name"] for node in admin_rows.json()}
    assert {"权限管理", "基础数据", "监控"}.issubset(admin_names)

    auditor_headers = auth_header(client, "auditor", "Auditor@123")
    auditor_rows = client.get("/api/sys/menus/my", headers=auditor_headers)
    assert auditor_rows.status_code == 200
    assert [x["name"] for x in auditor_rows.json()] == ["监控"]
    assert [x["name"] for x in auditor_rows.json()[0]["children"]] == ["日志管理"]
