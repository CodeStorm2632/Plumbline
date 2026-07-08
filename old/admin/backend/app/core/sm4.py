"""SM4-CBC encryption and decryption for sensitive fields."""

import os

from tongsuopy.crypto.ciphers import Cipher, algorithms, modes

from app.core.config import settings

_SM4_BLOCK_SIZE = 16


def _get_key() -> bytes:
    return bytes.fromhex(settings.SM4_SECRET_KEY)


def _pad(data: bytes) -> bytes:
    """PKCS7 padding."""
    pad_len = _SM4_BLOCK_SIZE - (len(data) % _SM4_BLOCK_SIZE)
    return data + bytes([pad_len]) * pad_len


def _unpad(data: bytes) -> bytes:
    """PKCS7 unpadding."""
    pad_len = data[-1]
    if pad_len < 1 or pad_len > _SM4_BLOCK_SIZE:
        raise ValueError("Invalid padding")
    if data[-pad_len:] != bytes([pad_len]) * pad_len:
        raise ValueError("Invalid padding")
    return data[:-pad_len]


def sm4_encrypt(plaintext: str) -> str:
    """Encrypt plaintext with SM4-CBC. Returns iv_hex:ciphertext_hex."""
    if not plaintext:
        return ""
    key = _get_key()
    iv = os.urandom(_SM4_BLOCK_SIZE)
    cipher = Cipher(algorithms.SM4(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    padded = _pad(plaintext.encode())
    ciphertext = encryptor.update(padded) + encryptor.finalize()
    return f"{iv.hex()}:{ciphertext.hex()}"


def sm4_decrypt(encrypted: str) -> str:
    """Decrypt SM4-CBC encrypted string. Input format: iv_hex:ciphertext_hex."""
    if not encrypted:
        return ""
    key = _get_key()
    iv_hex, ct_hex = encrypted.split(":")
    iv = bytes.fromhex(iv_hex)
    ciphertext = bytes.fromhex(ct_hex)
    cipher = Cipher(algorithms.SM4(key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    padded = decryptor.update(ciphertext) + decryptor.finalize()
    return _unpad(padded).decode()
