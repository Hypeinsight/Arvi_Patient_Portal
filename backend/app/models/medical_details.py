import uuid
from datetime import datetime, timezone

from app.extensions import db
from sqlalchemy.dialects.postgresql import ARRAY, UUID


class MedicalDetails(db.Model):
    __tablename__ = "medical_details"

    id = db.Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=db.text("gen_random_uuid()"),
    )
    session_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("intake_sessions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    conditions = db.Column(ARRAY(db.Text))
    medications = db.Column(ARRAY(db.Text))
    allergies = db.Column(ARRAY(db.Text))
    previous_surgeries = db.Column(db.Text)
    family_history = db.Column(db.Text)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=db.text("now()"),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=db.text("now()"),
    )
