"""Backend API integration tests.

These tests require:
- tongsuopy native backend (SM2/SM3/SM4 crypto)
- PostgreSQL database (POSTGRES_* env vars)
- Redis server (REDIS_* env vars)

They are skipped automatically when the crypto backend is unavailable
(e.g. local macOS dev) and are designed to run in CI/Docker.
"""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from tests.conftest import requires_tongsuopy

pytestmark = requires_tongsuopy

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.api.deps import get_db, get_redis
from app.core.security import hash_password
from app.main import app
from app.models.menu import Menu
from app.models.role import Role
from app.models.user import User


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(name="db")
def db_fixture():
    """In-memory SQLite database for testing."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="mock_redis")
def mock_redis_fixture():
    """Mock Redis that stores tokens in a dict."""
    store: dict[str, str] = {}

    redis = AsyncMock()

    async def _set(key, value, **kwargs):
        store[key] = value

    async def _get(key):
        return store.get(key)

    async def _delete(*keys):
        for k in keys:
            store.pop(k, None)

    async def _exists(key):
        return 1 if key in store else 0

    async def _keys(pattern):
        import fnmatch
        return [k for k in store if fnmatch.fnmatch(k, pattern)]

    async def _scan_iter(match=None):
        import fnmatch
        for k in list(store):
            if match is None or fnmatch.fnmatch(k, match):
                yield k

    redis.set = _set
    redis.get = _get
    redis.delete = _delete
    redis.exists = _exists
    redis.keys = _keys
    redis.scan_iter = _scan_iter
    redis.close = AsyncMock()
    redis.pipeline = MagicMock(return_value=redis)
    redis.execute = AsyncMock(return_value=[])
    redis.__aenter__ = AsyncMock(return_value=redis)
    redis.__aexit__ = AsyncMock(return_value=None)

    return redis


@pytest.fixture(name="client")
def client_fixture(db: Session, mock_redis):
    """TestClient with overridden DB and Redis dependencies."""

    def override_get_db():
        yield db

    async def override_get_redis():
        return mock_redis

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_redis] = override_get_redis

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(db: Session):
    """Create a regular test user."""
    user = User(
        id=uuid.uuid4(),
        username="testuser",
        password_hash=hash_password("Test@1234"),
        real_name="Test User",
        status=1,
        is_superadmin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(name="superadmin")
def superadmin_fixture(db: Session):
    """Create a superadmin user."""
    user = User(
        id=uuid.uuid4(),
        username="admin",
        password_hash=hash_password("Admin@1234"),
        real_name="Super Admin",
        status=1,
        is_superadmin=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _login(client: TestClient, mock_redis, username: str, password: str) -> str:
    """Helper: bypass captcha and login, return access token."""
    with patch("app.api.routes.auth.verify_captcha", new_callable=AsyncMock) as mock_captcha:
        mock_captcha.return_value = True
        resp = client.post(
            "/api/v1/auth/login",
            json={
                "username": username,
                "password": password,
                "captcha_id": "fake-captcha-id",
                "captcha_code": "1234",
            },
        )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    return data["data"]["access_token"]


def _auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Auth Tests
# ---------------------------------------------------------------------------

class TestCaptcha:
    def test_get_captcha(self, client: TestClient):
        with patch("app.api.routes.auth.generate_captcha", new_callable=AsyncMock) as mock_gen:
            mock_gen.return_value = ("cap-id-123", "base64image")
            resp = client.get("/api/v1/auth/captcha")
        assert resp.status_code == 200
        body = resp.json()
        assert body["code"] == 200
        assert body["data"]["captcha_id"] == "cap-id-123"


class TestLogin:
    def test_login_success(self, client, test_user, mock_redis):
        token = _login(client, mock_redis, "testuser", "Test@1234")
        assert token
        assert "." in token  # JWT format

    def test_login_wrong_password(self, client, test_user, mock_redis):
        with patch("app.api.routes.auth.verify_captcha", new_callable=AsyncMock) as mock_captcha:
            mock_captcha.return_value = True
            resp = client.post(
                "/api/v1/auth/login",
                json={
                    "username": "testuser",
                    "password": "WrongPass@1",
                    "captcha_id": "fake",
                    "captcha_code": "1234",
                },
            )
        assert resp.json()["code"] == 401

    def test_login_nonexistent_user(self, client, mock_redis):
        with patch("app.api.routes.auth.verify_captcha", new_callable=AsyncMock) as mock_captcha:
            mock_captcha.return_value = True
            resp = client.post(
                "/api/v1/auth/login",
                json={
                    "username": "nobody",
                    "password": "Test@1234",
                    "captcha_id": "fake",
                    "captcha_code": "1234",
                },
            )
        assert resp.json()["code"] == 401

    def test_login_bad_captcha(self, client, test_user, mock_redis):
        with patch("app.api.routes.auth.verify_captcha", new_callable=AsyncMock) as mock_captcha:
            mock_captcha.return_value = False
            resp = client.post(
                "/api/v1/auth/login",
                json={
                    "username": "testuser",
                    "password": "Test@1234",
                    "captcha_id": "fake",
                    "captcha_code": "wrong",
                },
            )
        assert resp.json()["code"] == 400


class TestLogout:
    def test_logout(self, client, test_user, mock_redis):
        token = _login(client, mock_redis, "testuser", "Test@1234")
        resp = client.post("/api/v1/auth/logout", headers=_auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["code"] == 200


class TestMe:
    def test_get_me(self, client, superadmin, mock_redis):
        token = _login(client, mock_redis, "admin", "Admin@1234")
        resp = client.get("/api/v1/auth/me", headers=_auth_header(token))
        assert resp.status_code == 200
        body = resp.json()
        assert body["data"]["username"] == "admin"
        assert body["data"]["is_superadmin"] is True

    def test_get_me_unauthenticated(self, client):
        resp = client.get("/api/v1/auth/me")
        assert resp.json()["code"] == 401

    def test_update_me(self, client, superadmin, mock_redis):
        token = _login(client, mock_redis, "admin", "Admin@1234")
        resp = client.put(
            "/api/v1/auth/me",
            headers=_auth_header(token),
            json={"real_name": "New Name"},
        )
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# System Users Tests (requires permissions)
# ---------------------------------------------------------------------------

class TestSystemUsers:
    def test_list_users_superadmin(self, client, superadmin, mock_redis):
        token = _login(client, mock_redis, "admin", "Admin@1234")
        resp = client.get("/api/v1/system/users", headers=_auth_header(token))
        assert resp.status_code == 200
        body = resp.json()
        assert body["code"] == 200
        assert "items" in body["data"]

    def test_list_users_unauthenticated(self, client):
        resp = client.get("/api/v1/system/users")
        assert resp.json()["code"] == 401

    def test_create_user(self, client, superadmin, mock_redis, db):
        token = _login(client, mock_redis, "admin", "Admin@1234")
        resp = client.post(
            "/api/v1/system/users",
            headers=_auth_header(token),
            json={
                "username": "newuser",
                "password": "NewUser@1234",
                "real_name": "New User",
                "role_ids": [],
            },
        )
        assert resp.status_code == 200
        assert resp.json()["code"] == 200

    def test_create_duplicate_user(self, client, superadmin, test_user, mock_redis):
        token = _login(client, mock_redis, "admin", "Admin@1234")
        resp = client.post(
            "/api/v1/system/users",
            headers=_auth_header(token),
            json={
                "username": "testuser",  # Already exists
                "password": "Test@1234",
                "real_name": "Dup User",
                "role_ids": [],
            },
        )
        # Should fail with conflict/business error
        assert resp.json()["code"] != 200


# ---------------------------------------------------------------------------
# System Roles Tests
# ---------------------------------------------------------------------------

class TestSystemRoles:
    def test_list_roles(self, client, superadmin, mock_redis):
        token = _login(client, mock_redis, "admin", "Admin@1234")
        resp = client.get("/api/v1/system/roles", headers=_auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["code"] == 200

    def test_create_role(self, client, superadmin, mock_redis):
        token = _login(client, mock_redis, "admin", "Admin@1234")
        resp = client.post(
            "/api/v1/system/roles",
            headers=_auth_header(token),
            json={
                "name": "Test Role",
                "code": "test_role",
                "data_scope": "SELF",
                "menu_ids": [],
            },
        )
        assert resp.status_code == 200
        assert resp.json()["code"] == 200


# ---------------------------------------------------------------------------
# System Menus Tests
# ---------------------------------------------------------------------------

class TestSystemMenus:
    def test_list_menus(self, client, superadmin, mock_redis):
        token = _login(client, mock_redis, "admin", "Admin@1234")
        resp = client.get("/api/v1/system/menus", headers=_auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["code"] == 200

    def test_create_menu(self, client, superadmin, mock_redis):
        token = _login(client, mock_redis, "admin", "Admin@1234")
        resp = client.post(
            "/api/v1/system/menus",
            headers=_auth_header(token),
            json={
                "name": "Test Menu",
                "menu_type": "MENU",
                "parent_id": None,
                "path": "/test",
                "component": "test/index",
                "sort_order": 1,
            },
        )
        assert resp.status_code == 200
        assert resp.json()["code"] == 200


# ---------------------------------------------------------------------------
# Dashboard Tests
# ---------------------------------------------------------------------------

class TestDashboard:
    def test_summary(self, client, superadmin, mock_redis):
        token = _login(client, mock_redis, "admin", "Admin@1234")
        resp = client.get("/api/v1/dashboard/summary", headers=_auth_header(token))
        assert resp.status_code == 200
        body = resp.json()
        assert body["code"] == 200
        assert "user_count" in body["data"]

    def test_health(self, client, superadmin, mock_redis):
        token = _login(client, mock_redis, "admin", "Admin@1234")
        resp = client.get("/api/v1/health", headers=_auth_header(token))
        assert resp.status_code == 200
