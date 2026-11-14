# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: React + Vite + a hand-authored CSS design system for the app, FastAPI + SQLite for the API (the stack named in the repository README). Tailwind was not used so the custom visual system stays coherent and dependency-light.

## Users

Brand, content, and marketing teams inside growing organisations: creators who publish across channels, reviewers who approve or reject content, and brand admins who maintain the guidelines and assets. Their job is to move a piece of content from draft to approved without letting an off-brand claim, term, or visual reach the audience.

## Product Purpose

Klarity reviews content before publication against approved brand guidelines, verified facts, terminology, and visual rules. It explains every issue with evidence and a targeted correction, keeps the creator's original purpose intact, and routes the final decision to a human reviewer. Success means fewer brand breaches reach the audience, reviews get faster, and recurring issues improve the guidelines themselves.

## Positioning

Evidence-based, human-controlled brand governance: every issue is linked to a guideline or verified source, every suggestion fixes the specific problem instead of rewriting the whole piece, and the final decision stays with an authorised reviewer.

## Operating Context

Reviewers work through a queue of submitted copy, social posts, product pages, press releases, and visual assets. They need to see the content, the score, the severity of each issue, the evidence behind it, and a suggested fix in one place. Admins maintain the guideline library that powers those checks. The product is used in a desktop browser during working hours; the review decision is high-stakes and needs a calm, scannable surface.

## Capabilities and Constraints

- Dashboard with brand-health trends, review queue, issue mix, recent reviews, and governance signals.
- Content submissions with type, owner, status, body, review report, score, and issues.
- Issue severities (critical, warning, suggestion), categories (tone, terminology, facts, visual, grammar), evidence, and suggested fixes.
- Reviewer actions: approve, request changes, reject, with a comment and audit trail.
- Guideline library with categories, priorities, and authored guidance.
- Brand asset library with logos, palette, typography, and campaign plates.
- Insights on issue patterns, flagged terminology, review volume, and team performance.
- This build uses synthetic demonstration data. The AI/vision layer is represented by a rule-based demo analyser; no production model or authentication is wired in this version.
- Repository evidence: Python/FastAPI backend scaffold and README product brief. The proposed architecture is otherwise unimplemented.

## Brand Commitments

- Product name: Klarity. Team: localhost:5000 (Kamegaonkar Kruthik, Ashwik Saxena, G N Sreekar, Maddi Abhinav).
- Voice: clear, calm, direct, and specific. Explain the problem and the recovery; never scold the creator.
- The user chose a soft cream + sage + charcoal visual direction, with a light cream background and bold typography. This is a binding aesthetic constraint for the workspace.

## Evidence on Hand

- `README.md` contains the product brief, problem statement, solution, differentiators, architecture, expected impact, and team.
- `backend/` contains ORM models and Pydantic schemas, but no running app, routers, seed data, or analyser.
- No real customer data, case studies, benchmark results, testimonials, press, or brand assets exist. All dashboard content and campaign plates in this build are authored synthetic demonstration material and must be labelled as such where a visitor could mistake it for real evidence.

## Product Principles

1. Evidence before opinion: an issue without a guideline, source, or specific reason is noise.
2. Fix the sentence, not the voice: corrections should preserve the creator's intent.
3. Calm surfaces for high-stakes calls: the queue, the content, and the evidence should read in one pass.
4. Human judgement is the final gate: automation prepares the decision, it never impersonates the reviewer.
5. Patterns improve the system: recurring issues should feed back into clearer guidelines.

## Accessibility & Inclusion

- Keyboard reachable navigation, visible focus rings, labelled form controls, and status conveyed by text as well as colour.
- Body text and controls meet WCAG AA contrast on the cream and charcoal surfaces.
- Respect `prefers-reduced-motion`; no motion is required to understand a state change.
