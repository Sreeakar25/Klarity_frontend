"""
SQLAlchemy ORM models for the Klarity platform.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
import enum

from database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class GuidelineCategory(str, enum.Enum):
    tone = "tone"
    visual = "visual"
    terminology = "terminology"
    facts = "facts"


class ContentType(str, enum.Enum):
    text = "text"
    image = "image"
    video = "video"
    html = "html"


class SubmissionStatus(str, enum.Enum):
    pending = "pending"
    reviewing = "reviewing"
    approved = "approved"
    rejected = "rejected"
    needs_changes = "needs_changes"


class IssueSeverity(str, enum.Enum):
    critical = "critical"
    warning = "warning"
    suggestion = "suggestion"


class IssueCategory(str, enum.Enum):
    tone = "tone"
    terminology = "terminology"
    facts = "facts"
    visual = "visual"
    grammar = "grammar"


class ActionType(str, enum.Enum):
    approved = "approved"
    rejected = "rejected"
    changes_requested = "changes_requested"


class UserRole(str, enum.Enum):
    creator = "creator"
    reviewer = "reviewer"
    admin = "admin"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(254), nullable=False, unique=True, index=True)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.creator)
    created_at = Column(DateTime, default=_utcnow)


class BrandGuideline(Base):
    __tablename__ = "brand_guidelines"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(SAEnum(GuidelineCategory), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(Integer, nullable=False, default=1)  # 1-5
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    # reverse relation from ReviewIssue
    issues = relationship("ReviewIssue", back_populates="guideline")


class ContentSubmission(Base):
    __tablename__ = "content_submissions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content_type = Column(SAEnum(ContentType), nullable=False, default=ContentType.text)
    content_text = Column(Text, nullable=False)
    status = Column(SAEnum(SubmissionStatus), nullable=False, default=SubmissionStatus.pending)
    submitted_by = Column(String(120), nullable=False)
    submitted_at = Column(DateTime, default=_utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewer_notes = Column(Text, nullable=True)

    reports = relationship("ReviewReport", back_populates="submission", cascade="all, delete-orphan")


class ReviewReport(Base):
    __tablename__ = "review_reports"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("content_submissions.id"), nullable=False)
    overall_score = Column(Float, nullable=False)  # 0-100
    summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=_utcnow)

    submission = relationship("ContentSubmission", back_populates="reports")
    issues = relationship("ReviewIssue", back_populates="report", cascade="all, delete-orphan")
    actions = relationship("ReviewAction", back_populates="report", cascade="all, delete-orphan")


class ReviewIssue(Base):
    __tablename__ = "review_issues"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("review_reports.id"), nullable=False)
    severity = Column(SAEnum(IssueSeverity), nullable=False)
    category = Column(SAEnum(IssueCategory), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    suggested_fix = Column(Text, nullable=True)
    guideline_id = Column(Integer, ForeignKey("brand_guidelines.id"), nullable=True)

    report = relationship("ReviewReport", back_populates="issues")
    guideline = relationship("BrandGuideline", back_populates="issues")


class ReviewAction(Base):
    __tablename__ = "review_actions"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("review_reports.id"), nullable=False)
    action = Column(SAEnum(ActionType), nullable=False)
    performed_by = Column(String(120), nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    report = relationship("ReviewReport", back_populates="actions")
