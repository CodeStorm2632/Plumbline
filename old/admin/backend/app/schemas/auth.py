"""Auth schemas for request/response."""

import uuid

from pydantic import BaseModel


class CaptchaResponse(BaseModel):
    captcha_id: str
    captcha_image: str


class LoginRequest(BaseModel):
    username: str
    password: str
    captcha_id: str
    captcha_code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserMeResponse(BaseModel):
    id: uuid.UUID
    username: str
    real_name: str | None = None
    email: str | None = None
    phone: str | None = None
    avatar: str | None = None
    is_superadmin: bool
    roles: list[str] = []
    permissions: list[str] = []
    menus: list[dict] = []
