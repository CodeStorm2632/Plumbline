---
name: prd-to-ui-spec
description: Turn a Markdown-first PRD (产品需求说明书 with traceable [FR-*] IDs) plus an optional indicators.yaml into per-screen UI design specifications (UI 设计说明) — the design contract between requirements and prototype generation. Use whenever the user wants to go from PRD to 界面设计 / UI 设计说明 / 原型设计准备, says 把 PRD 转成 UI 设计说明 / 出界面设计 / 设计稿前的说明, or is about to generate prototypes with Claude Design or Claude Code and needs a structured, reviewable spec first. Derives a screen inventory from functional modules and roles, then writes one markdown spec per screen with frontmatter, requirement traceability ([FR-*]/[NFR-*]), low-fi layout, component map to Shadcn/UI (+ TanStack/Zod), a mandatory state checklist (loading/error/empty/no-permission/缺失/否决/success), data bindings (element → API field → FR), interactions, edge cases, inherited open questions, and a ready-to-paste generation brief for the next stage. Markdown-first; renders HTML and validates every referenced ID against the PRD.
compatibility: Needs pandoc (HTML render) and the public docx skill's soffice.py (HTML→PDF preview); Python3 for the traceability check. Consumes the Markdown-first PRD produced by prd-writer (where every [FR-*]/[NFR-*]/[OQ-*] is DEFINED); this skill only REFERENCES those IDs, never invents requirements. Middle stage of dev-pipeline; ID convention & directory layout are governed by the dev-pipeline runbook.
---

# PRD → UI 设计说明（prd-to-ui-spec）

把"Markdown 优先"的 PRD（带 `[FR-*]` 追溯 ID）+ 可选 `indicators.yaml`,转成**逐屏的 UI 设计说明**。它是需求与原型之间的"UI 契约":先把界面的信息架构、组件、状态、数据绑定、交互、追溯一次性定清楚,再交给 Claude Design / Claude Code 生成 Shadcn 原型——避免直接出图后看图重画、漏状态返工。

默认中文,Markdown 优先(每屏一份 `.md`,可进 git、可 PR 评审、可被下一棒消费)。

**上游真源**:`prd/PRD-<slug>.md`(由 `prd-writer` 产出,`[FR-*]/[NFR-*]/[OQ-*]` 在那里定义)。本 skill **只引用、不新增**需求。技术栈取 PRD frontmatter 的 `stack`(默认 React19+TS+Vite / TanStack Router·Query·Table / Shadcn/UI / Tailwind4 / Zod4)。ID 约定与目录布局以 `dev-pipeline` 总纲为权威。

## 何时使用

- 用户要"把 PRD 转成 UI 设计说明 / 出界面设计 / 原型前的设计说明"。
- 在用 Claude Design / Claude Code 生成原型**之前**,需要一份结构化、可评审、可追溯的界面设计契约。
- 已有 `prd-writer` 产出的 Markdown PRD,想推进到设计阶段。

## 工作流

### 第 1 步:读输入

- **PRD(`prd/PRD-<slug>.md`)**:读 frontmatter(`id/version/stack`)与正文,提取 `[FR-*]`/`[NFR-*]`/`[OQ-*]`、用户角色(§3)、功能模块(§5)、应用层/界面线索(§4 的"应用层")。spec frontmatter 的 `stack` 沿用 PRD 的 `stack`、`source_prd` 写成 `<PRD id> @ <version>`。
- **`prd/indicators.yaml`(若有)**:由 prd-writer 同步导出,用于推断数据形态(指标/规则/字段),让数据绑定字段命名与后端对齐而非靠猜。
- 用 `file-reading` skill 读取;PRD 通常已是 markdown,直接读。

### 第 2 步:推导屏清单(先给用户过目)

按 `references/screen-derivation.md` 从"应用层模块 + 角色 + 关键流程"枚举屏幕,产出一张**屏清单表**(屏 ID `SC-x` | 名称 | 主要角色 | 实现的 `[FR-*]` | 优先级),先让用户确认或增删,再逐屏展开。不要一上来写全部细节。

### 第 3 步:逐屏写设计说明

每屏一份 markdown,严格套用 `references/ui-spec-template.md` 的模板(11 节):概述、需求追溯、低保真布局、组件映射(→Shadcn)、**页面状态(必填清单)**、数据绑定、交互与校验、边界异常、验收要点、开放问题、生成简报。要点:

- **追溯**:每个区块回指 `[FR-*]`;`indicators.yaml` 的字段映射到数据绑定。
- **状态必填清单**:loading / error / empty / no-permission / 数据缺失或未确认 / 业务否决态 / success——逐项想过,这是设计说明相对"出图"的最大增量。
- **组件映射到 Shadcn**:用 `references/screen-derivation.md` 的速查表,落到具体组件(Table 用 TanStack Table、表单用 react-hook-form+Zod 等),不要泛泛"放个表格"。
- **生成简报(§11)**:写成可直接粘给 Claude Design / Claude Code 的一段,含栈、布局、必做项、首个样例数据状态。
- **开放问题**:继承 PRD 的 `[OQ-*]`,说明它如何影响本屏控件/流程。

### 第 4 步:校验追溯 + 渲染 + 交付

1. 校验:`python scripts/check_trace.py prd/PRD-*.md ui-spec/SC-*.md`——确保每个 spec 引用的 `[FR-*]/[NFR-*]` 都存在于 PRD(无悬空)。这是 dev-pipeline 的 ②→③ stage gate。
2. 渲染评审视图:`bash scripts/render.sh <spec.md> html`(复用 prd-writer 同一条链)。
3. 交付:`present_files` 给出屏清单 + 各屏 `.md`(及 HTML);提示每屏 §11 生成简报可直接喂 Claude Design。

## 输出约定

- 真源是 markdown,逐屏一份;HTML 为渲染产物。
- 屏 ID `SC-<n>` 全局唯一;文件名 `ui-spec/SC-<n>-<slug>.md`;spec frontmatter 的 `traces_to` 列全本屏回指的 `[FR-*]`。
- 不臆造需求:spec 只能引用 PRD 已存在的 ID;若发现 PRD 缺需求,回到 `prd-writer` 补,不在设计说明里新增需求。

## 参考文件

- `references/ui-spec-template.md` — 逐屏 11 节模板与各节写法(先读)。
- `references/screen-derivation.md` — 屏清单推导法、组件→Shadcn 映射速查、页面状态必填清单、数据绑定约定。
- `assets/sample_review_console.md` — 完整样例(评价复核台),展示模板填充后的样子。
- `scripts/render.sh` — md→html/docx/pdf(复用)。
- `scripts/check_trace.py` — 校验 spec 的 ID 都能追溯回 PRD。

> 本 skill 是 `dev-pipeline` 流水线第二棒。三棒衔接、目录布局与 ID 约定权威版见 `dev-pipeline` 总纲;全链覆盖(哪些 FR 还没出屏)用其 `coverage.py`。
