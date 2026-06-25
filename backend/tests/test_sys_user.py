"""用户管理切片：正常路径 + 越权 403 + 校验 422 + 加密落库/脱敏 + 软删除留痕 + 信封入参。"""

from sqlmodel import Session, select

from app.core.db import engine
from app.core.security import crypto
from app.core.security.envelope import seal_value
from app.features.auth.models import User
from tests.conftest import auth_header


def _admin(client):
    return auth_header(client, "admin", "Admin@123")


def test_create_list_mask_and_encrypt_at_rest(client):
    h = _admin(client)
    r = client.post(
        "/api/sys/users",
        headers=h,
        json={
            "username": "alice",
            "password": "Alice@123",
            "phone": "13900139000",
            "email": "alice@corp.com",
            "roles": ["审计员"],
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert body["phone"] == "139****9000"  # 出参脱敏
    assert body["email"].endswith("@corp.com") and "***" in body["email"]

    # 列表可见、脱敏
    lst = client.get("/api/sys/users", headers=h, params={"q": "alice"}).json()
    assert any(u["username"] == "alice" for u in lst)

    # 落库为 SM4 密文，非明文
    with Session(engine) as s:
        u = s.exec(select(User).where(User.username == "alice")).first()
        assert u.phone_enc and u.phone_enc != "13900139000"
        assert crypto.decrypt_field(u.phone_enc) == "13900139000"


def test_create_requires_write_perm_403(client):
    # auditor 仅 sys:log:read，无 sys:user:write → 垂直越权被拒
    h = auth_header(client, "auditor", "Auditor@123")
    r = client.post(
        "/api/sys/users", headers=h, json={"username": "bob", "password": "Bob@1234", "roles": []}
    )
    assert r.status_code == 403


def test_create_validation_422(client):
    h = _admin(client)
    # 用户名过短
    assert (
        client.post(
            "/api/sys/users", headers=h, json={"username": "ab", "password": "Abcd@123"}
        ).status_code
        == 422
    )
    # 弱口令违反策略
    assert (
        client.post(
            "/api/sys/users", headers=h, json={"username": "carol", "password": "123"}
        ).status_code
        == 422
    )


def test_soft_delete_retains_record_and_audit(client):
    h = _admin(client)
    uid = client.post(
        "/api/sys/users", headers=h, json={"username": "dave", "password": "Dave@123", "roles": []}
    ).json()["id"]
    h_dave = auth_header(client, "dave", "Dave@123")
    assert client.delete(f"/api/sys/users/{uid}", headers=h).status_code == 204
    assert client.get("/api/auth/me", headers=h_dave).status_code == 403
    # 列表不再出现
    assert all(u["id"] != uid for u in client.get("/api/sys/users", headers=h).json())
    with Session(engine) as s:
        row = s.get(User, uid)
        # 原始记录仍在，仅 is_deleted=1（NFR-6.1）
        assert row is not None and row.is_deleted is True
        # 删除操作审计留痕（写操作三段式的"审计"环节）
        from app.core.audit.models import AuditRecord

        audit = s.exec(
            select(AuditRecord).where(
                AuditRecord.entity_id == uid, AuditRecord.action == "delete_user"
            )
        ).first()
        assert audit is not None, "delete_user 应写审计记录"
        assert audit.before["password_hash"] == "***"
        assert audit.before["phone_enc"] == "***"

    from tests.conftest import fetch_captcha

    cid, code = fetch_captcha(client)
    r = client.post(
        "/api/auth/login",
        json={"username": "dave", "password": "Dave@123", "captcha_id": cid, "captcha_code": code},
    )
    assert r.status_code == 401


def test_disabled_user_cannot_login_or_access(client):
    h = _admin(client)
    # 创建并立刻禁用
    uid = client.post(
        "/api/sys/users", headers=h, json={"username": "zara", "password": "Zara@123", "roles": []}
    ).json()["id"]
    # 先登录拿 token
    h_zara = auth_header(client, "zara", "Zara@123")
    # 禁用前 /api/auth/me 正常
    assert client.get("/api/auth/me", headers=h_zara).status_code == 200
    # 禁用
    assert (
        client.post(
            f"/api/sys/users/{uid}/status", headers=h, json={"status": "disabled"}
        ).status_code
        == 200
    )
    # 持有旧 token 的请求立即被拦截（k_user_block）
    assert client.get("/api/auth/me", headers=h_zara).status_code == 403
    # 禁用后不能重新登录
    from tests.conftest import fetch_captcha

    cid, code = fetch_captcha(client)
    r = client.post(
        "/api/auth/login",
        json={"username": "zara", "password": "Zara@123", "captcha_id": cid, "captcha_code": code},
    )
    assert r.status_code == 403


def test_assign_roles_and_audit(client):
    h = _admin(client)
    uid = client.post(
        "/api/sys/users", headers=h, json={"username": "erin", "password": "Erin@123", "roles": []}
    ).json()["id"]
    r = client.post(f"/api/sys/users/{uid}/roles", headers=h, json={"roles": ["审计员"]})
    assert r.status_code == 200 and r.json()["roles"] == ["审计员"]


def test_assign_roles_affects_existing_token_immediately(client):
    h = _admin(client)
    uid = client.post(
        "/api/sys/users",
        headers=h,
        json={"username": "gary", "password": "Gary@123", "roles": ["管理员"]},
    ).json()["id"]
    h_gary = auth_header(client, "gary", "Gary@123")
    assert client.get("/api/sys/users", headers=h_gary).status_code == 200
    assert (
        client.post(f"/api/sys/users/{uid}/roles", headers=h, json={"roles": []}).status_code == 200
    )
    assert client.get("/api/sys/users", headers=h_gary).status_code == 403


def test_envelope_phone_input_decrypted(client):
    h = _admin(client)
    token = seal_value("13700137000")  # 模拟前端信封上送
    uid = client.post(
        "/api/sys/users",
        headers=h,
        json={"username": "frank", "password": "Frank@12", "phone": token},
    ).json()["id"]
    with Session(engine) as s:
        u = s.get(User, uid)
        assert crypto.decrypt_field(u.phone_enc) == "13700137000"  # 信封被解开后再 SM4 落库
