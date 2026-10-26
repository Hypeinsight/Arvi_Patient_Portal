import uuid
from datetime import datetime, timezone

from app.extensions import db
from sqlalchemy import CheckConstraint
from sqlalchemy.dialects.postgresql import UUID


class IntakeSession(db.Model):
    __tablename__ = "intake_sessions"
    __table_args__ = (
        CheckConstraint(
            "patient_type IN ('pending', 'new', 'guest', 'followup_lt12', 'followup_gt12')",
            name="ck_intake_sessions_patient_type",
        ),
        CheckConstraint(
            "status IN ('in_progress', 'submitted', 'expired')",
            name="ck_intake_sessions_status",
        ),
        CheckConstraint(
            "delivery_status IN ('pending', 'sent', 'failed')",
            name="ck_intake_sessions_delivery_status",
        ),
    )

    id = db.Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=db.text("gen_random_uuid()"),
    )
    user_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=False,
    )
    patient_type = db.Column(db.String(50), nullable=False)
    is_new_account = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        server_default=db.false(),
    )
    status = db.Column(
        db.String(50),
        nullable=False,
        default="in_progress",
        server_default="in_progress",
    )
    last_activity_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=db.text("now()"),
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=db.text("now()"),
    )
    submitted_at = db.Column(db.DateTime(timezone=True))

    # Clinic and doctor chosen by the patient. IDs come from ARVI, names are
    # kept so the intake still reads correctly if ARVI is unreachable
    organization_id = db.Column(db.String(100))
    organization_name = db.Column(db.String(255))
    doctor_id = db.Column(db.String(100))
    doctor_name = db.Column(db.String(255))

    # Result of sending the finished intake to ARVI
    delivery_status = db.Column(db.String(20))
    delivery_error = db.Column(db.Text)
    delivered_at = db.Column(db.DateTime(timezone=True))
    arvi_reference = db.Column(db.String(100))

    user = db.relationship("User", backref="intake_sessions")
    appointment_details = db.relationship(
        "AppointmentDetails",
        backref="session",
        cascade="all, delete-orphan",
        uselist=False,
    )
    consent_record = db.relationship(
        "ConsentRecord",
        backref="session",
        cascade="all, delete-orphan",
        uselist=False,
    )
    patient_profile = db.relationship(
        "PatientProfile",
        backref="session",
        cascade="all, delete-orphan",
        uselist=False,
    )
    medical_details = db.relationship(
        "MedicalDetails",
        backref="session",
        cascade="all, delete-orphan",
        uselist=False,
    )
    referral_details = db.relationship(
        "ReferralDetails",
        backref="session",
        cascade="all, delete-orphan",
        uselist=False,
    )
    chat_messages = db.relationship(
        "ChatMessage",
        backref="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )
    summary = db.relationship(
        "Summary",
        backref="session",
        cascade="all, delete-orphan",
        uselist=False,
    )

    def is_active(self):
        return self.status == "in_progress"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "patient_type": self.patient_type,
            "is_new_account": self.is_new_account,
            "status": self.status,
            "last_activity_at": self.last_activity_at.isoformat(),
            "created_at": self.created_at.isoformat(),
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "organization_id": self.organization_id,
            "organization_name": self.organization_name,
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor_name,
            "delivery_status": self.delivery_status,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
        }
