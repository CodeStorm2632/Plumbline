"""展示脱敏：手机号 / 邮箱。"""


def mask_phone(phone: str | None) -> str | None:
    if not phone or len(phone) < 7:
        return phone
    return phone[:3] + "****" + phone[-4:]


def mask_email(email: str | None) -> str | None:
    if not email or "@" not in email:
        return email
    name, domain = email.split("@", 1)
    head = name[0] if name else ""
    return f"{head}***@{domain}"
