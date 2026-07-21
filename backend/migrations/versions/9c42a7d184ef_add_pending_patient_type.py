"""add pending patient type and new-account session flag

Revision ID: 9c42a7d184ef
Revises: f12f53bbecb8
Create Date: 2026-07-20

"""
from alembic import op
import sqlalchemy as sa


revision = "9c42a7d184ef"
down_revision = "f12f53bbecb8"
branch_labels = None
depends_on = None


def upgrade():
    # The pre-Alembic database used PostgreSQL's automatic constraint name,
    # while fresh databases created by the baseline use the explicit model name.
    op.execute(
        "ALTER TABLE intake_sessions "
        "DROP CONSTRAINT IF EXISTS ck_intake_sessions_patient_type"
    )
    op.execute(
        "ALTER TABLE intake_sessions "
        "DROP CONSTRAINT IF EXISTS intake_sessions_patient_type_check"
    )
    op.create_check_constraint(
        "ck_intake_sessions_patient_type",
        "intake_sessions",
        "patient_type IN ('pending', 'new', 'guest', 'followup_lt12', 'followup_gt12')",
    )
    op.add_column(
        "intake_sessions",
        sa.Column(
            "is_new_account",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade():
    op.drop_column("intake_sessions", "is_new_account")
    op.drop_constraint(
        "ck_intake_sessions_patient_type",
        "intake_sessions",
        type_="check",
    )
    op.create_check_constraint(
        "ck_intake_sessions_patient_type",
        "intake_sessions",
        "patient_type IN ('new', 'guest', 'followup_lt12', 'followup_gt12')",
    )
