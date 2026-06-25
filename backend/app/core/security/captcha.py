"""图形验证码：生成 code 存 Redis（5 分钟过期），校验后即焚。

图像绘制用 Pillow（可选）；无 Pillow 时返回占位 data-uri，code 逻辑不受影响。
"""
import io
import secrets
import string

from app.core.config import settings
from app.core.store import k_captcha, store

ALPHABET = string.ascii_uppercase + string.digits


def new_captcha() -> dict:
    cid = secrets.token_urlsafe(12)
    code = "".join(secrets.choice(ALPHABET) for _ in range(4))
    store.set(k_captcha(cid), code.upper(), ttl=settings.CAPTCHA_TTL)
    return {"captcha_id": cid, "image": _render(code), "ttl": settings.CAPTCHA_TTL}


def verify_captcha(cid: str, code: str) -> bool:
    if not cid or not code:
        return False
    real = store.get(k_captcha(cid))
    store.delete(k_captcha(cid))  # 一次性
    return bool(real and real == code.strip().upper())


def _render(code: str) -> str:
    try:
        from PIL import Image, ImageDraw  # type: ignore

        img = Image.new("RGB", (100, 36), "white")
        d = ImageDraw.Draw(img)
        d.text((12, 10), code, fill="black")
        buf = io.BytesIO()
        img.save(buf, "PNG")
        import base64

        return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
    except Exception:
        # demo 占位：前端开发期直接显示明文（生产必装 Pillow）
        return f"data:text/plain,{code}"
