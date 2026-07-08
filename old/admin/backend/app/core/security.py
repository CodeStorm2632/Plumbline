"""SM3 password hashing using PBKDF2-HMAC-SM3."""

import hmac as hmac_module
import os
import struct

from tongsuopy.crypto import hashes

from app.core.config import settings

_SM3_BLOCK_SIZE = 64
_SM3_DIGEST_SIZE = 32


def _sm3_hash(data: bytes) -> bytes:
    h = hashes.Hash(hashes.SM3())
    h.update(data)
    return h.finalize()


def _hmac_sm3(key: bytes, msg: bytes) -> bytes:
    if len(key) > _SM3_BLOCK_SIZE:
        key = _sm3_hash(key)
    key = key.ljust(_SM3_BLOCK_SIZE, b"\x00")
    o_key_pad = bytes(k ^ 0x5C for k in key)
    i_key_pad = bytes(k ^ 0x36 for k in key)
    return _sm3_hash(o_key_pad + _sm3_hash(i_key_pad + msg))


def _pbkdf2_sm3(
    password: bytes, salt: bytes, iterations: int, dk_len: int = 32
) -> bytes:
    blocks_needed = (dk_len + _SM3_DIGEST_SIZE - 1) // _SM3_DIGEST_SIZE
    dk = b""
    for block_num in range(1, blocks_needed + 1):
        u = _hmac_sm3(password, salt + struct.pack(">I", block_num))
        result = u
        for _ in range(iterations - 1):
            u = _hmac_sm3(password, u)
            result = bytes(a ^ b for a, b in zip(result, u))
        dk += result
    return dk[:dk_len]


def hash_password(plain: str) -> str:
    """Hash password using PBKDF2-SM3. Returns $sm3$iterations$salt_hex$hash_hex."""
    salt = os.urandom(16)
    iterations = settings.PBKDF2_ITERATIONS
    dk = _pbkdf2_sm3(plain.encode(), salt, iterations)
    return f"$sm3${iterations}${salt.hex()}${dk.hex()}"


def verify_password(plain: str, hashed: str) -> bool:
    """Verify password against PBKDF2-SM3 hash using constant-time comparison."""
    parts = hashed.split("$")
    # Format: $sm3$iterations$salt_hex$hash_hex → ['', 'sm3', iterations, salt, hash]
    if len(parts) != 5 or parts[1] != "sm3":
        return False
    try:
        iterations = int(parts[2])
        salt = bytes.fromhex(parts[3])
        expected_hash = bytes.fromhex(parts[4])
    except (ValueError, IndexError):
        return False
    dk = _pbkdf2_sm3(plain.encode(), salt, iterations)
    return hmac_module.compare_digest(dk, expected_hash)
