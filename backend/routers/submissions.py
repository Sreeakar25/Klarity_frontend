"""Content submission and review-action endpoints."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models import (
    ActionType,
    BrandGuideline,
    ContentSubmission,
    ContentType,
    ReviewAction,
    ReviewIssue,
    ReviewReport,
    SubmissionStatus,
)
from schemas import (
    ActionRequest,
    ContentSubmissionDetail,
    ContentSubmit,
)
from services.analyzer import analyse_content

router = APIRouter(prefix="/api/submissions", tags=["submissions"])

STATUS_BY_ACTION = {
    ActionType.approved: SubmissionStatus.approved,
    ActionType.rejected: SubmissionStatus.rejected,
    ActionType.changes_requested: SubmissionStatus.needs_changes,
}


def _submission(db: Session, submission_id: int) -> ContentSubmission:
    submission = (
        db.query(ContentSubmission)
        .options(
            selectinload(ContentSubmission.reports).selectinload(ReviewReport.issues),
            selectinload(ContentSubmission.reports).selectinload(ReviewReport.actions),
        )
        .filter(ContentSubmission.id == submission_id)
        .first()
    )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.get("", response_model=list[ContentSubmissionDetail])
def list_submissions(
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    limit: int = Query(default=60, ge=1, le=200),
    db: Session = Depends(get_db),
) -> list[ContentSubmission]:
    query = db.query(ContentSubmission).options(
        selectinload(ContentSubmission.reports).selectinload(ReviewReport.issues),
        selectinload(ContentSubmission.reports).selectinload(ReviewReport.actions),
    )
    if status and status != "all":
        try:
            query = query.filter(ContentSubmission.status == SubmissionStatus(status))
        except ValueError:
            raise HTTPException(status_code=422, detail="Unknown status filter")
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(ContentSubmission.title.ilike(pattern))
    return query.order_by(ContentSubmission.submitted_at.desc()).limit(limit).all()


@router.get("/{submission_id}", response_model=ContentSubmissionDetail)
def get_submission(submission_id: int, db: Session = Depends(get_db)) -> ContentSubmission:
    return _submission(db, submission_id)


@router.post("", response_model=ContentSubmissionDetail, status_code=201)
def create_submission(payload: ContentSubmit, db: Session = Depends(get_db)) -> ContentSubmission:
    try:
        content_type = ContentType(payload.content_type)
    except ValueError:
        raise HTTPException(status_code=422, detail="Unknown content type")

    submission = ContentSubmission(
        title=payload.title.strip(),
        content_type=content_type,
        content_text=payload.content_text.strip(),
        submitted_by=payload.submitted_by.strip(),
        status=SubmissionStatus.reviewing,
        submitted_at=datetime.utcnow(),
    )
    db.add(submission)
    db.flush()

    result = analyse_content(db, submission.title, submission.content_text, content_type)
    report = ReviewReport(
        submission=submission,
        overall_score=result.score,
        summary=result.summary,
        created_at=datetime.utcnow(),
    )
    db.add(report)
    db.flush()

    for issue in result.issues:
        db.add(
            ReviewIssue(
                report=report,
                severity=issue.severity,
                category=issue.category,
                title=issue.title,
                description=issue.description,
                evidence=issue.evidence,
                suggested_fix=issue.suggested_fix,
                guideline_id=issue.guideline_id,
            )
        )

    db.commit()
    return _submission(db, submission.id)


@router.post("/{submission_id}/action", response_model=ContentSubmissionDetail)
def review_submission(
    submission_id: int,
    payload: ActionRequest,
    db: Session = Depends(get_db),
) -> ContentSubmission:
    submission = _submission(db, submission_id)
    if not submission.reports:
        raise HTTPException(status_code=409, detail="Submission has no review report yet")

    report = max(submission.reports, key=lambda item: item.created_at)
    action = ReviewAction(
        report=report,
        action=payload.action,
        performed_by=payload.performed_by.strip(),
        comment=payload.comment.strip() if payload.comment else None,
        created_at=datetime.utcnow(),
    )
    db.add(action)
    submission.status = STATUS_BY_ACTION[payload.action]
    submission.reviewed_at = datetime.utcnow()
    submission.reviewer_notes = action.comment
    db.commit()
    return _submission(db, submission.id)
