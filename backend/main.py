"""Klarity FastAPI application."""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, SEED_DEMO_DATA
from database import get_db, init_db
from routers import dashboard, guidelines, submissions
from seed import seed_database
from auth import router as auth_router, current_account, seed_test_account

ROOT = Path(__file__).resolve().parent
DIST = ROOT.parent / "frontend" / "dist"


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    seed_test_account()
    if SEED_DEMO_DATA:
        seed_database()
    yield


app = FastAPI(
    title="Klarity API",
    version="0.1.0",
    description="Brand consistency and governance API for the Klarity demo workspace.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dashboard.router, dependencies=[Depends(current_account)])
app.include_router(submissions.router, dependencies=[Depends(current_account)])
app.include_router(guidelines.router, dependencies=[Depends(current_account)])


@app.get("/api/health")
def health(db: Session = Depends(get_db)) -> dict:
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database unavailable") from None
    return {"status": "ok", "service": "klarity-api", "demo_data": SEED_DEMO_DATA}


if DIST.exists():
    assets = DIST / "assets"
    if assets.exists():
        app.mount("/assets", StaticFiles(directory=assets), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        candidate = DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(DIST / "index.html")
else:

    @app.get("/", include_in_schema=False)
    def root():
        return JSONResponse(
            {
                "service": "Klarity API",
                "docs": "/docs",
                "message": "Frontend is not built yet. Run `npm run dev` in frontend/ for the app.",
            }
        )
