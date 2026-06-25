---
description: 按规格驱动流程实现一个屏的完整垂直切片（PRD对齐→SC→后端→契约→前端→测试→过关）
argument-hint: <feature-slug，如 review 或 ranking>
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

为特性 `$1` 走完整切片流程，严格遵守 CLAUDE.md 与 .claude/rules/*：

1. 在 `specs/prd/PRD-*.md` 找出 `$1` 涉及的 `[FR-*]`；缺则先回 PRD 追加并 `make gen-lock`。
2. 确认/创建 `specs/ui/SC-*-$1.md`（含七态清单、数据绑定、traces_to）。
3. 后端切片 `backend/app/features/$1/`，前端切片 `frontend/src/features/$1/`，各遵守对应 rule。
4. `make openapi` 导契约，`pnpm orval` 生成类型。
5. 补 pytest + Vitest。
6. `make check` + `make test-all` 全绿。

可调用 `slice-implementer` 子代理执行，最后用 `code-reviewer`、`security-reviewer` 审。
