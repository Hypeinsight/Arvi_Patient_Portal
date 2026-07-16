# creates the app, connects to the database, and registers blueprints for the routes
import os
from flask import Flask
import redis
from app.extensions import db, migrate, bcrypt, jwt
from app.config     import config_map
from flask_cors import CORS

from app import extensions

def create_app():
    app = Flask(__name__)
    CORS(app)

    env = os.getenv("FLASK_ENV", "development")
    app.config.from_object(config_map.get(env, config_map["development"]))

    # Init extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    extensions.redis_client = redis.from_url(app.config["REDIS_URL"])

    # Import models so Flask-Migrate can detect them
    from app.models import User

    # Register blueprints
    from app.routes.appointment_details import appointment_details_bp
    from app.routes.consent_records import consent_records_bp
    from app.routes.medical_details import medical_details_bp
    from app.routes.patient_profiles import patient_profiles_bp
    from app.routes.referral_details import referral_details_bp
    from app.routes.extract import extract_bp
    from app.routes.sessions import sessions_bp
    from app.routes.auth     import auth_bp
    from app.routes.chat import chat_bp

    app.register_blueprint(appointment_details_bp, url_prefix="/api")
    app.register_blueprint(consent_records_bp, url_prefix="/api")
    app.register_blueprint(medical_details_bp, url_prefix="/api")
    app.register_blueprint(patient_profiles_bp, url_prefix="/api")
    app.register_blueprint(referral_details_bp, url_prefix="/api")
    app.register_blueprint(extract_bp, url_prefix="/api")
    app.register_blueprint(sessions_bp, url_prefix="/api")
    app.register_blueprint(auth_bp,     url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")
    return app
