FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json ./
RUN pnpm install
COPY . .
RUN pnpm orval && pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# SPA 回退
RUN printf 'server{listen 80;root /usr/share/nginx/html;location /{try_files $uri /index.html;}}' \
    > /etc/nginx/conf.d/default.conf
