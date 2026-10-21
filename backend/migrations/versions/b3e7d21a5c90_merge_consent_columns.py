"""merge consent columns into accepted_terms_and_privacy

Revision ID: b3e7d21a5c90
Revises: 9c42a7d184ef
Create Date: 2026-10-21

"""
from alembic import op
import sqlalchemy as sa


revision = "b3e7d21a5c90"
down_revision = "9c42a7d184ef"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "consent_records",
        sa.Column(
            "accepted_terms_and_privacy",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    # A record only counts as consented if both old flags were accepted
    op.execute(
        "UPDATE consent_records "
        "SET accepted_terms_and_privacy = accepted_terms AND accepted_privacy"
    )
    op.drop_column("consent_records", "accepted_terms")
    op.drop_column("consent_records", "accepted_privacy")
    op.drop_column("consent_records", "consent_marketing")


def downgrade():
    for column in ("accepted_terms", "accepted_privacy", "consent_marketing"):
        op.add_column(
            "consent_records",
            sa.Column(column, sa.Boolean(), nullable=False, server_default=sa.false()),
        )
    op.execute(
        "UPDATE consent_records "
        "SET accepted_terms = accepted_terms_and_privacy, "
        "accepted_privacy = accepted_terms_and_privacy"
    )
    op.drop_column("consent_records", "accepted_terms_and_privacy")
