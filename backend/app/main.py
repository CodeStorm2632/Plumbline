from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.features.auth.router import router as auth_router
from app.features.review.router import router as review_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.ENV in {"dev", "test"}:
        from app.core.db import init_db
        init_db()                       # 生产用 alembic upgrade head，绝不 create_all
    yield


def create_app() -> FastAPI:
    if settings.SENTRY_DSN:
        try:
            import sentry_sdk  # type: ignore
            sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.1)
        except Exception:
            pass
    app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"],
                       allow_headers=["*"])
    app.include_router(auth_router)
    app.include_router(review_router)

    @app.get("/health", operation_id="health")
    def health():
        from app.core.security import crypto
        return {"status": "ok", "crypto_backend": crypto.backend()}

    return app


app = create_app()
