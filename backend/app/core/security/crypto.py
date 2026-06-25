"""国密加解密统一接口（crypto seam）。

生产路径用 tongsuopy 提供 SM2 / SM3 / SM4；若环境未装 tongsuopy（本地、CI、测试），
自动降级到一个**仅供开发**的 stdlib demo 后端（PBKDF2-SHA256 / HMAC / 可逆编码），
并发出一次性告警。两套后端实现同一组函数签名，业务层不感知差异。

⚠ demo 后端不安全，绝不能用于生产。生产务必 `uv sync --extra crypto` 装 tongsuopy。
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import time
import warnings

# ---- 后端选择 ----------------------------------------------------------------
try:  # 生产：真实国密
    from tongsuopy.crypto import hashes as _ts_hashes  # type: ignore
    from tongsuopy.crypto.asymmetric import sm2 as _ts_sm2  # type: ignore
    from tongsuopy.crypto.ciphers import SM4, modes  # type: ignore

    _BACKEND = "tongsuopy"
except Exception:  # 开发/CI：demo 降级
    _BACKEND = "demo"
    warnings.warn(
        "tongsuopy 未安装，crypto 使用 DEMO 后端（不安全，仅供开发/测试）。"
        "生产请 `uv sync --extra crypto`。",
        RuntimeWarning,
        stacklevel=2,
    )


def backend() -> str:
    return _BACKEND


# ---- 口令哈希：PBKDF2-HMAC-SM3（10 万次）------------------------------------
PBKDF2_ITERATIONS = 100_000


def hash_password(password: str, *, salt: bytes | None = None) -> str:
    """返回 `algo$iter$salt$hash`（base64）。demo 用 sha256 代 SM3。"""
    salt = salt or secrets.token_bytes(16)
    if _BACKEND == "tongsuopy":
        dk = _pbkdf2_sm3(password.encode(), salt, PBKDF2_ITERATIONS)
        algo = "pbkdf2-sm3"
    else:
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
        algo = "pbkdf2-sha256(demo)"
    return f"{algo}${PBKDF2_ITERATIONS}${_b64(salt)}${_b64(dk)}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iters, salt_b64, hash_b64 = stored.split("$")
        salt = _unb64(salt_b64)
        if algo.startswith("pbkdf2-sm3"):
            dk = _pbkdf2_sm3(password.encode(), salt, int(iters))
        else:
            dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(iters))
        return hmac.compare_digest(_b64(dk), hash_b64)
    except Exception:
        return False


def _pbkdf2_sm3(pw: bytes, salt: bytes, iters: int) -> bytes:
    """用 SM3 作 PRF 的 PBKDF2（仅 tongsuopy 后端）。"""
    def sm3(data: bytes) -> bytes:
        h = _ts_hashes.Hash(_ts_hashes.SM3())
        h.update(data)
        return h.finalize()

    def prf(key: bytes, msg: bytes) -> bytes:  # HMAC-SM3
        block = 64
        if len(key) > block:
            key = sm3(key)
        key = key.ljust(block, b"\x00")
        o = bytes(b ^ 0x5C for b in key)
        i = bytes(b ^ 0x36 for b in key)
        return sm3(o + sm3(i + msg))

    dk, block_index = b"", 1
    while len(dk) < 32:
        u = prf(pw, salt + block_index.to_bytes(4, "big"))
        t = bytearray(u)
        for _ in range(iters - 1):
            u = prf(pw, u)
            for k in range(len(t)):
                t[k] ^= u[k]
        dk += bytes(t)
        block_index += 1
    return dk[:32]


# ---- 敏感字段加密：SM4-CBC ---------------------------------------------------
def _field_key() -> bytes:
    raw = os.getenv("SM4_KEY", "0123456789abcdef")  # 16B；生产从 env/KMS 注入
    return raw.encode()[:16].ljust(16, b"\x00")


def encrypt_field(plaintext: str | None) -> str | None:
    if plaintext is None:
        return None
    data = plaintext.encode()
    iv = secrets.token_bytes(16)
    if _BACKEND == "tongsuopy":
        c = SM4(_field_key())
        enc = c.encryptor(modes.CBC(iv)) if hasattr(c, "encryptor") else None
        ct = enc.update(_pkcs7(data)) + enc.finalize()
    else:  # demo：IV 派生流密钥异或（可逆、非安全）
        ct = _xor_stream(_pkcs7(data), _field_key(), iv)
    return "sm4cbc$" + _b64(iv) + "$" + _b64(ct)


def decrypt_field(token: str | None) -> str | None:
    if token is None:
        return None
    try:
        _, iv_b64, ct_b64 = token.split("$")
        iv, ct = _unb64(iv_b64), _unb64(ct_b64)
        if _BACKEND == "tongsuopy":
            c = SM4(_field_key())
            dec = c.decryptor(modes.CBC(iv))
            pt = dec.update(ct) + dec.finalize()
        else:
            pt = _xor_stream(ct, _field_key(), iv)
        return _unpkcs7(pt).decode()
    except Exception:
        return None


# ---- JWT：SM2 非对称签名 -----------------------------------------------------
def sign_jwt(payload: dict, *, ttl: int = 3600) -> str:
    body = dict(payload)
    body.setdefault("iat", int(time.time()))
    body["exp"] = int(time.time()) + ttl
    header = {"alg": "SM2" if _BACKEND == "tongsuopy" else "HS256-demo", "typ": "JWT"}
    signing_input = _b64(_dumps(header)) + "." + _b64(_dumps(body))
    sig = _jwt_sign(signing_input.encode())
    return signing_input + "." + _b64(sig)


def verify_jwt(token: str) -> dict | None:
    try:
        h_b64, p_b64, sig_b64 = token.split(".")
        signing_input = (h_b64 + "." + p_b64).encode()
        if not _jwt_verify(signing_input, _unb64(sig_b64)):
            return None
        payload = json.loads(_unb64(p_b64))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


def _jwt_sign(data: bytes) -> bytes:
    if _BACKEND == "tongsuopy":
        key = _sm2_private_key()
        return key.sign(data)  # tongsuopy SM2 sign
    return hmac.new(_demo_jwt_secret(), data, hashlib.sha256).digest()


def _jwt_verify(data: bytes, sig: bytes) -> bool:
    if _BACKEND == "tongsuopy":
        try:
            _sm2_public_key().verify(sig, data)
            return True
        except Exception:
            return False
    return hmac.compare_digest(hmac.new(_demo_jwt_secret(), data, hashlib.sha256).digest(), sig)


# tongsuopy SM2 key 载入（生产从 env/KMS）；demo 用 HMAC，不需要密钥对
def _sm2_private_key():
    return _ts_sm2.load_pem_private_key(os.environ["SM2_PRIVATE_KEY"].encode(), None)


def _sm2_public_key():
    return _ts_sm2.load_pem_public_key(os.environ["SM2_PUBLIC_KEY"].encode())


def _demo_jwt_secret() -> bytes:
    return os.getenv("DEMO_JWT_SECRET", "dev-only-secret").encode()


# ---- 小工具 ------------------------------------------------------------------
def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode().rstrip("=")


def _unb64(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def _dumps(d: dict) -> bytes:
    return json.dumps(d, separators=(",", ":"), ensure_ascii=False).encode()


def _pkcs7(data: bytes, block: int = 16) -> bytes:
    pad = block - len(data) % block
    return data + bytes([pad]) * pad


def _unpkcs7(data: bytes) -> bytes:
    return data[: -data[-1]]


def _xor_stream(data: bytes, key: bytes, iv: bytes) -> bytes:
    out, counter = bytearray(), 0
    while len(out) < len(data):
        block = hashlib.sha256(key + iv + counter.to_bytes(8, "big")).digest()
        out += block
        counter += 1
    return bytes(a ^ b for a, b in zip(data, out))
