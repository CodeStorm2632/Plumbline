"""Unit tests for SM3 password hashing (PBKDF2-HMAC-SM3)."""

import pytest

from tests.conftest import requires_tongsuopy

pytestmark = requires_tongsuopy

from app.core.security import (
    _hmac_sm3,
    _pbkdf2_sm3,
    _sm3_hash,
    hash_password,
    verify_password,
)


class TestSM3Hash:
    def test_deterministic(self):
        data = b"hello"
        assert _sm3_hash(data) == _sm3_hash(data)

    def test_different_inputs_different_outputs(self):
        assert _sm3_hash(b"hello") != _sm3_hash(b"world")

    def test_output_length(self):
        assert len(_sm3_hash(b"test")) == 32

    def test_empty_input(self):
        result = _sm3_hash(b"")
        assert len(result) == 32


class TestHMACSM3:
    def test_deterministic(self):
        key = b"secret"
        msg = b"message"
        assert _hmac_sm3(key, msg) == _hmac_sm3(key, msg)

    def test_different_keys(self):
        msg = b"message"
        assert _hmac_sm3(b"key1", msg) != _hmac_sm3(b"key2", msg)

    def test_different_messages(self):
        key = b"secret"
        assert _hmac_sm3(key, b"msg1") != _hmac_sm3(key, b"msg2")

    def test_output_length(self):
        assert len(_hmac_sm3(b"key", b"msg")) == 32

    def test_long_key(self):
        """Key longer than block size should be hashed first."""
        long_key = b"x" * 128
        result = _hmac_sm3(long_key, b"message")
        assert len(result) == 32


class TestPBKDF2SM3:
    def test_deterministic(self):
        result1 = _pbkdf2_sm3(b"password", b"salt", 10)
        result2 = _pbkdf2_sm3(b"password", b"salt", 10)
        assert result1 == result2

    def test_different_passwords(self):
        r1 = _pbkdf2_sm3(b"pass1", b"salt", 10)
        r2 = _pbkdf2_sm3(b"pass2", b"salt", 10)
        assert r1 != r2

    def test_different_salts(self):
        r1 = _pbkdf2_sm3(b"password", b"salt1", 10)
        r2 = _pbkdf2_sm3(b"password", b"salt2", 10)
        assert r1 != r2

    def test_different_iterations(self):
        r1 = _pbkdf2_sm3(b"password", b"salt", 10)
        r2 = _pbkdf2_sm3(b"password", b"salt", 20)
        assert r1 != r2

    def test_output_length(self):
        assert len(_pbkdf2_sm3(b"p", b"s", 1, dk_len=32)) == 32
        assert len(_pbkdf2_sm3(b"p", b"s", 1, dk_len=64)) == 64
        assert len(_pbkdf2_sm3(b"p", b"s", 1, dk_len=16)) == 16


class TestHashAndVerifyPassword:
    def test_hash_format(self):
        hashed = hash_password("Test@1234")
        parts = hashed.split("$")
        assert len(parts) == 5
        assert parts[0] == ""
        assert parts[1] == "sm3"
        # iterations
        int(parts[2])
        # salt hex
        bytes.fromhex(parts[3])
        # hash hex
        bytes.fromhex(parts[4])

    def test_verify_correct_password(self):
        hashed = hash_password("MyPass@123")
        assert verify_password("MyPass@123", hashed) is True

    def test_verify_wrong_password(self):
        hashed = hash_password("MyPass@123")
        assert verify_password("WrongPass@1", hashed) is False

    def test_different_hashes_for_same_password(self):
        """Each call generates a random salt, so hashes differ."""
        h1 = hash_password("Same@Pass1")
        h2 = hash_password("Same@Pass1")
        assert h1 != h2
        # But both verify
        assert verify_password("Same@Pass1", h1) is True
        assert verify_password("Same@Pass1", h2) is True

    def test_verify_invalid_format(self):
        assert verify_password("test", "not-a-valid-hash") is False
        assert verify_password("test", "$md5$100$abcd$1234") is False
        assert verify_password("test", "") is False

    def test_unicode_password(self):
        hashed = hash_password("密码@Test1")
        assert verify_password("密码@Test1", hashed) is True
        assert verify_password("密@Test1", hashed) is False
