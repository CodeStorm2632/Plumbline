from typing import Annotated

from fastapi import Depends, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from redis.asyncio import Redis
from sqlmodel import Session

from app.core.db import engine
from app.core.exceptions import BusinessException
from app.core.jwt import verify_token
from app.core.redis import get_redis
from app.core.token_store import verify_token_exists
from app.models.user import User

_bearer = HTTPBearer(auto_error=False)


def get_db() -> Session:  # type: ignore[misc]
    with Session(engine) as session:
        yield session  # type: ignore[misc]


SessionDep = Annotated[Session, Depends(get_db)]
RedisDep = Annotated[Redis, Depends(get_redis)]  # type: ignore[type-arg]


class PaginationParams:
    def __init__(
        self,
        page: Annotated[int, Query(ge=1, description="页码")] = 1,
        size: Annotated[int, Query(ge=1, le=100, description="每页条数")] = 10,
    ) -> None:
        self.page = page
        self.size = size
        self.offset = (page - 1) * size


PaginationDep = Annotated[PaginationParams, Depends()]


async def get_current_user(
    session: SessionDep,
    redis: RedisDep,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> User:
    """Authenticate via Bearer token: verify SM2 JWT → check Redis whitelist → return user."""
    if not credentials:
        raise BusinessException(401, "未提供认证凭据")

    payload = verify_token(credentials.credentials)
    if not payload:
        raise BusinessException(401, "Token 无效或已过期")

    jti = payload.get("jti")
    if not jti or not await verify_token_exists(redis, jti):
        raise BusinessException(401, "Token 已失效")

    user_id = payload.get("sub")
    user = session.get(User, user_id)
    if not user:
        raise BusinessException(401, "用户不存在")
    if user.status == 0:
        raise BusinessException(403, "账户已被禁用")

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
