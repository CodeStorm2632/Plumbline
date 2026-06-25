from pydantic import BaseModel, Field, field_validator

from app.core.security.password_policy import check_password


class CaptchaOut(BaseModel):
    captcha_id: str
    image: str
    ttl: int


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)
    captcha_id: str
    captcha_code: str


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3)
    password: str
    phone: str | None = None
    email: str | None = None
    roles: list[str] = []

    @field_validator("password")
    @classmethod
    def _policy(cls, v: str) -> str:
        errs = check_password(v)
        if errs:
            raise ValueError("；".join(errs))
        return v


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    roles: list[str]


class UserOut(BaseModel):       # 展示用，手机/邮箱已脱敏
    id: str
    username: str
    phone: str | None = None
    email: str | None = None
    roles: list[str]
