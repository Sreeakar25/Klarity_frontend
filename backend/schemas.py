"""
Pydantic schemas (request / response models) for the Klarity API.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from models import (
    GuidelineCategory,
    ContentType,
    SubmissionStatus,
    IssueSeverity,
    IssueCategory,
    ActionType,
    UserRole,
)


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., min_length=3, max_length=254)
    role: UserRole = UserRole.creator


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# BrandGuideline
# ---------------------------------------------------------------------------

class GuidelineCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    category: GuidelineCategory
    content: str = Field(..., min_length=1)
    priority: int = Field(1, ge=1, le=5)


class GuidelineUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[GuidelineCategory] = None
    content: Optional[str] = Field(None, min_length=1)
    priority: Optional[int] = Field(None, ge=1, le=5)


class GuidelineOut(BaseModel):
    id: int
    title: str
    category: GuidelineCategory
    content: str
    priority: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# ContentSubmission
# ---------------------------------------------------------------------------

class ContentSubmit(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content_type: ContentType = ContentType.text
    content_text: str = Field(..., min_length=1)
    submitted_by: str = Field(..., min_length=1, max_length=120)


class ContentSubmissionOut(BaseModel):
    id: int
    title: str
    content_type: ContentType
    content_text: str
    status: SubmissionStatus
    submitted_by: str
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewer_notes: Optional[str] = None

    model_config = {"from_attributes": True}


class ContentSubmissionDetail(ContentSubmissionOut):
    """Submission plus its review reports."""
    reports: List[ReviewReportOut] = []


# ---------------------------------------------------------------------------
# ReviewReport
# ---------------------------------------------------------------------------

class ReviewIssueOut(BaseModel):
    id: int
    severity: IssueSeverity
    category: IssueCategory
    title: str
    description: str
    evidence: Optional[str] = None
    suggested_fix: Optional[str] = None
    guideline_id: Optional[int] = None

    model_config = {"from_attributes": True}


class ReviewActionOut(BaseModel):
    id: int
    action: ActionType
    performed_by: str
    comment: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewReportOut(BaseModel):
    id: int
    submission_id: int
    overall_score: float
    summary: str
    created_at: datetime
    issues: List[ReviewIssueOut] = []
    actions: List[ReviewActionOut] = []

    model_config = {"from_attributes": True}


# Resolve forward reference
ContentSubmissionDetail.model_rebuild()


# ---------------------------------------------------------------------------
# Review Action request
# ---------------------------------------------------------------------------

class ActionRequest(BaseModel):
    action: ActionType
    performed_by: str = Field(..., min_length=1, max_length=120)
    comment: Optional[str] = None


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

class DashboardStats(BaseModel):
    total_submissions: int
    approval_rate: float  # percentage 0-100
    avg_score: float
    active_guidelines: int
    pending_reviews: int = 0
    open_issues: int = 0
    reviews_this_week: int = 0
    volume_delta: float = 0
    score_delta: float = 0
    approval_delta: float = 0


class RecentReview(BaseModel):
    submission_id: int
    title: str
    overall_score: float
    status: SubmissionStatus
    submitted_by: str
    reviewed_at: Optional[datetime] = None


class IssueBreakdownItem(BaseModel):
    category: str
    severity: str
    count: int


class TrendPoint(BaseModel):
    date: str  # ISO date
    submissions: int
    avg_score: Optional[float] = None


# ---------------------------------------------------------------------------
# Bootstrap payload (single request powers the workspace)
# ---------------------------------------------------------------------------

class ActivityItem(BaseModel):
    id: str
    kind: str  # approved | changes_requested | rejected | submitted
    actor: str
    title: str
    submission_id: int
    detail: Optional[str] = None
    created_at: datetime


class CoverageItem(BaseModel):
    category: str
    guidelines: int
    issues: int


class BootstrapOut(BaseModel):
    stats: DashboardStats
    submissions: List[ContentSubmissionDetail]
    guidelines: List[GuidelineOut]
    activity: List[ActivityItem]
    trends: List[TrendPoint]
    issue_breakdown: List[IssueBreakdownItem]
    coverage: List[CoverageItem]
    demo_data: bool = True
