# Plumbline（准绳）— 规格驱动全栈脚手架

一根贯穿「需求 → 设计 → 代码」的准绳：PRD 与 UI 说明是真源，代码按**屏垂直切片**，
每个接口可追溯回 `[FR-*]`，四道关卡 + ID 锁守在合入前。配套 `prd-writer → prd-to-ui-spec
→ spec-to-slice` 三棒流水线。

`plumb`=垂直（垂直切片），准绳=校准笔直的基准（追溯校验），亦取「准绳=标准」呼应「配置即标准」。

## 技术栈

后端 FastAPI · SQLModel · PostgreSQL 18 · Redis 7 · Alembic · tongsuopy(国密) · uv。
前端 React 19 · Vite 7 · TanStack Router/Query/Table · Shadcn/UI · Tailwind 4 · Zod 4。
基础设施 Docker Compose · Traefik · Sentry(可选)。

## 目录布局

```
specs/                       规格真源（单一可信源）
  prd/PRD-*.md               PRD（[FR-*] 在此定义）
  prd/indicators.yaml        结构化指标（可空）
  ui/SC-*.md                 逐屏 UI 设计说明
  contract/openapi.json      后端导出的契约（orval 输入，generated）
  requirements-lock.yaml     ID 登记表（防删/回收/重编号）
backend/
  app/
    core/                    跨切片：config db store deps security/* audit/*
    features/                垂直切片，与前端 features 一一对应
      auth/                  models·schemas·service·router（一个切片=一个文件夹）
      review/                models·schemas·service·router
    main.py  seed.py
  migrations/  tests/  pyproject.toml  Dockerfile
frontend/
  src/
    lib/api/                 http.ts + generated/
    components/ui/           shadcn
    features/{auth,review}/  api.ts + Page.tsx（与后端 features 对应）
tools/pipeline/              四道关卡 + ID 锁脚本（仓内自包含）
docs/pipeline.md            三棒流水线 runbook（离线参考）
.github/workflows/          spec-gates / backend-tests / contract-drift
```

> 设计取向：**特性优先（feature-first）而非分层**。切一刀 = 后端加一个 `features/<x>/` +
> 前端加一个 `features/<x>/`，二者一一对应；跨切片的认证/审计/国密在 `core/`。

## 快速开始

```bash
cp .env.example .env
make up                     # postgres / redis / traefik / backend / frontend
make seed                   # 演示账号：expert/Expert@123（评审专家）, viewer/Viewer@123（回测分析员）

make check                  # 四道规格关卡（提交前）
make test                   # 后端 pytest（不装 tongsuopy → 走 demo crypto 后端）
make gen-lock               # 首次建立 specs/requirements-lock.yaml 基线

# 不用 Docker 单独跑后端：
cd backend && uv sync --extra dev && uv run python -m app.seed && uv run uvicorn app.main:app --reload
```

访问 `http://localhost/`（Traefik）或 `http://localhost:8000/health`（含当前 crypto 后端标识）。

## 安全特性落点

| 特性 | 代码 |
|------|------|
| 口令哈希 PBKDF2-SM3(10万次) | `app/core/security/crypto.py: hash_password` |
| JWT SM2 签名 | `crypto.py: sign_jwt/verify_jwt` |
| 字段加密 SM4-CBC | `crypto.py: encrypt_field/decrypt_field`（手机/邮箱在 `features/auth/models.py`） |
| Token 白名单 + 即时吊销 | `core/store.py` + `features/auth/service.py: logout` |
| 账户锁定(5次/30分钟) | `features/auth/service.py: login` + `store.incr(k_lock)` |
| 口令策略 | `core/security/password_policy.py` |
| 数据脱敏 | `core/security/masking.py`（`/auth/me` 返回掩码） |
| 审计日志(操作+登录) | `core/audit/service.py` + `core/audit/models.py` |
| RBAC 按钮级 + 数据范围 | `core/security/rbac.py` + `core/deps.py: require_perms` |
| 图形验证码(Redis,5分钟) | `core/security/captcha.py` |

> **国密**：默认无 tongsuopy 时 crypto 走 **demo 后端**（不安全，仅本地/CI）。生产
> `uv sync --extra crypto` 装 tongsuopy，注入 `SM2_PRIVATE_KEY/SM2_PUBLIC_KEY/SM4_KEY`，
> 并用 `make test` + 一次真实登录验证签名/加密路径。

## 加一屏 / 切一刀（日常流程）

1. 改需求 → `specs/prd/PRD-*.md` 追新 `[FR-*]`（只增不改）→ `make check` + `make gen-lock`。
2. 出屏 → `specs/ui/SC-<n>-*.md`（套 prd-to-ui-spec 模板，含状态清单）→ `make check`。
3. 切片 → 后端建 `backend/app/features/<x>/{models,schemas,service,router}.py`，前端建
   `frontend/src/features/<x>/{api.ts,Page.tsx}`；`make openapi` 导契约，`pnpm orval` 生成类型
   → `make test` + `make check`。
4. coverage 显示某 FR 仍 🔴/🟠 → 补屏/补接口，直到清零；PRD 置 `status: approved`，CI 用 `--strict`。

## CI/CD（测试 → 构建 → 部署上线）

代码自动写出后，GitHub Actions 接力完成全链，全程门控（详见 `docs/cicd.md`）：

- **ci.yml（测试门）**：`spec-gates`（四关+ID锁）、`backend-tests`（pytest）、
  `frontend-tests`（类型+Vitest）、`contract-drift`（openapi 一致）。测试不过不构建。
- **cd.yml（交付）**：`tests` 复用 ci → `build` 推镜像到 GHCR → `deploy-staging`（main 自动）
  → `deploy-production`（打 `v*` tag 或手动，**GitHub 环境审批门控**）。部署后 `/health` 冒烟，失败自动回滚。

```
make test-all          # 本地：后端 pytest + 前端 Vitest
git tag v1.0.0 && git push --tags   # 触发生产部署（需审批）
```

需要的 Secrets / 环境与主机准备见 `docs/cicd.md`。

## 自动化测试边界

机器保证：追溯不断、覆盖不漏、ID 不乱、接口行为符合测试（权限 403 / 必填 422 / 重算 / 留痕 / 锁定 / 吊销）。
仍需人判：PRD 是否抓对需求、屏是否齐、`[OQ-*]` 是否真拍板、前端视觉交互、验收阈值。
前端目前只有类型/契约约束，组件测试（Vitest/RTL）按需补。流水线 runbook 见 `docs/pipeline.md`。
