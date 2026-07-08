"""Unit tests for SM2 JWT token creation and verification."""

import json
import time
from unittest.mock import patch

import pytest

from tests.conftest import requires_tongsuopy

pytestmark = requires_tongsuopy

from app.core.jwt import (
    _base64url_decode,
    _base64url_encode,
    create_token,
    verify_token,
)


class TestBase64URL:
    def test_roundtrip(self):
        data = b"hello world"
        encoded = _base64url_encode(data)
        decoded = _base64url_decode(encoded)
        assert decoded == data

    def test_no_padding(self):
        encoded = _base64url_encode(b"test")
        assert "=" not in encoded

    def test_url_safe(self):
        # Use data that would produce + or / in standard base64
        data = b"\xff\xfe\xfd\xfc\xfb\xfa"
        encoded = _base64url_encode(data)
        assert "+" not in encoded
        assert "/" not in encoded


class TestCreateToken:
    def test_returns_three_part_jwt(self):
        token = create_token("user-123", "jti-abc")
        parts = token.split(".")
        assert len(parts) == 3

    def test_header_contains_sm2(self):
        token = create_token("user-123", "jti-abc")
        header_b64 = token.split(".")[0]
        header = json.loads(_base64url_decode(header_b64))
        assert header["alg"] == "SM2"
        assert header["typ"] == "JWT"

    def test_payload_contains_claims(self):
        token = create_token("user-456", "jti-xyz")
        payload_b64 = token.split(".")[1]
        payload = json.loads(_base64url_decode(payload_b64))
        assert payload["sub"] == "user-456"
        assert payload["jti"] == "jti-xyz"
        assert "iat" in payload
        assert "exp" in payload
        assert payload["exp"] > payload["iat"]


class TestVerifyToken:
    def test_valid_token(self):
        token = create_token("user-123", "jti-abc")
        payload = verify_token(token)
        assert payload is not None
        assert payload["sub"] == "user-123"
        assert payload["jti"] == "jti-abc"

    def test_tampered_payload(self):
        token = create_token("user-123", "jti-abc")
        parts = token.split(".")
        # Tamper with payload
        fake_payload = _base64url_encode(json.dumps({"sub": "hacker"}).encode())
        tampered = f"{parts[0]}.{fake_payload}.{parts[2]}"
        assert verify_token(tampered) is None

    def test_invalid_format(self):
        assert verify_token("not.a.jwt.at.all") is None
        assert verify_token("only-one-part") is None
        assert verify_token("") is None

    def test_expired_token(self):
        token = create_token("user-123", "jti-abc")
        # Mock time to be far in the future
        with patch("app.core.jwt.time") as mock_time:
            mock_time.time.return_value = time.time() + 999999999
            assert verify_token(token) is None

    def test_invalid_signature(self):
        token = create_token("user-123", "jti-abc")
        parts = token.split(".")
        # Corrupt signature
        bad_sig = _base64url_encode(b"invalid-signature-bytes")
        corrupted = f"{parts[0]}.{parts[1]}.{bad_sig}"
        assert verify_token(corrupted) is None

    def test_roundtrip_different_users(self):
        t1 = create_token("alice", "jti-1")
        t2 = create_token("bob", "jti-2")
        p1 = verify_token(t1)
        p2 = verify_token(t2)
        assert p1["sub"] == "alice"
        assert p2["sub"] == "bob"
