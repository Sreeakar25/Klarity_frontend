"""Dashboard and workspace bootstrap endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import BootstrapOut
from services.workspace import build_bootstrap

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/bootstrap", response_model=BootstrapOut)
def bootstrap(db: Session = Depends(get_db)) -> BootstrapOut:
    """One request returns everything the workspace needs to render."""

    return build_bootstrap(db)


@router.get("/dashboard", response_model=BootstrapOut)
def dashboard(db: Session = Depends(get_db)) -> BootstrapOut:
    return build_bootstrap(db)
