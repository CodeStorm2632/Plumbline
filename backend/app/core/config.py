"""集中配置（从环境变量读取，无需 pydantic-settings）。"""
import os


class Settings:
    APP_NAME = os.getenv("APP_NAME", "SDD Starter")
    ENV = os.getenv("ENV", "dev")  # dev | test | prod
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
    REDIS_URL = os.getenv("REDIS_URL", "")  # 空 → 内存兜底
    JWT_TTL = int(os.getenv("JWT_TTL", "3600"))
    # 账户锁定策略
    MAX_FAILED = int(os.getenv("MAX_FAILED_ATTEMPTS", "5"))
    LOCK_MINUTES = int(os.getenv("LOCK_MINUTES", "30"))
    # 验证码
    CAPTCHA_TTL = int(os.getenv("CAPTCHA_TTL", "300"))
    SENTRY_DSN = os.getenv("SENTRY_DSN", "")

    @property
    def is_prod(self) -> bool:
        return self.ENV == "prod"


settings = Settings()
