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
    """渲染带防伪干扰的验证码 PNG：随机浅底 + 噪点 + 干扰线 + 逐字多色/抖动/旋转。

    无 Pillow 时退化为明文 data-uri（仅开发/测试，生产必装 captcha extra）。
    渲染任何异常都回退明文，保证登录链路不因绘图失败而中断。
    """
    try:
        import base64
        import random as _rand

        from PIL import Image, ImageDraw, ImageFilter, ImageFont  # type: ignore

        w, h = 130, 44
        bg = tuple(_rand.randint(235, 255) for _ in range(3))  # 随机浅色底
        img = Image.new("RGB", (w, h), bg)
        draw = ImageDraw.Draw(img)
        font = ImageFont.load_default(size=30)

        # 背景噪点
        for _ in range(int(w * h * 0.05)):
            draw.point(
                (_rand.randint(0, w - 1), _rand.randint(0, h - 1)),
                fill=tuple(_rand.randint(160, 225) for _ in range(3)),
            )
        # 干扰线
        for _ in range(_rand.randint(4, 6)):
            draw.line(
                [
                    (_rand.randint(0, w), _rand.randint(0, h)),
                    (_rand.randint(0, w), _rand.randint(0, h)),
                ],
                fill=tuple(_rand.randint(110, 190) for _ in range(3)),
                width=1,
            )

        # 逐字符：随机深色 + 上下抖动 + ±旋转（独立小图旋转后贴回，带透明遮罩）
        n = len(code) or 1
        step = (w - 16) // n
        for i, ch in enumerate(code):
            color = tuple(_rand.randint(0, 100) for _ in range(3)) + (255,)
            glyph = Image.new("RGBA", (step + 12, h), (0, 0, 0, 0))
            ImageDraw.Draw(glyph).text((4, _rand.randint(0, 6)), ch, font=font, fill=color)
            glyph = glyph.rotate(
                _rand.randint(-30, 30), expand=1, resample=Image.Resampling.BICUBIC
            )
            img.paste(glyph, (8 + i * step - 6, _rand.randint(-3, 3)), glyph)

        img = img.filter(ImageFilter.SMOOTH)  # 轻微平滑，进一步干扰 OCR 边缘

        buf = io.BytesIO()
        img.save(buf, "PNG")
        return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
    except Exception:
        # demo 占位：明文（前端开发期直接显示；生产必装 Pillow）
        return f"data:text/plain,{code}"
