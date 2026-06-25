"""字典管理路由：/api/sys/dicts。x-trace 回指 FR-6.5.*。"""

from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, get_session, require_perms
from app.features.sys_dict import service
from app.features.sys_dict.schemas import (
    DictCreate,
    DictItemCreate,
    DictItemOut,
    DictItemUpdate,
    DictOut,
    DictUpdate,
)

router = APIRouter(prefix="/api/sys/dicts", tags=["sys_dict"])

READ = require_perms("sys:dict:read")
WRITE = require_perms("sys:dict:write")


@router.get(
    "",
    response_model=list[DictOut],
    operation_id="listSysDicts",
    openapi_extra={"x-trace": ["FR-6.5.1"]},
)
def list_dicts(
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
    session=Depends(get_session),
    user: CurrentUser = Depends(READ),
):
    return service.list_dicts(session, q=q, limit=limit, offset=offset)


@router.post(
    "",
    response_model=DictOut,
    status_code=201,
    operation_id="createSysDict",
    openapi_extra={"x-trace": ["FR-6.5.1"]},
)
def create_dict(body: DictCreate, session=Depends(get_session), user: CurrentUser = Depends(WRITE)):
    return service.create_dict(session, actor=user.name, body=body)


@router.put(
    "/{dict_id}",
    response_model=DictOut,
    operation_id="updateSysDict",
    openapi_extra={"x-trace": ["FR-6.5.1"]},
)
def update_dict(
    dict_id: str, body: DictUpdate, session=Depends(get_session), user: CurrentUser = Depends(WRITE)
):
    return service.update_dict(session, actor=user.name, dict_id=dict_id, body=body)


@router.delete(
    "/{dict_id}",
    status_code=204,
    operation_id="deleteSysDict",
    openapi_extra={"x-trace": ["FR-6.5.1", "NFR-6.1"]},
)
def delete_dict(dict_id: str, session=Depends(get_session), user: CurrentUser = Depends(WRITE)):
    service.delete_dict(session, actor=user.name, dict_id=dict_id)


@router.get(
    "/{type_code}/items",
    response_model=list[DictItemOut],
    operation_id="listSysDictItems",
    openapi_extra={"x-trace": ["FR-6.5.2"]},
)
def list_items(
    type_code: str,
    limit: int = 100,
    offset: int = 0,
    session=Depends(get_session),
    user: CurrentUser = Depends(READ),
):
    return service.list_items(session, type_code, limit=limit, offset=offset)


@router.post(
    "/items",
    response_model=DictItemOut,
    status_code=201,
    operation_id="createSysDictItem",
    openapi_extra={"x-trace": ["FR-6.5.2"]},
)
def create_item(
    body: DictItemCreate, session=Depends(get_session), user: CurrentUser = Depends(WRITE)
):
    return service.create_item(session, actor=user.name, body=body)


@router.put(
    "/items/{item_id}",
    response_model=DictItemOut,
    operation_id="updateSysDictItem",
    openapi_extra={"x-trace": ["FR-6.5.2"]},
)
def update_item(
    item_id: str,
    body: DictItemUpdate,
    session=Depends(get_session),
    user: CurrentUser = Depends(WRITE),
):
    return service.update_item(session, actor=user.name, item_id=item_id, body=body)


@router.delete(
    "/items/{item_id}",
    status_code=204,
    operation_id="deleteSysDictItem",
    openapi_extra={"x-trace": ["FR-6.5.2", "NFR-6.1"]},
)
def delete_item(item_id: str, session=Depends(get_session), user: CurrentUser = Depends(WRITE)):
    service.delete_item(session, actor=user.name, item_id=item_id)


@router.get(
    "/public/{type_code}/items",
    response_model=list[DictItemOut],
    operation_id="getEnabledSysDictItems",
    openapi_extra={"x-trace": ["FR-6.5.3"]},
)
def get_enabled_items(type_code: str, session=Depends(get_session)):
    return service.get_items_by_code(session, type_code)
