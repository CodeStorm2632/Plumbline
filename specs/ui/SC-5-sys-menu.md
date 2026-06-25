---
id: UID-SC-sys-menu
screen: SC-5 菜单管理
title: 菜单管理 · UI 设计说明
source_prd: PRD-sys-admin @ v1.0
traces_to: [FR-6.3.1, FR-6.3.2, FR-6.3.3, FR-6.3.4, NFR-6.1, NFR-6.3, NFR-6.4]
version: v0.1
status: draft
stack: { framework: React19+TS, router: TanStack Router, data: TanStack Query, table: TanStack Table, ui: Shadcn/UI, css: Tailwind4, schema: Zod4 }
---

# SC-5 菜单管理 · UI 设计说明

> 维护目录/菜单/按钮三级树，按钮节点的 `perm_code` 作为动态 RBAC 权限载体。

## 1 概述

- **目的**：管理员维护菜单树、路由路径与按钮级权限码。
- **主要角色**：`管理员`（`sys:menu:read` + `sys:menu:write`）。无 `sys:menu:write` 的角色隐藏写操作。
- **入口路由**：`/sys/menus`。
- **一句话**：菜单即权限载体，树形维护后驱动角色授权与按钮级鉴权。

## 2 需求追溯

| 区块 | 回指 |
|------|------|
| 树形展示目录/菜单/按钮 | `[FR-6.3.1]` |
| 新建/编辑菜单节点 | `[FR-6.3.2]` |
| 级联软删除菜单节点 | `[FR-6.3.3]` `[NFR-6.1]` |
| 维护按钮权限码 | `[FR-6.3.4]` `[NFR-6.3]` |

## 3 信息架构 / 布局（低保真）

```
┌────────────────────────────────────────────────────┐
│ 菜单管理                              [+ 新建节点] │
├────────────────────────────────────────────────────┤
│ 名称/层级        | 类型   | 路径      | 权限码      │
│ 系统管理         | dir    | —         | —           │
│   用户管理       | menu   | /sys/users| —           │
│     用户维护按钮 | button | —         | sys:user:write │
│ …                                                   │
└────────────────────────────────────────────────────┘
```

## 4 组件映射（→ Shadcn/UI）

| 区块 | Shadcn 组件 | 备注 |
|------|-------------|------|
| 树表 | `Table` + 缩进 | 展示父子层级，按 `order_no` 排序 |
| 新建/编辑 | `Dialog` + `Form` | code/name/type/parent/path/icon/order_no/perm_code |
| 删除 | `Button` + `AlertDialog` | 删除为级联软删 |
| 反馈 | `Toaster`(sonner) | 成功/失败提示 |
| 骨架 | `Skeleton` | 见 §5 |

## 5 页面状态

| 状态 | 触发 | 表现 |
|------|------|------|
| 加载中 | 拉取菜单树 | `Skeleton` / 文本加载提示 |
| 错误 | 接口失败 | `Alert` + [重试] |
| 空 | 无菜单节点 | 空态 + [新建节点] |
| 无权限 | 无 `sys:menu:write` | 隐藏写操作；无 read 整页提示 |
| 缺失/未确认 | 节点 path 或 perm_code 为空 | 显示「—」并标记按钮权限缺失 |
| 否决/受限 | 越权写操作 | 后端 403，前端 toast/错误文案 |
| 成功 | 写/删完成 | toast + 失效菜单树 query |

## 6 数据绑定

| UI 元素 | 来源（接口/字段） | 回指 |
|---------|------------------|------|
| 菜单树 | `GET /api/sys/menus` → `id,code,name,parent_id,type,perm_code,path,icon,order_no,children` | `[FR-6.3.1]` |
| 新建 | `POST /api/sys/menus` `{code,name,parent_id,type,perm_code,path,icon,order_no}` | `[FR-6.3.2]` `[FR-6.3.4]` |
| 编辑 | `PUT /api/sys/menus/{id}` | `[FR-6.3.2]` `[FR-6.3.4]` |
| 删除 | `DELETE /api/sys/menus/{id}`（级联软删） | `[FR-6.3.3]` `[NFR-6.1]` |

## 7 交互与校验规则

- **类型约束**：`type ∈ {dir, menu, button}`；button 节点应填写 `perm_code`。`[FR-6.3.4]`
- **排序**：同级节点按 `order_no` 升序展示。`[FR-6.3.1]`
- **级联软删**：删除父节点时，后端将其全部子节点标记 `is_deleted=1`。`[FR-6.3.3]`
- **权限缓存**：修改按钮权限码或删除含按钮权限的节点后，后端失效权限缓存。`[NFR-6.3]`

## 8 边界与异常

- 菜单码重复：后端 409，表单内联报错。
- 父节点被删除：子节点随父节点软删，列表不再展示。
- 无写权限：前端隐藏新建/编辑/删除，后端仍以 403 兜底。`[NFR-6.4]`

## 9 验收要点（本屏）

- 能按树形层级展示目录/菜单/按钮。`[FR-6.3.1]`
- 能创建按钮节点并维护 `perm_code`。`[FR-6.3.4]`
- 删除父节点后子节点不再出现在树中，库内保留软删记录。`[FR-6.3.3]`

## 10 交给下一棒的生成简报

> 目标：菜单管理屏。树表 + 新建节点表单 + 删除按钮；七态见 §5，数据形态见 §6。
> 先出「系统管理下含用户/角色/日志按钮权限」样例。
