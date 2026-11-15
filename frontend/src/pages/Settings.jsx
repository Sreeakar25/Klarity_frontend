import { useEffect, useState } from 'react'
import {
  Bell,
  Check,
  Clock,
  Clock3,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  UserPlus,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Avatar, Button, Field, Panel, SectionHead, Select } from '../components/UI'
import { cx } from '../lib/utils'
import { api } from '../lib/api'

const STORAGE_KEY = 'klarity.settings.v1'

const defaultSettings = {
  workspace: 'Aster & Oak',
  website: 'asterandoak.studio',
  timezone: 'Asia/Kolkata (GMT+5:30)',
  defaultReviewer: 'Ashwik Saxena',
  threshold: '85',
  autoAssign: true,
  requireEvidence: true,
  weeklyDigest: true,
  assignedEmails: true,
  mentions: false,
  slack: false,
}

const team = [
  { name: 'Ashwik Saxena (Topper)', email: 'ashwik@topper', role: 'Stage 1 · Brand Owner', status: 'Active' },
  { name: 'Kruthik Kamegaonkar', email: 'kruthik@localhost5000.dev', role: 'Stage 1 · Brand Owner', status: 'Active' },
  { name: 'Maddi Abhinav', email: 'abhinav@localhost5000.dev', role: 'Stage 2 · Reviewer', status: 'Active' },
  { name: 'Maya Iyer', email: 'maya@asterandoak.studio', role: 'Stage 2 · Reviewer', status: 'Active' },
  { name: 'G N Sreekar', email: 'sreekar@localhost5000.dev', role: 'Stage 3 · Team Member', status: 'Active' },
  { name: 'Rohan Mehta', email: 'rohan@asterandoak.studio', role: 'Stage 3 · Team Member', status: 'Invited' },
]

function ToggleRow({ label, description, checked, onChange, disabled = false }) {
  return (
    <div className={cx('toggle-row', disabled && 'is-disabled')} style={disabled ? { opacity: 0.65 } : undefined}>
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={cx('switch', checked && 'is-on')}
        onClick={() => !disabled && onChange(!checked)}
        style={disabled ? { cursor: 'not-allowed' } : undefined}
      >
        <span />
      </button>
    </div>
  )
}

export function Settings() {
  const { toast, currentUser, user, isLead, isOwner, visibilitySettings, updateRoleVisibility } = useApp()
  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [pendingAccounts, setPendingAccounts] = useState([])
  const [brandCode, setBrandCode] = useState('KLARITY-2026')
  const [loadingPending, setLoadingPending] = useState(false)

  const fetchPending = async () => {
    try {
      setLoadingPending(true)
      const list = await api.pendingAccounts()
      setPendingAccounts(list || [])
    } catch {
      // non-admin or failed
    } finally {
      setLoadingPending(false)
    }
  }

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setSettings({ ...defaultSettings, ...JSON.parse(stored) })
    } catch {
      // ignore malformed local settings
    }
    api.brandCodeHint().then(res => {
      if (res?.brand_code) setBrandCode(res.brand_code)
    }).catch(() => {})
    fetchPending()
  }, [])

  const handleVerify = async (accountId, approve) => {
    try {
      const res = await api.verifyAccount({ account_id: accountId, approve })
      toast(res.message, approve ? 'good' : 'warn')
      fetchPending()
    } catch (err) {
      toast(err.message, 'warn')
    }
  }

  const update = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  const save = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // the toast still confirms the in-session change
    }
    setSaved(true)
    toast('Workspace settings saved.')
  }

  return (
    <div className="settings-page">
      <section className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Workspace identity, review defaults, and the people who make the final call.</p>
        </div>
        <div className="page-head__actions">
          <span className={cx('settings-saved', saved && 'is-saved')}>
            {saved ? <><Check size={14} /> Saved locally</> : isLead ? 'Demo workspace settings' : 'Member view-only'}
          </span>
          {isLead ? (
            <Button icon={Save} onClick={save}>
              Save changes
            </Button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--cream)',
                  border: '1px solid var(--line-strong)',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  fontWeight: 600,
                }}
              >
                <Lock size={13} color="var(--sage)" />
                Governed by Brand Leads
              </span>
              <Button
                variant="secondary"
                icon={Save}
                onClick={() => {
                  try {
                    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
                  } catch {}
                  setSaved(true)
                  toast('Personal notification preferences saved.', 'good')
                }}
              >
                Save preferences
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <a href="#workspace"><Globe size={15} /> Workspace</a>
          <a href="#review-defaults"><SlidersHorizontal size={15} /> Review defaults</a>
          <a href="#notifications"><Bell size={15} /> Notifications</a>
          <a href="#team"><Users size={15} /> Team</a>
          <a href="#role-visibility"><ShieldAlert size={15} /> Role Viewability Matrix</a>
          <a href="#ai-disclosure"><ShieldCheck size={15} /> AI &amp; Confidentiality</a>
        </nav>

        <div className="settings-content">
          <Panel className="settings-section" id="workspace">
            <SectionHead
              title="Workspace"
              description="The identity and defaults attached to every review."
              action={
                isLead ? (
                  <Globe size={18} className="settings-section__icon" />
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11.5px',
                      color: 'var(--muted)',
                      background: 'var(--cream)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <Lock size={12} color="var(--sage)" />
                    Lead Exclusive
                  </span>
                )
              }
            />
            {!isLead && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(217, 119, 6, 0.08)',
                  border: '1px solid rgba(217, 119, 6, 0.22)',
                  color: '#92400e',
                  fontSize: '12px',
                  lineHeight: 1.4,
                }}
              >
                <Lock size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Read-only access:</strong> Workspace creation, custom domain configuration, and governance defaults are restricted to <strong>Brand Owners and Reviewers</strong>. Team members work within their assigned workspace.
                </span>
              </div>
            )}
            <div className="settings-form">
              <Field label="Workspace name" htmlFor="workspace-name">
                <input
                  id="workspace-name"
                  value={settings.workspace}
                  disabled={!isLead}
                  onChange={(event) => update('workspace', event.target.value)}
                  style={!isLead ? { cursor: 'not-allowed', background: 'var(--paper-deep)', opacity: 0.8 } : undefined}
                />
              </Field>
              <div className="form-row form-row--two">
                <Field label="Brand site" htmlFor="workspace-site">
                  <input
                    id="workspace-site"
                    value={settings.website}
                    disabled={!isLead}
                    onChange={(event) => update('website', event.target.value)}
                    style={!isLead ? { cursor: 'not-allowed', background: 'var(--paper-deep)', opacity: 0.8 } : undefined}
                  />
                </Field>
                <Field label="Timezone" htmlFor="workspace-timezone">
                  <Select
                    id="workspace-timezone"
                    value={settings.timezone}
                    disabled={!isLead}
                    onChange={(val) => update('timezone', val)}
                    options={[
                      'Asia/Kolkata (GMT+5:30)',
                      'Europe/London (GMT+0)',
                      'America/New_York (GMT-5)',
                      'Asia/Singapore (GMT+8)',
                    ]}
                  />
                </Field>
              </div>
              <Field
                label="Default reviewer"
                htmlFor="workspace-reviewer"
                hint={isLead ? 'New submissions are routed here first.' : 'Primary reviewer assigned to review your submissions.'}
              >
                <Select
                  id="workspace-reviewer"
                  value={settings.defaultReviewer}
                  disabled={!isLead}
                  onChange={(val) => update('defaultReviewer', val)}
                  options={[
                    'Ashwik Saxena',
                    'Maya Iyer',
                    'Maddi Abhinav',
                    'Kruthik Kamegaonkar',
                  ]}
                />
              </Field>
            </div>
          </Panel>

          <Panel className="settings-section" id="review-defaults">
            <SectionHead
              title="Review defaults"
              description="How strict the workspace is by default. Individual rules can still override this."
              action={
                isLead ? (
                  <ShieldCheck size={18} className="settings-section__icon" />
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11.5px',
                      color: 'var(--muted)',
                      background: 'var(--cream)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <Lock size={12} color="var(--sage)" />
                    Lead Governed
                  </span>
                )
              }
            />
            <div className="settings-form">
              <Field
                label="Publish threshold"
                htmlFor="workspace-threshold"
                hint={
                  isLead
                    ? 'A piece below this score needs a reviewer decision before it can be approved.'
                    : 'Minimum score required for automatic clearance (configured by Brand Leads).'
                }
              >
                <div className="threshold-field">
                  <input
                    id="workspace-threshold"
                    type="range"
                    min="60"
                    max="95"
                    disabled={!isLead}
                    value={settings.threshold}
                    onChange={(event) => update('threshold', event.target.value)}
                    style={!isLead ? { cursor: 'not-allowed', opacity: 0.7 } : undefined}
                  />
                  <span>
                    <strong>{settings.threshold}</strong>
                    <small>/100</small>
                  </span>
                </div>
              </Field>
              <div className="toggle-stack">
                <ToggleRow
                  label="Auto-assign new reviews"
                  description="Route a submission to the default reviewer as soon as the report is ready."
                  checked={settings.autoAssign}
                  disabled={!isLead}
                  onChange={(value) => update('autoAssign', value)}
                />
                <ToggleRow
                  label="Require evidence on critical findings"
                  description="A blocking issue cannot be overridden without a cited guideline or source."
                  checked={settings.requireEvidence}
                  disabled={!isLead}
                  onChange={(value) => update('requireEvidence', value)}
                />
              </div>
            </div>
          </Panel>

          <Panel className="settings-section" id="notifications">
            <SectionHead
              title="Notifications"
              description="What the team hears about, and where."
              action={<Bell size={18} className="settings-section__icon" />}
            />
            <div className="toggle-stack toggle-stack--flush">
              <ToggleRow
                label="Weekly governance digest"
                description="A Monday summary of scores, open issues, and the guidelines doing the most work."
                checked={settings.weeklyDigest}
                onChange={(value) => update('weeklyDigest', value)}
              />
              <ToggleRow
                label="Review assigned to me"
                description="An email when a new report is routed to your queue."
                checked={settings.assignedEmails}
                onChange={(value) => update('assignedEmails', value)}
              />
              <ToggleRow
                label="Mentions in reviewer notes"
                description="Notify me when someone names me in a decision comment."
                checked={settings.mentions}
                onChange={(value) => update('mentions', value)}
              />
              <ToggleRow
                label="Slack digest"
                description="Post the daily review summary into #brand-governance."
                checked={settings.slack}
                onChange={(value) => update('slack', value)}
              />
            </div>
          </Panel>

          <Panel className="settings-section" id="team">
            <SectionHead
              title="Team & Access Governance"
              description="Roles decide who can approve, reject, and publish guidelines."
              action={
                isLead ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--muted)', background: 'var(--cream)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                      Brand Code: <strong>{brandCode}</strong>
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={UserPlus}
                      onClick={() => toast(`Share Brand Value Code "${brandCode}" with new team members.`, 'info')}
                    >
                      Invite member
                    </Button>
                  </div>
                ) : (
                  <span style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--cream)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                    <ShieldCheck size={14} color="var(--sage)" />
                    Audited by Brand Leads
                  </span>
                )
              }
            />

            {isLead && pendingAccounts.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '14px', background: 'var(--sage-wash)', border: '1.5px solid var(--sage-soft)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="#b45309" />
                    <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>Pending Verification Requests ({pendingAccounts.length})</strong>
                  </div>
                  <small style={{ color: 'var(--muted)', fontSize: '11px' }}>Entered brand code · Awaiting owner authorization</small>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pendingAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: '#fff',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '13px', display: 'block', color: 'var(--ink)' }}>{acc.username}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{acc.email} · Role: <strong style={{ color: 'var(--sage-deep)' }}>{acc.role === 'reviewer' ? 'Reviewer' : 'Team Member'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Check}
                          onClick={() => handleVerify(acc.id, true)}
                        >
                          Approve Access
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={X}
                          onClick={() => handleVerify(acc.id, false)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="team-list">
              {team.map((member) => (
                <div className="team-row" key={member.email}>
                  <Avatar name={member.name} />
                  <div className="team-row__identity">
                    <strong>{member.name}</strong>
                    <small>{member.email}</small>
                  </div>
                  <span className="team-row__role">{member.role}</span>
                  <span className={cx('team-row__status', member.status === 'Invited' && 'is-invited')}>
                    <span /> {member.status}
                  </span>
                  {isLead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast(`Role controls are mocked for ${member.name.split(' ')[0]}.`, 'info')}
                    >
                      Manage
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="settings-note">
              <Workflow size={16} />
              <p>
                <strong>3-Stage Governance Hierarchy:</strong><br />
                <strong>1. Brand Owner / Lead:</strong> Exclusive authority to create workspaces, publish guidelines, verify users, and define thresholds.<br />
                <strong>2. Reviewer / Higher-up:</strong> Audits submissions, verifies guideline evidence, and approves or requests changes.<br />
                <strong>3. Team Member / Employee:</strong> Assigned to approved workspaces, runs pre-flight checks, and submits drafts. Cannot create or configure workspaces.
              </p>
            </div>
          </Panel>

          <Panel className="settings-section" id="role-visibility">
            <SectionHead
              title="Role Viewability & Permission Governance"
              description="Brand Owner controls: Determine exactly which screens, queues, and intelligence modules are visible to Reviewers (Admins) vs Team Members."
              action={<ShieldAlert size={18} className="settings-section__icon" />}
            />
            <div style={{ marginBottom: '16px', padding: '12px 14px', background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={16} color="var(--ink)" />
                <span style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                  <strong>Owner Power:</strong> You have absolute governance authority to toggle visibility. Toggles take effect live across workspace navigation and route access.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Reviewer / Admin Visibility */}
              <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px', marginBottom: '12px' }}>
                  <div>
                    <strong style={{ fontSize: '13.5px', display: 'block', color: 'var(--ink)' }}>Stage 2 · Reviewer (Admin)</strong>
                    <small style={{ color: 'var(--muted)', fontSize: '11px' }}>Compliance, audits &amp; approvals</small>
                  </div>
                  <span style={{ fontSize: '11px', background: 'var(--sage-soft)', color: 'var(--sage-deep)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Reviewer Access</span>
                </div>
                <div className="toggle-stack toggle-stack--flush">
                  <ToggleRow
                    label="Executive Overview"
                    description="Access executive dashboard scores and volume metrics."
                    checked={visibilitySettings?.admin?.overview ?? true}
                    onChange={(val) => updateRoleVisibility('admin', 'overview', val)}
                  />
                  <ToggleRow
                    label="Creator Studio"
                    description="Allow direct access to authoring and pre-flight suite."
                    checked={visibilitySettings?.admin?.studio ?? true}
                    onChange={(val) => updateRoleVisibility('admin', 'studio', val)}
                  />
                  <ToggleRow
                    label="Reviews Queue"
                    description="Audit desk, filter all incoming pieces, and review history."
                    checked={visibilitySettings?.admin?.reviews ?? true}
                    onChange={(val) => updateRoleVisibility('admin', 'reviews', val)}
                  />
                  <ToggleRow
                    label="Calendar"
                    description="Content release and review schedule deadlines."
                    checked={visibilitySettings?.admin?.calendar ?? true}
                    onChange={(val) => updateRoleVisibility('admin', 'calendar', val)}
                  />
                  <ToggleRow
                    label="Guidelines Library"
                    description="Inspect and reference live brand rules."
                    checked={visibilitySettings?.admin?.guidelines ?? true}
                    onChange={(val) => updateRoleVisibility('admin', 'guidelines', val)}
                  />
                  <ToggleRow
                    label="Brand Assets"
                    description="Typography, palettes, logos, and approved tokens."
                    checked={visibilitySettings?.admin?.assets ?? true}
                    onChange={(val) => updateRoleVisibility('admin', 'assets', val)}
                  />
                  <ToggleRow
                    label="Governance Insights"
                    description="Heatmaps, issue distribution, and repeated violations."
                    checked={visibilitySettings?.admin?.insights ?? true}
                    onChange={(val) => updateRoleVisibility('admin', 'insights', val)}
                  />
                </div>
              </div>

              {/* Team Member Visibility */}
              <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px', marginBottom: '12px' }}>
                  <div>
                    <strong style={{ fontSize: '13.5px', display: 'block', color: 'var(--ink)' }}>Stage 3 · Team Member</strong>
                    <small style={{ color: 'var(--muted)', fontSize: '11px' }}>Content authoring &amp; pre-flight checks</small>
                  </div>
                  <span style={{ fontSize: '11px', background: 'var(--cream)', color: 'var(--ink-soft)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>Member Access</span>
                </div>
                <div className="toggle-stack toggle-stack--flush">
                  <ToggleRow
                    label="Personal Overview"
                    description="View personal submission scorecard and progress."
                    checked={visibilitySettings?.member?.overview ?? true}
                    onChange={(val) => updateRoleVisibility('member', 'overview', val)}
                  />
                  <ToggleRow
                    label="Creator Studio"
                    description="Access Creator Studio editor and instant pre-flight checks."
                    checked={visibilitySettings?.member?.studio ?? true}
                    onChange={(val) => updateRoleVisibility('member', 'studio', val)}
                  />
                  <ToggleRow
                    label="My Submissions Queue"
                    description="View status and feedback on their own submitted pieces."
                    checked={visibilitySettings?.member?.reviews ?? true}
                    onChange={(val) => updateRoleVisibility('member', 'reviews', val)}
                  />
                  <ToggleRow
                    label="Editorial Calendar"
                    description="Visibility into upcoming launch deadlines and campaign dates."
                    checked={visibilitySettings?.member?.calendar ?? false}
                    onChange={(val) => updateRoleVisibility('member', 'calendar', val)}
                  />
                  <ToggleRow
                    label="Guidelines Library"
                    description="Reference brand guidelines for tone, lexicon, and claims."
                    checked={visibilitySettings?.member?.guidelines ?? true}
                    onChange={(val) => updateRoleVisibility('member', 'guidelines', val)}
                  />
                  <ToggleRow
                    label="Brand Assets"
                    description="Download approved logos, palette tokens, and typography."
                    checked={visibilitySettings?.member?.assets ?? true}
                    onChange={(val) => updateRoleVisibility('member', 'assets', val)}
                  />
                  <ToggleRow
                    label="Governance Insights"
                    description="Access high-level analytics, violation heatmaps, and trends."
                    checked={visibilitySettings?.member?.insights ?? false}
                    onChange={(val) => updateRoleVisibility('member', 'insights', val)}
                  />
                  <ToggleRow
                    label="Workspace Settings"
                    description="Allow team member to inspect workspace configuration."
                    checked={visibilitySettings?.member?.settings ?? false}
                    onChange={(val) => updateRoleVisibility('member', 'settings', val)}
                  />
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="settings-section" id="ai-disclosure">
            <SectionHead
              title="AI Transparency &amp; Confidentiality"
              description="Privacy controls, zero-retention guarantees, and ethical AI disclosures."
              action={<ShieldCheck size={18} className="settings-section__icon" />}
            />
            <div className="toggle-stack toggle-stack--flush">
              <ToggleRow
                label="Zero Data Retention (ZDR)"
                description="Content evaluated in Klarity is never used for training foundational models or retained by third parties."
                checked={settings.zeroDataRetention ?? true}
                onChange={(value) => update('zeroDataRetention', value)}
              />
              <ToggleRow
                label="Confidential Material Masking"
                description="Automatically redact unreleased codenames, customer PII, and financial figures before pre-flight analysis."
                checked={settings.confidentialMasking ?? true}
                onChange={(value) => update('confidentialMasking', value)}
              />
              <ToggleRow
                label="Disclose AI Review Watermark"
                description="Clearly disclose on review reports that content was evaluated with Klarity's hybrid rule-based and AI pipeline."
                checked={settings.discloseAi ?? true}
                onChange={(value) => update('discloseAi', value)}
              />
            </div>
            <div className="settings-note">
              <ShieldCheck size={16} />
              <p>
                <strong>Architecture Disclosure:</strong> Klarity uses a hybrid evaluation engine combining deterministic AST rule-checking (for terminology, facts, and WCAG accessibility) with localized RAG for tone nuances. All decisions remain strictly human-controlled.
              </p>
            </div>
          </Panel>

          <div className="settings-foot">
            <div>
              <Mail size={15} />
              <span>Questions? The workspace owner is {currentUser}.</span>
            </div>
            <span className="settings-foot__version">
              <Clock3 size={14} /> Klarity v0.1 · demo
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
