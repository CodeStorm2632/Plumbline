"""传输信封（NFR-6.7）：服务端解信封 + 明文透传 + 公钥下发。"""

from app.core.security import crypto
from app.core.security.envelope import is_enveloped, open_envelope, seal_value


def test_open_envelope_decrypts_sm4_field():
    token = crypto.encrypt_field("13800138000")
    assert is_enveloped(token)
    out = open_envelope({"phone": token, "name": "x"}, ["phone"])
    assert out["phone"] == "13800138000"
    assert out["name"] == "x"  # 非敏感字段不动


def test_open_envelope_passthrough_plaintext():
    out = open_envelope({"phone": "13800138000"}, ["phone"])
    assert out["phone"] == "13800138000"  # 明文透传（dev/无前端加密）


def test_seal_then_open_roundtrip():
    assert open_envelope({"email": seal_value("a@b.com")}, ["email"])["email"] == "a@b.com"
    assert seal_value(None) is None


def test_pubkey_endpoint(client):
    body = client.get("/api/crypto/pubkey").json()
    assert "backend" in body and "sm2_public_key" in body
