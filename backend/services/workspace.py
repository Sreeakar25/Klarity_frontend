"""Workspace-level queries that power the dashboard and bootstrap payload."""

from __future__ import annotations

from datetime import datetime, timedelta
from statistics import mean
from typing import Dict, List

from sqlalchemy.orm import Session, selectinload
from config import SEED_DEMO_DATA

from models import (
    ActionType,
    BrandGuideline,
    ContentSubmission,
    GuidelineCategory,
    SubmissionStatus,
    ReviewReport,
)
from schemas import (
    ActivityItem,
    BootstrapOut,
    CoverageItem,
    DashboardStats,
    IssueBreakdownItem,
    TrendPoint,
)

OPEN_STATUSES = (
    SubmissionStatus.pending,
    SubmissionStatus.reviewing,
    SubmissionStatus.needs_changes,
)
REVIEWED_STATUSES = (
    SubmissionStatus.approved,
    SubmissionStatus.rejected,
    SubmissionStatus.needs_changes,
)


def latest_report_map(submissions: list[ContentSubmission]) -> Dict[int, ReviewReport]:
    reports: Dict[int, ReviewReport] = {}
    for submission in submissions:
        if submission.reports:
            reports[submission.id] = max(submission.reports, key=lambda report: report.created_at)
    return reports


def _submission_query(db: Session):
    return db.query(ContentSubmission).options(
        selectinload(ContentSubmission.reports).selectinload(ReviewReport.issues),
        selectinload(ContentSubmission.reports).selectinload(ReviewReport.actions),
    )


def load_submissions(db: Session) -> list[ContentSubmission]:
    return _submission_query(db).order_by(ContentSubmission.submitted_at.desc()).all()


def _approval_rate(submissions: list[ContentSubmission]) -> float:
    reviewed = [item for item in submissions if item.status in REVIEWED_STATUSES]
    if not reviewed:
        return 0.0
    approved = sum(1 for item in reviewed if item.status == SubmissionStatus.approved)
    return round(approved / len(reviewed) * 100, 1)


def _avg_score(submissions: list[ContentSubmission], reports: Dict[int, ReviewReport]) -> float:
    scores = [reports[item.id].overall_score for item in submissions if item.id in reports]
    return round(mean(scores), 1) if scores else 0.0


def build_stats(db: Session, submissions: list[ContentSubmission], reports: Dict[int, ReviewReport]) -> DashboardStats:
    now = datetime.utcnow()
    previous_start = now - timedelta(days=60)
    window_start = now - timedelta(days=30)

    current = [item for item in submissions if item.submitted_at and item.submitted_at >= window_start]
    previous = [
        item
        for item in submissions
        if item.submitted_at and previous_start <= item.submitted_at < window_start
    ]

    volume_delta = 0.0
    if previous:
        volume_delta = round((len(current) - len(previous)) / len(previous) * 100, 1)

    current_scores = [reports[item.id].overall_score for item in current if item.id in reports]
    previous_scores = [reports[item.id].overall_score for item in previous if item.id in reports]
    score_delta = 0.0
    if current_scores and previous_scores:
        score_delta = round(mean(current_scores) - mean(previous_scores), 1)

    current_approval = _approval_rate(current)
    previous_approval = _approval_rate(previous)
    approval_delta = round(current_approval - previous_approval, 1)

    open_issues = sum(
        len(reports[item.id].issues)
        for item in submissions
        if item.id in reports and item.status in OPEN_STATUSES
    )
    reviews_this_week = sum(
        1
        for item in submissions
        if item.reviewed_at and item.reviewed_at >= now - timedelta(days=7)
    )

    return DashboardStats(
        total_submissions=len(submissions),
        approval_rate=_approval_rate(submissions),
        avg_score=_avg_score(submissions, reports),
        active_guidelines=db.query(BrandGuideline).count(),
        pending_reviews=sum(1 for item in submissions if item.status in (SubmissionStatus.pending, SubmissionStatus.reviewing)),
        open_issues=open_issues,
        reviews_this_week=reviews_this_week,
        volume_delta=volume_delta,
        score_delta=score_delta,
        approval_delta=approval_delta,
    )


def build_trends(submissions: list[ContentSubmission], reports: Dict[int, ReviewReport]) -> List[TrendPoint]:
    now = datetime.utcnow()
    by_day: dict[str, list[ContentSubmission]] = {}
    for item in submissions:
        if not item.submitted_at:
            continue
        if item.submitted_at < now - timedelta(days=30):
            continue
        key = item.submitted_at.date().isoformat()
        by_day.setdefault(key, []).append(item)

    points: List[TrendPoint] = []
    for offset in range(29, -1, -1):
        day = (now - timedelta(days=offset)).date()
        key = day.isoformat()
        items = by_day.get(key, [])
        scores = [reports[item.id].overall_score for item in items if item.id in reports]
        points.append(
            TrendPoint(
                date=key,
                submissions=len(items),
                avg_score=round(mean(scores), 1) if scores else None,
            )
        )
    return points


def build_issue_breakdown(reports: Dict[int, ReviewReport]) -> List[IssueBreakdownItem]:
    counts: dict[tuple[str, str], int] = {}
    for report in reports.values():
        for issue in report.issues:
            key = (issue.category.value, issue.severity.value)
            counts[key] = counts.get(key, 0) + 1
    return [
        IssueBreakdownItem(category=category, severity=severity, count=count)
        for (category, severity), count in sorted(counts.items(), key=lambda item: item[1], reverse=True)
    ]


def build_coverage(db: Session, reports: Dict[int, ReviewReport]) -> List[CoverageItem]:
    issue_counts: dict[str, int] = {}
    for report in reports.values():
        for issue in report.issues:
            issue_counts[issue.category.value] = issue_counts.get(issue.category.value, 0) + 1

    items: List[CoverageItem] = []
    for category in GuidelineCategory:
        guideline_count = db.query(BrandGuideline).filter(BrandGuideline.category == category).count()
        items.append(
            CoverageItem(
                category=category.value,
                guidelines=guideline_count,
                issues=issue_counts.get(category.value, 0),
            )
        )
    return items


def build_activity(submissions: list[ContentSubmission], reports: Dict[int, ReviewReport]) -> List[ActivityItem]:
    items: list[ActivityItem] = []
    for submission in submissions:
        report = reports.get(submission.id)
        if not report:
            continue
        if report.actions:
            for action in report.actions:
                items.append(
                    ActivityItem(
                        id=f"action-{action.id}",
                        kind=action.action.value,
                        actor=action.performed_by,
                        title=submission.title,
                        submission_id=submission.id,
                        detail=action.comment,
                        created_at=action.created_at,
                    )
                )
        elif submission.status in (SubmissionStatus.pending, SubmissionStatus.reviewing, SubmissionStatus.needs_changes):
            items.append(
                ActivityItem(
                    id=f"submission-{submission.id}",
                    kind="submitted",
                    actor=submission.submitted_by,
                    title=submission.title,
                    submission_id=submission.id,
                    detail="Submitted for review",
                    created_at=submission.submitted_at,
                )
            )
    items.sort(key=lambda item: item.created_at, reverse=True)
    return items[:16]


def build_bootstrap(db: Session) -> BootstrapOut:
    submissions = load_submissions(db)
    guidelines = (
        db.query(BrandGuideline)
        .order_by(BrandGuideline.priority.desc(), BrandGuideline.title.asc())
        .all()
    )
    reports = latest_report_map(submissions)
    return BootstrapOut(
        stats=build_stats(db, submissions, reports),
        submissions=submissions[:56],
        guidelines=guidelines,
        activity=build_activity(submissions, reports),
        trends=build_trends(submissions, reports),
        issue_breakdown=build_issue_breakdown(reports),
        coverage=build_coverage(db, reports),
        demo_data=SEED_DEMO_DATA,
    )
