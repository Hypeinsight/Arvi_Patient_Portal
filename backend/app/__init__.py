# creates the app, connects to the database, and registers blueprints for the routes
import os
from flask import Flask
from app.extensions import db, migrate, bcrypt
from app.config     import config_map

def create_app():
    app = Flask(__name__)

    env = os.getenv("FLASK_ENV", "development")
    app.config.from_object(config_map.get(env, config_map["development"]))

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)

    # Import models so Flask-Migrate can detect them
    from app.models import IntakeSession, IntakeFormData, IntakeUpload, IntakeSummary

    # Register blueprints
    from app.routes.sessions import sessions_bp
    from app.routes.uploads  import uploads_bp
    from app.routes.submit   import submit_bp
    from app.routes.extract import extract_bp

    app.register_blueprint(sessions_bp, url_prefix="/api")
    app.register_blueprint(uploads_bp,  url_prefix="/api")
    app.register_blueprint(submit_bp,   url_prefix="/api")
    app.register_blueprint(extract_bp, url_prefix="/api")

    return app