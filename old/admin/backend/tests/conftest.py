"""Shared test fixtures and configuration."""

import os

import pytest

# Set test environment variables before importing app modules
os.environ.setdefault("ENVIRONMENT", "local")
os.environ.setdefault("POSTGRES_SERVER", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ.setdefault("POSTGRES_USER", "postgres")
os.environ.setdefault("POSTGRES_PASSWORD", "changethis")
os.environ.setdefault("POSTGRES_DB", "matrixadmin_test")
os.environ.setdefault("REDIS_HOST", "localhost")
os.environ.setdefault("REDIS_PORT", "6379")
os.environ.setdefault("SM4_SECRET_KEY", "0123456789abcdef0123456789abcdef")
os.environ.setdefault("PBKDF2_ITERATIONS", "1000")  # Fast iterations for tests

# Try to generate SM2 key pair; fall back to dummy values when
# tongsuopy native backend is unavailable (e.g. macOS local dev).
_tongsuopy_available = False
try:
    from tongsuopy.crypto import serialization
    from tongsuopy.crypto.asymciphers import ec

    _test_key = ec.generate_private_key(ec.SM2())
    _private_pem = _test_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()
    _public_pem = _test_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()
    _tongsuopy_available = True
except (ImportError, OSError):
    # Dummy PEM values so settings can still be constructed
    _private_pem = "-----BEGIN PRIVATE KEY-----\nDUMMY\n-----END PRIVATE KEY-----"
    _public_pem = "-----BEGIN PUBLIC KEY-----\nDUMMY\n-----END PUBLIC KEY-----"

os.environ.setdefault("SM2_PRIVATE_KEY", _private_pem)
os.environ.setdefault("SM2_PUBLIC_KEY", _public_pem)

# Marker for tests requiring the tongsuopy native backend
requires_tongsuopy = pytest.mark.skipif(
    not _tongsuopy_available,
    reason="tongsuopy native backend not available",
)
