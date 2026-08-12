import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY                     = os.getenv("SECRET_KEY", "dev-secret")
    SQLALCHEMY_DATABASE_URI        = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH             = 20 * 1024 * 1024   # 20 MB
    STORAGE_BUCKET                 = os.getenv("STORAGE_BUCKET")
    # Shared ARVI platform endpoint — backs clinic/doctor search and the intake submission API
    ARVI_API_URL                   = os.getenv("ARVI_API_URL", "http://localhost:5000")
    ARVI_API_KEY                   = os.getenv("ARVI_API_KEY")
    JWT_SECRET_KEY                 = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    REDIS_URL                      = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True          # logs every SQL query — useful while building

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False

config_map = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
}