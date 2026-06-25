"""灌入演示用户与申报数据：`uv run python -m app.seed`。"""
from sqlmodel import Session, select

from app.core.db import engine, init_db
from app.core.security import crypto
from app.features.review.models import ApplicantRecord
from app.features.auth.models import User


def run():
    init_db()
    with Session(engine) as s:
        if not s.exec(select(User)).first():
            s.add(User(id="u-expert", username="expert",
                       password_hash=crypto.hash_password("Expert@123"),
                       phone_enc=crypto.encrypt_field("13800138000"),
                       email_enc=crypto.encrypt_field("expert@corp.com"),
                       roles_csv="评审专家"))
            s.add(User(id="u-viewer", username="viewer",
                       password_hash=crypto.hash_password("Viewer@123"),
                       roles_csv="回测分析员"))
            s.add(ApplicantRecord(id="A1", name="张三", owner="u-expert",
                                  scores={"c1": 2.0}, qc_confirmed=False))
            s.add(ApplicantRecord(id="A2", name="李四", owner="u-expert",
                                  scores={"c1": 5.0}, qc_confirmed=True))
            s.commit()
            print("seeded: expert/Expert@123, viewer/Viewer@123; applicants A1,A2")
        else:
            print("already seeded")


if __name__ == "__main__":
    run()
