import { useEffect, useState } from 'react'
import {
  Bell,
  Check,
  Clock3,
  Globe,
  Mail,
  Plus,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  Users,
  Workflow,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Avatar, Button, Field, Panel, SectionHead, Select } from '../components/UI'
import { cx } from '../lib/utils'

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

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="toggle-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={cx('switch', checked && 'is-on')}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  )
}

export function Settings() {
  const { toast, currentUser } = useApp()
  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setSettings({ ...defaultSettings, ...JSON.parse(stored) })
    } catch {
      // ignore malformed local settings
    }
  }, [])

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
            {saved ? <><Check size={14} /> Saved locally</> : 'Demo workspace settings'}
          </span>
          <Button icon={Save} onClick={save}>
            Save changes
          </Button>
        </div>
      </section>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <a href="#workspace"><Globe size={15} /> Workspace</a>
          <a href="#review-defaults"><SlidersHorizontal size={15} /> Review defaults</a>
          <a href="#notifications"><Bell size={15} /> Notifications</a>
          <a href="#team"><Users size={15} /> Team</a>
        </nav>

        <div className="settings-content">
          <Panel className="settings-section" id="workspace">
            <SectionHead
              title="Workspace"
              description="The identity and defaults attached to every review."
              action={<Globe size={18} className="settings-section__icon" />}
            />
            <div className="settings-form">
              <Field label="Workspace name" htmlFor="workspace-name">
                <input
                  id="workspace-name"
                  value={settings.workspace}
                  onChange={(event) => update('workspace', event.target.value)}
                />
              </Field>
              <div className="form-row form-row--two">
                <Field label="Brand site" htmlFor="workspace-site">
                  <input
                    id="workspace-site"
                    value={settings.website}
                    onChange={(event) => update('website', event.target.value)}
                  />
                </Field>
                <Field label="Timezone" htmlFor="workspace-timezone">
                  <Select
                    id="workspace-timezone"
                    value={settings.timezone}
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
              <Field label="Default reviewer" htmlFor="workspace-reviewer" hint="New submissions are routed here first.">
                <Select
                  id="workspace-reviewer"
                  value={settings.defaultReviewer}
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
              action={<ShieldCheck size={18} className="settings-section__icon" />}
            />
            <div className="settings-form">
              <Field
                label="Publish threshold"
                htmlFor="workspace-threshold"
                hint="A piece below this score needs a reviewer decision before it can be approved."
              >
                <div className="threshold-field">
                  <input
                    id="workspace-threshold"
                    type="range"
                    min="60"
                    max="95"
                    value={settings.threshold}
                    onChange={(event) => update('threshold', event.target.value)}
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
                  onChange={(value) => update('autoAssign', value)}
                />
                <ToggleRow
                  label="Require evidence on critical findings"
                  description="A blocking issue cannot be overridden without a cited guideline or source."
                  checked={settings.requireEvidence}
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
              title="Team"
              description="Roles decide who can approve, reject, and publish guidelines."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={UserPlus}
                  onClick={() => toast('Invites are mocked in this local demo.', 'info')}
                >
                  Invite member
                </Button>
              }
            />
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast(`Role controls are mocked for ${member.name.split(' ')[0]}.`, 'info')}
                  >
                    Manage
                  </Button>
                </div>
              ))}
            </div>
            <div className="settings-note">
              <Workflow size={16} />
              <p>
                <strong>3-Stage Governance Hierarchy:</strong><br />
                <strong>1. Brand Owner:</strong> Holds final approval authority, publishes guidelines, and manages workspace settings.<br />
                <strong>2. Reviewer:</strong> Audits submissions, verifies guideline evidence, and requests changes.<br />
                <strong>3. Team Member:</strong> Drafts content, runs pre-flight checks, and submits pieces for review.
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
