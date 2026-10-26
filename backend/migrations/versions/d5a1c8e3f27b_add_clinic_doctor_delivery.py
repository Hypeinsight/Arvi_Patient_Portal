"""add clinic, doctor and ARVI delivery columns to intake_sessions

Revision ID: d5a1c8e3f27b
Revises: b3e7d21a5c90
Create Date: 2026-10-21

"""
from alembic import op
import sqlalchemy as sa


revision = "d5a1c8e3f27b"
down_revision = "b3e7d21a5c90"
branch_labels = None
depends_on = None


COLUMNS = [
    ("organization_id", sa.String(100)),
    ("organization_name", sa.String(255)),
    ("doctor_id", sa.String(100)),
    ("doctor_name", sa.String(255)),
    ("delivery_status", sa.String(20)),
    ("delivery_error", sa.Text()),
    ("delivered_at", sa.DateTime(timezone=True)),
    ("arvi_reference", sa.String(100)),
]


def upgrade():
    for name, type_ in COLUMNS:
        op.add_column("intake_sessions", sa.Column(name, type_, nullable=True))
    op.create_check_constraint(
        "ck_intake_sessions_delivery_status",
        "intake_sessions",
        "delivery_status IN ('pending', 'sent', 'failed')",
    )


def downgrade():
    op.drop_constraint("ck_intake_sessions_delivery_status", "intake_sessions", type_="check")
    for name, _ in reversed(COLUMNS):
        op.drop_column("intake_sessions", name)
