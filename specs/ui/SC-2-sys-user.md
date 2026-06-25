---
id: UID-SC-sys-user
screen: SC-2 用户管理
title: 用户管理 · UI 设计说明
source_prd: PRD-sys-admin @ v1.0
traces_to: [FR-6.1.1, FR-6.1.2, FR-6.1.3, FR-6.1.4, FR-6.1.5, FR-6.1.6, FR-6.1.7, NFR-6.4, NFR-6.5, NFR-6.6, NFR-6.7]
version: v0.1
status: draft
stack: { framework: React19+TS, router: TanStack Router, data: TanStack Query, table: TanStack Table, ui: Shadcn/UI, css: Tailwind4, schema: Zod4 }
---

# SC-2 用户管理 · UI 设计说明

> PRD-sys-admin@v1.0 与原型之间的 UI 契约。系统账号的增删改查、改密、启停、分配角色，
> 敏感信息加密存储、脱敏展示、传输信封保护，写操作留痕、按钮级权限控制。

## 1 概述

- **目的**：管理员维护系统账号——列表查询、新建/编辑、重置口令、启用停用、软删除、分配角色。
- **主要角色**：`管理员`（`sys:user:read` + `sys:user:write`）。无 `sys:user:write` 的角色隐藏写操作。
- **入口路由**：`/sys/users`（TanStack Router）。
- **一句话**：系统账号的全生命周期管理，敏感信息全链路保护、操作可追溯。

## 2 需求追溯

| 区块 | 回指 |
|------|------|
| 用户列表（分页/搜索/脱敏） | `[FR-6.1.1]` `[NFR-6.6]` |
| 新建用户（口令哈希+敏感字段加密+信封） | `[FR-6.1.2]` `[NFR-6.5]` `[NFR-6.7]` |
| 编辑用户 | `[FR-6.1.3]` |
| 重置口令 | `[FR-6.1.4]` |
| 启用/停用 | `[FR-6.1.5]` `[NFR-6.4]` |
| 软删除 | `[FR-6.1.6]` |
| 分配角色 | `[FR-6.1.7]` |

## 3 信息架构 / 布局（低保真）

```
┌───────────────────────────────────────────────────────────┐
│ 用户管理            [搜索用户名____]  [+ 新建用户]          │
├───────────────────────────────────────────────────────────┤
│ 用户名 | 手机(脱敏) | 邮箱(脱敏) | 角色 | 状态 | 操作       │
│ admin  | 138****8000| a***@..  | 管理员| 启用 | [编辑][改密]│
│        |            |          |      |      | [角色][停用][删]│
│ …（分页）                                                   │
└───────────────────────────────────────────────────────────┘
   新建/编辑：Dialog + Form(Zod)：用户名/口令/手机/邮箱/角色
```

## 4 组件映射（→ Shadcn/UI）

| 区块 | Shadcn 组件 | 备注 |
|------|-------------|------|
| 列表 | `Table`（TanStack Table 驱动） | 列含脱敏手机/邮箱、状态 `Badge` |
| 搜索 | `Input` | 按用户名过滤（服务端 q 参数） |
| 新建/编辑 | `Dialog` + `Form` | react-hook-form + Zod4；敏感字段经 `envelope.ts` 加密上送 |
| 改密 | `Dialog` + `Form` | 口令策略校验 |
| 分配角色 | `Dialog` + 多选 | 写 roles |
| 启停/删除 | `Button` + `AlertDialog` | 删除为软删除二次确认 |
| 反馈 | `Toaster`(sonner) | 成功/失败提示 |
| 骨架 | `Skeleton` | 见 §5 |

## 5 页面状态

| 状态 | 触发 | 表现 |
|------|------|------|
| 加载中 | 拉取列表 | 表格 `Skeleton` |
| 错误 | 接口失败 | `Alert` + [重试]（TanStack Query retry） |
| 空 | 无用户 | 空态插画 + [新建用户] |
| 无权限 | 无 `sys:user:write` | 隐藏所有写操作按钮；无 `sys:user:read` 整页提示无权限 |
| 缺失/未确认 | 敏感字段为空 | 显示「—」，不显示明文 |
| 否决/受限 | 越权访问他人（非管理员） | 列表仅返回本人，写操作 403 toast |
| 成功 | 写操作完成 | toast + 失效列表 query 刷新 |

## 6 数据绑定

| UI 元素 | 来源（接口/字段） | 回指 |
|---------|------------------|------|
| 列表行 | `GET /api/sys/users?q&limit&offset` → `id,username,phone,email,roles,status` | `[FR-6.1.1]` `[NFR-6.6]` |
| 新建 | `POST /api/sys/users` `{username,password,phone,email,roles}` | `[FR-6.1.2]` `[NFR-6.5]` `[NFR-6.7]` |
| 编辑 | `PUT /api/sys/users/{id}` `{phone,email}` | `[FR-6.1.3]` |
| 改密 | `POST /api/sys/users/{id}/password` `{password}` | `[FR-6.1.4]` |
| 启停 | `POST /api/sys/users/{id}/status` `{status}` | `[FR-6.1.5]` |
| 删除 | `DELETE /api/sys/users/{id}`（软删） | `[FR-6.1.6]` |
| 角色 | `POST /api/sys/users/{id}/roles` `{roles}` | `[FR-6.1.7]` |

> 类型可由 orval 从 `specs/contract/openapi.json` 生成；本切片沿用仓内 `lib/api/http.ts` 手写 hook 约定。

## 7 交互与校验规则

- **敏感字段保护**：手机/邮箱经 `lib/api/envelope.ts` 信封加密上送（`[NFR-6.7]`）；列表/详情仅显示脱敏值（`[NFR-6.6]`）。
- **口令策略**：新建/改密的口令走 Zod + 后端 `password_policy` 双校验，弱口令 422。`[FR-6.1.2]` `[FR-6.1.4]`
- **软删除**：删除为逻辑删除，二次确认；删除后列表不显示但数据保留。`[FR-6.1.6]`
- **按钮级权限**：无 `sys:user:write` 隐藏写操作；越权请求后端 403。`[NFR-6.4]`

## 8 边界与异常

- 用户名重复：后端 409，表单内联报错。
- 越权：非管理员仅能见本人（后端数据范围过滤），写他人 403。`[NFR-6.4]`
- 敏感字段为空：显示「—」，不回吐明文。

## 9 验收要点（本屏）

- 列表手机/邮箱为脱敏值，库内为密文。`[NFR-6.5]` `[NFR-6.6]`
- 无写权限角色看不到写操作按钮，直接调用返回 403。`[NFR-6.4]`
- 删除后该用户从列表消失但数据库记录仍在。`[FR-6.1.6]`

## 10 交给下一棒的生成简报

> 目标：用户管理屏。React19+TS+Vite，Shadcn/UI + Tailwind4，TanStack Query/Table，表单 Zod4。
> 列表 + 新建/编辑/改密/角色 Dialog；敏感字段经 envelope.ts 加密；七态见 §5；数据形态见 §6（用 http hook）。
> 先出「已加载 + 含脱敏数据 + 管理员可见全部写操作」样例。
