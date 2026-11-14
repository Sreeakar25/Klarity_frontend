"""
Synthetic seed data for the Klarity demo workspace.

Everything here is authored demonstration content. Names, brand copy, scores,
and review history are fictional and exist so the workspace can be evaluated
without a live AI pipeline or customer data.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Iterable

from sqlalchemy.orm import Session

from database import SessionLocal, init_db
from models import (
    ActionType,
    BrandGuideline,
    ContentSubmission,
    ContentType,
    GuidelineCategory,
    IssueCategory,
    IssueSeverity,
    ReviewAction,
    ReviewIssue,
    ReviewReport,
    SubmissionStatus,
    User,
    UserRole,
)

NOW = datetime.now(timezone.utc).replace(tzinfo=None)


GUIDELINES: list[dict] = [
    {
        "title": "Brand voice principles",
        "category": GuidelineCategory.tone,
        "priority": 5,
        "content": (
            "We sound like a thoughtful host: warm, specific, and unhurried. Write in the second person. "
            "Prefer concrete nouns and active verbs. Confidence comes from detail, never from volume. "
            "Never use hype language, exclamation stacks, or claims we cannot show."
        ),
    },
    {
        "title": "Words we use and avoid",
        "category": GuidelineCategory.terminology,
        "priority": 5,
        "content": (
            "Use: linen, flax, maker, repair, keep, lived-in, considered. "
            "Avoid: seamless, game-changing, revolutionary, eco-friendly, utilize, leverage, best-in-class. "
            "If a word could describe any brand in the category, replace it with a specific observation."
        ),
    },
    {
        "title": "Sustainability claims",
        "category": GuidelineCategory.facts,
        "priority": 5,
        "content": (
            "Every environmental claim needs a named certification, standard, or measured figure in the same "
            "paragraph. Approved language: 'made with 100% European flax linen', 'dyed in a closed-loop facility'. "
            "Do not use '100% sustainable', 'carbon neutral', or 'zero waste' without current evidence on file."
        ),
    },
    {
        "title": "Logo usage and clear space",
        "category": GuidelineCategory.visual,
        "priority": 5,
        "content": (
            "Use the primary horizontal lockup by default. Keep clear space equal to the height of the oak mark "
            "on every side, with a 24px minimum in digital layouts. Never recolour the mark, add effects, or place "
            "it on a busy photographic field without the cream holding shape."
        ),
    },
    {
        "title": "Product naming conventions",
        "category": GuidelineCategory.terminology,
        "priority": 4,
        "content": (
            "Product names are set in sentence case, never all caps. The collection name follows the product name "
            "with an en dash: 'Linen duvet – Oat'. Do not shorten 'Aster & Oak' to 'A&O' in customer-facing copy; "
            "the monogram is reserved for the mark."
        ),
    },
    {
        "title": "Colour palette specification",
        "category": GuidelineCategory.visual,
        "priority": 4,
        "content": (
            "The core palette is Cream #F6F1E6, Brown #3B2418, Klarity Blue #298EE4, and Clay #A97A32. "
            "Klarity Blue is the working accent; it should carry action and selection, not decoration. "
            "Use no more than one accent per composition and keep text at brown or cream for contrast."
        ),
    },
    {
        "title": "Typography and hierarchy",
        "category": GuidelineCategory.visual,
        "priority": 3,
        "content": (
            "Bricolage Grotesque carries display headlines at 700–800 weight with tight tracking. "
            "Manrope carries interface and body copy. Never set body copy below 15px. "
            "One display moment per screen; let the rest of the hierarchy stay quiet."
        ),
    },
    {
        "title": "Claim substantiation",
        "category": GuidelineCategory.facts,
        "priority": 5,
        "content": (
            "Superlatives, rankings, and performance claims need a named source and a date within the piece or "
            "in the linked evidence. Use 'world's best' only when the ranking body and year are visible. "
            "If the source is older than 12 months, refresh it before publishing."
        ),
    },
    {
        "title": "Inclusive language",
        "category": GuidelineCategory.tone,
        "priority": 4,
        "content": (
            "Address the reader directly and avoid gendered defaults. Describe people the way they describe "
            "themselves. Use 'they' for a person whose pronouns are unknown. Avoid ability metaphors such as "
            "'blind spot' and 'tone deaf' in product copy."
        ),
    },
    {
        "title": "Social caption rhythm",
        "category": GuidelineCategory.tone,
        "priority": 3,
        "content": (
            "Open with one concrete image, follow with one useful detail, and close with an invitation that "
            "names the next action. Keep captions under 90 words. Hashtags sit after the close, never inline."
        ),
    },
    {
        "title": "Photography direction",
        "category": GuidelineCategory.visual,
        "priority": 4,
        "content": (
            "Photograph real homes in natural light. Keep one human trace in the frame: a folded corner, a cup, "
            "a chair pulled out. Avoid pure white studio fields, heavy contrast, and props that read as a set. "
            "Warm the image toward cream without shifting the linen's actual colour."
        ),
    },
    {
        "title": "Regional spelling and place names",
        "category": GuidelineCategory.terminology,
        "priority": 2,
        "content": (
            "Use the market's approved English spelling. In India, the approved market name is Bengaluru in all "
            "customer-facing copy; keep local variants only inside direct quotes. Dates are written 12 March 2026."
        ),
    },
]


CURATED = [
    {
        "title": "Spring collection · product page",
        "type": ContentType.html,
        "status": SubmissionStatus.approved,
        "owner": "Kruthik Kamegaonkar",
        "days_ago": 1.2,
        "content": (
            "Light that lingers. Our spring collection is cut from European flax and washed until it falls "
            "the way you want it to. Layer the linen duvet with the oat throw, open the window, and let the "
            "morning take its time. Every piece is designed to be repaired, rewashed, and kept."
        ),
        "score": 91,
        "summary": "One optional tone suggestion. The product story is specific, warm, and grounded; no claims need evidence.",
        "issues": [
            (
                "suggestion",
                "tone",
                "A quiet adjective would do more",
                "'Lingers' is doing good work. The phrase 'the way you want it to' is a little generic next to the rest of the copy.",
                "The opening paragraph uses one soft abstraction after a run of concrete detail.",
                "Name the specific fall or weight: 'washed until it softens against the skin'.",
                "Brand voice principles",
            )
        ],
    },
    {
        "title": "The quiet luxury of linen",
        "type": ContentType.text,
        "status": SubmissionStatus.needs_changes,
        "owner": "Ashwik Saxena",
        "days_ago": 1.6,
        "content": (
            "Linen is the quiet luxury everyone is talking about. Our linen is 100% sustainable, eco-friendly, "
            "and designed for a seamless transition from morning to evening. It is a game-changing fabric that "
            "only gets better with time. Shop the collection and feel the difference."
        ),
        "score": 67,
        "summary": "A strong product idea held back by three unsupported claims. Fix the evidence and the piece can publish.",
        "issues": [
            (
                "critical",
                "facts",
                "Unsubstantiated sustainability claim",
                "The phrase '100% sustainable' needs a named certification or a measured figure before publication.",
                "'Our linen is 100% sustainable' appears with no source in the paragraph.",
                "Use 'made with 100% European flax linen' and link the certification in the evidence field.",
                "Sustainability claims",
            ),
            (
                "warning",
                "terminology",
                "Banned umbrella term",
                "'Eco-friendly' is on the avoid list because it cannot be verified. Replace it with the specific material or process.",
                "'eco-friendly' appears in the opening sentence.",
                "Say what makes it lower-impact: the fibre, the dye process, or the repair programme.",
                "Words we use and avoid",
            ),
            (
                "warning",
                "tone",
                "Hype language breaks the voice",
                "The brand voice is grounded and specific. 'Game-changing' and 'seamless' could describe any product in the category.",
                "Two hype terms appear in the same paragraph.",
                "Keep the concrete observation about how linen ages, and remove the claims around it.",
                "Brand voice principles",
            ),
        ],
    },
    {
        "title": "A letter from our founder",
        "type": ContentType.text,
        "status": SubmissionStatus.approved,
        "owner": "Kruthik Kamegaonkar",
        "days_ago": 2.1,
        "content": (
            "We started Aster & Oak with one question: what would we keep if we could only keep ten things? "
            "The answer was almost never the thing itself. It was the table it sat on, the light across it, the "
            "person who pulled out the chair. So we make fewer pieces, repair what we can, and leave room for "
            "the life that happens around them."
        ),
        "score": 97,
        "summary": "No guideline breaches. This is a clean example of the brand voice and a useful reference for creators.",
        "issues": [],
    },
    {
        "title": "Autumn lookbook captions",
        "type": ContentType.text,
        "status": SubmissionStatus.needs_changes,
        "owner": "G N Sreekar",
        "days_ago": 2.8,
        "content": (
            "The leaves are turning and so is the light! Our new autumn layers are here! Utilize the last warm "
            "weeks and make every golden hour count! Tap the link to shop before the weekend! "
            "P.S. the oak mark is tucked into the corner of every image."
        ),
        "score": 64,
        "summary": "The visuals are strong; the captions need a voice pass. Tone and terminology issues are pulling the score down.",
        "issues": [
            (
                "warning",
                "tone",
                "Too many exclamation marks",
                "Four exclamation marks make the captions read as shouty rather than warm. The brand voice earns emphasis through detail.",
                "Four exclamation marks across four short sentences.",
                "Keep one exclamation at most and let the concrete image carry the energy.",
                "Social caption rhythm",
            ),
            (
                "warning",
                "terminology",
                "Formal filler in a casual caption",
                "'Utilize' is the wrong register here and is on the avoid list.",
                "'Utilize the last warm weeks' appears in the second line.",
                "Use 'make the most of the last warm weeks' or simply 'take the last warm weeks slowly'.",
                "Words we use and avoid",
            ),
            (
                "suggestion",
                "visual",
                "Logo clear space needs a check",
                "The oak mark is visible in the corner but the preview does not show 24px of clear space at the smallest crop.",
                "The mark sits close to the image edge in the 4:5 crop.",
                "Use the cream holding shape or pull the mark in by one clear-space unit.",
                "Logo usage and clear space",
            ),
        ],
    },
    {
        "title": "Holiday gifting press release",
        "type": ContentType.text,
        "status": SubmissionStatus.approved,
        "owner": "Maddi Abhinav",
        "days_ago": 3.4,
        "content": (
            "Aster & Oak opens its holiday gifting edit on 14 November with a small collection of useful, "
            "repairable pieces. The edit includes the linen robe in oat, the stoneware carafe, and a repair kit "
            "for well-loved textiles. Every order ships in recycled board with a hand-written note."
        ),
        "score": 96,
        "summary": "Clear, sourced, and on voice. The date and materials are specific; no changes required.",
        "issues": [],
    },
    {
        "title": "New store opening · Bengaluru",
        "type": ContentType.text,
        "status": SubmissionStatus.rejected,
        "owner": "G N Sreekar",
        "days_ago": 4.1,
        "content": (
            "We are opening our Bangalore store on 30 February with the world's best linen collection. "
            "The first 50 guests will receive a free gift. Come early, stay late, and celebrate with us!"
        ),
        "score": 52,
        "summary": "Two blocking factual issues. The opening date does not exist and the ranking claim has no source.",
        "issues": [
            (
                "critical",
                "facts",
                "Opening date is impossible",
                "30 February does not exist. A public event date must be verified before publication.",
                "The press copy says the store opens on 30 February.",
                "Confirm the date with the retail team and update the line, including the year.",
                "Claim substantiation",
            ),
            (
                "critical",
                "facts",
                "Unsupported superlative",
                "'World's best' needs a named ranking body and a visible year.",
                "The claim appears in the first sentence with no source.",
                "Replace it with a specific description of the collection, or link the ranking and date.",
                "Claim substantiation",
            ),
            (
                "warning",
                "terminology",
                "Market name is not approved",
                "Customer-facing copy uses 'Bengaluru'. 'Bangalore' appears in the same line.",
                "'Bangalore store' appears in the opening sentence.",
                "Use the approved market name consistently: 'Bengaluru'.",
                "Regional spelling and place names",
            ),
        ],
    },
    {
        "title": "Welcome to Aster & Oak",
        "type": ContentType.html,
        "status": SubmissionStatus.reviewing,
        "owner": "Kruthik Kamegaonkar",
        "days_ago": 0.4,
        "content": (
            "Welcome in. We make considered pieces for the rooms you actually live in. Your first order includes "
            "a repair guide and a small tin of wax for the oak. If a seam ever opens, send it back and we will "
            "mend it. Our approach is seamless, unhurried, and built to last."
        ),
        "score": 82,
        "summary": "One terminology warning. The welcome note is warm and specific; remove the empty adjective and it is ready.",
        "issues": [
            (
                "warning",
                "terminology",
                "Empty adjective",
                "'Seamless' is the most overused word in the category and is on the avoid list.",
                "'Our approach is seamless, unhurried, and built to last' appears in the final paragraph.",
                "Remove 'seamless' and keep the two concrete promises around it.",
                "Words we use and avoid",
            )
        ],
    },
    {
        "title": "Paid social · Meta carousel",
        "type": ContentType.image,
        "status": SubmissionStatus.reviewing,
        "owner": "Maddi Abhinav",
        "days_ago": 0.8,
        "content": (
            "Five-card carousel for the linen bedding launch. Card one: product hero on cream. Card two: detail "
            "of the washed edge. Card three: the oak mark over a bedroom scene. Card four: care instructions. "
            "Card five: shop the collection. Preview supplied as a flattened export."
        ),
        "score": 78,
        "summary": "The narrative is strong. The logo treatment and one caption line need a check before the carousel ships.",
        "issues": [
            (
                "warning",
                "visual",
                "Logo sits too close to the crop",
                "The oak mark on card three does not have the required clear space at the 4:5 crop.",
                "The mark is 9px from the right edge at the delivered size.",
                "Pull the mark in to a 24px minimum or place it on the cream holding shape.",
                "Logo usage and clear space",
            ),
            (
                "suggestion",
                "tone",
                "Caption can be more specific",
                "'Shop the collection' is clear but generic. The brand usually names the material or the moment.",
                "The final card uses the default call to action.",
                "Try 'Bring the washed linen home' and keep the shop link as the action.",
                "Social caption rhythm",
            ),
        ],
    },
    {
        "title": "Care guide: linen bedding",
        "type": ContentType.text,
        "status": SubmissionStatus.approved,
        "owner": "Ashwik Saxena",
        "days_ago": 5.2,
        "content": (
            "Wash linen at 40°C with a gentle detergent. Skip the fabric softener; it coats the fibre and stops "
            "it breathing. Line dry in the shade, then press the seams while they are still slightly damp. "
            "Small wrinkles are part of the fabric, not a flaw. If a seam opens, send it back and we will mend it."
        ),
        "score": 94,
        "summary": "Useful, specific, and on voice. No guideline breaches.",
        "issues": [],
    },
    {
        "title": "Sustainability page rewrite",
        "type": ContentType.html,
        "status": SubmissionStatus.needs_changes,
        "owner": "G N Sreekar",
        "days_ago": 6.0,
        "content": (
            "We believe in a 100% sustainable future. Our packaging is eco-friendly, our linen is carbon neutral, "
            "and our studio sends zero waste to landfill. We are constantly working to do better, and we are "
            "proud to be the world's best at thoughtful production."
        ),
        "score": 58,
        "summary": "Three critical factual issues. This page cannot publish until every environmental claim is sourced.",
        "issues": [
            (
                "critical",
                "facts",
                "Three unsourced environmental claims",
                "Sustainability claims need a named certification, standard, or measured figure in the same paragraph.",
                "The paragraph makes three claims: '100% sustainable', 'carbon neutral', and 'zero waste'.",
                "Rebuild the paragraph around the evidence on file: fibre origin, dye process, and the actual waste figure.",
                "Sustainability claims",
            ),
            (
                "critical",
                "facts",
                "Unsupported superlative",
                "'World's best' needs a named ranking body and a year.",
                "The final sentence claims a ranking with no evidence.",
                "Replace it with one specific practice the studio can show, such as the repair programme.",
                "Claim substantiation",
            ),
            (
                "warning",
                "tone",
                "Claims are doing the work of detail",
                "The page repeats abstract promises. The brand voice asks for one concrete, verifiable observation.",
                "Four abstract claims appear in a single paragraph.",
                "Cut to the three facts the team can prove and give each one a sentence.",
                "Brand voice principles",
            ),
        ],
    },
    {
        "title": "Instagram: Maker's mark series",
        "type": ContentType.image,
        "status": SubmissionStatus.approved,
        "owner": "Kruthik Kamegaonkar",
        "days_ago": 7.4,
        "content": (
            "Six-image series showing the oak mark being pressed into the base of each piece. Natural light, "
            "warm cream field, close crops of the grain. Caption names the maker and the workshop."
        ),
        "score": 89,
        "summary": "The series is on brand. One optional note on the mark's size at the smallest crop.",
        "issues": [
            (
                "suggestion",
                "visual",
                "Mark can grow at the smallest crop",
                "The pressed mark is legible but loses detail in the 1:1 feed crop.",
                "The mark occupies less than 6% of the frame in the smallest export.",
                "Use the tighter crop for feed and keep the wider composition for Stories.",
                "Photography direction",
            )
        ],
    },
    {
        "title": "Wholesale deck · Q3",
        "type": ContentType.html,
        "status": SubmissionStatus.needs_changes,
        "owner": "Maddi Abhinav",
        "days_ago": 8.1,
        "content": (
            "Q3 wholesale overview for stockists. We leverage our repair programme to utilize the full life of "
            "each piece, and our best-in-class margins make the range easy to build around. The deck includes "
            "the full price list and delivery windows for the season."
        ),
        "score": 73,
        "summary": "Two terminology warnings and one tone warning. The commercial detail is solid; the language needs a cleanup.",
        "issues": [
            (
                "warning",
                "terminology",
                "Corporate filler",
                "'Leverage' and 'utilize' are both on the avoid list and appear in the same sentence.",
                "The first paragraph uses both terms.",
                "Use 'use' and 'build on' instead. The sentence gets shorter and clearer.",
                "Words we use and avoid",
            ),
            (
                "warning",
                "tone",
                "Comparative claim without evidence",
                "'Best-in-class margins' is a claim the audience cannot verify from the deck.",
                "The phrase appears without a comparison or source.",
                "State the margin range or remove the comparative framing.",
                "Claim substantiation",
            ),
        ],
    },
]


TITLE_PARTS = [
    ("Linen bedding", "product page"),
    ("Stoneware carafe", "product page"),
    ("The repair programme", "editorial"),
    ("Oak side table", "product page"),
    ("A slower morning", "journal"),
    ("Autumn layering", "social"),
    ("Gift edit", "email"),
    ("Studio notes", "journal"),
    ("Care guide: oak", "help article"),
    ("Wholesale Q4", "sales deck"),
    ("The maker series", "social"),
    ("Linen robe", "product page"),
    ("Holiday windows", "campaign"),
    ("A room for reading", "journal"),
    ("Clay and cream", "social"),
    ("Refill programme", "landing page"),
    ("The oak mark", "brand story"),
    ("Small space, long table", "editorial"),
    ("Press: autumn edit", "press release"),
    ("Care guide: stoneware", "help article"),
    ("Founder's note: winter", "email"),
    ("Paid social: gifting", "campaign"),
    ("Stockist spotlight", "social"),
    ("The washed edge", "journal"),
]

CONTENT_TEMPLATES = [
    "A considered piece for the rooms you actually live in. Made from European flax, finished by hand, and designed to be repaired rather than replaced.",
    "Natural light, a pulled-out chair, and a table that has seen a few dinners. This is the scene the collection was made for.",
    "We make fewer things, keep them longer, and show you how to care for them. The details are specific because the material is.",
    "A quiet layer for the end of the day. The linen softens with every wash and keeps its shape through the seasons.",
    "The studio is open. Come see how the oak mark is pressed, how the seam is finished, and why the small imperfections stay.",
    "Designed around the way a home actually works: a surface for the cup, a chair for the extra guest, a light that stays low.",
]

OWNERS = [
    "Kruthik Kamegaonkar",
    "Ashwik Saxena",
    "G N Sreekar",
    "Maddi Abhinav",
    "Maya Iyer",
    "Rohan Mehta",
]

REVIEWERS = ["Ashwik Saxena", "Maya Iyer", "Maddi Abhinav"]

TEMPLATE_ISSUES = [
    (
        IssueSeverity.suggestion,
        IssueCategory.tone,
        "One line can carry more detail",
        "The piece is on voice overall. One abstraction could be replaced with a concrete observation.",
        "A general claim appears where the rest of the copy is specific.",
        "Name the material, the moment, or the measurement behind the line.",
        "Brand voice principles",
    ),
    (
        IssueSeverity.warning,
        IssueCategory.terminology,
        "Word on the avoid list",
        "'Seamless' is on the terminology watchlist and appears without a specific meaning.",
        "The term appears in the submitted copy.",
        "Replace it with the concrete benefit the sentence is trying to name.",
        "Words we use and avoid",
    ),
    (
        IssueSeverity.warning,
        IssueCategory.tone,
        "Tone drifts toward hype",
        "The brand voice is grounded. A hype phrase makes this read like a different company.",
        "A watchlist phrase appears in the body copy.",
        "Keep the benefit and remove the hype modifier.",
        "Brand voice principles",
    ),
    (
        IssueSeverity.critical,
        IssueCategory.facts,
        "Claim needs a source",
        "A factual claim cannot publish without a named source or a current evidence link.",
        "The claim appears without a supporting reference.",
        "Add the source and date, or rewrite the sentence around a fact the team can show.",
        "Claim substantiation",
    ),
    (
        IssueSeverity.suggestion,
        IssueCategory.visual,
        "Small-crop legibility",
        "The visual holds at full size; the smallest export loses a little detail in the mark.",
        "The mark occupies under 6% of the frame at the smallest crop.",
        "Use the tighter crop for feed placements and keep the wide composition for Stories.",
        "Photography direction",
    ),
    (
        IssueSeverity.suggestion,
        IssueCategory.grammar,
        "Comma needed before the conjunction",
        "A short readability edit, not a brand issue.",
        "Two independent clauses are joined without a comma.",
        "Add the comma or split the sentence.",
        "Brand voice principles",
    ),
]


def _guideline_map(db: Session) -> dict[str, BrandGuideline]:
    return {guideline.title: guideline for guideline in db.query(BrandGuideline).all()}


def _add_report(
    db: Session,
    submission: ContentSubmission,
    score: float,
    summary: str,
    issues: Iterable[tuple],
    guidelines: dict[str, BrandGuideline],
    reviewed_at: datetime | None,
) -> ReviewReport:
    report = ReviewReport(
        submission=submission,
        overall_score=float(score),
        summary=summary,
        created_at=reviewed_at or submission.submitted_at,
    )
    db.add(report)
    for issue_data in issues:
        severity, category, title, description, evidence, fix, guideline_title = issue_data
        guideline = guidelines.get(guideline_title)
        db.add(
            ReviewIssue(
                report=report,
                severity=IssueSeverity(severity),
                category=IssueCategory(category),
                title=title,
                description=description,
                evidence=evidence,
                suggested_fix=fix,
                guideline_id=guideline.id if guideline else None,
            )
        )
    return report


def _add_action(
    db: Session,
    report: ReviewReport,
    action: ActionType,
    actor: str,
    comment: str,
    created_at: datetime,
) -> None:
    db.add(
        ReviewAction(
            report=report,
            action=action,
            performed_by=actor,
            comment=comment,
            created_at=created_at,
        )
    )


def seed_database() -> None:
    """Idempotently fill the demo database."""

    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        db.add_all(
            [
                User(name="Kruthik Kamegaonkar", email="kruthik@localhost5000.dev", role=UserRole.admin),
                User(name="Ashwik Saxena", email="ashwik@localhost5000.dev", role=UserRole.reviewer),
                User(name="G N Sreekar", email="sreekar@localhost5000.dev", role=UserRole.creator),
                User(name="Maddi Abhinav", email="abhinav@localhost5000.dev", role=UserRole.reviewer),
                User(name="Maya Iyer", email="maya@asterandoak.studio", role=UserRole.reviewer),
                User(name="Rohan Mehta", email="rohan@asterandoak.studio", role=UserRole.creator),
            ]
        )

        db.add_all(
            [
                BrandGuideline(
                    title=item["title"],
                    category=item["category"],
                    content=item["content"],
                    priority=item["priority"],
                    created_at=NOW - timedelta(days=120 - index * 4),
                    updated_at=NOW - timedelta(days=max(1, 18 - index)),
                )
                for index, item in enumerate(GUIDELINES)
            ]
        )
        db.commit()
        guidelines = _guideline_map(db)

        for index, item in enumerate(CURATED):
            submitted_at = NOW - timedelta(days=item["days_ago"])
            reviewed_at = submitted_at + timedelta(hours=5, minutes=40)
            status = item["status"]
            submission = ContentSubmission(
                title=item["title"],
                content_type=item["type"],
                content_text=item["content"],
                status=status,
                submitted_by=item["owner"],
                submitted_at=submitted_at,
                reviewed_at=None if status in (SubmissionStatus.pending, SubmissionStatus.reviewing) else reviewed_at,
                reviewer_notes=(
                    "Approved for the spring calendar."
                    if status == SubmissionStatus.approved
                    else "Blocking facts need evidence before this can run."
                    if status == SubmissionStatus.rejected
                    else "Please revise and resubmit; the structure is right."
                    if status == SubmissionStatus.needs_changes
                    else None
                ),
            )
            db.add(submission)
            db.flush()
            report = _add_report(
                db,
                submission,
                item["score"],
                item["summary"],
                item["issues"],
                guidelines,
                reviewed_at,
            )
            db.flush()
            if status == SubmissionStatus.approved:
                _add_action(
                    db,
                    report,
                    ActionType.approved,
                    REVIEWERS[index % len(REVIEWERS)],
                    "Reads on brand. Approved for publication.",
                    reviewed_at,
                )
            elif status == SubmissionStatus.rejected:
                _add_action(
                    db,
                    report,
                    ActionType.rejected,
                    REVIEWERS[index % len(REVIEWERS)],
                    "Please confirm the date and evidence, then resubmit.",
                    reviewed_at,
                )
            elif status == SubmissionStatus.needs_changes:
                _add_action(
                    db,
                    report,
                    ActionType.changes_requested,
                    REVIEWERS[index % len(REVIEWERS)],
                    "The structure is right; the flagged claims need a source.",
                    reviewed_at,
                )

        # A broader review history gives the dashboard a believable trend.
        for index in range(236):
            part, kind = TITLE_PARTS[index % len(TITLE_PARTS)]
            status_roll = index % 100
            if status_roll < 87:
                status = SubmissionStatus.approved
            elif status_roll < 92:
                status = SubmissionStatus.needs_changes
            elif status_roll < 95:
                status = SubmissionStatus.reviewing
            elif status_roll < 98:
                status = SubmissionStatus.rejected
            else:
                status = SubmissionStatus.pending

            if status == SubmissionStatus.approved:
                score = 84 + (index * 7) % 15
            elif status == SubmissionStatus.needs_changes:
                score = 63 + (index * 5) % 17
            elif status == SubmissionStatus.reviewing:
                score = 70 + (index * 3) % 17
            elif status == SubmissionStatus.rejected:
                score = 48 + (index * 5) % 19
            else:
                score = 72 + (index * 3) % 19

            submitted_at = NOW - timedelta(days=((index * 89) / 236.0), hours=(index * 13) % 24)
            reviewed_at = submitted_at + timedelta(hours=4 + index % 9)
            owner = OWNERS[index % len(OWNERS)]
            if status == SubmissionStatus.reviewing:
                status = SubmissionStatus.reviewing
            submission = ContentSubmission(
                title=f"{part} · {kind}",
                content_type=(
                    ContentType.image if kind in ("social", "campaign") else ContentType.html if "page" in kind or "deck" in kind else ContentType.text
                ),
                content_text=(
                    f"{CONTENT_TEMPLATES[index % len(CONTENT_TEMPLATES)]} "
                    f"{CONTENT_TEMPLATES[(index + 2) % len(CONTENT_TEMPLATES)]} "
                    f"Reference {index + 1:03d} · synthetic demo content."
                ),
                status=status,
                submitted_by=owner,
                submitted_at=submitted_at,
                reviewed_at=None if status in (SubmissionStatus.pending, SubmissionStatus.reviewing) else reviewed_at,
                reviewer_notes=(
                    "Approved."
                    if status == SubmissionStatus.approved
                    else "Changes requested."
                    if status == SubmissionStatus.needs_changes
                    else "Rejected; see blocking issues."
                    if status == SubmissionStatus.rejected
                    else None
                ),
            )
            db.add(submission)
            db.flush()

            if status == SubmissionStatus.approved:
                count = index % 2
            elif status == SubmissionStatus.rejected:
                count = 3
            elif status == SubmissionStatus.needs_changes:
                count = 2
            else:
                count = 1 + index % 2
            issues = [
                TEMPLATE_ISSUES[(index + offset) % len(TEMPLATE_ISSUES)]
                for offset in range(count)
            ]
            summary = (
                "No blocking issues. The piece stays close to the approved voice and terminology."
                if count == 0
                else "A small set of guideline checks needs attention before this can publish."
            )
            report = _add_report(
                db,
                submission,
                score,
                summary,
                issues,
                guidelines,
                reviewed_at,
            )
            db.flush()
            if status == SubmissionStatus.approved:
                _add_action(
                    db,
                    report,
                    ActionType.approved,
                    REVIEWERS[index % len(REVIEWERS)],
                    "Approved.",
                    reviewed_at,
                )
            elif status == SubmissionStatus.rejected:
                _add_action(
                    db,
                    report,
                    ActionType.rejected,
                    REVIEWERS[index % len(REVIEWERS)],
                    "Rejected pending factual evidence.",
                    reviewed_at,
                )
            elif status == SubmissionStatus.needs_changes:
                _add_action(
                    db,
                    report,
                    ActionType.changes_requested,
                    REVIEWERS[index % len(REVIEWERS)],
                    "Changes requested.",
                    reviewed_at,
                )

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    seed_database()
    print("Klarity demo database seeded.")
