import re

from app.core.config import settings


def validate_password_strength(password: str) -> str | None:
    """Validate password against configured policy. Returns error message or None."""
    if len(password) < settings.PASSWORD_MIN_LENGTH:
        return f"密码长度不能少于 {settings.PASSWORD_MIN_LENGTH} 个字符"
    if len(password) > settings.PASSWORD_MAX_LENGTH:
        return f"密码长度不能超过 {settings.PASSWORD_MAX_LENGTH} 个字符"
    if settings.PASSWORD_REQUIRE_UPPER and not re.search(r"[A-Z]", password):
        return "密码必须包含大写字母"
    if settings.PASSWORD_REQUIRE_LOWER and not re.search(r"[a-z]", password):
        return "密码必须包含小写字母"
    if settings.PASSWORD_REQUIRE_DIGIT and not re.search(r"\d", password):
        return "密码必须包含数字"
    if settings.PASSWORD_REQUIRE_SPECIAL and not re.search(
        r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?`~]", password
    ):
        return "密码必须包含特殊字符"
    return None
