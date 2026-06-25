"""字典管理切片：类型/项 CRUD + 越权 403 + 校验 422 + 软删 + public 启用项。"""

from sqlmodel import Session, select

from app.core.audit.models import AuditRecord
from app.core.db import engine
from app.core.store import k_perms, store
from app.features.sys_dict.models import Dict, DictItem
from tests.conftest import auth_header


def _admin(client):
    store.delete(k_perms("管理员"))
    return auth_header(client, "admin", "Admin@123")


def test_dict_type_and_item_crud_and_guard(client):
    h = _admin(client)
    r = client.post("/api/sys/dicts", headers=h, json={"code": "color", "name": "颜色"})
    assert r.status_code == 201 and r.json()["code"] == "color"

    item = client.post(
        "/api/sys/dicts/items",
        headers=h,
        json={"type_code": "color", "label": "红色", "value": "red", "order_no": 1},
    )
    assert item.status_code == 201 and item.json()["label"] == "红色"
    assert client.get("/api/sys/dicts/color/items", headers=h).json()[0]["value"] == "red"
    assert (
        client.put(f"/api/sys/dicts/{r.json()['id']}", headers=h, json={"name": ""}).status_code
        == 422
    )
    assert (
        client.put(f"/api/sys/dicts/{r.json()['id']}", headers=h, json={"name": "色彩"}).status_code
        == 200
    )
    assert (
        client.put(
            f"/api/sys/dicts/items/{item.json()['id']}", headers=h, json={"label": ""}
        ).status_code
        == 422
    )
    assert (
        client.put(
            f"/api/sys/dicts/items/{item.json()['id']}", headers=h, json={"status": "broken"}
        ).status_code
        == 422
    )

    with Session(engine) as s:
        for entity_id, action in [
            (r.json()["id"], "create_dict"),
            (r.json()["id"], "update_dict"),
            (item.json()["id"], "create_dict_item"),
        ]:
            assert s.exec(
                select(AuditRecord).where(
                    AuditRecord.entity_id == entity_id, AuditRecord.action == action
                )
            ).first()

    ha = auth_header(client, "auditor", "Auditor@123")
    assert (
        client.post("/api/sys/dicts", headers=ha, json={"code": "x", "name": "x"}).status_code
        == 403
    )
    assert client.post("/api/sys/dicts", headers=h, json={"name": "缺码"}).status_code == 422


def test_public_enabled_items_and_soft_delete(client):
    h = _admin(client)
    did = client.post("/api/sys/dicts", headers=h, json={"code": "status", "name": "状态"}).json()[
        "id"
    ]
    active = client.post(
        "/api/sys/dicts/items",
        headers=h,
        json={"type_code": "status", "label": "启用", "value": "active"},
    ).json()["id"]
    disabled = client.post(
        "/api/sys/dicts/items",
        headers=h,
        json={"type_code": "status", "label": "停用", "value": "disabled"},
    ).json()["id"]
    assert (
        client.put(
            f"/api/sys/dicts/items/{disabled}", headers=h, json={"status": "disabled"}
        ).status_code
        == 200
    )

    public_items = client.get("/api/sys/dicts/public/status/items").json()
    assert [x["value"] for x in public_items] == ["active"]

    assert client.delete(f"/api/sys/dicts/{did}", headers=h).status_code == 204
    assert client.get("/api/sys/dicts", headers=h, params={"q": "状态"}).json() == []
    with Session(engine) as s:
        assert s.get(Dict, did).is_deleted is True
        assert s.get(DictItem, active).is_deleted is True
        assert s.get(DictItem, disabled).is_deleted is True
        for entity_id, action in [
            (disabled, "update_dict_item"),
            (did, "delete_dict"),
            (active, "delete_dict_item_cascade"),
            (disabled, "delete_dict_item_cascade"),
        ]:
            assert s.exec(
                select(AuditRecord).where(
                    AuditRecord.entity_id == entity_id, AuditRecord.action == action
                )
            ).first()
