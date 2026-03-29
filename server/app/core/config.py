from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "Student Academic Clustering API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    DATASET_PATH: str = str(BASE_DIR / "dataset" / "students.csv")
    MODEL_DIR: str = str(BASE_DIR / "models_saved")
    DEFAULT_N_CLUSTERS: int = 3
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
