"""灌入演示角色与用户：`uv run python -m app.seed`。"""

from sqlmodel import Session, select

from app.core.db import engine, init_db
from app.core.security import crypto
from app.core.security.rbac import seed_rbac
from app.features.auth.models import User


def run():
    init_db()
    with Session(engine) as s:
        seed_rbac(s)  # 角色/菜单/权限落库（动态 RBAC 依赖此种子）
        if not s.exec(select(User)).first():
            s.add(
                User(
                    id="u-admin",
                    username="admin",
                    password_hash=crypto.hash_password("Admin@123"),
                    phone_enc=crypto.encrypt_field("13800138000"),
                    email_enc=crypto.encrypt_field("admin@corp.com"),
                    roles_csv="管理员",
                )
            )
            s.add(
                User(
                    id="u-auditor",
                    username="auditor",
                    password_hash=crypto.hash_password("Auditor@123"),
                    roles_csv="审计员",
                )
            )
            s.commit()
            print("seeded: admin/Admin@123 (管理员), auditor/Auditor@123 (审计员)")
        else:
            print("already seeded")


if __name__ == "__main__":
    run()
