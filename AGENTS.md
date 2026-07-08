# AGENTS.md — Plumbline（准绳）

规格驱动（SDD）全栈脚手架：PRD / UI 说明是**真源**，代码按「屏」**垂直切片**，每个接口可追溯回 `[FR-*]`，合入前四道关卡 + ID 锁必须绿。完整项目记忆见 [CLAUDE.md](CLAUDE.md)（本文件是其面向通用 AI 代理的精简入口，深度内容一律链接、不复制）。

## 沟通语言

**始终用中文回复。**

## 五条铁律（详见 [CLAUDE.md](CLAUDE.md)）

1. **规格优先**：需求只在 `specs/prd/PRD-*.md` 定义并分配 `[FR-*]`（只增不改）；缺需求回 PRD 追 ID，不在下游"顺手加功能"。
2. **垂直切片**：一屏一刀，后端 `backend/app/features/<x>/` 与前端 `frontend/src/features/<x>/` 一一对应；跨切片的认证 / 审计 / 国密在 `core/`。
3. **追溯不断**：接口带 `operation_id` + `openapi_extra={"x-trace":[FR-...]}`；UI 说明 frontmatter 带 `traces_to`。
4. **安全默认**：见 [.claude/rules/security.md](.claude/rules/security.md)，违反即返工。
5. **完成定义**：`make check`（四关）+ 相关测试全绿；生成物（openapi、orval 产物）不手改，用 `make openapi` / `pnpm orval` 重生成。

## 常用命令

| 命令 | 作用 |
|------|------|
| `make check` | 四道规格关卡（prd_lint / check_trace / check_xtrace / coverage）|
| `make test-all` | 后端 pytest + 前端 Vitest |
| `make openapi` | 后端导出 `specs/contract/openapi.json`（动了接口必跑）|
| `make gen-lock` / `make check-lock` | 生成 / 校验需求 ID 锁 |
| `make up` / `make down` / `make seed` | compose 起停 / 灌演示数据 |
| `make verify` / `make auto REQ="..."` | 形式化裁判 / 自治循环 |

- 后端单测：`cd backend && uv run pytest tests/test_xxx.py::name -q`（先 `uv sync --extra dev`）。
- 前端单测：`cd frontend && pnpm vitest run src/features/<x>/Xxx.test.tsx`（监视 `pnpm test:watch`）。
- 包管理：后端用 `uv add` / `uv sync`（**勿 pip**），前端用 `pnpm`（**勿 npm**）。
- 前端类型检查：`cd frontend && pnpm lint`（= `tsc --noEmit`）。

## 技术栈

后端 FastAPI · SQLModel · PostgreSQL 18 · Redis 7 · Alembic · tongsuopy(国密) · uv。
前端 React 19 · Vite 7 · TanStack(Router / Query / Table) · Shadcn/UI · Tailwind 4 · Zod 4 · orval。

## 目录与切片

特性优先（feature-first），不是分层。一个切片 = 一个文件夹，前后端对称：

- 后端 `backend/app/features/<x>/{models,schemas,service,router}.py`（表模型放各自切片，跨切片审计模型在 `core/audit/`）。
- 前端 `frontend/src/features/<x>/{api.ts,<X>Page.tsx}`（请求统一走 `lib/api/http.ts`，类型/hooks 由 orval 生成到 `lib/api/generated/`）。

架构详解见 [.claude/rules/architecture.md](.claude/rules/architecture.md)；「切一刀」标准 7 步流程见 [.claude/rules/workflow.md](.claude/rules/workflow.md)。

## 详细规范（按需展开，别把内容复制进代码）

- 架构与目录：[.claude/rules/architecture.md](.claude/rules/architecture.md)
- 后端约定（表/Schema 分离、不手拼 SQL、写操作三段式）：[.claude/rules/backend.md](.claude/rules/backend.md)
- 前端约定（统一 http.ts、orval 生成勿手改、页面七态）：[.claude/rules/frontend.md](.claude/rules/frontend.md)
- 安全约定（国密走 crypto.py、绝不硬编码密钥、脱敏、审计）：[.claude/rules/security.md](.claude/rules/security.md)
- 追溯约定：[.claude/rules/traceability.md](.claude/rules/traceability.md)
- 测试约定：[.claude/rules/testing.md](.claude/rules/testing.md)
- 三棒流水线 runbook：[docs/pipeline.md](docs/pipeline.md)；自治循环原理：[docs/loop.md](docs/loop.md)

## 关键陷阱

- **生成物勿手改**：`specs/contract/openapi.json` 由 `make openapi` 生成；`frontend/src/lib/api/generated/` 由 `pnpm orval` 生成。契约变了就重生成，别手动补。
- **国密默认退化**：不装 `tongsuopy` 时 crypto 走 **demo 后端（不安全，仅本地/CI）**；生产 `uv sync --extra crypto` 并注入 `SM2_PRIVATE_KEY` / `SM2_PUBLIC_KEY` / `SM4_KEY`（16 字节）。绝不把私钥或明文口令提交到仓库或写进日志。
- **ID 只增不改**：`[FR-*]` / `[NFR-*]` / `[OQ-*]` 不删、不回收、不重排；改 PRD 后跑 `make check-lock`。
- **新增表要注册**：新表建在 `features/<x>/models.py`，并确保被 `app/features/__init__.py` 导入（否则 Alembic 发现不了）；结构变更只走 `alembic revision --autogenerate`，不在生产 `create_all`、不手改已存在迁移。
- **页面必须覆盖七态**：加载 / 错误(可重试) / 空 / 无权限(隐藏写操作) / 缺失或未确认 / 否决 / 成功，缺态视为未完成。
- **遇到 `[OQ-*]` 未决或需部署 = 硬停点**，交人决策，别自行拍板。
