from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models.user import User

auth_bp = Blueprint("auth", __name__)


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
