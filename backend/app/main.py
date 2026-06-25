from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.features.auth.router import router as auth_router
from app.features.sys_user.router import router as sys_user_router
from app.features.sys_role.router import router as sys_role_router
from app.features.sys_menu.router import router as sys_menu_router
from app.features.sys_dict.router import router as sys_dict_router
from app.features.sys_log.router import router as sys_log_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.ENV in {"dev", "test"}:
        from app.core.db import init_db

        init_db()  # 生产用 alembic upgrade head，绝不 create_all
    yield


def create_app() -> FastAPI:
    if settings.SENTRY_DSN:
        try:
            import sentry_sdk  # type: ignore

            sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.1)
        except Exception:
            pass
    app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
    )
    app.include_router(auth_router)
    app.include_router(sys_user_router)
    app.include_router(sys_role_router)
    app.include_router(sys_menu_router)
    app.include_router(sys_dict_router)
    app.include_router(sys_log_router)

    @app.get("/health", operation_id="health")
    def health():
        from app.core.security import crypto

        return {"status": "ok", "crypto_backend": crypto.backend()}

    @app.get(
        "/api/crypto/pubkey", operation_id="cryptoPubKey", openapi_extra={"x-trace": ["NFR-6.7"]}
    )
    def crypto_pubkey():
        """下发 SM2 公钥供客户端做传输信封加密（NFR-6.7）。demo 无非对称密钥返回 null。"""
        from app.core.security import crypto

        return {"backend": crypto.backend(), "sm2_public_key": crypto.public_key_pem()}

    return app


app = create_app()
