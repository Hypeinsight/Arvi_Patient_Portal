import uuid
from datetime import datetime, timezone

from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID


class ClinicDetails(db.Model):
    __tablename__ = "clinic_details"

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
    clinic_org_id = db.Column(db.Integer, nullable=False)
    clinic_name = db.Column(db.String(255), nullable=False)
    doctor_id = db.Column(db.Integer, nullable=False)
    doctor_name = db.Column(db.String(255), nullable=False)
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
