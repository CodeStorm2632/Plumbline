# 逐屏 UI 设计说明模板（11 节）

每屏一份 markdown,严格按本模板填充。完整样例见 `assets/sample_review_console.md`。

## Frontmatter（必带）

```yaml
---
id: UID-SC-<slug>
screen: SC-<n> <屏名>
title: <屏名> · UI 设计说明
source_prd: <PRD id> @ <version>
traces_to: [FR-x, FR-y, NFR-z]     # 本屏回指的全部 ID
version: v0.1
status: draft
stack: { framework: React19+TS, router: TanStack Router, data: TanStack Query, table: TanStack Table, ui: Shadcn/UI, css: Tailwind4, schema: Zod4 }
---
```

## 章节

**1 概述** — 目的(一句)、主要角色(及只读角色)、入口路由、一句话定位。

**2 需求追溯** — 表格:`区块 | 回指[FR-*]/[NFR-*]`。让每个界面区块都挂到需求。

**3 信息架构 / 布局(低保真)** — 用围栏代码块画 ASCII 线框,定主区/侧栏/头部/底部的分区与关键元素。不追求精确像素,追求"摆放与层级"说清。

**4 组件映射(→ Shadcn/UI)** — 表格:`区块 | Shadcn 组件 | 备注`。落到具体组件;数据表用 TanStack Table、表单用 react-hook-form+Zod、弹层用 Dialog/Sheet 等。映射速查见 `screen-derivation.md`。

**5 页面状态(必填清单)** — 表格:`状态 | 触发 | 表现`。**必须逐项覆盖**:加载中 / 错误 / 空 / 无权限 / 数据缺失或未确认 / 业务否决或异常态 / 成功反馈。这是设计说明相对"直接出图"的最大增量,开发最容易漏。

**6 数据绑定** — 表格:`UI 元素 | 来源(建议接口/字段) | 回指[FR-*]`。注明:接口形态以 OpenAPI 契约为准、前端类型经 orval 生成、表单校验用与后端 DTO 对齐的 Zod schema。字段尽量对齐 `indicators.yaml`。

**7 交互与校验规则** — 列出关键流程与规则(必填项、二次确认、留痕、权限门槛、计算/联动),每条回指 `[FR-*]`。

**8 边界与异常** — 并发/重复操作、互斥态优先级(如否决优先)、大数据量(虚拟滚动)、密级/水印等。

**9 验收要点(本屏)** — 3–6 条可验证项,回指 `[FR-*]/[NFR-*]`,用于评审与测试。

**10 开放问题(继承 PRD)** — 继承相关 `[OQ-*]`,说明它如何影响本屏控件/流程,并给本期的兜底做法。

**11 交给下一棒的生成简报(Claude Design / Claude Code)** — 一段可直接粘贴的引导文:栈 + 路由 + 布局指向 §3 + 组件指向 §4 + 状态指向 §5 + 数据形态指向 §6 + 必做项 + 首个样例数据状态(如"已确认 + 部分缺失 + 命中标志性")。让下一棒拿了就能生成。

## 写作要点

- 只引用 PRD 已存在的 `[FR-*]`;设计说明不新增需求(缺需求回 `prd-writer` 补)。
- 状态清单宁可多想一项,不可漏。
- 组件映射要具体到 Shadcn 组件名,便于下一棒直接落地。
- §11 写得越"可直接执行",Claude Design 生成质量越高。
