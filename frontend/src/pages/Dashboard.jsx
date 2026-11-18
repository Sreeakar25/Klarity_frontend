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
  Copy,
  Edit3,
  FileCheck2,
  FileClock,
  FileText,
  Image,
  KeyRound,
  LayoutTemplate,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react'
import { api } from '../lib/api'
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

const typeIcon = { text: FileText, html: LayoutTemplate, document: FileCheck2, image: Image }

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
  const { data, currentUser, isLead, isOwner, toast } = useApp()
  const { stats, submissions, trends, issue_breakdown: breakdown, coverage, activity } = data
  const [period, setPeriod] = useState('30d')

  // Owner workspace settings & user verification state
  const [pendingAccounts, setPendingAccounts] = useState([])
  const [loadingPending, setLoadingPending] = useState(false)
  const [verifyingId, setVerifyingId] = useState(null)
  const [brandMeta, setBrandMeta] = useState({
    brand_name: 'Aster & Oak',
    brand_values: 'Authenticity, craft, sustainability, quiet confidence',
    brand_code: 'KLARITY-2026',
  })
  const [isEditingBrand, setIsEditingBrand] = useState(false)
  const [editBrandName, setEditBrandName] = useState('Aster & Oak')
  const [editBrandCode, setEditBrandCode] = useState('KLARITY-2026')
  const [editBrandValues, setEditBrandValues] = useState('Authenticity, craft, sustainability, quiet confidence')
  const [savingBrand, setSavingBrand] = useState(false)

  const fetchPending = async () => {
    if (!isOwner) return
    try {
      setLoadingPending(true)
      const list = await api.pendingAccounts()
      setPendingAccounts(list || [])
    } catch {
      // ignore
    } finally {
      setLoadingPending(false)
    }
  }

  const fetchWorkspaceMeta = async () => {
    try {
      const res = await api.workspaceSettings()
      if (res?.brand_code) {
        setBrandMeta(res)
        setEditBrandName(res.brand_name || 'Aster & Oak')
        setEditBrandCode(res.brand_code || 'KLARITY-2026')
        setEditBrandValues(res.brand_values || '')
      }
    } catch {
      api.brandCodeHint().then((res) => {
        if (res?.brand_code) {
          setBrandMeta((prev) => ({ ...prev, ...res }))
          setEditBrandName(res.brand_name || 'Aster & Oak')
          setEditBrandCode(res.brand_code || 'KLARITY-2026')
        }
      }).catch(() => {})
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchPending()
    }
    fetchWorkspaceMeta()
  }, [isOwner])

  const handleVerify = async (accountId, approve) => {
    try {
      setVerifyingId(accountId)
      const res = await api.verifyAccount({ account_id: accountId, approve })
      toast(res.message, approve ? 'good' : 'warn')
      await fetchPending()
    } catch (err) {
      toast(err.message, 'warn')
    } finally {
      setVerifyingId(null)
    }
  }

  const handleSaveBrand = async (e) => {
    e.preventDefault()
    if (!isOwner) return
    try {
      setSavingBrand(true)
      const res = await api.updateWorkspaceSettings({
        brand_name: editBrandName,
        brand_code: editBrandCode,
        brand_values: editBrandValues,
      })
      setBrandMeta({
        brand_name: res.brand_name,
        brand_code: res.brand_code,
        brand_values: res.brand_values,
      })
      setIsEditingBrand(false)
      toast('Workspace brand identity & code updated successfully!', 'good')
    } catch (err) {
      toast(err.message, 'warn')
    } finally {
      setSavingBrand(false)
    }
  }

  const days = period === '7d' ? 7 : period === '14d' ? 14 : 30
  const chartData = trends.slice(-days)

  const userLower = (currentUser || '').toLowerCase().trim()
  const mySubmissions = useMemo(() => {
    if (isLead) return submissions
    if (!userLower) return []
    return submissions.filter((item) => {
      const author = (item.submitted_by || '').toLowerCase().trim()
      return author === userLower || author.includes(userLower) || userLower.includes(author)
    })
  }, [currentUser, submissions, isLead, userLower])

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

  const myChartData = useMemo(() => {
    const baseline = myStats.avgScore || 88.5
    return chartData.map((point) => {
      const diff = (point.avg_score - 86.4) * 0.8
      const val = Math.min(98, Math.max(72, Number((baseline + diff).toFixed(1))))
      return {
        ...point,
        avg_score: val,
        value: val,
      }
    })
  }, [chartData, myStats.avgScore])

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
          {isLead ? (
            <Link to="/reviews" className="btn-hero-studio">
              <FileClock size={14} /> Open Review Desk &rarr;
            </Link>
          ) : (
            <Link to="/studio" className="btn-hero-studio">
              <Sparkles size={14} /> Open Creator Studio &rarr;
            </Link>
          )}
          <span className="date-stamp">
            <Calendar size={14} /> {todayLabel}
          </span>
        </div>
      </section>

      {/* BRAND OWNER EXCLUSIVE: COMMAND & VERIFICATION CENTER */}
      {isOwner && (
        <section
          className="owner-command-card"
          aria-label="Owner Command & Verification Center"
          style={{
            marginBottom: '28px',
            borderRadius: '12px',
            border: '1.5px solid rgba(169, 122, 50, 0.35)',
            background: 'linear-gradient(135deg, rgba(251, 248, 241, 0.95) 0%, rgba(246, 241, 230, 0.98) 100%)',
            boxShadow: '0 4px 20px -2px rgba(59, 36, 24, 0.07)',
            overflow: 'hidden',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(59, 36, 24, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              background: 'rgba(169, 122, 50, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--clay)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '14.5px', color: 'var(--ink)' }}>
                    Brand Owner Command &amp; Access Controls
                  </strong>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: 'var(--clay)',
                      color: '#fff',
                      fontWeight: 600,
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Owner Exclusive
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-soft)' }}>
                  Authorize incoming reviewer/creator sign-ups and configure brand values &amp; security access code.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(59, 36, 24, 0.12)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--ink)',
                }}
              >
                <KeyRound size={13} color="var(--clay)" />
                <span>Brand Code:</span>
                <strong style={{ letterSpacing: '0.04em', color: 'var(--clay-deep)' }}>
                  {brandMeta.brand_code || 'KLARITY-2026'}
                </strong>
                <button
                  type="button"
                  title="Copy Brand Code"
                  onClick={() => {
                    navigator.clipboard.writeText(brandMeta.brand_code || 'KLARITY-2026')
                    toast(`Brand code "${brandMeta.brand_code || 'KLARITY-2026'}" copied to clipboard.`, 'good')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--ink-soft)',
                  }}
                >
                  <Copy size={12} />
                </button>
              </div>

              <Button
                size="sm"
                variant={isEditingBrand ? 'ghost' : 'secondary'}
                icon={isEditingBrand ? X : Edit3}
                onClick={() => setIsEditingBrand(!isEditingBrand)}
              >
                {isEditingBrand ? 'Cancel' : 'Edit Brand & Code'}
              </Button>
            </div>
          </div>

          {/* Quick Edit Brand Identity Drawer / Form */}
          {isEditingBrand && (
            <form
              onSubmit={handleSaveBrand}
              style={{
                padding: '18px 20px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderBottom: '1px solid rgba(59, 36, 24, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '14px',
                alignItems: 'end',
              }}
            >
              <div>
                <label
                  htmlFor="dash-brand-name"
                  style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
                >
                  Brand / Workspace Name
                </label>
                <input
                  id="dash-brand-name"
                  type="text"
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: '#fff',
                    color: 'var(--ink)',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="dash-brand-code"
                  style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
                >
                  Brand Access Code (Required on Sign-up)
                </label>
                <input
                  id="dash-brand-code"
                  type="text"
                  value={editBrandCode}
                  onChange={(e) => setEditBrandCode(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. KLARITY-2026"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: '#fff',
                    color: 'var(--clay-deep)',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="dash-brand-values"
                  style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '5px' }}
                >
                  Core Brand Values &amp; Tenets
                </label>
                <input
                  id="dash-brand-values"
                  type="text"
                  value={editBrandValues}
                  onChange={(e) => setEditBrandValues(e.target.value)}
                  placeholder="e.g. Authenticity, craft, sustainability"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    background: '#fff',
                    color: 'var(--ink)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  icon={Save}
                  disabled={savingBrand}
                >
                  {savingBrand ? 'Saving…' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingBrand(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Pending Verification Requests Section */}
          <div style={{ padding: '18px 20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="var(--clay)" />
                <strong style={{ fontSize: '13.5px', color: 'var(--ink)' }}>
                  Pending Verification &amp; Approval Requests
                </strong>
                {pendingAccounts.length > 0 ? (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '1px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {pendingAccounts.length} waiting
                  </span>
                ) : (
                  <span
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#15803d',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    All accounts cleared
                  </span>
                )}
              </div>
              <small style={{ color: 'var(--ink-soft)', fontSize: '11.5px' }}>
                Only the Brand Owner can allow or decline workspace access.
              </small>
            </div>

            {loadingPending ? (
              <div style={{ padding: '18px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '13px' }}>
                Checking for registration requests…
              </div>
            ) : pendingAccounts.length === 0 ? (
              <div
                style={{
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '8px',
                  border: '1px dashed rgba(59, 36, 24, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <ShieldCheck size={20} color="var(--clay)" />
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                    No pending confirmation requests right now.
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-soft)' }}>
                    When a new reviewer or creator signs up with your brand code (<code>{brandMeta.brand_code || 'KLARITY-2026'}</code>), their request will appear right here for your instant Allow / Decline decision.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pendingAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      padding: '12px 16px',
                      background: '#fff',
                      borderRadius: '8px',
                      border: '1px solid rgba(59, 36, 24, 0.12)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(169, 122, 50, 0.12)',
                          color: 'var(--clay-deep)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '14px',
                        }}
                      >
                        {acc.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{acc.username}</strong>
                          <span
                            style={{
                              fontSize: '10.5px',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: acc.role === 'reviewer' ? 'rgba(41, 142, 228, 0.12)' : 'rgba(169, 122, 50, 0.12)',
                              color: acc.role === 'reviewer' ? '#1d4ed8' : 'var(--clay-deep)',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}
                          >
                            Requested Role: {acc.role === 'reviewer' ? 'Reviewer' : 'Team Member / Creator'}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                          {acc.email} · Validated Brand Code · Awaiting Owner Confirmation
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={UserCheck}
                        disabled={verifyingId === acc.id}
                        onClick={() => handleVerify(acc.id, true)}
                        style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff' }}
                      >
                        {verifyingId === acc.id ? 'Processing…' : 'Allow / Verify'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={UserX}
                        disabled={verifyingId === acc.id}
                        onClick={() => handleVerify(acc.id, false)}
                        style={{ color: '#dc2626' }}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

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
                title="My content quality"
                description="Quality score trajectory across your reviewed work against brand guidelines."
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
                    <AnimatedValue value={myStats.avgScore.toFixed(1)} suffix="/100" />
                  </div>
                  <p>
                    <span className={cx('delta', 'delta--good')}>
                      <ArrowUpRight size={13} /> {deltaLabel(1.8, ' pts')}
                    </span>{' '}
                    over the last 30 days
                  </p>
                </div>
                <div className="health-mix">
                  <div>
                    <span>Approved</span>
                    <AnimatedValue value={`${myStats.rate.toFixed(1)}%`} />
                  </div>
                  <div>
                    <span>In review</span>
                    <AnimatedValue
                      value={`${myStats.total > 0 ? (((myStats.reviewing + myStats.pending) / myStats.total) * 100).toFixed(1) : '0.0'}%`}
                    />
                  </div>
                  <div>
                    <span>Changes</span>
                    <AnimatedValue
                      value={`${myStats.total > 0 ? ((myStats.changes / myStats.total) * 100).toFixed(1) : '0.0'}%`}
                    />
                  </div>
                </div>
              </div>
              <PulseChart
                data={myChartData}
                target={85}
                minScore={76}
                maxScore={96}
                label="My review score trend"
              />
              <div className="chart-foot">
                <span className="chart-legend">
                  <span className="chart-legend__swatch" /> My reviewed work score
                </span>
                <span className="chart-foot__note">
                  <Sparkles size={13} /> 85 is the publish threshold
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
