from datetime import datetime

from sqlmodel import JSON, Column, Field, SQLModel


class ApplicantRecord(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    owner: str = ""                                  # 数据范围过滤用
    scores: dict = Field(default_factory=dict, sa_column=Column(JSON))
    qc_confirmed: bool = False
    veto_flag: bool = False
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def total(self) -> float:
        return float(sum(self.scores.values()))
