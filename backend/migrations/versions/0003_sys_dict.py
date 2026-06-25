"""add sys dict tables

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-25
"""

import sqlalchemy as sa
import sqlmodel
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

_STR = sqlmodel.sql.sqltypes.AutoString


def _sysbase_cols() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("created_by", _STR(), nullable=True),
        sa.Column("updated_by", _STR(), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
    ]


def upgrade() -> None:
    op.create_table(
        "sys_dict",
        sa.Column("id", _STR(), primary_key=True),
        sa.Column("code", _STR(), nullable=False),
        sa.Column("name", _STR(), nullable=False),
        sa.Column("remark", _STR(), nullable=False, server_default=""),
        *_sysbase_cols(),
    )
    op.create_index("ix_sys_dict_code", "sys_dict", ["code"], unique=True)
    op.create_index("ix_sys_dict_is_deleted", "sys_dict", ["is_deleted"])

    op.create_table(
        "sys_dict_item",
        sa.Column("id", _STR(), primary_key=True),
        sa.Column("type_code", _STR(), nullable=False),
        sa.Column("label", _STR(), nullable=False),
        sa.Column("value", _STR(), nullable=False),
        sa.Column("order_no", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", _STR(), nullable=False, server_default="active"),
        *_sysbase_cols(),
    )
    op.create_index("ix_sys_dict_item_type_code", "sys_dict_item", ["type_code"])
    op.create_index("ix_sys_dict_item_is_deleted", "sys_dict_item", ["is_deleted"])


def downgrade() -> None:
    op.drop_index("ix_sys_dict_item_is_deleted", table_name="sys_dict_item")
    op.drop_index("ix_sys_dict_item_type_code", table_name="sys_dict_item")
    op.drop_table("sys_dict_item")
    op.drop_index("ix_sys_dict_is_deleted", table_name="sys_dict")
    op.drop_index("ix_sys_dict_code", table_name="sys_dict")
    op.drop_table("sys_dict")
