# Klarity

> *Every piece of content. One clear brand identity.*

**Klarity** is an AI-powered brand consistency and governance platform that helps organisations ensure their content stays on-brand, accurate, and trustworthy across all channels — before it ever reaches the audience.

---

## 🔍 The Problem Statement

Growing organisations publish content through multiple employees, agencies, and AI tools, making it difficult to maintain a consistent and trustworthy brand identity. Incorrect claims, outdated information, inconsistent language, and off-brand visuals can damage credibility before anyone notices the problem.

| # | Challenge | Description |
|---|-----------|-------------|
| 1 | **Inconsistent Messaging** | Different tones, terminology, and communication styles across content |
| 2 | **Incorrect Information** | Outdated facts, incorrect details, and unsupported claims |
| 3 | **Visual Inconsistency** | Incorrect logos, colours, and visual assets |
| 4 | **Fragmented Reviews** | Scattered feedback and unclear approval responsibilities |
| 5 | **Lack of Governance Insights** | Difficulty identifying recurring mistakes and unclear brand guidelines |

---

## 💡 The Solution

Klarity is an intelligent brand-governance platform that reviews content before publication and checks it against approved guidelines, facts, and assets. Instead of simply rejecting content, it explains each issue and suggests corrections that preserve the creator's original purpose.

### How It Works

1. **Understand** — Creates a centralised knowledge base containing brand guidelines, approved terminology, verified facts, and visual assets.
2. **Analyse** — Combines AI-powered analysis with rule-based validation to detect tone mismatches, incorrect claims, terminology errors, and visual deviations.
3. **Improve** — Generates a review report with issue severity, explanations, supporting evidence, and suggested corrections.
4. **Approve** — Allows creators to edit content or request human review. Authorised reviewers can approve, reject, or request changes.

---

## ✨ Key Differentiators

- **Evidence-Based Validation** — Every identified issue is linked to an approved guideline or information source.
- **Context-Aware Corrections** — Suggestions fix the specific issue rather than rewriting the whole thing.
- **Unified Brand Intelligence** — A centralised source of truth for brand guidelines, approved facts, and reusable assets.
- **Human-Controlled Decisions** — Final review and approval remain with authorised personnel.
- **Continuous Governance Insights** — Spots recurring breaches and areas where current guidance may need to be clarified.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Tailwind CSS |
| **Backend** | Python, FastAPI |
| **Database** | PostgreSQL |
| **AI/ML** | Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), Vision-based AI |

---

## 🏛️ Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────────┐
│   Frontend   │────▶│  Backend (API)  │────▶│  Brand Knowledge     │
│  React + TW  │◀────│  Python/FastAPI  │◀────│  Repository (RAG)    │
└─────────────┘     └────────┬────────┘     └──────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              ┌─────▼─────┐   ┌──────▼──────┐
              │ AI Analysis│   │ Rule-Based  │
              │ LLM+Vision │   │ Validation  │
              └─────┬─────┘   └──────┬──────┘
                    │                 │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐     ┌───────────────┐
                    │  Review Report  │────▶│ Human Review   │
                    │  & Scoring      │     │ & Approval     │
                    └─────────────────┘     └───────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    └─────────────────┘
```

---

## 📈 Expected Impact

1. **Brand Consistency** — Maintains a unified brand voice, identity, and messaging across platforms.
2. **Improved Accuracy** — Identifies outdated information, unsupported claims, and content deviations before publication.
3. **Faster Reviews** — Reduces repetitive manual checks through automated analysis and actionable suggestions.
4. **Better Collaboration** — Connects content creators and reviewers through a structured approval process.
5. **Continuous Improvement** — Uses review history and recurring issue patterns to help organisations strengthen their brand guidelines.

---

## 👥 Team

**Team Name:** localhost:5000

| Member |
|--------|
| Kamegaonkar Kruthik |
| Ashwik Saxena |
| G N Sreekar |
| Maddi Abhinav |

---

## Run the standalone backend

The FastAPI server uses SQLite. No cloud account or database password is needed.
Data persists in `backend/klarity.db`, independently of the working directory.
Tables are created on startup, and existing records are preserved.

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r backend/requirements.txt
.\.venv\Scripts\python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000
```

In a second terminal, run `npm install` and `npm run dev` inside `frontend`.
Vite forwards `/api` requests to port 8000.
API documentation: `http://127.0.0.1:8000/docs`.

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Check database connectivity |
| `GET /api/bootstrap` | Dashboard, guidelines, reports, trends, and activity |
| `GET/POST /api/guidelines` | List or create brand guidelines |
| `GET/PATCH/DELETE /api/guidelines/{id}` | Read, edit, or remove a guideline |
| `GET/POST /api/submissions` | List content or submit it for rule-based analysis |
| `GET /api/submissions/{id}` | Read a submission and its reports |
| `POST /api/submissions/{id}/action` | Approve, reject, or request changes |

Optional configuration lives in `backend/.env` (see `.env.example`). Set
`SEED_DEMO_DATA=false` before the first start for an empty workspace. This does
not remove sample records already stored. `CORS_ORIGINS` controls allowed
frontend origins. The API uses account authentication and a shared workspace. Per-role permissions
and email verification are not implemented, so run it locally. Analysis is rule-based, with no LLM service.

Run isolated API regression tests from the repository root:

```powershell
.\.venv\Scripts\python -m pip install httpx==0.28.1
.\.venv\Scripts\python -m unittest discover -s backend -v
```

Tests use temporary SQLite storage and do not alter workspace records.

## 📄 License

*Not yet decided*

### Accounts

Create an account on `/login` with a username, email (Gmail supported), and a
password of at least 8 characters. Sign in using the username or email. Passwords
are salted PBKDF2 hashes. Sessions expire after 24 hours and logout revokes them.
Workspace APIs require authentication; submission and review authors come from
the session. This is email/password login, not Google OAuth.

For local testing, `ENABLE_TEST_ACCOUNT=true` creates `ashwik@topper` (username
`ashwik`) with password `klarity`. This special test address is not a deliverable
email address. The account is created only if absent; startup never resets its
password. Use a separate database without this test account before deployment,
set `ENABLE_TEST_ACCOUNT=false`, and use HTTPS with `COOKIE_SECURE=true`.
The old demo SSO, any-password login, and password reset simulation are removed.
