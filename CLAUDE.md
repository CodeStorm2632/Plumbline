# Plumbline — Claude Code 项目记忆

规格驱动（SDD）全栈项目。核心铁律：**规格是真源 · 垂直切片 · 追溯不断 · 安全默认 · 收尾前四关须绿。**
你写的每一行代码都要能回指到 `specs/prd/PRD-*.md` 里的 `[FR-*]`。

## 五条铁律（任何任务都适用）

1. **规格优先**：需求只在 PRD 定义并分配 `[FR-*]`。代码/规格里发现缺需求 → 回 PRD 追加新 ID（只增不改），不要在下游"顺手加功能"。
2. **垂直切片**：一屏一刀，后端 `backend/app/features/<x>/` 与前端 `frontend/src/features/<x>/` 一一对应；跨切片的认证/审计/国密在 `core/`。不要回到"按层堆"。
3. **追溯**：接口带 `operation_id` + `openapi_extra={"x-trace":[FR-...]}`；UI 说明 frontmatter 带 `traces_to`。
4. **安全默认**：见 @.claude/rules/security.md，违反即返工。
5. **完成定义**：改完跑 `make check`（四关）+ 相关测试，全绿才算完成。生成物（openapi、orval 产物）不手改，用 `make openapi` / `pnpm orval` 重生成。

## 技术栈

后端 FastAPI · SQLModel · PostgreSQL18 · Redis7 · Alembic · tongsuopy(国密) · uv。
前端 React19 · Vite7 · TanStack(Router/Query/Table) · Shadcn/UI · Tailwind4 · Zod4 · orval。

## 常用命令

- `make check` 四道规格关卡　`make test-all` 前后端测试　`make openapi` 后端导出契约
- `make gen-lock`/`make check-lock` 需求 ID 锁　`make up`/`make down` 起停 compose　`make seed` 灌演示数据
- **四关**（`tools/pipeline/pipeline_check.sh`，缺产物则跳过对应关）：
  ① `prd_lint`（PRD frontmatter/§5 每叶子有 FR/无内部悬空）→ ② `check_trace`（SC 引用的 ID 都在 PRD）
  → ③ `check_xtrace`（接口 x-trace 都在 PRD）→ 全链 `coverage`（每条 FR 是否落到屏/接口）。
- **跑单个测试**：
  - 后端 `cd backend && uv run pytest tests/test_review.py::test_name -q`（先 `uv sync --extra dev`）
  - 前端 `cd frontend && pnpm vitest run src/features/review/ReviewPage.test.tsx`，监视 `pnpm test:watch`
- **前端开发**：`pnpm dev`（Vite）　`pnpm lint`（= `tsc --noEmit` 类型检查）　`pnpm orval`（从契约生成类型/hooks）
- **不装国密**：默认 crypto 走 **demo 后端**（不安全，仅本地/CI）；生产 `uv sync --extra crypto` 装 tongsuopy。
- 切一刀的标准流程见 @.claude/rules/workflow.md

## 详细规范（按需展开）

- 架构与目录：@.claude/rules/architecture.md
- 后端约定：@.claude/rules/backend.md
- 前端约定：@.claude/rules/frontend.md
- 安全约定：@.claude/rules/security.md
- 追溯约定：@.claude/rules/traceability.md
- 测试约定：@.claude/rules/testing.md
- 切片工作流：@.claude/rules/workflow.md

## 自动执行（loop）

- `/auto <需求>`：交给 `orchestrator` 子代理端到端自动实现，终止条件＝裁判 `tools/loop/verify.sh` 输出 DONE。
- 无头：`make auto REQ="..."`（有界：迭代/预算/动作上限 + 无进展熔断）。
- 裁判即"完成定义"：`make verify`。遇 `[OQ-*]` 或需部署＝硬停点，交人决策。原理见 docs/loop.md。

## 可用 Skills（自动触发）

`.claude/skills/` 内置四个方法论 skill，Claude 会按需自动加载：
- `prd-writer`：把零散需求整理成带 `[FR-*]` 的 PRD（markdown 真源）。
- `prd-to-ui-spec`：从 PRD 推导逐屏 UI 设计说明（含七态、数据绑定、traces_to）。
- `spec-to-slice`：把一屏 SC 实现成全栈垂直切片（含 worked-example 样板）。
- `dev-pipeline`：三棒编排、目录/ID 约定、覆盖与 ID 锁。

**路径映射**：这些 skill 的通用示例用根级 `prd/ ui-spec/ openapi/`，但本仓真源在
`specs/{prd,ui,contract}/`、代码在 `features/<x>/`、脚本在 `tools/pipeline/`。套用 skill 时按此映射。

> 子代理：复杂切片用 `slice-implementer`，提交前用 `code-reviewer` 和 `security-reviewer` 审。命令见 `.claude/commands/`，skill 列表用 `/skills`。
