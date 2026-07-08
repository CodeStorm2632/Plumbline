"""SM2 encryption/decryption for login credential transport.

Compatible with the JavaScript `sm-crypto` library (mode 1: C1‖C3‖C2 format).
The frontend encrypts with the SM2 public key; this module decrypts on the backend.

Ciphertext layout produced by sm-crypto doEncrypt(..., pubKey, 1):
    C1 : 04‖x‖y  — random EC point, 65 bytes (130 hex chars)
    C3 : SM3 hash — 32 bytes  (64 hex chars)
    C2 : ciphertext — variable length
"""

import struct

from tongsuopy.crypto import hashes

# ── SM2 curve parameters (GB/T 32918 / GM/T 0003) ─────────────────────────────
_P = 0xFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF
_A = 0xFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC
# Generator point G
_GX = 0x32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7
_GY = 0xBC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0


# ── EC point arithmetic ────────────────────────────────────────────────────────

def _point_add(P, Q):
    """Add two points on the SM2 curve (Weierstrass form)."""
    if P is None:
        return Q
    if Q is None:
        return P
    x1, y1 = P
    x2, y2 = Q
    if x1 == x2:
        if y1 != y2:
            return None  # point at infinity
        # Point doubling
        lam = (3 * x1 * x1 + _A) * pow(2 * y1, -1, _P) % _P
    else:
        lam = (y2 - y1) * pow(x2 - x1, -1, _P) % _P
    x3 = (lam * lam - x1 - x2) % _P
    y3 = (lam * (x1 - x3) - y1) % _P
    return (x3, y3)


def _point_mul(k: int, P):
    """Scalar multiplication k·P using double-and-add."""
    R = None
    Q = P
    while k:
        if k & 1:
            R = _point_add(R, Q)
        Q = _point_add(Q, Q)
        k >>= 1
    return R


# ── SM3 hash helper (via tongsuopy) ──────────────────────────────────────────

def _sm3(data: bytes) -> bytes:
    h = hashes.Hash(hashes.SM3())
    h.update(data)
    return h.finalize()


# ── SM2 KDF (GB/T 32918.4 §6.4.3) ────────────────────────────────────────────

def _kdf(z: bytes, klen: int) -> bytes:
    """Derive *klen* bytes from *z* using repeated SM3."""
    ha = b""
    ct = 1
    while len(ha) < klen:
        ha += _sm3(z + struct.pack(">I", ct))
        ct += 1
    return ha[:klen]


# ── Public API ─────────────────────────────────────────────────────────────────

def get_sm2_public_key_hex() -> str:
    """Return the server SM2 public key as uncompressed hex string (04‖x‖y).

    sm-crypto's decodePointHex requires the '04' prefix for uncompressed points.
    """
    from app.core.jwt import _get_private_key  # lazy to avoid circular import

    private_key = _get_private_key()
    d = private_key.private_numbers().private_value
    pub = _point_mul(d, (_GX, _GY))
    x, y = pub
    return "04" + x.to_bytes(32, "big").hex() + y.to_bytes(32, "big").hex()


def sm2_decrypt(hex_cipher: str) -> str:
    """Decrypt a hex-encoded SM2 ciphertext produced by sm-crypto (mode 1).

    sm-crypto doEncrypt output format (C1C3C2, mode 1):
        C1 : x‖y — 64 bytes (128 hex chars), NO 04 prefix
        C3 : SM3 hash — 32 bytes (64 hex chars)
        C2 : ciphertext — variable length

    Raises ``ValueError`` if the ciphertext is malformed or the hash check fails.
    """
    from app.core.jwt import _get_private_key

    private_key = _get_private_key()
    d = private_key.private_numbers().private_value

    data = bytes.fromhex(hex_cipher)

    if len(data) < 64 + 32:
        raise ValueError("SM2 ciphertext too short")

    c1x = int.from_bytes(data[0:32], "big")
    c1y = int.from_bytes(data[32:64], "big")
    c3 = data[64:96]   # 32-byte SM3 verification hash
    c2 = data[96:]     # encrypted payload

    # Compute [d]C1
    dC1 = _point_mul(d, (c1x, c1y))
    x2, y2 = dC1
    x2b = x2.to_bytes(32, "big")
    y2b = y2.to_bytes(32, "big")

    # Recover plaintext: M′ = C2 ⊕ KDF(x2‖y2, |C2|)
    t = _kdf(x2b + y2b, len(c2))
    plaintext = bytes(a ^ b for a, b in zip(c2, t))

    # Verify: SM3(x2‖M′‖y2) == C3
    if _sm3(x2b + plaintext + y2b) != c3:
        raise ValueError("SM2 decryption hash verification failed")

    return plaintext.decode("utf-8")
