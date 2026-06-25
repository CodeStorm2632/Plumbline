"""日志查询路由：/api/sys/logs。只读，require_perms("sys:log:read")。x-trace FR-6.4.*。"""

from datetime import datetime

from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, get_session, require_perms
from app.features.sys_log import service
from app.features.sys_log.schemas import AuditLogOut, LoginLogOut

router = APIRouter(prefix="/api/sys/logs", tags=["sys_log"])

READ = require_perms("sys:log:read")


@router.get(
    "/audit",
    response_model=list[AuditLogOut],
    operation_id="listAuditLogs",
    openapi_extra={"x-trace": ["FR-6.4.1", "FR-6.4.3", "NFR-6.4", "NFR-6.6"]},
)
def list_audit(
    entity_id: str | None = None,
    actor: str | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
    limit: int = 50,
    offset: int = 0,
    session=Depends(get_session),
    user: CurrentUser = Depends(READ),
):
    return service.list_audit(
        session, entity_id=entity_id, actor=actor, start=start, end=end, limit=limit, offset=offset
    )


@router.get(
    "/login",
    response_model=list[LoginLogOut],
    operation_id="listLoginLogs",
    openapi_extra={"x-trace": ["FR-6.4.2", "FR-6.4.3", "NFR-6.6"]},
)
def list_login(
    username: str | None = None,
    success: bool | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
    limit: int = 50,
    offset: int = 0,
    session=Depends(get_session),
    user: CurrentUser = Depends(READ),
):
    return service.list_login(
        session,
        username=username,
        success=success,
        start=start,
        end=end,
        limit=limit,
        offset=offset,
    )
