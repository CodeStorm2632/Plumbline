"""Operation log decorator and helpers."""

import functools
import json
import logging
import time
from typing import Any

from fastapi import Request
from sqlmodel import Session

from app.core.sm4 import sm4_encrypt
from app.models.operation_log import OperationLog

logger = logging.getLogger(__name__)

# Fields to mask in request params
_SENSITIVE_FIELDS = {"password", "current_password", "new_password", "captcha_code"}


def _mask_params(params: dict[str, Any]) -> dict[str, Any]:
    """Mask sensitive fields in request parameters."""
    masked = {}
    for k, v in params.items():
        if k.lower() in _SENSITIVE_FIELDS:
            masked[k] = "******"
        else:
            masked[k] = v
    return masked


def log_operation(module: str, action: str):
    """Decorator to log an API operation to the operation_log table.

    Usage:
        @router.post("/users")
        @log_operation("用户管理", "新增用户")
        async def create_user(...): ...
    """

    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            request: Request | None = kwargs.get("request")
            session: Session | None = kwargs.get("session")
            current_user = kwargs.get("current_user")

            response_code = 200
            error_msg = None
            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as exc:
                response_code = getattr(exc, "code", getattr(exc, "status_code", 500))
                error_msg = str(exc)
                raise
            finally:
                cost_ms = int((time.time() - start_time) * 1000)
                if session and request:
                    try:
                        # Collect request params
                        params: dict[str, Any] = {}
                        if request.query_params:
                            params.update(dict(request.query_params))
                        # Try to get body from kwargs
                        body = kwargs.get("body")
                        if body and hasattr(body, "model_dump"):
                            params.update(body.model_dump())

                        masked = _mask_params(params)
                        encrypted_params = sm4_encrypt(
                            json.dumps(masked, ensure_ascii=False, default=str)
                        ) if masked else None

                        log_entry = OperationLog(
                            user_id=current_user.id if current_user else None,
                            username=current_user.username if current_user else None,
                            module=module,
                            action=action,
                            method=request.method,
                            url=str(request.url.path),
                            ip=request.client.host if request.client else None,
                            request_params=encrypted_params,
                            response_code=response_code,
                            error_msg=error_msg,
                            cost_time_ms=cost_ms,
                        )
                        session.add(log_entry)
                        session.commit()
                    except Exception:
                        logger.exception("Failed to write operation log")

        return wrapper

    return decorator
