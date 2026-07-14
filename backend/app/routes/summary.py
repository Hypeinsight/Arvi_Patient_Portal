from flask import Blueprint, jsonify
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.session import IntakeSession
from app.models.summaries import Summary
from app.services.summariser import build_doctor_summary
from app.utils.session_helpers import session_form_data
from app.services.chat_cache import init_chat_cache
from app.services.prompt_builder import build_chat_system_prompt

summary_bp = Blueprint("summary", __name__)

@summary_bp.post("/sessions/<uuid:session_id>/summary")
def prepare_summary(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    form_data = session_form_data(session)

    summary_text = build_doctor_summary(
        session=session,
        form_data=form_data,
    )

    try:
        if session.summary:
            session.summary.summary_text = summary_text
            session.summary.user_id = session.user_id
        else:
            db.session.add(Summary(
                session_id=session.id,
                summary_text=summary_text,
                user_id=session.user_id
            ))
        db.session.commit()

        system_prompt = build_chat_system_prompt(form_data)
        init_chat_cache(str(session_id), system_prompt)
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 500

    return jsonify({
        "success": True,
        "summary": summary_text,
    }), 200