# 研发流水线 Runbook（SDD 三棒 · 完整版）

本文件是流水线的权威说明：全景、各棒 I/O 契约、目录布局、ID 约定、stage gate、变更流程、版本与 ID 稳定性、一个走查样例。`SKILL.md` 是精简入口，本文件是细则。

## 1 全景

```
原始需求 + 参考材料
        │
        ▼
┌─────────────────────────┐
│ ① prd-writer            │  产物: prd/PRD-<slug>.md  (+ indicators.yaml)
│ 资深 PM 把需求结构化      │  真源, 定义 [FR-*]/[NFR-*]/[OQ-*]
│ 并就地分配追溯 ID        │  frontmatter 声明 stack
└─────────────────────────┘
        │ prd_lint.py 绿
        ▼
┌─────────────────────────┐
│ ② prd-to-ui-spec        │  产物: ui-spec/SC-<n>-<slug>.md (逐屏)
│ 从应用层/角色/模块推导屏  │  frontmatter traces_to:[FR-*]
│ 逐屏定布局/组件/状态/绑定 │  §5 状态清单, §6 数据绑定
└─────────────────────────┘
        │ check_trace.py 绿
        ▼
┌─────────────────────────┐
│ ③ spec-to-slice         │  产物: slices/<feature>/ + openapi/openapi.json
│ 契约优先, 一屏一类切片    │  每接口 x-trace:[FR-*]
│ 后端模型/迁移/服务/路由    │  前端 hooks/页面/Zod
│ + 前端 + 测试 + 三门禁    │
└─────────────────────────┘
        │ check_xtrace.py 绿 + 三门禁
        ▼
   可运行全栈切片  ──▶  coverage.py 看全链覆盖
```

追溯是**单向**的：ID 在 ① 定义，② 和 ③ 只能引用。任何一棒发现缺需求，都回 ① 补，不在原地新增。

## 2 各棒 I/O 契约（精确到字段）

### ① prd-writer
- **输入**：用户的零散需求 + 上传的标准/模板/旧文档。
- **输出真源**：`prd/PRD-<slug>.md`
  - frontmatter：`id, title, version, status, stack`（必带）。
  - §5 每条功能需求带 `[FR-<模块>.<序>]`；§7 每条 NFR 带 `[NFR-<序>]`；§11 每个开放问题带 `[OQ-<序>]`。
  - §4「应用层」写清——②据此推导屏。
- **输出可选**：`prd/indicators.yaml`（结构化指标/规则，schema 见 prd-writer 的 indicators-schema.md）。
- **渲染交付件**：`PRD-<slug>.docx/pdf/html`（render_prd.sh，不参与追溯）。
- **自检**：`prd_lint.py`。

### ② prd-to-ui-spec
- **输入**：`prd/PRD-<slug>.md`（必）+ `prd/indicators.yaml`（可选）。
- **输出真源**：`ui-spec/SC-<n>-<slug>.md`（一屏一份，11 节模板）
  - frontmatter：`id, screen: SC-<n> <名>, source_prd, traces_to:[FR-*], stack`。
  - 必含 §5 页面状态清单（loading/error/empty/无权限/缺失/否决/success）、§6 数据绑定（元素→接口字段→FR）。
- **纪律**：只引用 PRD 已有 ID；不新增需求。
- **自检**：`check_trace.py <prd.md> ui-spec/SC-*.md`。

### ③ spec-to-slice
- **输入**：`ui-spec/SC-<n>-*.md`（必）+ `prd/PRD-*.md`（必）+ `indicators.yaml`/领域纯模块（视情况）。
- **输出**：`slices/<feature>/{backend,frontend}` + `openapi/openapi.json`
  - 每个业务接口带 `operation_id` + `openapi_extra={"x-trace":[FR-...]}`。
  - 一次切一屏一类（先读后写）。
- **自检**：`check_xtrace.py openapi/openapi.json prd/PRD-*.md` + 三门禁。

## 3 标准目录布局

```
<project>/
├─ prd/        PRD-<slug>.md  [+ .docx]  [+ indicators.yaml]
├─ ui-spec/    SC-1-<slug>.md  SC-2-<slug>.md  …
├─ slices/     <feature>/{backend,frontend}/
├─ openapi/    openapi.json
└─ requirements-lock.yaml      # 可选, ID 登记
```

让每棒读上游**约定路径**，是三棒能机械衔接、能被 coverage.py 批量校验的前提。不要把产物散落到随机路径。

## 4 追溯 ID 约定（权威）

| 类型 | 形态 | 定义处 | 引用处 | 正则 |
|------|------|--------|--------|------|
| FR | `[FR-<模块>.<序>]` | ① §5 | ② traces_to / ③ x-trace | `\[FR-[0-9]+(?:\.[0-9]+)*\]` |
| NFR | `[NFR-<序>]` | ① §7 | ② / ③ | `\[NFR-[0-9]+(?:\.[0-9]+)*\]` |
| OQ | `[OQ-<序>]` | ① §11 | ② §10 | `\[OQ-[0-9]+(?:\.[0-9]+)*\]` |
| 屏 | `SC-<n>` | ② | ③ | `SC-[0-9]+` |

- **定义永远写成方括号形式** `[FR-5.1.3]`；汇总里的简写 `FR-5.1.x` 不算定义（coverage.py 据此区分）。
- **只增不改、不重排**。修订往后追号；废弃标注但不回收号。
- 同一条需求允许在多处**被引用**（§9 验收、§10 里程碑回指 FR），这是追溯正常工作，不是「重复」。

## 5 Stage Gate（过棒前必绿）

| 过棒 | 命令 | 把关 |
|------|------|------|
| ①→② | `python prd-writer/scripts/prd_lint.py prd/PRD-*.md` | frontmatter 全、§5 每叶子有 FR、无内部悬空 |
| ②→③ | `python prd-to-ui-spec/scripts/check_trace.py prd/PRD-*.md ui-spec/SC-*.md` | spec 引用的 FR/NFR 都在 PRD |
| ③验收 | `python spec-to-slice/scripts/check_xtrace.py openapi/openapi.json prd/PRD-*.md` | 接口 x-trace 都在 PRD |
| 全链 | `python dev-pipeline/scripts/coverage.py prd/PRD-*.md --specs ui-spec/ --openapi openapi/openapi.json` | 每条 FR 是否落到屏/接口 |

前三个查「悬空」（引用了不存在的 ID）；coverage.py 查「漏做」（需求没被实现）。两类缺陷正交，都要查。

**一键串跑**：`bash dev-pipeline/scripts/pipeline_check.sh <project> [--strict]` 把四道关卡一把过，按已有产物自动跳过未到的阶段；`--strict` 让 coverage 的 🔴 也判失败（approved 门禁）。

## 6 需求变更流程（不打断追溯）

1. 改 **① PRD.md**：新增→追新 `[FR-*]`；改语义→保留原 ID；废弃→标注不回收。bump `version`。
2. 改 **② 受影响 SC**：更新 `traces_to` 与正文；新需求若需新屏，加 `SC-<n>`。
3. 改 **③ 受影响切片**：更新接口与 `x-trace`；写 mutation 记得失效相关 query。
4. 重跑 §5 全部 gate + coverage.py，确认无悬空、无新增 🔴。

因为三棒共享 markdown 真源 + 同一套 ID，变更可 diff、可校验——这正是「文档与代码各说各话」的反面。

## 7 版本与 ID 稳定性

- PRD `version` 用 `vMAJOR.MINOR`；spec frontmatter 写 `source_prd: <id> @ <version>` 钉住来源版本。
- 长周期项目建 `requirements-lock.yaml`（append-only）：
  ```yaml
  FR-5.1.3: { since: v1.0, summary: 可解释计分明细 }
  FR-5.1.8: { since: v1.0, summary: 负面清单一票否决 }
  ```
  重生成 PRD 前后对比 lock，若已有 ID 被删/被改名即报警。小项目靠纪律即可。
- 用 `requirements_lock.py` 自动维护：
  ```
  python dev-pipeline/scripts/requirements_lock.py gen   prd/PRD-*.md --lock requirements-lock.yaml
  python dev-pipeline/scripts/requirements_lock.py check prd/PRD-*.md --lock requirements-lock.yaml
  ```
  `check` 对被删/回收 ID 告警(exit 1)，并按摘要相似度提示「疑似被重编号为 X」；合法新增仅提示登记。建议接入合入前钩子。

## 8 走查样例（人才评价系统）

1. **①**：把「自动计分+人工复核+负面清单+榜单」整理成 `prd/PRD-talent-eval.md`，§5 得到 `[FR-5.1.3]`…`[FR-5.3.2]`，§7 得到 `[NFR-1/3/4]`，§11 得到 `[OQ-1/2]`（权重、标志性判定待定）。导出 `indicators.yaml`（指标体系）。`prd_lint.py` 绿。
2. **②**：从 §4 应用层推出屏清单：`SC-1 评价复核台`、`SC-2 榜单`、`SC-3 回测台`…。先写 `SC-1`，§5 状态清单覆盖「未质检不计入排序」「负面清单否决降级」等。`check_trace.py` 绿。
3. **③**：先切 SC-1 的**读**（明细查询），再切**写**（质检/直通车/亮点，走写→审计→重算）。导出 openapi，`check_xtrace.py` 绿，过三门禁。
4. **全链**：`coverage.py` 显示 `[FR-5.2.1/5.2.2]` 还是 🔴/⚠——提示榜单屏 `SC-2` 还没做。补 `SC-2` 与其切片，直到 FR 无 🔴，可置 PRD `status: approved`。

## 9 常见问题

- **下游发现 PRD 漏了一条需求**：别在 spec/代码里偷偷加；回 ① 追个新 `[FR-*]`，再回下游引用。
- **要不要每条 NFR 都覆盖到接口**：不必。NFR 多为横切（密级、审计），在相关接口/页面体现即可，coverage.py 不用它做 FR 门禁。
- **换技术栈**：改 ① frontmatter 的 `stack`，它会流到 ②③；②③ 模板是按默认栈写的，换栈时同步调整模板。
- **docx 和 md 不一致**：以 md 为准，重跑 render。永远不要手改 docx 当真源。
