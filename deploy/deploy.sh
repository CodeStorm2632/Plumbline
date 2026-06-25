#!/usr/bin/env bash
# 主机侧部署：拉镜像 → 迁移 → 起服务 → 健康冒烟 → 失败自动回滚到上一个 tag。
# 用法（在部署主机的项目目录执行，由 CI 通过 SSH 调用）：
#   ./deploy/deploy.sh <IMAGE_TAG>
# 依赖：docker、docker compose、主机已有 .env（含 REGISTRY/IMAGE_PREFIX/数据库与密钥）。
set -euo pipefail

NEW_TAG="${1:?usage: deploy.sh <IMAGE_TAG>}"
COMPOSE="docker compose -f docker-compose.prod.yml"
STATE=".deploy_current_tag"
PREV_TAG="$(cat "$STATE" 2>/dev/null || echo "")"

echo "▶ 部署 tag=$NEW_TAG（上一个=$PREV_TAG）"
export IMAGE_TAG="$NEW_TAG"

rollback() {
  if [ -n "$PREV_TAG" ] && [ "$PREV_TAG" != "$NEW_TAG" ]; then
    echo "✗ 部署失败，回滚到 $PREV_TAG"
    IMAGE_TAG="$PREV_TAG" $COMPOSE up -d --no-build
  else
    echo "✗ 部署失败且无可回滚版本，请人工介入"
  fi
  exit 1
}
trap rollback ERR

$COMPOSE pull
# 一次性迁移容器（与运行实例同镜像）
IMAGE_TAG="$NEW_TAG" $COMPOSE run --rm backend uv run alembic upgrade head
$COMPOSE up -d

# 健康冒烟：最多等 60s
echo "▶ 冒烟检查 /health"
ok=0
for i in $(seq 1 20); do
  if $COMPOSE exec -T backend python -c "import urllib.request,sys;sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)" 2>/dev/null; then
    ok=1; break
  fi
  sleep 3
done
[ "$ok" = "1" ] || { echo "健康检查未通过"; false; }

trap - ERR
echo "$NEW_TAG" > "$STATE"
echo "✓ 部署成功 tag=$NEW_TAG"
