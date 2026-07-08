ARG PYTHON_PLATFORM=linux/amd64
ARG PYTHON_IMAGE=python:3.12
FROM --platform=${PYTHON_PLATFORM} ${PYTHON_IMAGE}

ENV PYTHONUNBUFFERED=1
ARG PYPI_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/

# Install uv
RUN pip install --no-cache-dir --index-url ${PYPI_INDEX_URL} uv==0.9.26

ENV UV_COMPILE_BYTECODE=1
ENV UV_HTTP_RETRIES=5
ENV UV_HTTP_TIMEOUT=180
ENV UV_LINK_MODE=copy
ENV UV_INDEX_URL=${PYPI_INDEX_URL}

WORKDIR /app/

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

# Install dependencies
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-workspace --package app

COPY ./backend/scripts /app/backend/scripts

COPY ./backend/pyproject.toml ./backend/alembic.ini /app/backend/

COPY ./backend/app /app/backend/app

# Sync the project
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --package app

WORKDIR /app/backend/

CMD ["fastapi", "run", "--workers", "4", "app/main.py"]
