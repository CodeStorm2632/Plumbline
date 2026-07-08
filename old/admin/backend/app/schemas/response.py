import math
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ResponseModel(BaseModel, Generic[T]):
    """Unified API response envelope."""

    code: int = 200
    message: str = "success"
    data: T | None = None


class PageData(BaseModel, Generic[T]):
    """Paginated data payload."""

    items: list[T]
    total: int
    page: int
    size: int
    pages: int


class PageResponseModel(BaseModel, Generic[T]):
    """Unified paginated API response envelope."""

    code: int = 200
    message: str = "success"
    data: PageData[T]


def success(data: T | None = None, message: str = "success") -> ResponseModel[T]:
    return ResponseModel(code=200, message=message, data=data)


def page_response(
    *, items: list[T], total: int, page: int, size: int
) -> PageResponseModel[T]:
    pages = math.ceil(total / size) if size > 0 else 0
    return PageResponseModel(
        data=PageData(items=items, total=total, page=page, size=size, pages=pages)
    )
