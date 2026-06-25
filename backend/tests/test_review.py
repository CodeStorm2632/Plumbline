from sqlmodel import Session, select

from app.core.db import engine
from app.core.audit.models import AuditRecord
from tests.conftest import auth_header


def test_rankings_perm_and_qc_role_guard(client):
    viewer = auth_header(client, "viewer", "Viewer@123")
    assert client.get("/api/rankings", headers=viewer).status_code == 200      # 回测分析员有 ranking:read
    # viewer 无 review:qc → 403
    r = client.post("/api/applicants/A1/qc/c1", headers=viewer,
                    json={"delta": 1, "reason": "x"})
    assert r.status_code == 403


def test_qc_recompute_and_audit(client):
    h = auth_header(client, "expert", "Expert@123")
    r = client.post("/api/applicants/A1/qc/c1", headers=h,
                    json={"delta": 1, "reason": "复核确认"})
    assert r.status_code == 200
    assert r.json()["total"] == 3.0                                             # 2 + 1 重算
    with Session(engine) as s:
        assert s.exec(select(AuditRecord).where(AuditRecord.entity_id == "A1")).first()  # 留痕


def test_qc_requires_reason(client):
    h = auth_header(client, "expert", "Expert@123")
    r = client.post("/api/applicants/A1/qc/c1", headers=h, json={"delta": 1, "reason": ""})
    assert r.status_code == 422
