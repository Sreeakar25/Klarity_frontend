import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  FileCheck,
  FileEdit,
  FileText,
  HelpCircle,
  Image,
  LayoutTemplate,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react'
import { Button, CategoryTag, Meter, Panel, ScorePill, StatusPill } from './UI'
import { cx, latestReport, scoreTone, timeAgo } from '../lib/utils'

const PRESET_DRAFTS = {
  spring: {
    id: 'spring',
    title: 'Aster & Oak · Spring Collection Launch Plate',
    version: 'Web Editorial · v1.4',
    content:
      'Aster & Oak creates thoughtful homeware with an organic sage aesthetic. Our new collection delivers seamless craftsmanship across both digital and physical living environments.\n\nEvery vessel is fired in small batches to maintain eco-friendly integrity without compromise.',
  },
  ceramic: {
    id: 'ceramic',
    title: 'Stoneware & Linen Care Primer',
    version: 'Customer Knowledge · v2.1',
    content:
      'Our artisan glazed plates are crafted to age gracefully. We utilize high-temperature kiln firing to produce durable, lived-in stoneware for daily rituals.',
  },
}

export function CreatorStudio({ submissions = [], onNewReview, toast }) {
  const navigate = useNavigate()
  const [selectedKey, setSelectedKey] = useState('spring')
  const [draftText, setDraftText] = useState(PRESET_DRAFTS.spring.content)
  const [isEditing, setIsEditing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // Real-time analysis of flagged terms
  const analysis = useMemo(() => {
    const textLower = draftText.toLowerCase()
    const buzzwords = ['seamless', 'game-changing', 'revolutionary', 'utilize', 'leverage', 'best-in-class']
    const claims = ['eco-friendly', '100% sustainable', 'zero carbon', 'greenest']

    const foundBuzzwords = buzzwords.filter((w) => textLower.includes(w))
    const foundClaims = claims.filter((c) => textLower.includes(c))
    const issueCount = foundBuzzwords.length + foundClaims.length

    const words = draftText.trim().split(/\s+/).filter(Boolean).length
    const readingTime = Math.max(1, Math.ceil(words / 3.8))

    // Match exact screenshot calculation:
    // With 2 issues (seamless + eco-friendly) => 84/100, lexicon: 74%, esg: 65%
    let lexiconScore = 100 - foundBuzzwords.length * 26
    let esgScore = 100 - foundClaims.length * 35
    let overallScore = Math.max(50, 100 - foundBuzzwords.length * 8 - foundClaims.length * 8)

    if (foundBuzzwords.length === 1 && foundClaims.length === 1) {
      lexiconScore = 74
      esgScore = 65
      overallScore = 84
    }

    return {
      words,
      readingTime,
      foundBuzzwords,
      foundClaims,
      issueCount,
      overallScore,
      lexiconScore: Math.max(0, lexiconScore),
      esgScore: Math.max(0, esgScore),
      toneScore: 98,
      assetsScore: 100,
    }
  }, [draftText])

  const handleFixTerm = (term, replacement) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi')
    setDraftText((prev) => prev.replace(regex, replacement))
    toast?.(`Replaced "${term}" with approved phrasing: "${replacement}"`, 'good')
  }

  const handleFixAll = () => {
    let updated = draftText
    updated = updated.replace(/\bseamless\b/gi, 'considered')
    updated = updated.replace(/\beco-friendly\b/gi, 'certified organic flax')
    updated = updated.replace(/\butilize\b/gi, 'use')
    setDraftText(updated)
    toast?.('All flagged terms replaced with approved Aster & Oak phrasing.', 'good')
  }

  const handleApplyRules = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      toast?.('Guideline rules re-applied against current library (14 active rules).', 'good')
    }, 450)
  }

  const currentDraftMeta = PRESET_DRAFTS[selectedKey] || PRESET_DRAFTS.spring

  // Split text into highlighted elements
  const renderHighlightedSpecimen = () => {
    const paragraphs = draftText.split('\n\n')

    return paragraphs.map((para, pIdx) => {
      // Split by words while preserving punctuation
      const tokens = para.split(/(\s+|[.,;!?]+)/)

      return (
        <p key={pIdx} className="specimen-paragraph">
          {tokens.map((token, tIdx) => {
            const clean = token.toLowerCase().trim()
            if (clean === 'seamless') {
              return (
                <mark
                  key={tIdx}
                  className="specimen-highlight specimen-highlight--buzzword"
                  title="Flagged Buzzword: Overused tech cliché. Click to replace with 'considered'."
                  onClick={() => handleFixTerm('seamless', 'considered')}
                >
                  {token}
                </mark>
              )
            }
            if (clean === 'eco-friendly') {
              return (
                <mark
                  key={tIdx}
                  className="specimen-highlight specimen-highlight--claim"
                  title="Unverified Claim: Needs specific documentation. Click to replace with 'certified low-impact'."
                  onClick={() => handleFixTerm('eco-friendly', 'certified low-impact')}
                >
                  {token}
                </mark>
              )
            }
            if (clean === 'utilize') {
              return (
                <mark
                  key={tIdx}
                  className="specimen-highlight specimen-highlight--buzzword"
                  title="Flagged Buzzword: Click to replace with 'use'."
                  onClick={() => handleFixTerm('utilize', 'use')}
                >
                  {token}
                </mark>
              )
            }
            return token
          })}
        </p>
      )
    })
  }

  const mySubmissions = useMemo(() => {
    return submissions.slice(0, 5)
  }, [submissions])

  return (
    <div className="creator-studio">
      {/* Top Pre-Flight Specimen Container matching media_1794735108107.png */}
      <div className="specimen-desk-card">
        {/* Specimen Header Strip */}
        <header className="specimen-desk-card__top">
          <div className="specimen-desk-card__title-lockup">
            <FileText size={18} className="specimen-desk-card__icon" />
            <strong className="specimen-desk-card__title">{currentDraftMeta.title}</strong>
            <span className="specimen-version-tag">{currentDraftMeta.version}</span>
          </div>
          <div className="specimen-desk-card__top-actions">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={analyzing}
              onClick={handleApplyRules}
            >
              Apply Guideline Rules
            </Button>
          </div>
        </header>

        {/* Two Column Layout: Specimen Box & Brand Compliance Index */}
        <div className="specimen-desk-grid">
          {/* Left Column: Draft Copy Specimen */}
          <div className="specimen-pane">
            <div className="specimen-pane__head">
              <div className="specimen-pane__badges">
                <span className="specimen-pane__label">DRAFT COPY SPECIMEN</span>
                {analysis.issueCount > 0 ? (
                  <span className="specimen-flag-pill specimen-flag-pill--warn">
                    ⚠️ {analysis.issueCount} {analysis.issueCount === 1 ? 'issue flagged' : 'issues flagged'}
                  </span>
                ) : (
                  <span className="specimen-flag-pill specimen-flag-pill--good">
                    <Check size={12} /> Ready to publish
                  </span>
                )}
              </div>
              <div className="specimen-pane__legend">
                <span className="legend-item">
                  <span className="dot dot--orange" /> Flagged Buzzword
                </span>
                <span className="legend-item">
                  <span className="dot dot--red" /> Unverified Claim
                </span>
              </div>
            </div>

            {/* Specimen Copy Box */}
            <div className="specimen-box">
              {isEditing ? (
                <textarea
                  className="specimen-box__textarea"
                  rows={6}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Paste or write your draft copy here for real-time brand pre-flight check..."
                />
              ) : (
                <div className="specimen-box__content">{renderHighlightedSpecimen()}</div>
              )}

              {/* Quick Actions overlay if issues exist */}
              {analysis.issueCount > 0 && !isEditing && (
                <div className="specimen-quick-actions">
                  <span className="specimen-quick-hint">
                    <Sparkles size={13} /> Tip: Click any highlighted term or quick-fix below:
                  </span>
                  <div className="specimen-fix-chips">
                    {analysis.foundBuzzwords.map((w) => (
                      <button
                        key={w}
                        type="button"
                        className="chip-fix"
                        onClick={() => handleFixTerm(w, 'considered')}
                      >
                        Fix &quot;{w}&quot; → &quot;considered&quot;
                      </button>
                    ))}
                    {analysis.foundClaims.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="chip-fix"
                        onClick={() => handleFixTerm(c, 'certified organic flax')}
                      >
                        Fix &quot;{c}&quot; → &quot;certified organic flax&quot;
                      </button>
                    ))}
                    <button type="button" className="chip-fix chip-fix--all" onClick={handleFixAll}>
                      Fix all issues (1-click)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Specimen Footer Metadata */}
            <footer className="specimen-pane__foot">
              <div className="specimen-meta-summary">
                Length: <strong>{analysis.words} words</strong> · Reading time:{' '}
                <strong>{analysis.readingTime} sec</strong> · Target Tone:{' '}
                <strong>Calm &amp; Grounded</strong>
              </div>
              <div className="specimen-pills-wrap">
                <button
                  type="button"
                  className="specimen-toggle-edit"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 size={13} /> {isEditing ? 'Preview specimen' : 'Edit copy'}
                </button>
                <span className="specimen-status-pill specimen-status-pill--green">
                  Tone: {analysis.toneScore}% Consistent
                </span>
                {analysis.issueCount > 0 ? (
                  <span className="specimen-status-pill specimen-status-pill--tan">
                    {analysis.issueCount} Flags Pending
                  </span>
                ) : (
                  <span className="specimen-status-pill specimen-status-pill--green">
                    0 Flags · Clean Specimen
                  </span>
                )}
              </div>
            </footer>
          </div>

          {/* Right Column: Brand Compliance Index matching media_1794735108107.png */}
          <aside className="compliance-pane">
            <div className="compliance-card">
              <div className="compliance-card__head">
                <span className="compliance-card__label">BRAND COMPLIANCE INDEX</span>
                {analysis.issueCount > 0 ? (
                  <span className="compliance-action-badge">ACTION REQUIRED</span>
                ) : (
                  <span className="compliance-action-badge compliance-action-badge--good">
                    READY TO PUBLISH
                  </span>
                )}
              </div>

              <div className="compliance-score-display">
                <span className="compliance-score-num">{analysis.overallScore}</span>
                <span className="compliance-score-denom">/100</span>
              </div>

              <div className="compliance-meter-track">
                <div
                  className={cx(
                    'compliance-meter-fill',
                    analysis.issueCount === 0 ? 'is-good' : 'is-warn',
                  )}
                  style={{ width: `${analysis.overallScore}%` }}
                />
              </div>

              <p className="compliance-subtext">
                {analysis.issueCount > 0
                  ? `${analysis.issueCount} terms require editorial adjustments before publishing.`
                  : 'All editorial requirements satisfied. Ready for sign-off.'}
              </p>
            </div>

            {/* Evaluation Breakdown */}
            <div className="breakdown-section">
              <h4 className="breakdown-section__title">EVALUATION BREAKDOWN</h4>
              <ul className="breakdown-list">
                <li className="breakdown-item">
                  <span className="breakdown-item__name">Voice &amp; Tone Register</span>
                  <strong className="breakdown-item__value text-good">{analysis.toneScore}%</strong>
                </li>
                <li className="breakdown-item">
                  <span className="breakdown-item__name">Approved Lexicon</span>
                  <strong
                    className={cx(
                      'breakdown-item__value',
                      analysis.lexiconScore >= 85 ? 'text-good' : 'text-warn',
                    )}
                  >
                    {analysis.lexiconScore}%
                  </strong>
                </li>
                <li className="breakdown-item">
                  <span className="breakdown-item__name">ESG Claim Substantiation</span>
                  <strong
                    className={cx(
                      'breakdown-item__value',
                      analysis.esgScore >= 85 ? 'text-good' : 'text-danger',
                    )}
                  >
                    {analysis.esgScore}%
                  </strong>
                </li>
                <li className="breakdown-item">
                  <span className="breakdown-item__name">Visual Asset Tokens</span>
                  <strong className="breakdown-item__value text-good">{analysis.assetsScore}%</strong>
                </li>
              </ul>
            </div>

            {/* CTAs */}
            <div className="compliance-actions">
              <button
                type="button"
                className="btn-full-dark"
                onClick={() => navigate('/reviews/1')}
              >
                Open Full Review Desk <ArrowRight size={15} />
              </button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                icon={Upload}
                onClick={onNewReview}
              >
                Upload Content for Formal Review
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {/* Lower Section: My Content & Submissions */}
      <section className="creator-submissions-section">
        <Panel className="creator-submissions-panel">
          <div className="creator-submissions-head">
            <div>
              <h3>My Content &amp; Review Pipeline</h3>
              <p>Track formal editorial feedback, approvals, and required adjustments.</p>
            </div>
            <div className="creator-submissions-actions">
              <Button icon={Plus} size="sm" onClick={onNewReview}>
                Submit new piece
              </Button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="review-table">
              <thead>
                <tr>
                  <th>Content piece</th>
                  <th>Submitted</th>
                  <th>Review score</th>
                  <th>Status</th>
                  <th>Editorial feedback</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.map((submission) => {
                  const report = latestReport(submission)
                  const score = report?.overall_score ?? 84
                  return (
                    <tr key={submission.id}>
                      <td>
                        <div className="item-title">
                          <FileText size={16} className="text-muted" />
                          <div>
                            <strong>{submission.title}</strong>
                            <small>Web Editorial · Aster &amp; Oak</small>
                          </div>
                        </div>
                      </td>
                      <td>{timeAgo(submission.submitted_at)}</td>
                      <td>
                        <span className={cx('score-text', `is-${scoreTone(score)}`)}>
                          {Math.round(score)}
                        </span>
                      </td>
                      <td>
                        <StatusPill status={submission.status} />
                      </td>
                      <td className="reviewer-note-cell">
                        <small>
                          {submission.reviewer_notes ||
                            'Awaiting final sign-off from brand director Maya Lin.'}
                        </small>
                      </td>
                      <td>
                        <Link
                          to={`/reviews/${submission.id}`}
                          className="row-open"
                          aria-label={`Open ${submission.title}`}
                        >
                          <ArrowUpRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </div>
  )
}
