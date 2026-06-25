# 架构与目录约定

**特性优先（feature-first），不是分层。** 一个切片 = 一个文件夹，前后端对称。

```
backend/app/
  core/                跨切片：config db store deps security/* audit/*
  features/<x>/        models.py schemas.py service.py router.py
frontend/src/
  lib/api/             http.ts + generated/（orval 生成，勿手改）
  features/<x>/        api.ts + <X>Page.tsx
specs/                 prd/ ui/ contract/ requirements-lock.yaml（真源）
```

规则：
- 新功能放 `features/<x>/`，不要散进多个"层目录"。
- 跨切片复用（认证、审计、国密、RBAC、DB 会话）放 `core/`；`core` 不依赖 `features`。
- 表模型在各自切片 `features/<x>/models.py`；跨切片的审计模型在 `core/audit/models.py`。
  新增表后在 `app/features/__init__.py` 确保被导入（Alembic 才能发现）。
