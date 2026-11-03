"""add appointment_date to intake_sessions

Revision ID: e8b4f19a6c21
Revises: d5a1c8e3f27b
Create Date: 2026-11-02

"""
from alembic import op
import sqlalchemy as sa


revision = "e8b4f19a6c21"
down_revision = "d5a1c8e3f27b"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("intake_sessions", sa.Column("appointment_date", sa.Date(), nullable=True))


def downgrade():
    op.drop_column("intake_sessions", "appointment_date")
