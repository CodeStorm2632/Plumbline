---
id: UID-SC-sys-dict
screen: SC-6 字典管理
title: 字典管理 · UI 设计说明
source_prd: PRD-sys-admin @ v1.0
traces_to: [FR-6.5.1, FR-6.5.2, FR-6.5.3, NFR-6.1, NFR-6.4]
version: v0.1
status: draft
stack: { framework: React19+TS, router: TanStack Router, data: TanStack Query, table: TanStack Table, ui: Shadcn/UI, css: Tailwind4, schema: Zod4 }
---

# SC-6 字典管理 · UI 设计说明

> 维护可复用的数据字典（字典类型 + 字典项），并提供按类型 code 拉取启用项的下拉数据接口。

## 1 概述

- **目的**：管理员维护字典类型与其字典项，前端表单通过 code 获取启用项。
- **主要角色**：`管理员`（`sys:dict:read` + `sys:dict:write`）。无 `sys:dict:write` 的角色隐藏写操作。
- **入口路由**：`/sys/dicts`。
- **一句话**：统一维护枚举/选项数据，业务前端只消费启用中的字典项。

## 2 需求追溯

| 区块 | 回指 |
|------|------|
| 字典类型增删改查 | `[FR-6.5.1]` `[NFR-6.1]` |
| 字典项增删改查 | `[FR-6.5.2]` |
| 按 type code 拉取启用项 | `[FR-6.5.3]` |

## 3 信息架构 / 布局（低保真）

```
┌──────────────────────────────────────────────────────┐
│ 字典管理  [搜索类型____]       [+ 新建字典类型]      │
├───────────────────────┬──────────────────────────────┤
│ 类型 code | 名称       │ 当前类型的字典项             │
│ user_status | 用户状态 │ label | value | status | 操作 │
│ …                     │ 启用  | active| active | [删] │
└───────────────────────┴──────────────────────────────┘
```

## 4 组件映射（→ Shadcn/UI）

| 区块 | Shadcn 组件 | 备注 |
|------|-------------|------|
| 类型列表 | `Table` | code/name/remark |
| 项列表 | `Table` | 当前选中 type_code 下的 item |
| 新建类型/项 | `Dialog` + `Form` | 最小表单也可内联 |
| 状态 | `Badge` | active / disabled |
| 删除 | `Button` + `AlertDialog` | 软删除 |
| 骨架 | `Skeleton` | 见 §5 |

## 5 页面状态

| 状态 | 触发 | 表现 |
|------|------|------|
| 加载中 | 拉取类型或项 | `Skeleton` / 文本加载提示 |
| 错误 | 接口失败 | `Alert` + [重试] |
| 空 | 无类型或无项 | 空态 + 对应新建按钮 |
| 无权限 | 无 `sys:dict:write` | 隐藏写操作；无 read 整页提示 |
| 缺失/未确认 | 未选择字典类型或 remark 为空 | 右侧提示先选择类型；空 remark 显示「—」 |
| 否决/受限 | 越权写操作 | 后端 403，前端 toast/错误文案 |
| 成功 | 写/删完成 | toast + 失效 dict/type items query |

## 6 数据绑定

| UI 元素 | 来源（接口/字段） | 回指 |
|---------|------------------|------|
| 类型列表 | `GET /api/sys/dicts?q&limit&offset` → `id,code,name,remark` | `[FR-6.5.1]` |
| 新建类型 | `POST /api/sys/dicts` `{code,name,remark}` | `[FR-6.5.1]` |
| 编辑类型 | `PUT /api/sys/dicts/{id}` `{name,remark}` | `[FR-6.5.1]` |
| 删除类型 | `DELETE /api/sys/dicts/{id}`（类型与项软删） | `[FR-6.5.1]` `[NFR-6.1]` |
| 项列表 | `GET /api/sys/dicts/{type_code}/items` → `label,value,order_no,status` | `[FR-6.5.2]` |
| 新建项 | `POST /api/sys/dicts/items` `{type_code,label,value,order_no}` | `[FR-6.5.2]` |
| 编辑项 | `PUT /api/sys/dicts/items/{id}` `{label,value,order_no,status}` | `[FR-6.5.2]` |
| 删除项 | `DELETE /api/sys/dicts/items/{id}` | `[FR-6.5.2]` `[NFR-6.1]` |
| 启用项下拉 | `GET /api/sys/dicts/public/{type_code}/items` | `[FR-6.5.3]` |

## 7 交互与校验规则

- **编码唯一**：字典类型 `code` 不可重复，重复返回 409。`[FR-6.5.1]`
- **项状态**：只有 `status=active` 的项会出现在 public enabled-items 接口。`[FR-6.5.3]`
- **排序**：字典项按 `order_no` 升序展示。`[FR-6.5.2]`
- **软删除**：删除字典类型时级联软删其字典项。`[NFR-6.1]`

## 8 边界与异常

- 未选择类型：右侧显示「请选择字典类型」。
- 新建项时类型不存在：后端 404。
- 无写权限：前端隐藏新建/删除，后端 403 兜底。`[NFR-6.4]`

## 9 验收要点（本屏）

- 能维护字典类型与字典项。`[FR-6.5.1]` `[FR-6.5.2]`
- public 接口只返回启用项，不返回 disabled 或软删项。`[FR-6.5.3]`
- 删除类型后该类型及其项均不再出现在管理列表。`[NFR-6.1]`

## 10 交给下一棒的生成简报

> 目标：字典管理屏。左侧类型表，右侧当前类型项表；七态见 §5，数据形态见 §6。
> 先出「user_status 类型 + active/disabled 两个字典项」样例。
