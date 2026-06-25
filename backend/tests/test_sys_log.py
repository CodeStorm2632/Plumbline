"""日志查询切片：权限（auditor 可读 / 无权 403）+ 过滤 + 脱敏。"""

from tests.conftest import auth_header


def _admin(client):
    return auth_header(client, "admin", "Admin@123")


def test_auditor_can_read_logs(client):
    # auditor 有 sys:log:read → 200
    h = auth_header(client, "auditor", "Auditor@123")
    assert client.get("/api/sys/logs/login", headers=h).status_code == 200
    assert client.get("/api/sys/logs/audit", headers=h).status_code == 200


def test_no_perm_user_forbidden(client):
    # admin 新建一个无角色用户 → 登录后无 sys:log:read → 403
    h = _admin(client)
    client.post(
        "/api/sys/users",
        headers=h,
        json={"username": "norole", "password": "Norole@1", "roles": []},
    )
    hn = auth_header(client, "norole", "Norole@1")
    assert client.get("/api/sys/logs/audit", headers=hn).status_code == 403


def test_login_log_filter_and_records_login(client):
    # 触发一次登录后，登录日志应有 admin 的成功记录；按用户名过滤可命中
    _admin(client)
    h = _admin(client)
    rows = client.get("/api/sys/logs/login", headers=h, params={"username": "admin"}).json()
    assert rows and all(r["username"] == "admin" for r in rows)
    assert any(r["success"] for r in rows)


def test_audit_filter_by_actor(client):
    # admin 的写操作（建用户）会留审计；按 actor 过滤
    h = _admin(client)
    client.post(
        "/api/sys/users",
        headers=h,
        json={"username": "logtarget", "password": "Logt@123", "roles": []},
    )
    rows = client.get("/api/sys/logs/audit", headers=h, params={"actor": "admin"}).json()
    assert rows and all(r["actor"] == "admin" for r in rows)


def test_login_detail_phone_masked(client):
    # 在登录日志 detail 写入含手机号的文本，查询应脱敏（NFR-6.6 / FR-6.4.3）
    from sqlmodel import Session

    from app.core.audit.models import LoginLog
    from app.core.db import engine

    with Session(engine) as s:
        s.add(LoginLog(username="masktest", success=False, detail="疑似来源 13800138000"))
        s.commit()
    h = _admin(client)
    rows = client.get("/api/sys/logs/login", headers=h, params={"username": "masktest"}).json()
    assert rows and "138****8000" in rows[0]["detail"]
    assert "13800138000" not in rows[0]["detail"]
