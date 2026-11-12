import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY                     = os.getenv("SECRET_KEY", "dev-secret")
    SQLALCHEMY_DATABASE_URI        = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH             = 20 * 1024 * 1024   # 20 MB
    STORAGE_BUCKET                 = os.getenv("STORAGE_BUCKET")
    DOCTOR_API_URL                 = os.getenv("DOCTOR_API_URL")
    DOCTOR_API_KEY                 = os.getenv("DOCTOR_API_KEY")
    JWT_SECRET_KEY                 = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    REDIS_URL                      = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    # Email goes through Resend, same as ARVI
    RESEND_API_KEY                 = os.getenv("RESEND_API_KEY")
    SENDER_EMAIL                   = os.getenv("SENDER_EMAIL", "Info@arvihealth.com")
    # Where links in emails point to (the Next.js app)
    FRONTEND_URL                   = os.getenv("FRONTEND_URL", "http://localhost:3000")
    # Google DLP masks PII in chat text before it reaches Azure OpenAI.
    # Off by default in development; while off, text is sent unmasked
    DLP_ENABLED                    = (os.getenv("DLP_ENABLED") or "false").lower() == "true"
    GCP_PROJECT                    = os.getenv("GCP_PROJECT")

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True          # logs every SQL query — useful while building

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False
    # On unless explicitly turned off, so a missing setting can't send PII
    # unmasked. Without GCP_PROJECT, chat then fails with a 503 instead
    DLP_ENABLED = (os.getenv("DLP_ENABLED") or "true").lower() == "true"

config_map = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
}