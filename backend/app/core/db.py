"""数据库会话（SQLModel）。dev/test 用 create_all；prod 用 Alembic。"""
from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)


def init_db() -> None:
    """仅 dev/test 调用；生产用 `alembic upgrade head`。"""
    import app.features  # noqa: F401  确保模型注册

    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
