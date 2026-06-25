from fastapi import APIRouter, Depends

from app.core.deps import CurrentUser, get_session, require_perms
from app.features.review.schemas import EvalResult, QcAction, RankingItem
from app.features.review import service as review_service

router = APIRouter(prefix="/api", tags=["review"])


@router.get("/rankings", response_model=list[RankingItem], operation_id="listRankings",
            openapi_extra={"x-trace": ["FR-5.2.1", "FR-5.2.2", "FR-5.3.2"]})
def list_rankings(limit: int = 50, offset: int = 0, session=Depends(get_session),
                  user: CurrentUser = Depends(require_perms("ranking:read"))):
    return review_service.list_rankings(session, limit=limit, offset=offset)


@router.post("/applicants/{applicant_id}/qc/{claim_id}", response_model=EvalResult,
             operation_id="qcClaim",
             openapi_extra={"x-trace": ["FR-5.1.3", "FR-5.3.2", "NFR-4"]})
def qc(applicant_id: str, claim_id: str, body: QcAction, session=Depends(get_session),
       user: CurrentUser = Depends(require_perms("review:qc"))):
    return review_service.qc_claim(session, actor=user.name, applicant_id=applicant_id,
                                   claim_id=claim_id, delta=body.delta, reason=body.reason)
