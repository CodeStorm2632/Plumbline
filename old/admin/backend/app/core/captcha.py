"""SVG CAPTCHA generation and verification using Redis."""

import base64
import uuid

from captcha.image import ImageCaptcha
from redis.asyncio import Redis

from app.core.config import settings

_captcha_gen = ImageCaptcha(width=160, height=60)


async def generate_captcha(redis: Redis) -> tuple[str, str]:  # type: ignore[type-arg]
    """Generate captcha. Returns (captcha_id, captcha_image_base64)."""
    import random
    import string

    captcha_id = str(uuid.uuid4())
    text = "".join(random.choices(string.digits + string.ascii_uppercase, k=4))

    # Generate PNG image and convert to base64
    image_data = _captcha_gen.generate(text)
    image_bytes = image_data.read()
    image_b64 = base64.b64encode(image_bytes).decode()

    # Store in Redis with TTL
    await redis.set(
        f"captcha:{captcha_id}",
        text.upper(),
        ex=settings.CAPTCHA_EXPIRE_SECONDS,
    )

    return captcha_id, f"data:image/png;base64,{image_b64}"


async def verify_captcha(redis: Redis, captcha_id: str, captcha_code: str) -> bool:  # type: ignore[type-arg]
    """Verify captcha and delete it (one-time use)."""
    key = f"captcha:{captcha_id}"
    stored = await redis.get(key)
    if not stored:
        return False
    # Delete immediately to prevent replay
    await redis.delete(key)
    return stored.upper() == captcha_code.upper()
