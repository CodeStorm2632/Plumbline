ARG BUN_IMAGE=oven/bun:1
ARG BUN_SLIM_IMAGE=oven/bun:1-slim

FROM ${BUN_IMAGE} AS build-stage

WORKDIR /app

ARG NPM_REGISTRY=https://registry.npmmirror.com

COPY frontend/package.json frontend/bun.lock* /app/

RUN printf 'registry=%s\n' "$NPM_REGISTRY" > /root/.npmrc && bun install

COPY ./frontend /app/
ARG VITE_API_URL

RUN bun run build

FROM ${BUN_SLIM_IMAGE} AS runtime

WORKDIR /app

COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/server.ts ./server.ts

ENV PORT=80

EXPOSE 80

CMD ["bun", "server.ts"]
