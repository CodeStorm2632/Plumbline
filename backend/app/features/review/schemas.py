from pydantic import BaseModel, Field, field_validator


class RankingItem(BaseModel):
    id: str
    name: str
    total: float
    qc_confirmed: bool
    veto: bool


class QcAction(BaseModel):
    delta: float
    reason: str = Field(min_length=1)

    @field_validator("reason")
    @classmethod
    def _strip(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("reason 不能为空")
        return v.strip()


class EvalResult(BaseModel):    # 与领域纯模块同形（示意）
    applicant_id: str
    total: float
    veto: bool
    breakdown: dict
