FROM node:22-alpine AS build
# build context 是仓库根（见 docker-compose.yml 的 frontend.build.context）。
# WORKDIR 设成 /app/frontend，让 orval.config.ts 里 ../specs/contract/openapi.json 相对路径成立。
WORKDIR /app/frontend
# pnpm 11 在 CI 容器里的几道隐式开关：
# - CI=true：依赖状态检查走非交互分支（避免 ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY）。
# - strict-dep-builds=false：被忽略的 lifecycle 脚本（如 esbuild postinstall）不再 fail-fast；
#   esbuild 0.19+ 走 optionalDependencies 分发 platform 包，跳过 build script 不影响运行。
# - verify-deps-before-run=false：跑 pnpm orval/build 前不再做依赖状态检查，
#   避免 COPY 触发"重装 node_modules + 重跑供应链检查"。
ENV CI=true \
    PNPM_CONFIG_STRICT_DEP_BUILDS=false \
    PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false
RUN corepack enable
COPY frontend/package.json frontend/pnpm-workspace.yaml ./
RUN pnpm install
# orval 需要读 ../specs/contract/openapi.json，先单独 COPY 这份契约。
COPY specs/contract/openapi.json /app/specs/contract/openapi.json
COPY frontend/ ./
RUN pnpm orval && pnpm build

FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
# SPA 回退
RUN printf 'server{listen 80;root /usr/share/nginx/html;location /{try_files $uri /index.html;}}' \
    > /etc/nginx/conf.d/default.conf
