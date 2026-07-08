"""Unit tests for unified API response models."""

from app.schemas.response import (
    PageData,
    PageResponseModel,
    ResponseModel,
    page_response,
    success,
)


class TestResponseModel:
    def test_default_values(self):
        r = ResponseModel(data="test")
        assert r.code == 200
        assert r.message == "success"
        assert r.data == "test"

    def test_custom_code_and_message(self):
        r = ResponseModel(code=400, message="bad request", data=None)
        assert r.code == 400
        assert r.message == "bad request"

    def test_none_data(self):
        r = ResponseModel(data=None)
        assert r.data is None


class TestSuccess:
    def test_with_data(self):
        r = success(data={"key": "value"})
        assert r.code == 200
        assert r.data == {"key": "value"}

    def test_without_data(self):
        r = success()
        assert r.code == 200
        assert r.data is None

    def test_custom_message(self):
        r = success(message="创建成功")
        assert r.message == "创建成功"


class TestPageResponse:
    def test_basic(self):
        r = page_response(items=["a", "b", "c"], total=3, page=1, size=10)
        assert r.code == 200
        assert r.data.items == ["a", "b", "c"]
        assert r.data.total == 3
        assert r.data.page == 1
        assert r.data.size == 10
        assert r.data.pages == 1

    def test_multiple_pages(self):
        r = page_response(items=[], total=25, page=3, size=10)
        assert r.data.pages == 3

    def test_exact_page_boundary(self):
        r = page_response(items=[], total=20, page=2, size=10)
        assert r.data.pages == 2

    def test_empty_result(self):
        r = page_response(items=[], total=0, page=1, size=10)
        assert r.data.pages == 0
        assert r.data.items == []

    def test_single_item(self):
        r = page_response(items=[{"id": 1}], total=1, page=1, size=10)
        assert r.data.pages == 1
        assert len(r.data.items) == 1
