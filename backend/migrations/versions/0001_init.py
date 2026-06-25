"""init: user / audit / login_log / applicant

Revision ID: 0001
Revises:
Create Date: 2026-06-23
"""
import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

JSON = postgresql.JSONB(astext_type=sa.Text())   # 生产 JSONB


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(), primary_key=True),
        sa.Column("username", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("password_hash", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("phone_enc", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("email_enc", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("roles_csv", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_user_username", "user", ["username"], unique=True)

    op.create_table(
        "auditrecord",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("entity_id", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("actor", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("action", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("reason", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("before", JSON, nullable=False),
        sa.Column("after", JSON, nullable=False),
        sa.Column("ts", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_auditrecord_entity_id", "auditrecord", ["entity_id"])
    op.create_index("ix_auditrecord_ts", "auditrecord", ["ts"])

    op.create_table(
        "loginlog",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("success", sa.Boolean(), nullable=False),
        sa.Column("ip", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("user_agent", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("detail", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("ts", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_loginlog_username", "loginlog", ["username"])

    op.create_table(
        "applicantrecord",
        sa.Column("id", sqlmodel.sql.sqltypes.AutoString(), primary_key=True),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("owner", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("scores", JSON, nullable=False),
        sa.Column("qc_confirmed", sa.Boolean(), nullable=False),
        sa.Column("veto_flag", sa.Boolean(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    for t in ("applicantrecord", "loginlog", "auditrecord", "user"):
        op.drop_table(t)
