from tests.conftest import auth_header, login


def test_login_success(client):
    r = login(client, "admin", "Admin@123")
    assert r.status_code == 200
    assert r.json()["token_type"] == "Bearer"
    assert "管理员" in r.json()["roles"]


def test_bad_captcha_rejected(client):
    r = client.post(
        "/api/auth/login",
        json={
            "username": "admin",
            "password": "Admin@123",
            "captcha_id": "nope",
            "captcha_code": "ZZZZ",
        },
    )
    assert r.status_code == 400


def test_lockout_after_5_failures(client):
    # auditor 连续输错 5 次 → 401；第 6 次 → 423 锁定
    for _ in range(5):
        r = login(client, "auditor", "wrong-pass")
        assert r.status_code == 401
    r = login(client, "auditor", "wrong-pass")
    assert r.status_code == 423
    # 清理：解除 auditor 锁定，避免污染后续以 auditor 登录的用例（client/store 为 session 级共享）
    from app.core.store import k_lock, store

    store.delete(k_lock("auditor"))


def test_me_requires_token_and_masks(client):
    assert client.get("/api/auth/me").status_code == 401
    h = auth_header(client, "admin", "Admin@123")
    me = client.get("/api/auth/me", headers=h).json()
    assert me["username"] == "admin"
    assert me["phone"] == "138****8000"  # 脱敏
    assert me["email"].endswith("@corp.com") and "***" in me["email"]


def test_logout_revokes_token(client):
    h = auth_header(client, "admin", "Admin@123")
    assert client.get("/api/auth/me", headers=h).status_code == 200
    assert client.post("/api/auth/logout", headers=h).status_code == 200
    assert client.get("/api/auth/me", headers=h).status_code == 401  # 白名单即时吊销
