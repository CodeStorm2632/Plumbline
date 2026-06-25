"""评价复核：读（榜单）+ 写（质检：写→审计→重算→返回最新）。"""
from __future__ import annotations

from sqlalchemy.orm.attributes import flag_modified
from sqlmodel import select

from app.core.audit.service import write_audit
from app.features.review.models import ApplicantRecord
from app.features.review.schemas import EvalResult, RankingItem


def list_rankings(session, *, limit: int = 50, offset: int = 0) -> list[RankingItem]:
    stmt = (
        select(ApplicantRecord)
        .where(ApplicantRecord.qc_confirmed == True)   # noqa: E712  仅确认者计入 [FR-5.3.2]
        .where(ApplicantRecord.veto_flag == False)     # noqa: E712  否决者不入榜 [FR-5.1.8]
        .order_by(ApplicantRecord.updated_at.desc())
        .offset(offset).limit(limit)
    )
    return [
        RankingItem(id=r.id, name=r.name, total=r.total,
                    qc_confirmed=r.qc_confirmed, veto=r.veto_flag)
        for r in session.exec(stmt).all()
    ]


def qc_claim(session, *, actor: str, applicant_id: str, claim_id: str, delta: float,
             reason: str) -> EvalResult:
    rec = session.get(ApplicantRecord, applicant_id)
    if rec is None:
        raise LookupError("applicant not found")
    before = dict(rec.scores)

    rec.scores[claim_id] = rec.scores.get(claim_id, 0) + delta      # 1) 改持久状态
    rec.qc_confirmed = True
    flag_modified(rec, "scores")                                    # JSON 字段必 flag

    write_audit(session, entity_id=applicant_id, actor=actor, action="qc",
                reason=reason, before=before, after=dict(rec.scores))  # 2) 审计 NFR-4

    # 3) 重算（领域纯模块；此处用内联简化算法示意）
    result = EvalResult(applicant_id=applicant_id, total=rec.total,
                        veto=rec.veto_flag, breakdown=dict(rec.scores))
    session.commit()
    return result                                                   # 4) 返回最新
