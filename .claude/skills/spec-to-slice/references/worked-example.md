# 内联样板（自包含 · 读切片 + 写切片）

这份样板把模板实例化成**可对照的真实代码**，覆盖人才评价域（与 `prd-writer` 的 `sample_prd.md`、`prd-to-ui-spec` 的 SC-1 复核台一致）。干净环境里没有外部 `eval-slice-*` 仓时，直接照这份模仿即可；若工程里恰好有 `eval-slice-B/C` 实样，可一并对照（可选）。

两条切片：
- **读** · SC-2 榜单 → `[FR-5.2.1]`（仅确认者计入）`[FR-5.2.2]`（筛选/排序/分页）。
- **写** · SC-1 复核台质检 → `[FR-5.1.3]`（可解释结果）`[FR-5.3.2]`（确认后计入）`[NFR-4]`（留痕）。

占位符实例化：`<Feature>=Review`/`<Entity>=Applicant`/`<Action>=Qc`。

---

## 后端 · 表模型（`app/models/applicant.py`）

```python
from datetime import datetime
from sqlmodel import SQLModel, Field, Column, JSON

class ApplicantRecord(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    scores: dict = Field(default_factory=dict, sa_column=Column(JSON))  # 测试 SQLite 用 JSON；迁移里 PostgreSQL 用 JSONB
    qc_confirmed: bool = False
    veto_flag: bool = False
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AuditRecord(SQLModel, table=True):           # NFR-4：只增不改
    id: int | None = Field(default=None, primary_key=True)
    entity_id: str = Field(index=True)
    actor: str
    action: str
    reason: str
    before: dict = Field(default_factory=dict, sa_column=Column(JSON))
    after: dict = Field(default_factory=dict, sa_column=Column(JSON))
    ts: datetime = Field(default_factory=datetime.utcnow)
```

## 后端 · schema（`app/schemas/review.py`，与表模型分离）

```python
from pydantic import BaseModel, Field, field_validator

class QcAction(BaseModel):
    delta: float
    reason: str = Field(min_length=1)            # 必填理由，缺则 422
    @field_validator("reason")
    @classmethod
    def _strip(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("reason 不能为空")
        return v.strip()

# EvalResult 直接复用领域纯模块（评分引擎）的 Pydantic 契约，前后端同形，不另定义。
from eval_engine.contracts import EvalResult   # 若无领域模块，则就地定义响应 schema
```

## 后端 · 写服务（`app/services/review_write.py`）—— 写→审计→重算范式

```python
from sqlalchemy.orm.attributes import flag_modified
from app.models.applicant import ApplicantRecord, AuditRecord

def qc_claim(session, actor: str, applicant_id: str, claim_id: str, act: QcAction) -> EvalResult:
    rec = session.get(ApplicantRecord, applicant_id)
    if rec is None:
        raise LookupError("applicant not found")
    before = dict(rec.scores)

    # 1) 改持久状态
    rec.scores[claim_id] = rec.scores.get(claim_id, 0) + act.delta
    rec.qc_confirmed = True
    flag_modified(rec, "scores")                 # 改 JSON 字段必须 flag，否则不落库

    # 2) 写审计（NFR-4，只增不改）
    session.add(AuditRecord(entity_id=applicant_id, actor=actor, action="qc",
                            reason=act.reason, before=before, after=dict(rec.scores)))

    # 3) 触发重算（仅当有领域计算时）：调评分引擎，落最新快照
    result = recompute(rec.scores, rec.veto_flag)   # 来自 eval_engine；纯 CRUD 切片无此步
    rec.updated_at = result.computed_at

    session.commit()
    return result                                 # 4) 返回最新结果
```

## 后端 · 读服务（`app/services/rankings_read.py`）—— 不手拼 SQL

```python
from sqlmodel import select
from app.models.applicant import ApplicantRecord

def list_rankings(session, *, domain: str | None, limit: int, offset: int):
    stmt = select(ApplicantRecord).where(ApplicantRecord.qc_confirmed == True)  # FR-5.3.2：仅确认者
    stmt = stmt.where(ApplicantRecord.veto_flag == False)                       # 否决者不入榜
    stmt = stmt.order_by(ApplicantRecord.updated_at.desc()).offset(offset).limit(limit)
    return session.exec(stmt).all()
```

## 后端 · 路由（`app/api/routes/review.py`）—— operation_id + x-trace + 角色守卫

```python
from fastapi import APIRouter, Depends
from app.core.deps import get_session, require_roles

router = APIRouter()

@router.get("/rankings", operation_id="listRankings",
            openapi_extra={"x-trace": ["FR-5.2.1", "FR-5.2.2", "FR-5.3.2"]})
def list_rankings_route(domain: str | None = None, limit: int = 50, offset: int = 0,
                        session=Depends(get_session),
                        user=Depends(require_roles("评审专家", "回测分析员"))):
    rows = list_rankings(session, domain=domain, limit=limit, offset=offset)
    return [RankingItem.model_validate(r, from_attributes=True) for r in rows]  # 经 schema，不直接返回表模型

@router.post("/applicants/{applicant_id}/qc/{claim_id}", response_model=EvalResult,
             operation_id="qcClaim",
             openapi_extra={"x-trace": ["FR-5.1.3", "FR-5.3.2", "NFR-4"]})
def qc_route(applicant_id: str, claim_id: str, body: QcAction,
             session=Depends(get_session),
             user=Depends(require_roles("评审专家"))):
    return qc_claim(session, user.name, applicant_id, claim_id, body)
```

---

## 前端 · hooks（`features/review/api.ts`）

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "../../lib/api/http";

export const rankingsKey = (domain?: string) => ["rankings", domain] as const;

export function useRankings(domain?: string) {                       // 读
  return useQuery({
    queryKey: rankingsKey(domain),
    queryFn: ({ signal }) => http<RankingItem[]>({ url: "/api/rankings", method: "GET", params: { domain }, signal }),
    staleTime: 30_000,
  });
}

export function useQcClaim(applicantId: string) {                    // 写
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: { claimId: string; delta: number; reason: string }) =>
      http<EvalResult>({ url: `/api/applicants/${applicantId}/qc/${b.claimId}`, method: "POST",
                        data: { delta: b.delta, reason: b.reason } }),
    onSuccess: () => {                                                // 重算结果自动回流
      qc.invalidateQueries({ queryKey: ["evaluation", applicantId] });
      qc.invalidateQueries({ queryKey: ["rankings"] });
      qc.invalidateQueries({ queryKey: ["audit", applicantId] });
    },
  });
}
```

## 前端 · 页面（`features/review/ReviewPage.tsx`）—— SC §5 七态全覆盖

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRankings, useQcClaim } from "./api";

export function ReviewPage({ applicantId, role }: { applicantId: string; role: string }) {
  const { data, isLoading, isError, error, refetch } = useRankings();
  const qc = useQcClaim(applicantId);
  const canWrite = role === "评审专家";                              // 无权限：隐藏写操作

  if (isError)                                                        // 错误
    return (
      <Alert variant="destructive">
        <AlertTitle>加载失败</AlertTitle>
        <AlertDescription>{String((error as Error)?.message)}
          <Button size="sm" variant="outline" onClick={() => refetch()}>重试</Button>
        </AlertDescription>
      </Alert>
    );
  if (isLoading)                                                      // 加载中
    return <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  if (!data || data.length === 0)                                    // 空
    return <div className="rounded-md border p-10 text-center text-muted-foreground">暂无可复核数据</div>;

  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div key={row.id} className="flex items-center gap-2 border-b py-2">
          <span className="font-medium">{row.name}</span>
          {row.veto && <Alert variant="destructive" className="py-1">一票否决·不计入排序</Alert>}   {/* 否决态：降级 */}
          {!row.qcConfirmed && <Badge variant="outline">未确认</Badge>}                              {/* 缺失/未确认：标记 + 禁用下游 */}
          {canWrite && (                                                                              {/* 无权限角色不渲染 */}
            <Button size="sm" disabled={row.veto || qc.isPending}
              onClick={() => qc.mutate(
                { claimId: row.id, delta: 1, reason: "复核确认" },
                { onSuccess: () => toast.success("已质检并重算") }                                    /* 成功反馈 */
              )}>质检</Button>
          )}
        </div>
      ))}
    </div>
  );
}
```

> 七态对照 SC §5：加载(`Skeleton`)/错误(`Alert`+重试)/空(空态)/无权限(`canWrite` 隐藏)/未确认(`Badge`+禁用)/否决(`Alert` destructive 降级)/成功(`toast`)。

---

## 测试（`tests/test_review.py`）—— 覆盖重算·留痕·422·角色守卫

```python
def test_qc_recompute_and_audit(client, db):
    seed_applicant(db, "A1", scores={"c1": 2})
    r = client.post("/api/applicants/A1/qc/c1",
                    json={"delta": 1, "reason": "复核确认"},
                    headers=expert_auth())
    assert r.status_code == 200
    assert r.json()["total"] == 3                      # 重算正确
    assert db.exec(select(AuditRecord).where(AuditRecord.entity_id == "A1")).first()  # 留痕

def test_qc_requires_reason(client):
    r = client.post("/api/applicants/A1/qc/c1", json={"delta": 1, "reason": ""}, headers=expert_auth())
    assert r.status_code == 422                         # 必填理由

def test_qc_role_guard(client):
    r = client.post("/api/applicants/A1/qc/c1", json={"delta": 1, "reason": "x"}, headers=viewer_auth())
    assert r.status_code == 403                         # 角色守卫
```

`conftest.py` 用 `test.py.tmpl` 配套的统一 SQLite 测试库 + 认证头工具（`expert_auth/viewer_auth`，header 不含中文，角色用 ascii 映射）。
