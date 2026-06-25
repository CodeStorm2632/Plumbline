FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml ./
RUN uv sync --extra crypto --extra captcha --extra monitor
COPY . .
# 生产：先迁移再起服务
# uv run 在启动时会按 pyproject.toml 重新 sync；必须同样带上 --extra crypto，
# 否则运行期会把 tongsuopy 卸掉、crypto 退化到 demo 后端（不安全）。
CMD ["sh", "-c", "uv run --extra crypto --extra captcha --extra monitor alembic upgrade head && uv run --extra crypto --extra captcha --extra monitor uvicorn app.main:app --host 0.0.0.0 --port 8000"]
