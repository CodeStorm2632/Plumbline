"""Redis Token management with dual-key model.

Keys:
  token:{jti} → user_id (TTL = 24h)   — single token validation
  user_tokens:{user_id} → Set of JTIs  — batch invalidation by user
"""

from redis.asyncio import Redis

from app.core.config import settings

_TOKEN_TTL = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60  # seconds


async def store_token(redis: Redis, user_id: str, jti: str) -> None:  # type: ignore[type-arg]
    """Store token on login: set token:{jti} + add jti to user_tokens:{user_id}."""
    pipe = redis.pipeline()
    pipe.set(f"token:{jti}", user_id, ex=_TOKEN_TTL)
    pipe.sadd(f"user_tokens:{user_id}", jti)
    await pipe.execute()


async def verify_token_exists(redis: Redis, jti: str) -> bool:  # type: ignore[type-arg]
    """Check if token:{jti} exists in Redis."""
    return bool(await redis.exists(f"token:{jti}"))


async def revoke_token(redis: Redis, user_id: str, jti: str) -> None:  # type: ignore[type-arg]
    """Revoke single token on logout."""
    pipe = redis.pipeline()
    pipe.delete(f"token:{jti}")
    pipe.srem(f"user_tokens:{user_id}", jti)
    await pipe.execute()


async def revoke_all_user_tokens(redis: Redis, user_id: str) -> None:  # type: ignore[type-arg]
    """Revoke all tokens for a user (disable account / admin action)."""
    jtis = await redis.smembers(f"user_tokens:{user_id}")
    if jtis:
        pipe = redis.pipeline()
        for jti in jtis:
            pipe.delete(f"token:{jti}")
        pipe.delete(f"user_tokens:{user_id}")
        await pipe.execute()


async def revoke_other_tokens(redis: Redis, user_id: str, keep_jti: str) -> None:  # type: ignore[type-arg]
    """Revoke all tokens except the current one (password change)."""
    jtis = await redis.smembers(f"user_tokens:{user_id}")
    if not jtis:
        return
    pipe = redis.pipeline()
    for jti in jtis:
        if jti != keep_jti:
            pipe.delete(f"token:{jti}")
            pipe.srem(f"user_tokens:{user_id}", jti)
    await pipe.execute()
