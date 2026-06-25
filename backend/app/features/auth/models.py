from sqlmodel import Field

from app.core.models import SysBase


class User(SysBase, table=True):
    id: str = Field(primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    phone_enc: str | None = None  # SM4 密文
    email_enc: str | None = None  # SM4 密文
    roles_csv: str = ""  # 角色逗号分隔
    status: str = "active"  # active | locked | disabled
    # created_at/updated_at/created_by/updated_by/is_deleted 由 SysBase 提供

    @property
    def roles(self) -> list[str]:
        return [r for r in self.roles_csv.split(",") if r]
