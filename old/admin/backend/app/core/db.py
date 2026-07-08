from sqlmodel import Session, create_engine

from app.core.config import settings

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


def init_db(session: Session) -> None:
    from app.models import SQLModel
    from app.initial_data import seed_initial_data

    SQLModel.metadata.create_all(engine)
    seed_initial_data(session)
