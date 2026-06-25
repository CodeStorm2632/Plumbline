"""统一测试夹具：临时 SQLite + 内存 store + TestClient + 种子。"""
import os
import tempfile

import pytest

# 必须在导入 app 之前设环境
os.environ["ENV"] = "test"
_DB_FD, _DB_PATH = tempfile.mkstemp(suffix=".db")
os.environ["DATABASE_URL"] = f"sqlite:///{_DB_PATH}"
os.environ.setdefault("REDIS_URL", "")  # 走内存兜底


@pytest.fixture(scope="session")
def client():
    from fastapi.testclient import TestClient

    from app.main import app
    from app.seed import run as seed

    seed()
    with TestClient(app) as c:
        yield c


def fetch_captcha(client):
    """取验证码（demo 后端 image 为 data:text/plain,CODE，可直接解析）。"""
    r = client.get("/api/auth/captcha")
    body = r.json()
    code = body["image"].split(",", 1)[1]  # demo：明文；生产改为人工/OCR
    return body["captcha_id"], code


def login(client, username, password):
    cid, code = fetch_captcha(client)
    return client.post("/api/auth/login", json={
        "username": username, "password": password,
        "captcha_id": cid, "captcha_code": code,
    })


def auth_header(client, username, password):
    r = login(client, username, password)
    return {"Authorization": f"Bearer {r.json()['access_token']}"}
