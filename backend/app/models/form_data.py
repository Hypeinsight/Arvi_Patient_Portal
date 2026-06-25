import uuid
from datetime import datetime
from app.extensions import db

class IntakeFormData(db.Model):
    __tablename__ = "intake_form_data"

    id          = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id  = db.Column(db.UUID(as_uuid=True), db.ForeignKey("intake_sessions.id"), nullable=False)
    personal    = db.Column(db.JSON)
    medical     = db.Column(db.JSON)
    referral    = db.Column(db.JSON)
    consent     = db.Column(db.JSON)
    appointment = db.Column(db.JSON)
    account     = db.Column(db.JSON)
    created_at  = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)