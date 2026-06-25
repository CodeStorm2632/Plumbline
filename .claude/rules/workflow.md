# 切一刀（垂直切片）标准工作流

1. **对规格**：确认这屏的能力在 `specs/prd/PRD-*.md` 有 `[FR-*]`；没有就先回 PRD 追加并 `make gen-lock`。
2. **UI 说明**：`specs/ui/SC-<n>-<slug>.md`（含七态清单、数据绑定、`traces_to`）。
3. **后端切片**：建 `backend/app/features/<x>/{models,schemas,service,router}.py`，遵守 @.claude/rules/backend.md；
   需要新表则建 Alembic 迁移并在 `features/__init__.py` 注册。
4. **导出契约**：`make openapi` → `specs/contract/openapi.json`；前端 `pnpm orval` 生成类型。
5. **前端切片**：建 `frontend/src/features/<x>/{api.ts,<X>Page.tsx}`，遵守 @.claude/rules/frontend.md（七态）。
6. **测试**：补后端 pytest + 前端 Vitest（@.claude/rules/testing.md）。
7. **过关**：`make check`（四关）+ `make test-all`，全绿。覆盖率若某 FR 仍 🔴/🟠 → 补屏/补接口。

> 复杂切片可交给 `slice-implementer` 子代理；收尾用 `code-reviewer` + `security-reviewer` 审 diff。
