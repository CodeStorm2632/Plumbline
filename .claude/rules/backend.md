# 后端约定（FastAPI + SQLModel）

- **表/Schema 分离**：`models.py`（SQLModel table）与 `schemas.py`（Pydantic 入/出 DTO）分开。
  路由返回 DTO（`Model.model_validate(row, from_attributes=True)`），**不要直接返回表模型**。
- **不手拼 SQL**：查询用 `select(...)`。结构变更只走 Alembic 迁移（`alembic revision --autogenerate`），
  **不 create_all 于生产**，不手改已存在迁移。
- **写操作三段式**：写持久状态 → 写审计（`core/audit`，只增不改）→（如有领域计算）重算 → 返回最新。
  改 JSON 字段后必须 `flag_modified(rec, "field")`。
- **接口契约**：每个业务路由带 `operation_id` 和 `openapi_extra={"x-trace":[FR-...]}`；
  入参/出参用 schema 校验；必填项缺失应 422。
- **依赖与守卫**：会话 `Depends(get_session)`；鉴权 `Depends(require_perms("资源:动作"))` 或 `require_roles(...)`。
- **包管理**：`uv add` / `uv sync`，不要 pip。
- **每个切片配 pytest**：见 @.claude/rules/testing.md。
