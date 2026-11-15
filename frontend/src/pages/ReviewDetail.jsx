import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Clipboard,
  Clock3,
  FileCheck2,
  FileText,
  Image,
  LayoutTemplate,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { AnimatedValue } from '../components/AnimatedValue'
import { animateHorizontalBars } from '../lib/animations'
import {
  Badge,
  Button,
  CategoryTag,
  CodeBlock,
  EmptyState,
  Panel,
  ScorePill,
  SeverityPill,
  StatusDot,
  StatusPill,
} from '../components/UI'
import {
  actionLabel,
  categoryLabels,
  cx,
  formatDateTime,
  latestReport,
  severityMeta,
  statusMeta,
  timeAgo,
  typeLabels,
} from '../lib/utils'

const typeIcon = { text: FileText, html: LayoutTemplate, document: FileCheck2, image: Image }

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function buildHighlights(issues, text) {
  const lowered = text.toLowerCase()
  const terms = new Map()
  issues.forEach((issue) => {
    const source = `${issue.evidence || ''} ${issue.description || ''}`
    const matches = source.match(/[“”"'‘’]([^“”"'‘’]{3,80})[“”"'‘’]/g) || []
    matches.forEach((match) => {
      const term = match.slice(1, -1).trim()
      if (term.length < 3) return
      if (!lowered.includes(term.toLowerCase())) return
      if (!terms.has(term.toLowerCase())) {
        terms.set(term.toLowerCase(), { term, severity: issue.severity, title: issue.title })
      }
    })
  })
  return [...terms.values()].sort((a, b) => b.term.length - a.term.length)
}

function HighlightedContent({ text, issues }) {
  const highlights = useMemo(() => buildHighlights(issues, text), [issues, text])
  if (!highlights.length) return <>{text}</>
  const pattern = new RegExp(`(${highlights.map((item) => escapeRegExp(item.term)).join('|')})`, 'gi')
  const parts = text.split(pattern)
  return (
    <>
      {parts.map((part, index) => {
        const match = highlights.find((item) => item.term.toLowerCase() === part.toLowerCase())
        if (!match) return <span key={index}>{part}</span>
        return (
          <mark
            key={index}
            className={cx('hl', `hl--${match.severity}`)}
            title={match.title}
          >
            {part}
          </mark>
        )
      })}
    </>
  )
}

function VisualPreview({ submission }) {
  return (
    <div className="visual-preview" aria-label="Synthetic visual asset preview">
      <div className="visual-preview__frame">
        <span className="visual-preview__shape visual-preview__shape--one" />
        <span className="visual-preview__shape visual-preview__shape--two" />
        <span className="visual-preview__mark">A&amp;O</span>
        <div className="visual-preview__copy">
          <span>Aster &amp; Oak</span>
          <strong>{submission.title}</strong>
          <small>4:5 · synthetic preview</small>
        </div>
      </div>
      <p>{submission.content_text}</p>
    </div>
  )
}

export function ReviewDetail() {
  const { id } = useParams()
  const { data, reviewSubmission, toast, isLead } = useApp()
  const submission = data.submissions.find((item) => String(item.id) === String(id))
  const report = submission ? latestReport(submission) : null
  const [expanded, setExpanded] = useState(null)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const commentRef = useRef(null)
  const reportPanelRef = useRef(null)

  useEffect(() => {
    if (report) {
      const cancel = animateHorizontalBars(reportPanelRef.current)
      return cancel
    }
  }, [report?.overall_score])

  if (!submission) {
    return (
      <EmptyState
        icon={FileText}
        title="This review is not in the workspace"
        description="It may have been removed, or the link is older than this demo session."
        action={
          <Link className="btn btn--primary" to="/reviews">
            Back to reviews
          </Link>
        }
      />
    )
  }

  const Icon = typeIcon[submission.content_type] || FileText
  const status = statusMeta[submission.status] || { label: submission.status, tone: 'muted' }
  const firstOpen = expanded ?? report?.issues?.[0]?.id ?? null
  const guidelineFor = (issue) => data.guidelines.find((guideline) => guideline.id === issue.guideline_id)

  const handleAction = async (action) => {
    if ((action === 'rejected' || action === 'changes_requested') && !comment.trim()) {
      setError('Add a short note so the creator knows what to change.')
      commentRef.current?.focus()
      return
    }
    setError('')
    setBusy(action)
    try {
      await reviewSubmission(submission.id, action, comment.trim())
      setComment('')
    } finally {
      setBusy(null)
    }
  }

  const copyFix = async (fix) => {
    try {
      await navigator.clipboard.writeText(fix)
      toast('Suggested fix copied to the clipboard.')
    } catch {
      toast('Could not access the clipboard in this browser.', 'warn')
    }
  }

  const actions = report?.actions || []

  return (
    <div className="review-detail">
      <Link to="/reviews" className="back-link">
        <ArrowLeft size={15} /> Reviews
      </Link>

      <section className="detail-head">
        <div className="detail-head__title">
          <span className="detail-head__icon">
            <Icon size={19} />
          </span>
          <div>
            <div className="detail-head__topline">
              <span>{typeLabels[submission.content_type]}</span>
              <span>·</span>
              <span>#{String(submission.id).padStart(4, '0')}</span>
            </div>
            <h1>{submission.title}</h1>
            <p>
              Submitted by <strong>{submission.submitted_by}</strong> {timeAgo(submission.submitted_at)} ·{' '}
              {formatDateTime(submission.submitted_at)}
            </p>
          </div>
        </div>
        <div className="detail-head__badges">
          <StatusPill status={submission.status} />
          {report ? <ScorePill score={report.overall_score} /> : null}
        </div>
      </section>

      <div className="detail-grid">
        <Panel className="content-panel">
          <div className="content-panel__head">
            <div>
              <h2>Submitted content</h2>
              <p>{submission.content_text.trim().split(/\s+/).filter(Boolean).length} words</p>
            </div>
            <span className="content-panel__type">
              <Icon size={14} /> {typeLabels[submission.content_type]}
            </span>
          </div>

          {submission.content_type === 'image' ? (
            <VisualPreview submission={submission} />
          ) : (
            <div className="content-body">
              {submission.content_type === 'html' ? (
                <div className="content-body__browser">
                  <span />
                  <span />
                  <span />
                  <small>asterandoak.studio/preview</small>
                </div>
              ) : null}
              <p>
                <HighlightedContent text={submission.content_text} issues={report?.issues || []} />
              </p>
            </div>
          )}

          <div className="content-notes">
            <div>
              <span>Reviewer notes</span>
              <p>{submission.reviewer_notes || 'No note on this submission yet.'}</p>
            </div>
            {submission.reviewed_at ? (
              <span className="content-notes__date">Reviewed {formatDateTime(submission.reviewed_at)}</span>
            ) : null}
          </div>
        </Panel>

        <div className="report-column">
          <Panel className="report-panel" ref={reportPanelRef}>
            <div className="report-panel__head">
              <div>
                <h2>Review report</h2>
                <p>
                  {report?.issues?.length || 0}{' '}
                  {report?.issues?.length === 1 ? 'issue' : 'issues'} · {report ? Math.round(report.overall_score) : '—'}
                  /100
                </p>
              </div>
              <span className={cx('report-status', `tone-${status.tone}`)}>
                <span /> {status.label}
              </span>
            </div>

            {report ? (
              <>
                <div className="report-score">
                  <div className="report-score__number">
                    <AnimatedValue value={Math.round(report.overall_score)} suffix="/100" />
                  </div>
                  <div className="report-score__bar">
                    <span
                      className={cx(
                        'report-score__fill',
                        report.overall_score < 70 ? 'is-bad' : report.overall_score < 85 ? 'is-warn' : 'is-good',
                      )}
                      style={{ width: `${report.overall_score}%` }}
                    />
                  </div>
                  <p>{report.summary}</p>
                </div>

                <div className="report-issues">
                  <div className="report-issues__head">
                    <h3>What needs attention</h3>
                    <span>{report.issues.length} findings</span>
                  </div>
                  {report.issues.length ? (
                    <div className="issue-list">
                      {report.issues.map((issue, index) => {
                        const isOpen = firstOpen === issue.id
                        const guideline = guidelineFor(issue)
                        return (
                          <div className={cx('issue-item', isOpen && 'is-open')} key={issue.id}>
                            <button
                              type="button"
                              className="issue-item__head"
                              onClick={() => setExpanded(isOpen ? -1 : issue.id)}
                              aria-expanded={isOpen}
                            >
                              <span className={cx('issue-index', `tone-${severityMeta[issue.severity]?.tone}`)}>
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <span className="issue-item__title">
                                <span>
                                  <StatusDot
                                    status={
                                      issue.severity === 'critical'
                                        ? 'failed'
                                        : issue.severity === 'warning'
                                          ? 'warning'
                                          : 'busy'
                                    }
                                    size="xs"
                                  />
                                  <SeverityPill severity={issue.severity} />
                                  <CategoryTag category={issue.category} />
                                </span>
                                <strong>{issue.title}</strong>
                              </span>
                              <ChevronDown size={16} className="issue-item__chevron" />
                            </button>
                            {isOpen ? (
                              <div className="issue-item__body">
                                <p>{issue.description}</p>
                                {issue.evidence ? (
                                  <div className="evidence-block">
                                    <span>Evidence</span>
                                    <p>{issue.evidence}</p>
                                  </div>
                                ) : null}
                                {issue.suggested_fix ? (
                                  <div className="fix-block">
                                    <div className="fix-block__head">
                                      <span>Suggested fix</span>
                                      <button type="button" onClick={() => copyFix(issue.suggested_fix)}>
                                        <Clipboard size={13} /> Copy
                                      </button>
                                    </div>
                                    <p>{issue.suggested_fix}</p>
                                  </div>
                                ) : null}
                                {guideline ? (
                                  <Link className="guideline-ref" to={`/guidelines?guideline=${guideline.id}`}>
                                    <BookOpen size={13} />
                                    {guideline.title}
                                    <ArrowUpRight size={12} />
                                  </Link>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="report-clear">
                      <span>
                        <Check size={18} />
                      </span>
                      <div>
                        <strong>No guideline breaches found</strong>
                        <p>Every claim is specific or sourced, and the voice is on brand.</p>
                      </div>
                    </div>
                  )}
                </div>

                {isLead ? (
                  <div className="decision-block">
                    <div className="decision-block__head">
                      <h3>Your decision</h3>
                      <span>
                        <ShieldCheck size={14} /> Human approval required
                      </span>
                    </div>
                    <label htmlFor="review-comment">Reviewer note</label>
                    <textarea
                      id="review-comment"
                      ref={commentRef}
                      rows={3}
                      value={comment}
                      onChange={(event) => {
                        setComment(event.target.value)
                        if (error) setError('')
                      }}
                      placeholder="What should the creator know? Be specific and kind."
                    />
                    {error ? <p className="decision-block__error">{error}</p> : null}
                    <div className="decision-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Check}
                        loading={busy === 'approved'}
                        disabled={Boolean(busy)}
                        onClick={() => handleAction('approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={MessageSquare}
                        loading={busy === 'changes_requested'}
                        disabled={Boolean(busy)}
                        onClick={() => handleAction('changes_requested')}
                      >
                        Request changes
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={X}
                        loading={busy === 'rejected'}
                        disabled={Boolean(busy)}
                        onClick={() => handleAction('rejected')}
                        className="btn--danger-text"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="decision-block decision-block--creator-view">
                    <div className="decision-block__head">
                      <h3>Governance Decision</h3>
                      <StatusPill status={submission.status} />
                    </div>
                    {submission.reviewer_notes ? (
                      <div className="creator-review-note">
                        <span className="creator-review-note__label">Lead feedback &amp; instructions:</span>
                        <blockquote>&quot;{submission.reviewer_notes}&quot;</blockquote>
                      </div>
                    ) : (
                      <p className="creator-review-pending">
                        <Clock3 size={14} /> This piece is in the review pipeline. Reviewer notes and sign-off decision will appear here.
                      </p>
                    )}
                    <div className="creator-decision-actions">
                      <Link to="/studio" className="btn btn--secondary btn--sm">
                        <Sparkles size={14} /> Open Creator Studio to Revise
                      </Link>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                compact
                icon={Clock3}
                title="Review is still running"
                description="The report will appear here as soon as the analyser finishes."
              />
            )}
          </Panel>

          <Panel className="audit-panel">
            <div className="audit-panel__head">
              <h3>Audit trail</h3>
              <span>{actions.length} events</span>
            </div>
            {actions.length ? (
              <ol className="audit-list">
                {[...actions]
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map((item) => (
                    <li key={item.id}>
                      <span className={cx('audit-icon', `kind-${item.action}`)}>
                        {item.action === 'approved' ? (
                          <Check size={12} />
                        ) : item.action === 'rejected' ? (
                          <X size={12} />
                        ) : (
                          <MessageSquare size={12} />
                        )}
                      </span>
                      <div>
                        <p>
                          <strong>{item.performed_by}</strong> {actionLabel[item.action]?.toLowerCase()}
                        </p>
                        {item.comment ? <p className="audit-comment">{item.comment}</p> : null}
                        <small>{formatDateTime(item.created_at)}</small>
                      </div>
                    </li>
                  ))}
              </ol>
            ) : (
              <div className="audit-empty">
                <User size={16} />
                <p>No decisions yet. The first action will be recorded here.</p>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
