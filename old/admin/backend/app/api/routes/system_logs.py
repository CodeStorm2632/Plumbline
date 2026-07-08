"""System log management routes."""

import uuid

from fastapi import APIRouter, Query, Request
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, PaginationDep, SessionDep
from app.api.permission import require_permission
from app.core.audit import log_operation
from app.core.sm4 import sm4_decrypt
from app.models.login_log import LoginLog, LoginLogPublic
from app.models.operation_log import OperationLog, OperationLogPublic
from app.schemas.response import PageResponseModel, ResponseModel, page_response, success

router = APIRouter(prefix="/system/logs", tags=["system-logs"])


# ── Operation Logs ──────────────────────────────────────────────

@router.get(
    "/operation",
    response_model=PageResponseModel[OperationLogPublic],
    dependencies=[require_permission("sys:log:list")],
)
async def list_operation_logs(
    session: SessionDep,
    pagination: PaginationDep,
    module: str | None = Query(None),
    username: str | None = Query(None),
) -> PageResponseModel[OperationLogPublic]:
    """List operation logs with pagination and filtering."""
    query = select(OperationLog)
    count_query = select(func.count()).select_from(OperationLog)

    if module:
        query = query.where(OperationLog.module == module)
        count_query = count_query.where(OperationLog.module == module)
    if username:
        query = query.where(col(OperationLog.username).contains(username))
        count_query = count_query.where(col(OperationLog.username).contains(username))

    total: int = session.exec(count_query).one()
    rows = list(
        session.exec(
            query.order_by(col(OperationLog.created_at).desc())
            .offset(pagination.offset)
            .limit(pagination.size)
        ).all()
    )

    items: list[OperationLogPublic] = []
    for r in rows:
        decrypted_params: str | None = None
        if r.request_params:
            try:
                decrypted_params = sm4_decrypt(r.request_params)
            except Exception:
                decrypted_params = "[解密失败]"
        items.append(
            OperationLogPublic(
                id=r.id, user_id=r.user_id, username=r.username,
                module=r.module, action=r.action, method=r.method,
                url=r.url, ip=r.ip, request_params=decrypted_params,
                response_code=r.response_code, error_msg=r.error_msg,
                cost_time_ms=r.cost_time_ms, created_at=r.created_at,
            )
        )

    return page_response(items=items, total=total, page=pagination.page, size=pagination.size)


@router.get(
    "/operation/{log_id}",
    response_model=ResponseModel[OperationLogPublic],
    dependencies=[require_permission("sys:log:list")],
)
async def get_operation_log(
    log_id: uuid.UUID,
    session: SessionDep,
) -> ResponseModel[OperationLogPublic]:
    """Get operation log detail with decrypted params."""
    row = session.get(OperationLog, log_id)
    if not row:
        from app.core.exceptions import BusinessException
        raise BusinessException(404, "日志不存在")

    decrypted_params: str | None = None
    if row.request_params:
        try:
            decrypted_params = sm4_decrypt(row.request_params)
        except Exception:
            decrypted_params = "[解密失败]"

    return success(OperationLogPublic(
        id=row.id, user_id=row.user_id, username=row.username,
        module=row.module, action=row.action, method=row.method,
        url=row.url, ip=row.ip, request_params=decrypted_params,
        response_code=row.response_code, error_msg=row.error_msg,
        cost_time_ms=row.cost_time_ms, created_at=row.created_at,
    ))


@router.delete(
    "/operation",
    response_model=ResponseModel[None],
    dependencies=[require_permission("sys:log:del")],
)
@log_operation("日志管理", "清空操作日志")
async def clear_operation_logs(
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[None]:
    """Clear all operation logs."""
    from sqlalchemy import delete as sa_delete
    session.exec(sa_delete(OperationLog))  # type: ignore[call-overload]
    session.commit()
    return success(message="操作日志已清空")


# ── Login Logs ──────────────────────────────────────────────────

@router.get(
    "/login",
    response_model=PageResponseModel[LoginLogPublic],
    dependencies=[require_permission("sys:log:list")],
)
async def list_login_logs(
    session: SessionDep,
    pagination: PaginationDep,
    username: str | None = Query(None),
    status: int | None = Query(None),
) -> PageResponseModel[LoginLogPublic]:
    """List login logs with pagination and filtering."""
    query = select(LoginLog)
    count_query = select(func.count()).select_from(LoginLog)

    if username:
        query = query.where(col(LoginLog.username).contains(username))
        count_query = count_query.where(col(LoginLog.username).contains(username))
    if status is not None:
        query = query.where(LoginLog.status == status)
        count_query = count_query.where(LoginLog.status == status)

    total: int = session.exec(count_query).one()
    rows = list(
        session.exec(
            query.order_by(col(LoginLog.login_at).desc())
            .offset(pagination.offset)
            .limit(pagination.size)
        ).all()
    )

    items = [
        LoginLogPublic(
            id=r.id, username=r.username, ip=r.ip,
            browser=r.browser, os=r.os, status=r.status,
            fail_reason=r.fail_reason, login_at=r.login_at,
        )
        for r in rows
    ]
    return page_response(items=items, total=total, page=pagination.page, size=pagination.size)


@router.delete(
    "/login",
    response_model=ResponseModel[None],
    dependencies=[require_permission("sys:log:del")],
)
@log_operation("日志管理", "清空登录日志")
async def clear_login_logs(
    request: Request,
    session: SessionDep,
    current_user: CurrentUser,
) -> ResponseModel[None]:
    """Clear all login logs."""
    from sqlalchemy import delete as sa_delete
    session.exec(sa_delete(LoginLog))  # type: ignore[call-overload]
    session.commit()
    return success(message="登录日志已清空")
