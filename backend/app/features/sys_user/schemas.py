"""用户管理 入/出 DTO（与 SQLModel 表分离）。"""

from pydantic import BaseModel, Field, field_validator

from app.core.security.password_policy import check_password


class SysUserOut(BaseModel):  # 列表/详情：手机/邮箱已脱敏，绝不回吐明文
    id: str
    username: str
    phone: str | None = None
    email: str | None = None
    roles: list[str]
    status: str


def _policy(v: str) -> str:
    errs = check_password(v)
    if errs:
        raise ValueError("；".join(errs))
    return v


class SysUserCreate(BaseModel):
    username: str = Field(min_length=3)
    password: str
    phone: str | None = None  # 可为信封 token 或明文（open_envelope 透明处理）
    email: str | None = None
    roles: list[str] = []

    @field_validator("password")
    @classmethod
    def _pw(cls, v: str) -> str:
        return _policy(v)


class SysUserUpdate(BaseModel):  # 编辑基本信息（敏感字段同样信封/加密）
    phone: str | None = None
    email: str | None = None


class PasswordReset(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def _pw(cls, v: str) -> str:
        return _policy(v)


class StatusUpdate(BaseModel):
    status: str = Field(pattern="^(active|disabled)$")


class RoleAssign(BaseModel):
    roles: list[str]
