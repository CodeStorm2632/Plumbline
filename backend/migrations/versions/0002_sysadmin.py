"""sysadmin: user 加 SysBase 列 + role/menu/rolemenu；移除 applicantrecord

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-25
"""

import sqlalchemy as sa
import sqlmodel
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

JSON = postgresql.JSONB(astext_type=sa.Text())

_STR = sqlmodel.sql.sqltypes.AutoString


def _sysbase_cols() -> list[sa.Column]:
    # created_at/updated_at/created_by/updated_by/is_deleted（NFR-6.1 / NFR-6.2）
    return [
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("created_by", _STR(), nullable=True),
        sa.Column("updated_by", _STR(), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
    ]


def upgrade() -> None:
    # 1) user 补 SysBase 列（created_at 已在 0001）
    with op.batch_alter_table("user") as b:
        b.add_column(
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now())
        )
        b.add_column(sa.Column("created_by", _STR(), nullable=True))
        b.add_column(sa.Column("updated_by", _STR(), nullable=True))
        b.add_column(
            sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false())
        )
    op.create_index("ix_user_is_deleted", "user", ["is_deleted"])

    # 2) role
    op.create_table(
        "role",
        sa.Column("id", _STR(), primary_key=True),
        sa.Column("code", _STR(), nullable=False),
        sa.Column("name", _STR(), nullable=False),
        sa.Column("remark", _STR(), nullable=False, server_default=""),
        *_sysbase_cols(),
    )
    op.create_index("ix_role_code", "role", ["code"], unique=True)
    op.create_index("ix_role_is_deleted", "role", ["is_deleted"])

    # 3) menu
    op.create_table(
        "menu",
        sa.Column("id", _STR(), primary_key=True),
        sa.Column("code", _STR(), nullable=False),
        sa.Column("name", _STR(), nullable=False),
        sa.Column("parent_id", _STR(), nullable=True),
        sa.Column("type", _STR(), nullable=False, server_default="menu"),
        sa.Column("perm_code", _STR(), nullable=True),
        sa.Column("path", _STR(), nullable=True),
        sa.Column("icon", _STR(), nullable=True),
        sa.Column("order_no", sa.Integer(), nullable=False, server_default="0"),
        *_sysbase_cols(),
    )
    op.create_index("ix_menu_code", "menu", ["code"], unique=True)
    op.create_index("ix_menu_parent_id", "menu", ["parent_id"])
    op.create_index("ix_menu_is_deleted", "menu", ["is_deleted"])

    # 4) rolemenu 关联
    op.create_table(
        "rolemenu",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("role_id", _STR(), nullable=False),
        sa.Column("menu_id", _STR(), nullable=False),
    )
    op.create_index("ix_rolemenu_role_id", "rolemenu", ["role_id"])
    op.create_index("ix_rolemenu_menu_id", "rolemenu", ["menu_id"])

    # 5) 移除人才评价遗留表
    op.drop_table("applicantrecord")


def downgrade() -> None:
    op.create_table(
        "applicantrecord",
        sa.Column("id", _STR(), primary_key=True),
        sa.Column("name", _STR(), nullable=False),
        sa.Column("owner", _STR(), nullable=False),
        sa.Column("scores", JSON, nullable=False),
        sa.Column("qc_confirmed", sa.Boolean(), nullable=False),
        sa.Column("veto_flag", sa.Boolean(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    for t in ("rolemenu", "menu", "role"):
        op.drop_table(t)
    op.drop_index("ix_user_is_deleted", "user")
    with op.batch_alter_table("user") as b:
        for c in ("is_deleted", "updated_by", "created_by", "updated_at"):
            b.drop_column(c)
