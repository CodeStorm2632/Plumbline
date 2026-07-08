"""SM2 JWT token creation and verification."""

import base64
import json
import time

from tongsuopy.crypto import hashes, serialization
from tongsuopy.crypto.asymciphers import ec
from tongsuopy.crypto.exceptions import InvalidSignature

from app.core.config import settings


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _base64url_decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s)


def _get_private_key() -> ec.EllipticCurvePrivateKey:
    pem = settings.SM2_PRIVATE_KEY.replace("\\n", "\n")
    return serialization.load_pem_private_key(
        pem.encode(), password=None
    )


def _get_public_key() -> ec.EllipticCurvePublicKey:
    pem = settings.SM2_PUBLIC_KEY.replace("\\n", "\n")
    return serialization.load_pem_public_key(pem.encode())


def create_token(user_id: str, jti: str) -> str:
    """Create a JWT signed with SM2."""
    now = int(time.time())
    header = {"alg": "SM2", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "jti": jti,
        "iat": now,
        "exp": now + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }

    header_b64 = _base64url_encode(json.dumps(header, separators=(",", ":")).encode())
    payload_b64 = _base64url_encode(
        json.dumps(payload, separators=(",", ":")).encode()
    )
    signing_input = f"{header_b64}.{payload_b64}".encode()

    private_key = _get_private_key()
    signature = private_key.sign(signing_input, ec.ECDSA(hashes.SM3()))
    sig_b64 = _base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def verify_token(token: str) -> dict | None:
    """Verify and decode a SM2 JWT. Returns payload dict or None if invalid."""
    parts = token.split(".")
    if len(parts) != 3:
        return None

    signing_input = f"{parts[0]}.{parts[1]}".encode()
    try:
        signature = _base64url_decode(parts[2])
    except Exception:
        return None

    public_key = _get_public_key()
    try:
        public_key.verify(signature, signing_input, ec.ECDSA(hashes.SM3()))
    except InvalidSignature:
        return None

    try:
        payload = json.loads(_base64url_decode(parts[1]))
    except (json.JSONDecodeError, Exception):
        return None

    # Check expiration
    if payload.get("exp", 0) < time.time():
        return None

    return payload
