from fastapi import HTTPException


class BusinessException(HTTPException):
    """Custom business logic exception with unified response format."""

    def __init__(self, code: int, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(status_code=code, detail=message)
