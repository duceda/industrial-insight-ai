from pathlib import Path
from typing import List
import os

# Allow overriding the model path via environment variable. Default to the artifact we trained earlier.
DEFAULT_MODEL = Path(__file__).resolve().parents[2] / "artifacts" / "models" / "model_v20261001T140345Z.joblib"
MODEL_PATH = Path(os.environ.get("MODEL_PATH", str(DEFAULT_MODEL)))

# Risk thresholds (configurable)
THRESHOLDS = {
    "healthy": 0.30,
    "warning": 0.70,
}

# CORS allowed origins. Keep it narrow and allow local dev + Docker access.
DEFAULT_CORS_ORIGINS = [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:5173",
    "http://127.0.0.1",
    "http://127.0.0.1:80",
    "http://127.0.0.1:5173",
    "http://frontend",
    "http://frontend:80",
]
CORS_ORIGINS: List[str] = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", ",".join(DEFAULT_CORS_ORIGINS)).split(",")
    if origin.strip()
]

# In-memory store limits
STORE_MAX_PER_MACHINE = 100
