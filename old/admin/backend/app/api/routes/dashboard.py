"""Dashboard and health check routes."""

from fastapi import APIRouter
from sqlmodel import func, select

from app.api.deps import SessionDep
from app.core.redis import get_redis
from app.models.login_log import LoginLog
from app.models.operation_log import OperationLog, OperationLogPublic
from app.models.role import Role
from app.models.user import User
from app.schemas.response import ResponseModel, success

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/summary", response_model=ResponseModel[dict])
async def dashboard_summary(session: SessionDep) -> ResponseModel[dict]:
    """Get summary statistics for the dashboard."""
    user_count: int = session.exec(select(func.count()).select_from(User)).one()
    role_count: int = session.exec(select(func.count()).select_from(Role)).one()
    today_login_count: int = session.exec(
        select(func.count()).select_from(LoginLog).where(
            func.date(LoginLog.login_at) == func.current_date()
        )
    ).one()
    today_op_count: int = session.exec(
        select(func.count()).select_from(OperationLog).where(
            func.date(OperationLog.created_at) == func.current_date()
        )
    ).one()
    return success({
        "user_count": user_count,
        "role_count": role_count,
        "today_login_count": today_login_count,
        "today_operation_count": today_op_count,
    })


@router.get("/dashboard/recent-logs", response_model=ResponseModel[list[OperationLogPublic]])
async def dashboard_recent_logs(session: SessionDep) -> ResponseModel[list[OperationLogPublic]]:
    """Get last 10 operation logs for dashboard display."""
    from sqlmodel import col
    rows = list(
        session.exec(
            select(OperationLog)
            .order_by(col(OperationLog.created_at).desc())
            .limit(10)
        ).all()
    )
    items = [
        OperationLogPublic(
            id=r.id, user_id=r.user_id, username=r.username,
            module=r.module, action=r.action, method=r.method,
            url=r.url, ip=r.ip, request_params=None,
            response_code=r.response_code, error_msg=r.error_msg,
            cost_time_ms=r.cost_time_ms, created_at=r.created_at,
        )
        for r in rows
    ]
    return success(items)


@router.get("/health", response_model=ResponseModel[dict])
async def health_check(session: SessionDep) -> ResponseModel[dict]:
    """Health check endpoint — verifies DB and Redis connectivity."""
    db_ok = False
    redis_ok = False

    try:
        session.exec(select(func.now()))  # type: ignore[call-overload]
        db_ok = True
    except Exception:
        pass

    try:
        redis = await get_redis()
        await redis.ping()
        await redis.aclose()
        redis_ok = True
    except Exception:
        pass

    status = "healthy" if db_ok and redis_ok else "degraded"
    return success({
        "status": status,
        "database": "ok" if db_ok else "fail",
        "redis": "ok" if redis_ok else "fail",
    })
