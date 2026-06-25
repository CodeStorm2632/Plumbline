---
name: prd-writer
description: Generate a standard, professional Chinese product requirements document (产品需求说明书 / PRD) as a Markdown-first single source of truth carrying traceable [FR-*]/[NFR-*]/[OQ-*] IDs, then render it to a polished Word .docx deliverable. Use this whenever the user asks to write or organize requirements into a PRD, 需求文档, 需求说明书, 设计文档, or says 把这些需求整理成文档 / 写成PRD / 出一份需求说明书 — even from rough bullet points. Also use it at the FRONT of any spec-driven development (规格驱动/SDD) pipeline: it produces the PRD.md that prd-to-ui-spec and spec-to-slice consume and trace against. Reads source materials, maps requirements to a consistent multi-section outline, assigns a stable [FR-*] ID to every functional requirement (the traceability backbone), flags scope, open questions [OQ-*], acceptance metrics, milestones and risks like a senior PM, optionally emits an indicators.yaml, and renders html/docx/pdf via scripts/render_prd.sh (or the optional premium docx builder).
compatibility: Markdown source needs nothing. Rendering needs pandoc (html/docx/pdf) + the public docx skill's soffice.py (CJK-safe pdf). The optional premium docx path (scripts/docx_builder.js) needs Node.js + the `docx` npm package. Front of the dev-pipeline; pairs with prd-to-ui-spec and spec-to-slice via the shared ID convention (see dev-pipeline runbook).
---

# PRD Writer（产品需求说明书生成 · Markdown 优先）

把零散的需求（常常只是几条 bullet）+ 可选参考材料，整理成一份结构规范、可评审、**可追溯**的中文 PRD。本 skill 沉淀了一套「资深产品经理」的写法：固定大纲、范围切分、开放问题显式标注、验收度量、里程碑、风险、来源映射进附录。

**真源是 Markdown（`PRD-<slug>.md`），不是 docx。** 这是整条研发流水线的第一棒产物：它给每条功能需求分配一个稳定的 `[FR-*]` 追溯 ID，下游 `prd-to-ui-spec`（出 UI 设计说明）与 `spec-to-slice`（出全栈切片）都引用并校验这些 ID。docx/pdf 只是从 md 渲染出来的**交付件**，给人看、给评审用，不参与追溯。

> 为什么 markdown 优先：①下游两棒的 `check_trace.py`/`check_xtrace.py` 都对 `.md` 跑 `[FR-*]` 正则，docx 无法被追溯；②md 可进 git、可 PR、可 diff，「缺需求回 prd-writer 补」能机械回流，不产生 docx/md 双源漂移。

## 何时使用

- 用户要「写 / 整理一份 PRD / 需求说明书 / 需求文档 / 设计文档」。
- 用户贴了一堆需求点，说「帮我整理成文档 / 写成 PRD / 出一份说明书」。
- 在规格驱动（SDD）或新功能立项时，需要一份结构化、可评审、**带追溯 ID** 的需求产物作为下游设计与开发的输入。

简单的「读一下这个文件」不触发本 skill；只有需要产出结构化 PRD 时才用。

## 工作流

### 第 0 步：先读约定与依赖

1. 读 **ID 约定**：`references/prd-template.md` 顶部的「追溯 ID 约定」一节（FR/NFR/OQ 怎么编号）。完整规范的权威版本在 `dev-pipeline` 流水线总纲里，三棒共用，本节是其精简内联。
2. 渲染依赖（仅出 docx/pdf 时需要）：确认 `pandoc` 可用；CJK-safe pdf 复用公共 `docx` skill 的 `soffice.py`。
3. （可选）需要「带封面/自动目录/斑马线」的高规格 docx 时，才用 `scripts/docx_builder.js`（用法见 `references/docx-cookbook.md`）；否则 `render_prd.sh` 的 pandoc 路径已够用。

### 第 1 步：收集并读取输入

- **需求**：用户消息里的需求点是主输入；不要丢失任何一条，逐条落到大纲对应位置。
- **参考材料**：用户上传的标准、模板、申报书、旧文档等。按公共 `file-reading` skill 读取（`.docx/.xlsx/.pptx` 用 `extract-text`；旧版 `.doc` 先 `soffice.py --convert-to docx`；`.pdf` 按 `pdf-reading` skill）。
- 读完后明确：业务背景、要解决的问题、用户角色、关键规则、约束、以及**哪些来源标准需要原样映射进附录**（评分标准、字段清单、负面清单等）。

### 第 2 步：结构化为标准大纲

按 `references/prd-template.md` 的大纲组织内容。按需裁剪章节，但保留 PM 必备骨架：背景/定位、范围(In/Out)、用户与场景、功能需求详述、数据模型、非功能需求、验收度量、里程碑、风险与开放问题、附录。功能需求（§5）是主体，按模块拆 5.x。

### 第 3 步：套用 PM 纪律 + 分配追溯 ID（本 skill 价值核心）

逐项检查，缺哪补哪——并在写每条需求时**就地分配 ID**：

- **功能需求 `[FR-*]`**：§5 每个模块 `5.x` 下，把每条可独立验证的能力写成一条，并在该条**句首或句末**挂一个 `[FR-5.x.y]`。ID 跟随模块号，便于人读出归属（如 `[FR-5.1.3]` = 第 5.1 模块第 3 条）。一条 FR 只描述一件可验证的事，别把三件事塞进一条。
- **非功能需求 `[NFR-*]`**：§7 每条挂 `[NFR-n]`（n 全局顺序，如 `[NFR-1]` 性能、`[NFR-3]` 密级、`[NFR-4]` 审计留痕）。
- **开放问题 `[OQ-*]`**：§11 每个待定项挂 `[OQ-n]`，用醒目色标注（`**[OQ-1]** ...` 加粗或红字），写清需要谁、在什么时点拍板。**不要替用户假装拍板。**
- **范围切分**：显式写出 In Scope / Out of Scope。
- **可验收**：§9 给可量化验收点与度量指标；阈值留给业务方设定。
- **里程碑**：§10 给 MVP→V1→V2。
- **来源映射**：§12 把参考标准整理进附录表格（这是「可落地」的关键，也是 indicators.yaml 的素材）。
- **可解释/可追溯**：涉及自动计算/打分，要求每条结果可溯源（指标—规则—证据）。

> ID 稳定性：一旦分配，**只增不改、不重排**。后续修订新增需求往后追号（如 5.1 已有到 .8，新增就用 .9），不要重编已有 ID，否则下游所有 trace 静默失效。

### 第 4 步：写出 PRD.md（主产物）

1. 输出到 `/mnt/user-data/outputs/PRD-<slug>.md`（slug 用领域英文短名，如 `PRD-talent-eval.md`）。
2. **带 frontmatter**（下游靠它识别版本与技术栈）：
   ```yaml
   ---
   id: PRD-<slug>
   title: <系统名> 产品需求说明书
   version: v1.0
   status: draft        # draft | review | approved
   stack: { framework: React19+TS, router: TanStack Router, data: TanStack Query, table: TanStack Table, ui: Shadcn/UI, css: Tailwind4, schema: Zod4, backend: FastAPI+SQLModel+Postgres/Alembic+Redis }
   ---
   ```
   - `stack` 在立项时就和用户确认并记录——它会一路流到 UI 说明与切片。默认值如上；项目换栈就改这里，是唯一声明处。
3. 正文按 §2 大纲，每条 FR/NFR/OQ 带 ID。可直接参考 `assets/sample_prd.md`。

### 第 4b 步（可选）：导出 indicators.yaml

若领域含结构化指标/规则/字段（评分体系、配置项、负面清单等），从 §12 附录同步导出一份 `/mnt/user-data/outputs/indicators.yaml`，schema 见 `references/indicators-schema.md`。下游 `prd-to-ui-spec` 数据绑定、`spec-to-slice` 配置加载会直接消费它，避免字段命名靠猜。纯流程类需求无结构化指标可跳过。

### 第 5 步：自检（lint）+ 渲染 + 交付

1. **ID 自检**（务必）：`python scripts/prd_lint.py /mnt/user-data/outputs/PRD-<slug>.md` —— 校验 frontmatter 完整、§5 每个叶子模块至少 1 条 `[FR-*]`、ID 唯一不重复、OQ 都在 §11 定义。期望 `PASS`。
2. **渲染交付件**：`bash scripts/render_prd.sh /mnt/user-data/outputs/PRD-<slug>.md all` → 同名 `.html/.docx/.pdf`（CJK-safe）。需要带封面/自动目录的高规格 docx 时，改用 `docx_builder.js`（见 cookbook），但**内容仍以 md 为准**，别另起炉灶手写。
3. `present_files` 交付 **md（真源）+ docx（交付件）**，简述结构并**重点提示开放问题 `[OQ-*]` 清单**，让用户知道哪些待拍板。明确告诉用户：后续出 UI 设计说明 / 切片都引用这份 md 的 `[FR-*]`。

## 输出约定

- **真源 = `PRD-<slug>.md`**；docx/pdf/html 为渲染交付件，不参与追溯。
- 每条功能需求带稳定 `[FR-*]`；NFR 带 `[NFR-*]`；开放问题带 `[OQ-*]`。ID 只增不改。
- 默认中文；术语沿用用户/参考材料口径。正文以连贯段落为主，配合必要表格与列表。
- 不臆造数据；引用参考材料处与原文一致，差异显式标注；有争议口径进 §11，不假装拍板。

## 参考文件

- `references/prd-template.md` — 标准 PRD 大纲、**追溯 ID 约定**、frontmatter 规范、逐章写作要点（先读）。
- `references/indicators-schema.md` — indicators.yaml 的 schema 与导出时机。
- `references/docx-cookbook.md` — （可选）premium docx_builder.js 的 API 与陷阱。
- `assets/sample_prd.md` — 带 frontmatter + `[FR-*]` 的最小 PRD 样例。
- `assets/sample_assemble.js` — （可选）premium docx 拼装示例。
- `scripts/render_prd.sh` — md → html/docx/pdf（默认渲染路径）。
- `scripts/prd_lint.py` — ID/frontmatter 自检。
- `scripts/docx_builder.js` — （可选）高规格 docx 渲染库。

> 本 skill 是 `dev-pipeline` 流水线第一棒。三棒如何衔接、目录布局与 ID 约定权威版，见 `dev-pipeline` 总纲。
