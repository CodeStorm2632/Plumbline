# 后端约定（FastAPI + SQLModel + Alembic）

## 1 表模型 vs API schema 必须分离

- `app/models/` 放 SQLModel `table=True` 表模型;`app/schemas/` 放 Pydantic 请求/响应。
- **路由绝不直接返回表模型**,一律经 schema 转换(等价旧栈 entity/DTO/VO 分离)。
- 领域计算结果(如评分 `EvalResult`)**复用纯模块的 Pydantic 契约**作为响应,保证前后端同形、不重复定义。
- JSON 列:PostgreSQL 用 JSONB(迁移里指定),代码里用 `sa_column=Column(JSON)` 兼容测试 SQLite。

## 2 迁移:Alembic only

- 表结构一律 Alembic 版本化迁移;**生产绝不 `SQLModel.metadata.create_all`**(仅 dev/测试 lifespan 用)。
- 迁移里 JSONB 用 `postgresql.JSONB`;每张表建必要索引;`down_revision` 串成链。

## 3 查询:不手拼 SQL

- 一律 `sqlmodel.select(...)` + `.where/.order_by/.limit`;聚合"每实体最新一条"用按时间倒序取首条或子查询。

## 4 路由:operation_id + x-trace + 角色守卫

```python
@router.post(
    "/applicants/{applicant_id}/qc/{claim_id}",
    response_model=EvalResult, operation_id="qcClaim",
    openapi_extra={"x-trace": ["FR-5.1.3", "FR-5.3.2", "NFR-4"]},
)
def qc(applicant_id: str, claim_id: str, body: QcAction,
       session: Session = Depends(get_session),
       user: User = Depends(require_roles("评审专家"))):
    ...
```
- 每个业务 op 必带 `operation_id`(orval 命名)与 `x-trace`(回指 `[FR-*]`)。
- 每个接口必过 `require_roles(...)`。

## 5 服务层范式

**读**:`select` → 聚合/排序/分页 → 转 schema 返回。

**写(关键范式)**:
```
改持久状态(表/JSON 字段) → 写 AuditRecord(操作人·时间·理由·before/after) → 触发重算 → 返回最新结果
```
- 修改 SQLModel 的 JSON 字段后,**必须 `flag_modified(rec, "字段名")`** 否则不落库。
- 必填理由用 Pydantic `model_validator`/`Field(min_length=1)`,缺则 422。
- 幂等:重复写以最后一次为准,但**审计只增不改、历史全留**。
- 重算(**条件性**):仅当有领域计算(如评分)时,调用领域纯模块并落新结果快照,读侧取"最新";纯 CRUD 切片无此步。

## 6 认证 seam（SM2-JWT + Redis）

- `get_current_user`:从 `Authorization: Bearer <token>` 取 SM2-JWT → tongsuopy SM2 验签 → 校验 Redis token 白名单 → 解析 sub/roles。
- `require_roles(*roles)`:依赖工厂,角色不符 403。
- 占位实现(demo token)仅供本地/测试,**HTTP header 不能含中文**(角色用 ascii code 映射到中文角色)。

## 7 OpenAPI → orval

- FastAPI 自动出 OpenAPI 3.1;导出 `openapi/openapi.json` 作为前端契约真源。
- 用 `scripts/check_xtrace.py` 校验每个 op 的 `x-trace` 都存在于 PRD。

> 完整实例化代码见 `references/worked-example.md`(写服务含 audit + 重算 + 必填理由 + 角色守卫)。外部 `eval-slice-B/C` 若存在可额外对照(非必需)。
