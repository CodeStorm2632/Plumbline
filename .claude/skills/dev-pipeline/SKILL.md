---
name: dev-pipeline
description: Orchestrate the spec-driven development (规格驱动/SDD) pipeline that turns a raw requirement into running, fully traceable full-stack code via three stages — prd-writer (PRD.md with [FR-*] IDs) → prd-to-ui-spec (per-screen SC-*.md UI specs) → spec-to-slice (vertical full-stack slices). Use this as the entry runbook whenever someone says 走研发流水线 / 按 SDD 做这个需求 / 从需求到代码 / 把这个需求一条龙做下来, when you need to know which skill comes next, where each artifact lives, how IDs are shared and kept stable across stages, or when you want to check requirement coverage (which [FR-*]已落到屏/接口、哪些还没实现). Defines the canonical directory layout, the shared FR/NFR/OQ ID convention (the authoritative copy), the artifact contract between stages, stage-transition gates, and a coverage.py that reports FR→screen→endpoint coverage across the whole chain.
compatibility: Coordinates three skills (prd-writer, prd-to-ui-spec, spec-to-slice). coverage.py needs Python3 only. Does not itself produce PRDs/specs/code — it routes to the right stage skill and verifies the seams between them.
---

# dev-pipeline（研发流水线总纲 · SDD 三棒）

把「一个需求」一条龙做成「可运行、可追溯的全栈代码」。这条流水线是**规格驱动开发（SDD）**：每一棒的产物是下一棒的、带稳定追溯 ID 的输入，最终每行接口都能回指到最初的需求。

```
原始需求 ──▶ ① prd-writer ──▶ ② prd-to-ui-spec ──▶ ③ spec-to-slice ──▶ 可运行全栈切片
            PRD-<slug>.md       SC-1.md SC-2.md …      backend/ + frontend/
            [FR-*] 真源          traces_to:[FR-*]        x-trace:[FR-*]
                │                      │                      │
                └──────────── 追溯主线（单向、ID 只增不改）──────────┘
```

**本 skill 不替代任何一棒**，它是入口与裁判：决定现在该用哪一棒、产物放哪、ID 怎么共享与稳定、棒与棒之间是否对得上（覆盖/悬空）。各棒内部细节见各自 SKILL.md。

## 何时使用

- 「按 SDD 走 / 从需求到代码 / 把这个需求一条龙做下来 / 走研发流水线」。
- 中途想知道**下一棒是哪个**、上一棒产物**该放哪**、ID 该怎么编。
- 想做**覆盖率检查**：哪些 `[FR-*]` 已经有屏、有接口，哪些还没落地。
- 需求变更时，想知道**从哪一棒改起**、怎样不打断追溯。

## 三棒分工与产物契约

| 棒 | skill | 输入 | 产物（真源） | 给下一棒的契约 |
|----|-------|------|--------------|----------------|
| ① | `prd-writer` | 零散需求 + 参考材料 | `prd/PRD-<slug>.md`（+ 可选 `indicators.yaml`） | 每条功能需求带稳定 `[FR-*]`；frontmatter 带 `stack` |
| ② | `prd-to-ui-spec` | PRD.md + indicators.yaml | `ui-spec/SC-<n>-<slug>.md`（逐屏） | frontmatter `traces_to:[FR-*]`；§5 状态清单；§6 数据绑定 |
| ③ | `spec-to-slice` | SC-*.md + PRD.md（+ indicators.yaml + 领域纯模块） | `slices/<feature>/` + `openapi/openapi.json` | 每接口 `x-trace:[FR-*]`；契约优先 |

> 渲染交付件（docx/pdf/html）由各棒的 render 脚本从 md 生成，**不参与追溯**。真源永远是 markdown。

## 标准目录布局（约定，所有棒读写此处）

```
<project>/
├─ prd/
│  ├─ PRD-<slug>.md            # ① 真源，[FR-*] 在这里定义
│  ├─ PRD-<slug>.docx          # 渲染交付件（可选）
│  └─ indicators.yaml          # ① 可选，结构化指标/配置
├─ ui-spec/
│  ├─ SC-1-<slug>.md           # ② 逐屏，一屏一份
│  └─ SC-2-<slug>.md
├─ slices/
│  └─ <feature>/               # ③ 一屏一类（读/写）一条切片
│     ├─ backend/ …
│     └─ frontend/ …
├─ openapi/
│  └─ openapi.json             # ③ FastAPI 导出，orval 输入
└─ requirements-lock.yaml      # 可选：ID 登记表（见下「ID 稳定性」）
```

约定每棒读上游的**约定路径**，而不是「用户随手给的某个文件」——这样棒与棒可机械衔接、可批量校验。

## 追溯 ID 约定（权威版 · 三棒共用）

| 类型 | 形态 | 规则 | 谁定义 | 谁引用 |
|------|------|------|--------|--------|
| 功能需求 | `[FR-<模块>.<序>]` | 跟 PRD §5 模块号 | ① PRD §5 | ② traces_to / ③ x-trace |
| 非功能需求 | `[NFR-<序>]` | 全局顺序 | ① PRD §7 | ② / ③ |
| 开放问题 | `[OQ-<序>]` | 全局顺序 | ① PRD §11 | ② §10 继承 |
| 屏 | `SC-<n>` | 全局顺序 | ② | ③ 输入 |

铁律：
- **只增不改、不重排**。修订往后追号；废弃的需求标注但不回收号。下游只能**引用**已有 ID，不得新增需求。
- 正则统一 `\[(?:FR|NFR|OQ)-[0-9.]+\]`，三棒的 check 脚本都按它解析。
- 缺需求 → 回 ① 补 PRD（往后追号）→ 重跑下游，保持**单向**追溯。

## 工作流（编排）

### 起步：确认在哪一棒

- 还没有 `PRD-*.md` → 从 **①** 开始（用 `prd-writer`）。
- 有 PRD、还没 `SC-*.md` → 进 **②**（用 `prd-to-ui-spec`），先出屏清单给用户确认。
- 有 SC、要落代码 → 进 **③**（用 `spec-to-slice`），一屏一类（先读后写）切。

### 每次过棒（stage gate）

过到下一棒前，跑对应校验，绿了再走：

1. **① → ②**：`python <prd-writer>/scripts/prd_lint.py prd/PRD-<slug>.md` → PASS（frontmatter 全、§5 每叶子有 FR、无内部悬空）。
2. **② → ③**：`python <prd-to-ui-spec>/scripts/check_trace.py prd/PRD-*.md ui-spec/SC-*.md` → PASS（spec 引用的 FR/NFR 都在 PRD）。
3. **③ 验收**：`python <spec-to-slice>/scripts/check_xtrace.py openapi/openapi.json prd/PRD-*.md` → PASS（接口 x-trace 都在 PRD）+ spec-to-slice 自己的三门禁。

### 一键串跑（四道关卡）

不想逐条跑时，用 `pipeline_check.sh` 对整个项目一把过——它按 canonical 布局自动找产物，**只跑当前已存在产物对应的关卡**（还没出屏就跳过 ②、没出 openapi 就跳过 ③），任一已运行关卡失败即整体失败：

```
bash scripts/pipeline_check.sh <project_dir> [--strict]
```

`--strict` 会把 coverage 的 🔴（需求未设计）也判为失败，适合做 approved 门禁。脚本默认在 dev-pipeline 的同级目录找各棒脚本，可用 `--skills-dir` 或 `$SKILLS_DIR` 覆盖。

### 全链覆盖检查（本 skill 的核心增量）

上面三个校验只查「**悬空**」（引用了不存在的 ID）。它们查不出「**漏做**」（某条 FR 没人实现）。用本 skill 的 `coverage.py` 查覆盖：

```
python scripts/coverage.py prd/PRD-<slug>.md --specs ui-spec/ --openapi openapi/openapi.json
```

它报告每条 `[FR-*]` 的落地状态：✅ 有屏有接口 / 🟠 有屏无接口（设计了还没切）/ 🔴 无屏（需求悬空未设计）。`status approved` 的 PRD 应做到无 🔴。

## 需求变更怎么走（保持追溯不断）

1. 改 **① PRD.md**：新增需求往后追新 `[FR-*]`；修改语义保留原 ID；废弃则标注不回收。
2. 受影响的屏回 **②** 更新 `SC-*.md` 的 `traces_to` 与正文。
3. 受影响的切片回 **③** 更新接口与 `x-trace`。
4. 重跑三个 stage gate + `coverage.py`，确认无悬空、无新增 🔴。

> 因为三棒共享 markdown 真源 + 同一套 ID，变更可被 diff、可被校验，不会退化成「文档和代码各说各话」。

## ID 稳定性（requirements_lock.py）

大型/长周期项目维护一份 append-only 的 `requirements-lock.yaml`，记录每个 `[FR-*]/[NFR-*]` 的首次版本与一句话摘要，用 `requirements_lock.py` 自动生成与比对：

```
# 建立/更新基线（已有 ID 的 since 保留，新 ID 记当前 version）
python scripts/requirements_lock.py gen   prd/PRD-<slug>.md --lock requirements-lock.yaml
# 重生成 PRD 后比对：被删/回收 ID 告警(exit 1)，并按摘要相似度指出「疑似被重编号为 X」
python scripts/requirements_lock.py check prd/PRD-<slug>.md --lock requirements-lock.yaml
```

`check` 把「ID 被删/回收/重编号」这类会让下游 trace 静默失效的变更挡在合入前；合法新增只提示登记、不报错。小项目靠「只增不改」纪律也行，但有了 lock 就能机检，建议接进合入前钩子。

## 参考文件

- `references/pipeline-overview.md` — 完整 runbook：流水线全景、各棒契约细节、目录布局、ID 约定、stage gate、变更流程（先读）。
- `scripts/coverage.py` — 全链覆盖报告（FR→屏→接口），补「漏做」检查。
- `scripts/pipeline_check.sh` — 一键串跑四道关卡（自动按已有产物跳过/运行）。
- `scripts/requirements_lock.py` — ID 登记表 gen/check，捕捉删/回收/重编号。
