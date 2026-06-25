# CI/CD —— 从自动写码到自动上线

承接三棒流水线：`spec-to-slice` 自动写出代码后，由 GitHub Actions 接力完成
**测试 → 构建 → 部署 staging → 部署 production**，全程门控。

## 全链

```
  PR / push main
        │
        ▼  ci.yml（测试门，必过）
  ┌───────────────────────────────────────────────┐
  │ spec-gates    四道规格关卡 + ID 锁              │
  │ backend-tests pytest（权限/锁定/吊销/重算/留痕）│
  │ frontend-tests 类型检查 + Vitest（http/七态）   │
  │ contract-drift openapi 与后端一致              │
  └───────────────────────────────────────────────┘
        │ 全绿
        ▼  cd.yml
  build        构建并推送 backend/frontend 镜像到 GHCR（tag=sha 或 vX）
        │
        ▼
  deploy-staging   main 推送 → 自动部署 staging → /health 冒烟（失败回滚）
        │
        ▼
  deploy-production 打 tag vX（或手动）→ ★GitHub 环境审批★ → 部署 prod → 冒烟（失败回滚）
```

- **测试门**：`cd.yml` 用 `uses: ./.github/workflows/ci.yml` 复用全部检查，**测试不过不构建**。
- **staging 自动**：合并到 `main` 即自动部署到预发，便于持续验证。
- **production 受控**：仅打 `v*` tag 或手动触发；且 `production` 环境配 **required reviewers**，需人工点确认才放行——这是"自动上线"与"安全"的平衡（不建议 prod 全自动无门）。
- **冒烟 + 回滚**：`deploy.sh` 部署后轮询 `/health`，失败自动回滚到上一个 tag。

## 触发方式

| 目标 | 触发 |
|------|------|
| 跑测试 | 任意 PR / push `main` |
| 部署 staging | push `main`（自动）或手动 dispatch 选 staging |
| 部署 production | 打 `git tag vX.Y.Z && git push --tags`，或手动 dispatch 选 production（均需审批） |

## 需要配置的 Secrets / 环境

在仓库 **Settings → Environments** 建 `staging` 与 `production` 两个环境，给 production 勾选
**Required reviewers**（审批人）。各环境配置 secrets：

| Secret | 用途 |
|--------|------|
| `SSH_HOST` / `SSH_USER` / `SSH_KEY` | 部署主机地址 / 账号 / 私钥（环境隔离，staging 与 prod 各一套） |

主机侧 `~/plumbline/.env`（运维一次性放置，CI 不覆盖）需含：`APP_DOMAIN`、`ACME_EMAIL`、
`REGISTRY`、`IMAGE_PREFIX`、`POSTGRES_*`、`SM2_PRIVATE_KEY`/`SM2_PUBLIC_KEY`/`SM4_KEY`（国密生产密钥）。
镜像推送用内置 `GITHUB_TOKEN`（已授 `packages: write`），无需额外配置。

## 主机准备（一次性）

```bash
# 部署主机：装 docker + compose，放置 .env，登录 GHCR 拉私有镜像
mkdir -p ~/plumbline && cd ~/plumbline
cp /path/to/.env .                     # 按 .env.example 填，务必替换密钥
echo "$GHCR_PAT" | docker login ghcr.io -u <user> --password-stdin
# 首次部署由 CI 完成；也可本地：./deploy.sh vX.Y.Z
```

## 回滚

`deploy.sh` 记录 `.deploy_current_tag`；新版本冒烟失败会自动回滚。手动回滚到任意历史版本：

```bash
cd ~/plumbline && ./deploy.sh <旧TAG>
```

## 不同部署形态

本脚手架按 **Docker Compose + Traefik 单主机** 给出最小可用 CD。若用 K8s/Swarm/云托管，
替换 `deploy-*` 两个 job 的部署步骤即可（`kubectl set image` / `helm upgrade` / 云 CLI），
测试门、构建、镜像、审批门控这套骨架不变。
