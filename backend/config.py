"""Server configuration; credentials stay outside the frontend."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

DATABASE_URL = os.getenv(
    "DATABASE_URL", "sqlite:///" + (Path(__file__).resolve().parent / "klarity.db").as_posix()
)
if not DATABASE_URL.startswith("sqlite:"):
    raise ValueError("The standalone backend requires a sqlite: DATABASE_URL")
SEED_DEMO_DATA = os.getenv("SEED_DEMO_DATA", "true").lower() == "true"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000",
    ).split(",")
    if origin.strip()
]
