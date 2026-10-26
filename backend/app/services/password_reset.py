import uuid

from flask import current_app
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app.extensions import db
from app.models.user import User

TOKEN_MAX_AGE_SECONDS = 30 * 60
_SALT = "password-reset"


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt=_SALT)


def _password_fingerprint(user) -> str:
    # Part of the current hash: once the password changes, every link issued
    # before it stops working, so each link can only be used once
    return (user.password_hash or "")[-16:]


def make_reset_token(user) -> str:
    return _serializer().dumps({"uid": str(user.id), "pw": _password_fingerprint(user)})


def user_for_reset_token(token: str):
    """Returns the user the token was issued for, or None if it is invalid,
    expired or already used."""
    try:
        data = _serializer().loads(token, max_age=TOKEN_MAX_AGE_SECONDS)
        user_id = uuid.UUID(data.get("uid"))
    except (SignatureExpired, BadSignature, ValueError, TypeError, AttributeError):
        return None

    user = db.session.get(User, user_id)
    if not user or user.user_type != "registered":
        return None
    if _password_fingerprint(user) != data.get("pw"):
        return None
    return user
