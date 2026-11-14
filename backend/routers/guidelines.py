"""Brand guideline CRUD endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import BrandGuideline
from schemas import GuidelineCreate, GuidelineOut, GuidelineUpdate

router = APIRouter(prefix="/api/guidelines", tags=["guidelines"])


@router.get("", response_model=list[GuidelineOut])
def list_guidelines(
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[BrandGuideline]:
    query = db.query(BrandGuideline)
    if category and category != "all":
        query = query.filter(BrandGuideline.category == category)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(BrandGuideline.title.ilike(pattern))
    return query.order_by(BrandGuideline.priority.desc(), BrandGuideline.updated_at.desc()).all()


@router.get("/{guideline_id}", response_model=GuidelineOut)
def get_guideline(guideline_id: int, db: Session = Depends(get_db)) -> BrandGuideline:
    guideline = db.get(BrandGuideline, guideline_id)
    if not guideline:
        raise HTTPException(status_code=404, detail="Guideline not found")
    return guideline


@router.post("", response_model=GuidelineOut, status_code=201)
def create_guideline(payload: GuidelineCreate, db: Session = Depends(get_db)) -> BrandGuideline:
    guideline = BrandGuideline(
        title=payload.title.strip(),
        category=payload.category,
        content=payload.content.strip(),
        priority=payload.priority,
    )
    db.add(guideline)
    db.commit()
    db.refresh(guideline)
    return guideline


@router.patch("/{guideline_id}", response_model=GuidelineOut)
def update_guideline(
    guideline_id: int,
    payload: GuidelineUpdate,
    db: Session = Depends(get_db),
) -> BrandGuideline:
    guideline = db.get(BrandGuideline, guideline_id)
    if not guideline:
        raise HTTPException(status_code=404, detail="Guideline not found")
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(guideline, field, value)
    db.commit()
    db.refresh(guideline)
    return guideline


@router.delete("/{guideline_id}", status_code=204)
def delete_guideline(guideline_id: int, db: Session = Depends(get_db)) -> None:
    guideline = db.get(BrandGuideline, guideline_id)
    if not guideline:
        raise HTTPException(status_code=404, detail="Guideline not found")
    db.delete(guideline)
    db.commit()
