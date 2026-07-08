"""Sensitive data masking utility functions."""


def mask_phone(phone: str) -> str:
    """Mask phone number: 13812341234 → 138****1234."""
    if not phone or len(phone) < 7:
        return phone
    return phone[:3] + "****" + phone[-4:]


def mask_email(email: str) -> str:
    """Mask email: test@example.com → t***@example.com."""
    if not email or "@" not in email:
        return email
    local, domain = email.split("@", 1)
    if len(local) <= 1:
        return f"{local}***@{domain}"
    return f"{local[0]}***@{domain}"
