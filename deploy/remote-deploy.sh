#!/usr/bin/env bash
# CI runner 侧：建立 SSH，把编排文件与部署脚本同步到主机，再远程执行 deploy.sh。
# 需要环境变量（由 cd.yml 注入，来自 GitHub Environment secrets）：
#   SSH_HOST  SSH_USER  SSH_KEY  TAG
set -euo pipefail
: "${SSH_HOST:?}"; : "${SSH_USER:?}"; : "${SSH_KEY:?}"; : "${TAG:?}"

REMOTE_DIR="${REMOTE_DIR:-~/plumbline}"
mkdir -p ~/.ssh
printf '%s\n' "$SSH_KEY" > ~/.ssh/id_deploy
chmod 600 ~/.ssh/id_deploy
ssh-keyscan -H "$SSH_HOST" >> ~/.ssh/known_hosts 2>/dev/null || true
SSH="ssh -i ~/.ssh/id_deploy -o StrictHostKeyChecking=accept-new $SSH_USER@$SSH_HOST"

$SSH "mkdir -p $REMOTE_DIR"
scp -i ~/.ssh/id_deploy docker-compose.prod.yml deploy/deploy.sh "$SSH_USER@$SSH_HOST:$REMOTE_DIR/"
# 主机 .env 由运维一次性放置（含密钥/数据库口令），CI 不覆盖。
$SSH "cd $REMOTE_DIR && chmod +x deploy.sh && ./deploy.sh '$TAG'"
echo "✓ 远程部署完成 tag=$TAG host=$SSH_HOST"
