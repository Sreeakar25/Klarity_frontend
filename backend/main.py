"""Klarity FastAPI application."""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from database import init_db
from routers import dashboard, guidelines, submissions
from seed import seed_database

ROOT = Path(__file__).resolve().parent
DIST = ROOT.parent / "frontend" / "dist"


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(submissions.router)
app.include_router(guidelines.router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "klarity-api", "demo_data": True}


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
