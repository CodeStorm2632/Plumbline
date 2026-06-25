---
name: spec-to-slice
description: Scaffold a contract-first, full-stack vertical slice from one UI design spec (SC-*) plus its [FR-*] requirements, on a FastAPI + SQLModel + PostgreSQL/Alembic + React/TanStack/Shadcn/Zod stack. Use this when implementing a screen or feature end-to-end after the PRD and per-screen UI 设计说明 exist — the step after prd-writer and prd-to-ui-spec, turning a spec into running code. Produces SQLModel table models (kept separate from Pydantic API schemas), an Alembic versioned migration, FastAPI routes annotated with x-trace back to [FR-*], a service layer with the write→audit→re-evaluate pattern, an OpenAPI export plus orval config and TanStack Query hooks, a Shadcn page wired to real data, a pytest skeleton, and a three-gate checklist. Encodes proven conventions — table/schema separation, no hand-written SQL, Alembic-only migrations, an SM2-JWT + Redis auth seam, required-reason validation, immutable audit trail (NFR-4). Trigger on 把这个屏实现出来 / 切一刀 / 做 SC-x 的接口和前端 / 垂直切片 / vertical slice.
compatibility: Targets FastAPI/SQLModel/Alembic/Redis/tongsuopy (uv) backend + React19/TanStack/Shadcn/Zod (orval) frontend. Pairs with prd-writer (PRD) and prd-to-ui-spec (SC specs) via the dev-pipeline shared ID convention. A self-contained read+write worked example is inlined at references/worked-example.md; external eval-slice-B/C, if present, are optional extra references.
---

# spec-to-slice（契约优先 · 全栈垂直切片）

把一屏 `SC-*` 设计说明 + 相关 `[FR-*]` 变成**打穿全栈、可运行、可追溯**的一条切片。这是流水线最后一棒:`prd-writer`(PRD)→ `prd-to-ui-spec`(UI 说明)→ **本 skill(切片实现)**。

按屏切、不按层切:每条切片自带后端(模型/迁移/契约/服务/路由)+ 前端(hooks/页面)+ 测试 + 三门禁,可独立评审、mock 先行。栈:FastAPI + SQLModel + PostgreSQL/Alembic + Redis + tongsuopy(uv);React19 + TanStack(Router/Query/Table)+ Shadcn/UI + Tailwind4 + Zod4(orval)。

## 何时使用

- PRD 与 UI 设计说明已就绪,要"把某屏/某功能实现出来 / 切一刀 / 做 SC-x 的接口和前端"。
- 需要契约优先(FastAPI schema → OpenAPI → orval)且每个接口可追溯到 `[FR-*]`。

## 输入项（Inputs）

调用本 skill 时提供以下输入(前两项必需):

| 输入 | 必需 | 说明 |
|------|------|------|
| **目标屏设计说明 `SC-x.md`** | ✅ | 来自 prd-to-ui-spec。提供布局、组件、**状态清单(§5)**、**数据绑定(§6:元素→接口字段→FR)**、交互(§7)、`[OQ-*]`。决定接口与页面。 |
| **PRD(markdown,带 `[FR-*]`)** | ✅ | 来自 prd-writer。x-trace 的 ID 必须出自它;校验用。 |
| **领域纯模块(若有)** | 视情况 | 如评分引擎 `eval-engine`。其 Pydantic 契约直接复用为接口响应;写操作的"重算"调它。无领域计算的纯 CRUD 切片可不提供。 |
| **结构化标准/配置(若有)** | 视情况 | 如 `indicators.yaml`。用于数据绑定字段命名与配置加载。 |
| **目标脚手架路径/约定** | 视情况 | 已有 FastAPI+React 工程的目录与命名;无则按 `references/slice-anatomy.md` 的文件构成 + `worked-example.md` 的命名生成。 |
| **切片类型** | 默认推断 | 读(查询/榜单)或写(质检/操作)。决定走 `service_read` 还是 `service_write`(写→审计→重算)。 |

> 一次只切**一屏一类**(读或写)。一屏若读写都有,先切读、再切写,各成一刀。

## 命名实例化（占位符 → 具体名）

模板里的 `<...>` 按此从 SC 推出:

| 占位符 | 取自 | 例(SC-1 复核台写) |
|--------|------|------------------|
| `<Feature>/<feature>` | 屏名/功能 | `Review` / `review` |
| `<Entity>/<entity>` | 主数据实体(PRD §6) | `ApplicantRecord` / `applicant` |
| `<Action>/<action>` | SC §7 的交互动作 | `Qc` / `qc`、`fast-track`、`highlight` |
| `<FR-x>` | SC §2 追溯表 | `FR-5.1.3`、`NFR-4` |
| `<角色>` | SC §1 主要角色 | `评审专家` |

## 工作流

### 第 0 步:读输入与约定

1. 读目标屏 `SC-x` 设计说明(数据绑定、状态、交互、`[FR-*]`)与 PRD 相关条目。
2. 读三份约定(先读):`references/slice-anatomy.md`(切片由哪些文件构成)、`references/backend-conventions.md`、`references/frontend-conventions.md`。
3. 看**内联样板** `references/worked-example.md`(自包含的读+写两条切片,实例化到人才评价域,可直接照着模仿)。若工程里有外部 `eval-slice-B/C` 实样,可一并对照(可选,非必需)。

### 第 1 步:定数据与契约

- 从 SC 的数据绑定 + PRD §6 数据模型,定 SQLModel **表模型**(与 Pydantic API schema 分离);若涉及领域计算(如评分),**复用既有纯模块的 schema 作为响应契约**,前后端同形。
- 列接口清单:每个接口 = 一个 `operation_id` + `openapi_extra={"x-trace": [FR-...]}`。

### 第 2 步:后端切片(用模板)

按 `assets/templates/backend/` 逐个落:
- `model.py.tmpl` → 表模型(JSON 列;写类切片加 `audit_record` 表)。
- `schema.py.tmpl` → 请求/响应 schema(必填理由用 validator;复用领域 schema)。
- `migration.py.tmpl` → Alembic 版本化迁移(PostgreSQL 用 JSONB;**生产绝不 create_all**)。
- `service_read.py.tmpl` / `service_write.py.tmpl` → 服务层。**写操作遵循"写库 → 写审计(NFR-4)→ [若有领域计算则触发重算] → 返回最新结果"范式**(见 backend-conventions §写)。纯 CRUD(无领域计算)则只"写库 → 写审计 → 返回",省去重算。查询走 SQLModel select,**不手拼 SQL**。
- `route.py.tmpl` → 路由(`operation_id` + `x-trace` + `require_roles`)。
- `deps.py.tmpl` → DB 会话 + 认证(SM2-JWT/Redis 占位 seam)+ `require_roles`。

### 第 3 步:导出契约 → 前端

1. 导出 OpenAPI:`python -c "import json,app.main as m; json.dump(m.app.openapi(), open('openapi/openapi.json','w'), ensure_ascii=False, indent=2)"`。
2. 校验追溯:`python scripts/check_xtrace.py openapi/openapi.json <prd.md>`——每个 op 的 `x-trace` 必须存在于 PRD。
3. 前端(用 `assets/templates/frontend/`):`orval.config.ts`(从 openapi 生成)+ `http.ts`(认证 mutator)+ `feature.api.ts`(TanStack Query hooks;**写 mutation 成功后失效相关 query**)+ `Page.tsx`(Shadcn + TanStack Table,覆盖 SC §5 全部状态)+ Zod 镜像。

### 第 4 步:测试 + 三门禁

- 测试用 `test.py.tmpl`(TestClient + SQLite + conftest 统一测试库),覆盖正常 + 权限守卫 + 必填校验 + (写切片)重算与留痕。
- 过 `references/slice-anatomy.md` 末尾的**三门禁清单**:规格评审 / 安全 CRITICAL 清零 / 部署。

## 输出约定

- 真源:后端 Pydantic schema(经 FastAPI 出 OpenAPI)+ 前端由 orval 生成;手写 hooks 仅过渡。
- 每个接口带 `x-trace` 回指 `[FR-*]`;设计说明不新增需求,缺需求回 `prd-writer` 补。
- **不在生产 `create_all`**;**不手拼 SQL**;**表模型不直接出 API**;**敏感数据走国密 + 密级**;**写操作必留痕**。

## 参考文件

- `references/worked-example.md` — **自包含内联样板**:读+写两条切片的真实代码(模型/服务/路由/前端 hooks/页面七态/测试),没有外部仓时照此模仿。
- `references/slice-anatomy.md` — 切片文件构成 + 切片顺序建议 + 三门禁清单(先读)。
- `references/backend-conventions.md` — 表/schema 分离、Alembic、路由+x-trace、服务层(含写→审计→重算)、认证 seam。
- `references/frontend-conventions.md` — orval、http mutator、TanStack Query、Shadcn、状态、Zod。
- `assets/templates/backend/*`、`assets/templates/frontend/*` — 可复制骨架(含 `conftest.py.tmpl` 统一测试库)。
- `scripts/check_xtrace.py` — 校验 OpenAPI 的 x-trace 都能追溯回 PRD。

> 自包含样板见 `references/worked-example.md`(读+写两条,前端含七态、后端含写→审计→重算)。外部 `eval-slice-B/C` 若存在可作额外对照,但**非必需**——本 skill 已内联足够照做的代码。
