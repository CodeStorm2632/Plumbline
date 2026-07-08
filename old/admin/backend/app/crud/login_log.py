"""Login log recording utility."""

from fastapi import Request
from sqlmodel import Session
from user_agents import parse as ua_parse

from app.models.login_log import LoginLog


def record_login_log(
    session: Session,
    request: Request,
    username: str,
    status: int,
    fail_reason: str | None = None,
) -> None:
    """Record a login attempt to the login_log table."""
    ua_string = request.headers.get("user-agent", "")
    ua = ua_parse(ua_string)
    browser = f"{ua.browser.family} {ua.browser.version_string}".strip()
    os_info = f"{ua.os.family} {ua.os.version_string}".strip()
    ip = request.client.host if request.client else None

    log = LoginLog(
        username=username,
        ip=ip,
        browser=browser or None,
        os=os_info or None,
        status=status,
        fail_reason=fail_reason,
    )
    session.add(log)
    session.commit()
