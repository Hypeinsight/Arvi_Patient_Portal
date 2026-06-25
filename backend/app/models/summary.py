import uuid
from datetime import datetime
from app.extensions import db

class IntakeSummary(db.Model):
    __tablename__ = "intake_summaries"

    id             = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id     = db.Column(db.UUID(as_uuid=True), db.ForeignKey("intake_sessions.id"), nullable=False)
    summary_text   = db.Column(db.Text, nullable=False)
    generated_at   = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    sent_to_api_at = db.Column(db.DateTime(timezone=True))
    api_response   = db.Column(db.JSON)