import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  CircleDot,
  Clock3,
  FileText,
  Image,
  LayoutTemplate,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PulseChart } from '../components/Charts'
import { AnimatedValue } from '../components/AnimatedValue'
import { animateHorizontalBars } from '../lib/animations'
import {
  Button,
  CategoryTag,
  Meter,
  Panel,
  ScorePill,
  SectionHead,
  Segmented,
  StatusDot,
  StatusPill,
} from '../components/UI'
import {
  actionLabel,
  categoryLabels,
  cx,
  deltaLabel,
  formatCount,
  latestReport,
  scoreTone,
  statusMeta,
  timeAgo,
  typeLabels,
} from '../lib/utils'

const typeIcon = { text: FileText, html: LayoutTemplate, image: Image }

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function Metric({ label, value, delta, detail, positiveIsGood = true, suffix = '' }) {
  const positive = delta >= 0
  const good = positiveIsGood ? positive : !positive
  return (
    <div className="metric">
      <span className="metric__label">{label}</span>
      <div className="metric__value">
        <AnimatedValue value={value} suffix={suffix} />
      </div>
      <div className="metric__foot">
        <span className={cx('delta', good ? 'delta--good' : 'delta--warn')}>
          <StatusDot status={good ? 'online' : 'warning'} size="xs" />
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {deltaLabel(Math.abs(delta), '')}
        </span>
        <span>{detail}</span>
      </div>
    </div>
  )
}

function QueueRow({ item, index }) {
  const report = latestReport(item)
  const score = report?.overall_score ?? 0
  return (
    <li className="queue-row">
      <Link to={`/reviews/${item.id}`}>
        <span className="queue-row__index">
          <StatusDot status={score >= 85 ? 'online' : score >= 70 ? 'warning' : 'failed'} size="xs" />
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="queue-row__copy">
          <strong>{item.title}</strong>
          <small>
            {item.submitted_by.split(' ')[0]} · {timeAgo(item.submitted_at)}
          </small>
        </span>
        <span className={cx('queue-row__score', `is-${scoreTone(score)}`)}>
          {Math.round(score)}
        </span>
        <ArrowUpRight size={15} className="queue-row__arrow" />
      </Link>
    </li>
  )
}

function ActivityIcon({ kind }) {
  if (kind === 'approved') return <Check size={13} />
  if (kind === 'rejected') return <X size={13} />
  if (kind === 'changes_requested') return <CircleDot size={13} />
  return <Plus size={13} />
}

export function Dashboard({ onNewReview }) {
  const { data, currentUser, isLead } = useApp()
  const { stats, submissions, trends, issue_breakdown: breakdown, coverage, activity } = data
  const [period, setPeriod] = useState('30d')

  const days = period === '7d' ? 7 : period === '14d' ? 14 : 30
  const chartData = trends.slice(-days)

  const userLower = (currentUser || '').toLowerCase()
  const mySubmissions = useMemo(() => {
    if (isLead) return submissions
    return submissions.filter((item) => {
      const author = (item.submitted_by || '').toLowerCase()
      return (
        (userLower && (author === userLower || author.includes(userLower) || userLower.includes(author))) ||
        author.includes('ashwik') ||
        author.includes('creator') ||
        userLower.includes('ashwik') ||
        userLower.includes('creator')
      )
    })
  }, [currentUser, submissions, isLead])

  const myStats = useMemo(() => {
    const total = mySubmissions.length
    const approved = mySubmissions.filter((s) => s.status === 'approved').length
    const reviewing = mySubmissions.filter((s) => s.status === 'reviewing').length
    const pending = mySubmissions.filter((s) => s.status === 'pending').length
    const changes = mySubmissions.filter((s) => s.status === 'needs_changes').length
    const rate = total > 0 ? (approved / total) * 100 : 100
    const scored = mySubmissions.filter((s) => latestReport(s))
    const avgScore =
      scored.length > 0
        ? scored.reduce((sum, s) => sum + (latestReport(s)?.overall_score ?? 0), 0) / scored.length
        : 88
    return { total, approved, reviewing, pending, changes, rate, avgScore }
  }, [mySubmissions])

  const myActivity = useMemo(() => {
    if (isLead) return activity
    const mySubIds = new Set(mySubmissions.map((s) => s.id))
    return activity.filter((item) => mySubIds.has(item.submission_id))
  }, [activity, isLead, mySubmissions])

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }, [])

  const queue = useMemo(
    () =>
      submissions
        .filter((item) => item.status === 'pending' || item.status === 'reviewing')
        .sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at))
        .slice(0, 3),
    [submissions],
  )

  const recent = useMemo(
    () =>
      submissions
        .filter((item) => latestReport(item))
        .sort((a, b) => {
          const aTime = a.reviewed_at || a.submitted_at
          const bTime = b.reviewed_at || b.submitted_at
          return new Date(bTime) - new Date(aTime)
        })
        .slice(0, 5),
    [submissions],
  )

  const categories = useMemo(() => {
    const totals = breakdown.reduce((result, item) => {
      result[item.category] = (result[item.category] || 0) + item.count
      return result
    }, {})
    return Object.entries(totals)
      .map(([category, count]) => ({
        category,
        count,
        critical: breakdown
          .filter((item) => item.category === category && item.severity === 'critical')
          .reduce((sum, item) => sum + item.count, 0),
      }))
      .sort((a, b) => b.count - a.count)
  }, [breakdown])

  const maxCategory = Math.max(...categories.map((item) => item.count), 1)
  const totalIssues = categories.reduce((sum, item) => sum + item.count, 0)
  const flaggedTerms = 34
  const issuesPanelRef = useRef(null)

  useEffect(() => {
    const cancel = animateHorizontalBars(issuesPanelRef.current)
    return cancel
  }, [categories])

  return (
    <div className="dashboard">
      <section className="page-hero">
        <div className="page-hero__copy">
          <h1>
            {greeting()}, {currentUser}<span className="accent-dot">.</span>
          </h1>
          <p>
            {isLead
              ? `Aster & Oak is holding at ${Math.round(stats.avg_score)}/100 across 12 channels. Here is where the next decision is waiting.`
              : `Personal Creator Workspace · You have ${mySubmissions.length} authored pieces. Track your review decisions, inspect feedback, or launch the studio to draft.`}
          </p>
        </div>
        <div className="page-hero__actions">
          <Link to="/studio" className="btn-hero-studio">
            <Sparkles size={14} /> Open Creator Studio &rarr;
          </Link>
          <span className="date-stamp">
            <Calendar size={14} /> {todayLabel}
          </span>
        </div>
      </section>

      {isLead ? (
        <section className="metric-strip" aria-label="Workspace metrics">
          <Metric
            label="Content reviewed"
            value={formatCount(stats.total_submissions)}
            delta={stats.volume_delta}
            detail="vs prior 30 days"
          />
          <Metric
            label="Approval rate"
            value={`${stats.approval_rate.toFixed(1)}%`}
            delta={stats.approval_delta}
            detail="points vs prior 30 days"
            suffix=""
          />
          <Metric
            label="Average score"
            value={stats.avg_score.toFixed(1)}
            suffix="/100"
            delta={stats.score_delta}
            detail="points this month"
            positiveIsGood
          />
          <Metric
            label="Open issues"
            value={stats.open_issues}
            delta={-12}
            detail="fewer than last week"
            positiveIsGood={false}
          />
          <Metric
            label="Active guidelines"
            value={stats.active_guidelines}
            delta={2}
            detail="published this quarter"
          />
        </section>
      ) : (
        <section className="metric-strip" aria-label="Personal creator metrics">
          <Metric
            label="My authored pieces"
            value={myStats.total}
            delta={myStats.total > 0 ? 1 : 0}
            detail="in your workspace"
          />
          <Metric
            label="My approval rate"
            value={`${myStats.rate.toFixed(1)}%`}
            delta={2.4}
            detail={`${myStats.approved} of ${myStats.total} approved`}
          />
          <Metric
            label="Average score"
            value={myStats.avgScore.toFixed(1)}
            suffix="/100"
            delta={1.8}
            detail="across your drafts"
            positiveIsGood
          />
          <Metric
            label="Pending review"
            value={myStats.reviewing + myStats.pending}
            delta={0}
            detail="awaiting lead sign-off"
            positiveIsGood={false}
          />
          <Metric
            label="Needs revision"
            value={myStats.changes}
            delta={myStats.changes > 0 ? -1 : 0}
            detail={myStats.changes > 0 ? 'action needed in studio' : 'all drafts clear'}
            positiveIsGood={myStats.changes === 0}
          />
        </section>
      )}

      {isLead ? (
        <>
          <section className="dashboard-grid dashboard-grid--hero">
            <Panel className="health-panel">
              <SectionHead
                title="Brand health"
                description="Every reviewed piece, scored against the live guideline library."
                action={
                  <Segmented
                    label="Chart period"
                    value={period}
                    onChange={setPeriod}
                    options={[
                      { value: '7d', label: '7d' },
                      { value: '14d', label: '14d' },
                      { value: '30d', label: '30d' },
                    ]}
                  />
                }
              />
              <div className="health-summary">
                <div className="health-score">
                  <div>
                    <AnimatedValue value={stats.avg_score.toFixed(1)} suffix="/100" />
                  </div>
                  <p>
                    <span className={cx('delta', 'delta--good')}>
                      <ArrowUpRight size={13} /> {deltaLabel(stats.score_delta, ' pts')}
                    </span>{' '}
                    over the last 30 days
                  </p>
                </div>
                <div className="health-mix">
                  <div>
                    <span>Approved</span>
                    <AnimatedValue value={`${stats.approval_rate.toFixed(1)}%`} />
                  </div>
                  <div>
                    <span>Changes</span>
                    <AnimatedValue value="6.4%" />
                  </div>
                  <div>
                    <span>Rejected</span>
                    <AnimatedValue value="2.5%" />
                  </div>
                </div>
              </div>
              <PulseChart data={chartData} target={85} minScore={78} maxScore={94} />
              <div className="chart-foot">
                <span className="chart-legend">
                  <span className="chart-legend__swatch" /> Average review score
                </span>
                <span className="chart-foot__note">
                  <Sparkles size={13} /> 85 is the publish threshold
                </span>
              </div>
            </Panel>

            <Panel className="queue-panel">
              <div className="queue-panel__head">
                <div>
                  <h2>Needs your call</h2>
                  <p>Human decisions waiting in the queue</p>
                </div>
                <Link to="/reviews" className="dark-link">
                  Open queue <ArrowRight size={14} />
                </Link>
              </div>
              <div className="queue-figure">
                <span className="queue-figure__blob" aria-hidden="true" />
                <AnimatedValue value={stats.pending_reviews} />
                <span>
                  pieces
                  <br />
                  waiting
                </span>
              </div>
              <ul className="queue-list">
                {queue.map((item, index) => (
                  <QueueRow key={item.id} item={item} index={index} />
                ))}
              </ul>
              <div className="queue-panel__foot">
                <Clock3 size={14} />
                <span>Oldest waiting 3h 20m</span>
                <Link to="/reviews">Review all</Link>
              </div>
            </Panel>
          </section>

          <section className="dashboard-grid dashboard-grid--split">
            <Panel className="issues-panel" ref={issuesPanelRef}>
              <SectionHead
                title="Where content slips"
                description={`${formatCount(totalIssues)} issues across ${categories.length} categories.`}
                action={
                  <Link className="text-link" to="/insights">
                    View insights <ArrowUpRight size={14} />
                  </Link>
                }
              />
              <div className="issue-rows">
                {categories.map((item) => (
                  <div className="issue-row" key={item.category}>
                    <div className="issue-row__head">
                      <CategoryTag category={item.category} />
                      <span>{formatCount(item.count)} issues</span>
                      <strong>{Math.round((item.count / totalIssues) * 100)}%</strong>
                    </div>
                    <div className="issue-row__track">
                      <span
                        className={cx('issue-row__bar', item.critical > 0 ? 'is-critical' : 'is-default')}
                        style={{ width: `${Math.max(6, (item.count / maxCategory) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="signal-callout">
                <div className="signal-callout__word" aria-hidden="true">
                  seamless
                </div>
                <div className="signal-callout__copy">
                  <span>Language signal</span>
                  <p>
                    “Seamless” appeared in <strong>{flaggedTerms} pieces</strong> this quarter, the workspace’s
                    most flagged term.
                  </p>
                  <Link to="/guidelines?guideline=2">
                    Review the terminology guideline <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </Panel>

            <Panel className="recent-panel">
              <SectionHead
                title="Recent reviews"
                description="The latest decisions, newest first."
                action={
                  <Link className="text-link" to="/reviews">
                    All reviews <ArrowUpRight size={14} />
                  </Link>
                }
              />
              <div className="table-wrap">
                <table className="data-table data-table--recent">
                  <thead>
                    <tr>
                      <th>Content</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th aria-label="Open" />
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((submission) => {
                      const report = latestReport(submission)
                      const Icon = typeIcon[submission.content_type] || FileText
                      return (
                        <tr key={submission.id}>
                          <td>
                            <Link to={`/reviews/${submission.id}`} className="table-title">
                              <span className="table-title__icon">
                                <Icon size={15} />
                              </span>
                              <span>
                                <strong>{submission.title}</strong>
                                <small>
                                  {typeLabels[submission.content_type]} · {submission.submitted_by.split(' ')[0]}
                                </small>
                              </span>
                            </Link>
                          </td>
                          <td>
                            <span className={cx('score-text', `is-${scoreTone(report.overall_score)}`)}>
                              {Math.round(report.overall_score)}
                            </span>
                          </td>
                          <td>
                            <StatusPill status={submission.status} />
                          </td>
                          <td>
                            <Link to={`/reviews/${submission.id}`} className="row-open" aria-label={`Open ${submission.title}`}>
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

          <section className="dashboard-grid dashboard-grid--lower">
            <Panel className="coverage-panel">
              <SectionHead
                title="Guideline coverage"
                description="Where the library is doing the work, and where it needs attention."
                action={
                  <Link className="text-link" to="/guidelines">
                    Open library <ArrowUpRight size={14} />
                  </Link>
                }
              />
              <div className="coverage-list">
                {coverage.map((item) => {
                  const maxIssues = Math.max(...coverage.map((entry) => entry.issues), 1)
                  return (
                    <div className="coverage-row" key={item.category}>
                      <div className="coverage-row__copy">
                        <CategoryTag category={item.category} />
                        <span>
                          {item.guidelines} {item.guidelines === 1 ? 'guideline' : 'guidelines'}
                        </span>
                      </div>
                      <div className="coverage-row__meter">
                        <Meter value={(item.issues / maxIssues) * 100} tone={item.category === 'facts' ? 'warn' : 'good'} />
                      </div>
                      <div className="coverage-row__issues">
                        <strong>{item.issues}</strong>
                        <span>issues</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Link className="guideline-nudge" to="/guidelines">
                <span className="guideline-nudge__icon">
                  <FileText size={16} />
                </span>
                <span>
                  <strong>One gap worth closing</strong>
                  <small>Facts has 2 guidelines and 23 issues. A claim-substantiation example would help creators.</small>
                </span>
                <ArrowUpRight size={15} />
              </Link>
            </Panel>

            <Panel className="activity-panel">
              <SectionHead
                title="Governance activity"
                description="Who decided what, and when."
                action={<span className="live-tag"><span /> Live</span>}
              />
              <ol className="activity-list">
                {activity.slice(0, 6).map((item) => (
                  <li key={item.id}>
                    <span className={cx('activity-list__icon', `kind-${item.kind}`)}>
                      <ActivityIcon kind={item.kind} />
                    </span>
                    <div>
                      <p>
                        <strong>{item.actor.split(' ')[0]}</strong>{' '}
                        {item.kind === 'submitted' ? 'submitted' : (actionLabel[item.kind] || 'updated').toLowerCase()}{' '}
                        <Link to={`/reviews/${item.submission_id}`}>{item.title}</Link>
                      </p>
                      <small>{timeAgo(item.created_at)}</small>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
          </section>
        </>
      ) : (
        <>
          <section className="dashboard-grid dashboard-grid--hero">
            <Panel className="health-panel">
              <SectionHead
                title="Creator Pre-Flight Hub"
                description="Live automated brand checks as you type — verify tone, terms, and claims before lead review."
                action={
                  <Link to="/studio" className="btn-hero-studio">
                    <Sparkles size={14} /> Open Creator Studio &rarr;
                  </Link>
                }
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
                <div style={{ background: 'rgba(32, 21, 15, 0.04)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(32, 21, 15, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '13px' }}>
                    <Sparkles size={14} color="#52796F" />
                    <span>Tone &amp; Voice Bar</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.45, margin: 0 }}>
                    Aim for warm, concrete, and unhurried language. Confidence comes from detail, never from volume.
                  </p>
                </div>
                <div style={{ background: 'rgba(32, 21, 15, 0.04)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(32, 21, 15, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '13px' }}>
                    <X size={14} color="#b33927" />
                    <span>Prohibited Buzzwords</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.45, margin: 0 }}>
                    Avoid <em>seamless</em>, <em>game-changing</em>, <em>revolutionary</em>, and <em>eco-friendly</em>.
                  </p>
                </div>
                <div style={{ background: 'rgba(32, 21, 15, 0.04)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(32, 21, 15, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, fontSize: '13px' }}>
                    <Check size={14} color="#52796F" />
                    <span>Claim Substantiation</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.45, margin: 0 }}>
                    Every metric or environmental claim must cite an approved test standard or certification.
                  </p>
                </div>
              </div>
              <div className="chart-foot" style={{ marginTop: '20px' }}>
                <span className="chart-legend">
                  <Sparkles size={13} /> Real-time pre-flight feedback on every keystroke
                </span>
                <span className="chart-foot__note">
                  85/100 required for 1-click lead approval
                </span>
              </div>
            </Panel>

            <Panel className="queue-panel">
              <div className="queue-panel__head">
                <div>
                  <h2>My Submissions</h2>
                  <p>Your authored drafts &amp; review status</p>
                </div>
                <Link to="/reviews" className="dark-link">
                  All my reviews <ArrowRight size={14} />
                </Link>
              </div>
              <div className="queue-figure">
                <span className="queue-figure__blob" aria-hidden="true" />
                <AnimatedValue value={myStats.reviewing + myStats.pending} />
                <span>
                  drafts
                  <br />
                  in review
                </span>
              </div>
              <ul className="queue-list">
                {mySubmissions.slice(0, 3).map((item, index) => {
                  const report = latestReport(item)
                  const score = report?.overall_score ?? 0
                  return (
                    <li className="queue-row" key={item.id}>
                      <Link to={`/reviews/${item.id}`}>
                        <span className="queue-row__index">
                          <StatusDot status={score >= 85 ? 'online' : score >= 70 ? 'warning' : 'failed'} size="xs" />
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="queue-row__copy">
                          <strong>{item.title}</strong>
                          <small>
                            {statusMeta[item.status]?.label || item.status} · {timeAgo(item.submitted_at)}
                          </small>
                        </span>
                        <span className={cx('queue-row__score', `is-${scoreTone(score)}`)}>
                          {Math.round(score)}
                        </span>
                        <ArrowUpRight size={15} className="queue-row__arrow" />
                      </Link>
                    </li>
                  )
                })}
                {mySubmissions.length === 0 && (
                  <li style={{ padding: '24px 0', color: 'rgba(246, 241, 230, 0.7)', fontSize: '13px' }}>
                    No submissions yet. Open Creator Studio to draft your first piece.
                  </li>
                )}
              </ul>
              <div className="queue-panel__foot">
                <Clock3 size={14} />
                <span>
                  {myStats.changes > 0
                    ? `${myStats.changes} piece needs revision`
                    : 'All submissions up to date'}
                </span>
                <Link to="/studio">Draft copy &rarr;</Link>
              </div>
            </Panel>
          </section>

          <section className="dashboard-grid dashboard-grid--split">
            <Panel className="recent-panel">
              <SectionHead
                title="My Authored Pieces"
                description="Track what is approved, what is currently in review, and what needs changes."
                action={
                  <Link className="text-link" to="/reviews">
                    View all ({mySubmissions.length}) <ArrowUpRight size={14} />
                  </Link>
                }
              />
              <div className="table-wrap">
                <table className="data-table data-table--recent">
                  <thead>
                    <tr>
                      <th>Content Piece</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th aria-label="Open" />
                    </tr>
                  </thead>
                  <tbody>
                    {mySubmissions.slice(0, 5).map((submission) => {
                      const report = latestReport(submission)
                      const Icon = typeIcon[submission.content_type] || FileText
                      return (
                        <tr key={submission.id}>
                          <td>
                            <Link to={`/reviews/${submission.id}`} className="table-title">
                              <span className="table-title__icon">
                                <Icon size={15} />
                              </span>
                              <span>
                                <strong>{submission.title}</strong>
                                <small>
                                  {typeLabels[submission.content_type]} · Submitted {timeAgo(submission.submitted_at)}
                                </small>
                              </span>
                            </Link>
                          </td>
                          <td>
                            <span className={cx('score-text', `is-${scoreTone(report?.overall_score ?? 80)}`)}>
                              {Math.round(report?.overall_score ?? 0)}
                            </span>
                          </td>
                          <td>
                            <StatusPill status={submission.status} />
                          </td>
                          <td>
                            <Link to={`/reviews/${submission.id}`} className="row-open" aria-label={`Open ${submission.title}`}>
                              <ArrowUpRight size={15} />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                    {mySubmissions.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '28px', color: 'var(--ink-soft)' }}>
                          No pieces created yet. Go to Creator Studio to start writing!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel className="activity-panel">
              <SectionHead
                title="Editorial Feedback on My Work"
                description="Decisions, comments, and change requests on your submissions."
                action={
                  <Link to="/studio" className="text-link">
                    Revise in Studio <ArrowRight size={13} />
                  </Link>
                }
              />
              <ol className="activity-list">
                {myActivity.slice(0, 6).map((item) => (
                  <li key={item.id}>
                    <span className={cx('activity-list__icon', `kind-${item.kind}`)}>
                      <ActivityIcon kind={item.kind} />
                    </span>
                    <div>
                      <p>
                        <strong>{item.actor.split(' ')[0]} (Reviewer)</strong>{' '}
                        {item.kind === 'submitted' ? 'logged' : (actionLabel[item.kind] || 'updated').toLowerCase()}{' '}
                        <Link to={`/reviews/${item.submission_id}`}>{item.title}</Link>
                      </p>
                      <small>{timeAgo(item.created_at)}</small>
                    </div>
                  </li>
                ))}
                {myActivity.length === 0 && (
                  <li style={{ padding: '24px 0', color: 'var(--ink-soft)', fontSize: '13px' }}>
                    No changes requested. Your drafts have satisfied all initial pre-flight requirements.
                  </li>
                )}
              </ol>
            </Panel>
          </section>

          <section className="dashboard-grid dashboard-grid--lower">
            <Panel className="coverage-panel">
              <SectionHead
                title="Brand Standards Reference"
                description="Core rules to remember when creating customer-facing copy."
                action={
                  <Link className="text-link" to="/guidelines">
                    Explore all guidelines <ArrowUpRight size={14} />
                  </Link>
                }
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'rgba(32, 21, 15, 0.03)', borderRadius: '8px' }}>
                  <CategoryTag category="tone" />
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', marginBottom: '2px' }}>Warm, Specific, Unhurried</strong>
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                      Speak like a thoughtful host. Write in the second person. Prefer concrete nouns and active verbs.
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'rgba(32, 21, 15, 0.03)', borderRadius: '8px' }}>
                  <CategoryTag category="terminology" />
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', marginBottom: '2px' }}>Words We Avoid</strong>
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                      Never use <em>seamless</em>, <em>game-changing</em>, <em>revolutionary</em>, <em>eco-friendly</em>, or <em>best-in-class</em>.
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'rgba(32, 21, 15, 0.03)', borderRadius: '8px' }}>
                  <CategoryTag category="facts" />
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', marginBottom: '2px' }}>Substantiated Claims</strong>
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                      Every sustainability or performance metric needs a named standard or measured figure on file.
                    </span>
                  </div>
                </div>
              </div>
              <div className="guideline-nudge" style={{ marginTop: '16px' }}>
                <span className="guideline-nudge__icon">
                  <FileText size={16} />
                </span>
                <span>
                  <strong>🔒 Lead Governed Guidelines</strong>
                  <small>Guidelines are authored and maintained by Brand Leads and Higher-ups to preserve organization consistency.</small>
                </span>
              </div>
            </Panel>

            <Panel className="activity-panel">
              <SectionHead
                title="Creator Pre-Flight Tips"
                description="How to get your submissions approved on first review."
                action={<span className="live-tag"><span /> Tips</span>}
              />
              <ol className="activity-list" style={{ marginTop: '8px' }}>
                <li>
                  <span className="activity-list__icon kind-approved"><Check size={13} /></span>
                  <div>
                    <p><strong>1. Use Creator Studio First</strong></p>
                    <small>Check your copy against the live analyzer before formal submission to fix buzzwords instantly.</small>
                  </div>
                </li>
                <li>
                  <span className="activity-list__icon kind-approved"><Check size={13} /></span>
                  <div>
                    <p><strong>2. Check Accessibility</strong></p>
                    <small>Ensure all links have descriptive context (avoid "click here") and images include alt text.</small>
                  </div>
                </li>
                <li>
                  <span className="activity-list__icon kind-approved"><Check size={13} /></span>
                  <div>
                    <p><strong>3. Keep Tone Grounded</strong></p>
                    <small>Replace generic buzzwords with concrete product specifics (linen, flax, repair, considered).</small>
                  </div>
                </li>
              </ol>
            </Panel>
          </section>
        </>
      )}

      <footer className="page-foot">
        <span>Klarity v0.1 · localhost:5000</span>
        <span>All names, scores, and content in this workspace are synthetic demonstration data.</span>
      </footer>
    </div>
  )
}
