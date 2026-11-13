# Klarity

> *Every piece of content. One clear brand identity.*

**Klarity** is an AI-powered brand consistency and governance platform that helps organisations ensure their content stays on-brand, accurate, and trustworthy across all channels — before it ever reaches the audience.

---

## 🔍 The Problem

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

> **Note:** This is the proposed architecture. No component has been implemented yet.

## 📄 License

*TBD*
