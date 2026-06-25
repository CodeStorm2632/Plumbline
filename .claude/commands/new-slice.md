---
description: 脚手架：为新特性创建空的前后端切片文件骨架（不写业务逻辑）
argument-hint: <feature-slug>
allowed-tools: Write, Bash
---

为 `$1` 创建符合目录约定的空骨架（仅占位，含 TODO 指向对应 rule），不实现业务：
- `backend/app/features/$1/{__init__.py,models.py,schemas.py,service.py,router.py}`
- `frontend/src/features/$1/{api.ts,$1Page.tsx,$1Page.test.tsx}`
- 提醒：实现时遵守 .claude/rules/backend.md、frontend.md、testing.md；新表记得在 `app/features/__init__.py` 注册并建迁移。
