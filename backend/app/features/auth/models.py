from datetime import datetime

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    phone_enc: str | None = None      # SM4 密文
    email_enc: str | None = None      # SM4 密文
    roles_csv: str = ""               # 角色逗号分隔
    status: str = "active"            # active | locked | disabled
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def roles(self) -> list[str]:
        return [r for r in self.roles_csv.split(",") if r]
