"""
Rule-based demonstration analyser for Klarity.

This stands in for the LLM + vision pipeline described in the product brief.
It is deliberately transparent: every issue maps to a known rule and can be
traced back to a guideline. No network calls, no hidden model.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Optional

from sqlalchemy.orm import Session

from models import BrandGuideline, ContentType, GuidelineCategory, IssueCategory, IssueSeverity


@dataclass
class AnalysedIssue:
    severity: IssueSeverity
    category: IssueCategory
    title: str
    description: str
    evidence: str
    suggested_fix: str
    guideline_title: Optional[str] = None
    guideline_id: Optional[int] = None


@dataclass
class AnalysisResult:
    score: float
    summary: str
    issues: List[AnalysedIssue] = field(default_factory=list)


BANNED_TERMS = {
    "game-changing": ("tone", "Hype language", "The brand voice is grounded and specific; 'game-changing' is a claim without substance."),
    "seamless": ("terminology", "Empty adjective", "'Seamless' has appeared in 34 pieces this quarter and no longer carries meaning."),
    "revolutionary": ("tone", "Hype language", "Revolutionary reads as marketing noise next to the brand's measured voice."),
    "eco-friendly": ("terminology", "Unsubstantiated term", "Use a specific material or process instead of the banned umbrella term 'eco-friendly'."),
    "best-in-class": ("tone", "Comparative claim", "The brand does not use unsupported comparative claims."),
    "world's best": ("facts", "Unsupported superlative", "A superlative needs a named, verifiable source."),
    "number one": ("facts", "Unsupported superlative", "A ranking claim needs a named, verifiable source and a date."),
    "utilize": ("terminology", "Formal filler", "Prefer 'use'. It is shorter and warmer."),
    "leverage": ("terminology", "Corporate filler", "Prefer a concrete verb: 'use', 'build on', or 'draw from'."),
    "click here": ("terminology", "Accessibility (WCAG 2.4.4): Non-descriptive link", "Link text should describe the specific destination rather than 'click here'."),
    "read more": ("terminology", "Accessibility (WCAG 2.4.4): Non-descriptive link", "Links should provide meaningful context for assistive screen readers."),
    "100% guaranteed": ("facts", "Unsupported promotional claim", "Absolute promotional guarantees create legal and compliance liabilities."),
    "risk-free": ("facts", "Unsupported promotional claim", "Avoid absolute promotional promises without explicit terms."),
    "miracle": ("tone", "Hyperbolic promotional claim", "Aster & Oak avoids theatrical or miracle claims in customer-facing editorial copy."),
    "cheap": ("tone", "Off-brand descriptor", "Describe value, not price, in customer-facing copy."),
}

SUSTAINABILITY_PATTERNS = [
    ("100% sustainable", "sustainability"),
    ("carbon neutral", "sustainability"),
    ("zero waste", "sustainability"),
    ("fully recyclable", "sustainability"),
]

HYPE_WORDS = ["unleash", "supercharge", "effortlessly", "unlock", "transform your"]


def _find_guideline(
    guidelines: List[BrandGuideline],
    *preferred_categories: GuidelineCategory,
    title_hint: str | None = None,
) -> Optional[BrandGuideline]:
    if title_hint:
        for guideline in guidelines:
            if title_hint.lower() in guideline.title.lower():
                return guideline
    for category in preferred_categories:
        for guideline in guidelines:
            if guideline.category == category:
                return guideline
    return guidelines[0] if guidelines else None


def _issue(
    guidelines: List[BrandGuideline],
    severity: IssueSeverity,
    category: IssueCategory,
    title: str,
    description: str,
    evidence: str,
    suggested_fix: str,
    guideline_hint: str | None = None,
    guideline_category: GuidelineCategory | None = None,
) -> AnalysedIssue:
    preferred = [guideline_category] if guideline_category else []
    guideline = _find_guideline(guidelines, *preferred, title_hint=guideline_hint)
    return AnalysedIssue(
        severity=severity,
        category=category,
        title=title,
        description=description,
        evidence=evidence,
        suggested_fix=suggested_fix,
        guideline_title=guideline.title if guideline else None,
        guideline_id=guideline.id if guideline else None,
    )


def analyse_content(
    db: Session,
    title: str,
    content_text: str,
    content_type: ContentType = ContentType.text,
) -> AnalysisResult:
    """Review a piece of content against the live guideline library."""

    guidelines = db.query(BrandGuideline).order_by(BrandGuideline.priority.desc()).all()
    lowered = f"{title}\n{content_text}".lower()
    issues: list[AnalysedIssue] = []

    for term, (category, issue_title, description) in BANNED_TERMS.items():
        if term in lowered:
            cat = IssueCategory(category)
            severity = IssueSeverity.warning
            if category == "facts":
                severity = IssueSeverity.critical
            issues.append(
                _issue(
                    guidelines,
                    severity,
                    cat,
                    issue_title,
                    description,
                    f"Found the phrase “{term}” in the submitted copy.",
                    f"Replace “{term}” with a specific, verifiable detail that serves the same point.",
                    guideline_hint="words we use" if cat == IssueCategory.terminology else "voice",
                    guideline_category=GuidelineCategory.terminology if cat == IssueCategory.terminology else GuidelineCategory.tone,
                )
            )

    for phrase, claim_type in SUSTAINABILITY_PATTERNS:
        if phrase in lowered:
            issues.append(
                _issue(
                    guidelines,
                    IssueSeverity.critical,
                    IssueCategory.facts,
                    "Unsubstantiated sustainability claim",
                    "A sustainability claim needs a named certification, standard, or measured figure before it can ship.",
                    f"“{phrase}” appears without a source in the same paragraph.",
                    "State the material or certification behind the claim, for example “made with 100% European flax linen”, and link the evidence.",
                    guideline_hint="sustainability",
                    guideline_category=GuidelineCategory.facts,
                )
            )

    for word in HYPE_WORDS:
        if word in lowered:
            issues.append(
                _issue(
                    guidelines,
                    IssueSeverity.warning,
                    IssueCategory.tone,
                    "Tone drifts into hype",
                    "The brand speaks with quiet confidence. Hype verbs make the copy sound like a different company.",
                    f"“{word}” is on the tone watchlist for this workspace.",
                    "Keep the concrete benefit, remove the hype verb. Let the detail carry the energy.",
                    guideline_hint="voice",
                    guideline_category=GuidelineCategory.tone,
                )
            )
            break

    exclamations = content_text.count("!")
    if exclamations >= 3:
        issues.append(
            _issue(
                guidelines,
                IssueSeverity.suggestion,
                IssueCategory.tone,
                "Too many exclamation marks",
                "The brand voice is warm, not shouty. Repeated exclamation marks flatten the emphasis.",
                f"{exclamations} exclamation marks in one piece.",
                "Keep at most one exclamation mark, or remove them all and strengthen the verb.",
                guideline_hint="voice",
                guideline_category=GuidelineCategory.tone,
            )
        )

    if "we're" in lowered or "we are" in lowered:
        if "you" not in lowered and len(content_text.split()) > 30:
            issues.append(
                _issue(
                    guidelines,
                    IssueSeverity.suggestion,
                    IssueCategory.tone,
                    "Copy talks about us, not the reader",
                    "The reader should be the subject of the sentence more often than the company.",
                    "The piece uses first-person plural without addressing the reader directly.",
                    "Reframe one opening sentence around the reader's moment or need.",
                    guideline_hint="voice",
                    guideline_category=GuidelineCategory.tone,
                )
            )

    if content_type == ContentType.document:
        doc_words = len(content_text.split())
        if doc_words < 15:
            issues.append(
                _issue(
                    guidelines,
                    IssueSeverity.warning,
                    IssueCategory.facts,
                    "Document structure incomplete",
                    "Brand documentation and formal whitepapers require executive summaries and cited references.",
                    "The uploaded document contains under 15 words or is missing standard body sections.",
                    "Ensure the document contains an introduction, substantiated claims, and verified footnote citations.",
                    guideline_hint="facts",
                    guideline_category=GuidelineCategory.facts,
                )
            )

    if content_type == ContentType.image:
        issues.append(
            _issue(
                guidelines,
                IssueSeverity.warning,
                IssueCategory.visual,
                "Logo clear space cannot be verified",
                "The submitted visual is a raster preview. The logo lockup needs at least 24px of clear space at this size.",
                "No layered source file was supplied with the submission.",
                "Upload the layered source or confirm the primary lockup and clear space in the brand kit.",
                guideline_hint="logo",
                guideline_category=GuidelineCategory.visual,
            )
        )

    if content_type == ContentType.html and "<img" in lowered and "alt=" not in lowered:
        issues.append(
            _issue(
                guidelines,
                IssueSeverity.warning,
                IssueCategory.visual,
                "Accessibility (WCAG 1.1.1): Missing image alt text",
                "Images on brand web pages must have descriptive alt attributes for screen readers and search indexes.",
                "Found <img> tag without an alt attribute.",
                "Add an alt attribute describing the image subject, e.g. alt=\"Aster & Oak handcrafted stoneware bowl in organic sage\".",
                guideline_hint="visual",
                guideline_category=GuidelineCategory.visual,
            )
        )

    if "red button" in lowered or "green box" in lowered:
        issues.append(
            _issue(
                guidelines,
                IssueSeverity.suggestion,
                IssueCategory.terminology,
                "Accessibility (WCAG 1.4.1): Color-only sensory instruction",
                "Avoid referring exclusively to color to provide instructions, as users with visual impairments may not distinguish it.",
                "Found color-dependent instruction in content.",
                "Combine color with text labels or structural cues (e.g. 'the primary Publish button' rather than 'the green button').",
                guideline_hint="voice",
                guideline_category=GuidelineCategory.terminology,
            )
        )

    if "bengaluru" in lowered and "bangalore" in lowered:
        issues.append(
            _issue(
                guidelines,
                IssueSeverity.warning,
                IssueCategory.terminology,
                "Place name used inconsistently",
                "Use the approved market name in customer-facing copy and keep the local name in direct quotes.",
                "Both 'Bengaluru' and 'Bangalore' appear in the same piece.",
                "Pick the approved form for this market and apply it consistently.",
                guideline_hint="naming",
                guideline_category=GuidelineCategory.terminology,
            )
        )

    # Keep the report focused: strongest issues first, one per repeated title.
    deduped: list[AnalysedIssue] = []
    seen: set[str] = set()
    order = {IssueSeverity.critical: 0, IssueSeverity.warning: 1, IssueSeverity.suggestion: 2}
    for issue in sorted(issues, key=lambda item: order[item.severity]):
        key = f"{issue.severity}:{issue.title}"
        if key in seen:
            continue
        seen.add(key)
        deduped.append(issue)

    penalty = {IssueSeverity.critical: 14, IssueSeverity.warning: 6, IssueSeverity.suggestion: 2}
    score = 100 - sum(penalty[issue.severity] for issue in deduped)
    score = max(42.0, min(99.0, float(score)))

    if not deduped:
        summary = (
            "No guideline breaches found. The piece keeps the brand voice, uses approved terminology, "
            "and every claim is either specific or already sourced."
        )
    else:
        critical = sum(1 for issue in deduped if issue.severity == IssueSeverity.critical)
        warnings = sum(1 for issue in deduped if issue.severity == IssueSeverity.warning)
        suggestions = len(deduped) - critical - warnings
        bits = []
        if critical:
            bits.append(f"{critical} critical")
        if warnings:
            bits.append(f"{warnings} warning{'s' if warnings != 1 else ''}")
        if suggestions:
            bits.append(f"{suggestions} suggestion{'s' if suggestions != 1 else ''}")
        summary = (
            f"Found {' and '.join(bits)}. The piece is close in structure, but "
            + ("one claim needs evidence before it can publish." if critical else "a few edits will bring it back on brand.")
        )

    return AnalysisResult(score=score, summary=summary, issues=deduped)
