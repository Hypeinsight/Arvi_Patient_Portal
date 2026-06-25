import uuid
from datetime import datetime
from app.extensions import db

class IntakeUpload(db.Model):
    __tablename__ = "intake_uploads"

    id            = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id    = db.Column(db.UUID(as_uuid=True), db.ForeignKey("intake_sessions.id"), nullable=False)
    upload_type   = db.Column(db.String(30), nullable=False)
    original_name = db.Column(db.String(255))
    storage_key   = db.Column(db.String(500), nullable=False)
    mime_type     = db.Column(db.String(100))
    size_bytes    = db.Column(db.BigInteger)
    uploaded_at   = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":            str(self.id),
            "upload_type":   self.upload_type,
            "original_name": self.original_name,
            "mime_type":     self.mime_type,
            "size_bytes":    self.size_bytes,
        }