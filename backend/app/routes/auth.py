from datetime import datetime
from urllib.parse import quote

from flask import Blueprint, current_app, request, jsonify, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models.user import User
from app.services.password_reset import TOKEN_MAX_AGE_SECONDS, make_reset_token, user_for_reset_token
from app.utils.email import send_email

auth_bp = Blueprint("auth", __name__)

MIN_PASSWORD_LENGTH = 8


@auth_bp.post("/register")
def register():
    body = request.get_json(silent=True) or {}
    user_type = body.get("user_type", "registered")
    email = (body.get("email") or "").strip().lower()
    password = body.get("password")

    if user_type not in ("registered", "guest"):
        return jsonify({"success": False, "message": "Invalid user type"}), 400

    if user_type == "guest":
        user = User(user_type="guest")
        db.session.add(user)
        db.session.commit()

        token = create_access_token(identity=str(user.id))

        return jsonify({
            "success": True,
            "access_token": token,
            "user": {
                "id": str(user.id),
                "user_type": user.user_type,
                "email": user.email,
            },
        }), 201

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email already registered"}), 409

    user = User(
        user_type="registered",
        email=email,
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "success": True,
        "access_token": token,
        "user": {
            "id": str(user.id),
            "user_type": user.user_type,
            "email": user.email,
        },
    }), 201


@auth_bp.post("/login")
def login():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email, user_type="registered").first()
    if not user or not user.password_hash or not check_password_hash(user.password_hash, password):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "success": True,
        "access_token": token,
        "user": {
            "id": str(user.id),
            "user_type": user.user_type,
            "email": user.email,
        },
    }), 200


@auth_bp.post("/forgot-password")
def forgot_password():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400

    user = User.query.filter_by(email=email, user_type="registered").first()
    if user and user.password_hash:
        reset_url = (
            f"{current_app.config['FRONTEND_URL'].rstrip('/')}"
            f"/reset-password?token={quote(make_reset_token(user))}"
        )
        html = render_template(
            "emails/password_reset.html",
            email=email,
            reset_url=reset_url,
            expires_minutes=TOKEN_MAX_AGE_SECONDS // 60,
            year=datetime.now().year,
        )
        send_email(email, "Reset your Arvi Health password", html)

    # Same answer whether or not the account exists, so this can't be used to
    # find out which emails are registered
    return jsonify({
        "success": True,
        "message": "If an account exists for that email, we've sent a link to reset the password.",
    }), 200


@auth_bp.post("/reset-password")
def reset_password():
    body = request.get_json(silent=True) or {}
    token = body.get("token") or ""
    password = body.get("password") or ""

    if len(password) < MIN_PASSWORD_LENGTH:
        return jsonify({
            "success": False,
            "message": f"Password must be at least {MIN_PASSWORD_LENGTH} characters",
        }), 400

    user = user_for_reset_token(token)
    if not user:
        return jsonify({
            "success": False,
            "message": "This reset link is invalid or has expired. Please request a new one.",
        }), 400

    user.password_hash = generate_password_hash(password)
    db.session.commit()

    return jsonify({"success": True, "message": "Your password has been reset. You can now log in."}), 200
