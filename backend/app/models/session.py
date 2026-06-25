import uuid
from datetime import datetime, timedelta
from app.extensions import db

class IntakeSession(db.Model):
    __tablename__ = "intake_sessions"

    id             = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_type   = db.Column(db.String(20), nullable=False)
    status         = db.Column(db.String(20), nullable=False, default="in_progress") # in_progress, submitted, expired
    current_step   = db.Column(db.String(60))
    appointment_id = db.Column(db.String(100))
    doctor_id      = db.Column(db.String(100))
    created_at     = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    submitted_at   = db.Column(db.DateTime(timezone=True))
    expires_at     = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.utcnow() + timedelta(hours=48)
    )

    # Relationships — lets you do session.uploads, session.form_data, session.summary
    form_data = db.relationship("IntakeFormData", backref="session", uselist=False,  cascade="all, delete-orphan")
    uploads   = db.relationship("IntakeUpload",   backref="session", cascade="all, delete-orphan")
    summary   = db.relationship("IntakeSummary",  backref="session", uselist=False,  cascade="all, delete-orphan")

    def is_active(self):
        return self.status == "in_progress" and datetime.utcnow() < self.expires_at

    def to_dict(self):
        return {
            "id":             str(self.id),
            "patient_type":   self.patient_type,
            "status":         self.status,
            "current_step":   self.current_step,
            "appointment_id": self.appointment_id,
            "doctor_id":      self.doctor_id,
            "created_at":     self.created_at.isoformat(),
            "expires_at":     self.expires_at.isoformat(),
        }