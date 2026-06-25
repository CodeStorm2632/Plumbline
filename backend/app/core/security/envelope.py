"""传输信封（NFR-6.7）：在 TLS 之上，对敏感字段在请求/响应体内再加一层国密。

线格式复用 SM4 字段加密：客户端可将敏感字段以 SM4 信封 token（`sm4cbc$...`）上送，
服务端 `open_envelope` 透明解密；未加密的明文则原样透传（便于 dev/测试/无前端加密时）。
出参敏感字段由 `core/security/masking` 脱敏，绝不回吐明文。

生产硬化路径（非对称信封）：客户端用服务端 SM2 公钥（`GET /api/crypto/pubkey` →
`crypto.public_key_pem()`）加密敏感字段，仅服务端私钥可解。届时把下方 open_field 切到
`crypto.sm2_decrypt` 即可，对上层签名无影响。
"""

from __future__ import annotations

from collections.abc import Iterable

from app.core.security import crypto

ENVELOPE_PREFIX = "sm4cbc$"


def is_enveloped(v) -> bool:
    return isinstance(v, str) and v.startswith(ENVELOPE_PREFIX)


def open_field(v):
    """信封 token → 明文；明文原样返回。"""
    return crypto.decrypt_field(v) if is_enveloped(v) else v


def open_envelope(data: dict, fields: Iterable[str]) -> dict:
    """解开 data 中指定敏感字段的信封，返回副本（不改原 dict）。"""
    out = dict(data)
    for f in fields:
        if out.get(f) is not None:
            out[f] = open_field(out[f])
    return out


def seal_value(v: str | None) -> str | None:
    """把明文封进 SM4 信封（出参需要回传密文时用；展示一般走脱敏）。"""
    return crypto.encrypt_field(v) if v is not None else None
