import uuid
from datetime import datetime, timezone

from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID


class Summary(db.Model):
    __tablename__ = "summaries"

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
    user_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    summary_text = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=db.text("now()"),
    )
