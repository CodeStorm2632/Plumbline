"""Unit tests for SM4-CBC encryption and decryption."""

import pytest

from tests.conftest import requires_tongsuopy

pytestmark = requires_tongsuopy

from app.core.sm4 import sm4_decrypt, sm4_encrypt


class TestSM4EncryptDecrypt:
    def test_roundtrip(self):
        plaintext = "hello world"
        encrypted = sm4_encrypt(plaintext)
        decrypted = sm4_decrypt(encrypted)
        assert decrypted == plaintext

    def test_format(self):
        encrypted = sm4_encrypt("test data")
        # Format: iv_hex:ciphertext_hex
        assert ":" in encrypted
        iv_hex, ct_hex = encrypted.split(":")
        # IV is 16 bytes = 32 hex chars
        assert len(iv_hex) == 32
        # Ciphertext should be valid hex
        bytes.fromhex(ct_hex)

    def test_different_encryptions(self):
        """Random IV means same plaintext produces different ciphertext."""
        e1 = sm4_encrypt("same text")
        e2 = sm4_encrypt("same text")
        assert e1 != e2
        # But both decrypt correctly
        assert sm4_decrypt(e1) == "same text"
        assert sm4_decrypt(e2) == "same text"

    def test_empty_string(self):
        assert sm4_encrypt("") == ""
        assert sm4_decrypt("") == ""

    def test_unicode(self):
        text = "中文测试数据 🎉"
        encrypted = sm4_encrypt(text)
        assert sm4_decrypt(encrypted) == text

    def test_long_text(self):
        text = "A" * 10000
        encrypted = sm4_encrypt(text)
        assert sm4_decrypt(encrypted) == text

    def test_block_boundary_lengths(self):
        """Test plaintext at various lengths around block size (16 bytes)."""
        for length in [1, 15, 16, 17, 31, 32, 33]:
            text = "x" * length
            assert sm4_decrypt(sm4_encrypt(text)) == text
