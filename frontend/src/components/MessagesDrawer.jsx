import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  AtSign,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Inbox,
  Mail,
  MessageSquare,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { Avatar, Button, IconButton, Tabs } from './UI'
import { BrandMark } from './BrandMark'
import { cx, timeAgo } from '../lib/utils'

const INITIAL_THREADS = [
  {
    id: 'msg-1',
    actor: 'Maya Lin',
    role: 'Brand Director',
    time: '14 minutes ago',
    subject: 'Spring Collection Launch Plate',
    submissionId: 1,
    avatar: 'Maya Lin',
    unread: true,
    preview:
      "Loved the organic sage tone! Just swap 'seamless' out for 'considered' before we syndicate to retail partners.",
    status: 'Action required',
  },
  {
    id: 'msg-2',
    actor: 'Elena Shaw',
    role: 'ESG & Compliance Lead',
    time: '2 hours ago',
    subject: 'Linen Care Primer v2',
    submissionId: 2,
    avatar: 'Elena Shaw',
    unread: false,
    preview:
      'Please attach the Oeko-Tex Standard 100 cert ID (#49182) so the compliance scanner passes at 100%.',
    status: 'Changes requested',
  },
  {
    id: 'msg-3',
    actor: 'Klarity Pre-Flight Bot',
    role: 'Automated Governance',
    time: '5 hours ago',
    subject: 'Ceramic Glaze Lookbook',
    submissionId: 3,
    avatar: 'Bot',
    unread: false,
    preview:
      'Automated scan passed with 94/100. All visual token ratios and lexicon rules are verified.',
    status: 'Pre-flight passed',
  },
]

export function MessagesDrawer({ open, onClose, toast }) {
  const [activeTab, setActiveTab] = useState('inbox')
  const [threads, setThreads] = useState(INITIAL_THREADS)
  const [activeThreadId, setActiveThreadId] = useState('msg-1')
  const [replyText, setReplyText] = useState('')

  if (!open) return null

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0]

  const handleSendReply = (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    toast?.('Reply sent to ' + activeThread.actor, 'good')
    setReplyText('')
  }

  const markAllRead = () => {
    setThreads((prev) => prev.map((t) => ({ ...t, unread: false })))
    toast?.('All messages marked as read.', 'good')
  }

  return (
    <div className="messages-overlay" onClick={onClose}>
      <aside
        className="messages-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Messages and Email notifications"
      >
        {/* Drawer Header */}
        <header className="messages-drawer__head">
          <div className="messages-drawer__title">
            <Mail size={18} />
            <div>
              <h3>Editorial Messages &amp; Mail</h3>
              <p>Direct reviewer feedback and email dispatch previews.</p>
            </div>
          </div>
          <IconButton label="Close messages" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </header>

        {/* Tab Controls */}
        <div className="messages-drawer__tabs-wrap">
          <Tabs
            label="Message views"
            value={activeTab}
            onChange={setActiveTab}
            options={[
              {
                value: 'inbox',
                label: 'Inbox & Feedback',
                count: threads.filter((t) => t.unread).length || undefined,
              },
              { value: 'email', label: 'Email Dispatch Specimen' },
            ]}
          />
        </div>

        {/* Tab 1: Inbox and direct conversation */}
        {activeTab === 'inbox' && (
          <div className="messages-inbox-view">
            <div className="messages-inbox-head">
              <span className="inbox-count">
                <strong>{threads.length}</strong> active review threads
              </span>
              <button type="button" className="btn-text" onClick={markAllRead}>
                Mark all as read
              </button>
            </div>

            <div className="messages-thread-list">
              {threads.map((item) => (
                <div
                  key={item.id}
                  className={cx(
                    'message-item',
                    activeThreadId === item.id && 'is-selected',
                    item.unread && 'is-unread',
                  )}
                  onClick={() => setActiveThreadId(item.id)}
                >
                  <Avatar name={item.avatar} size="md" />
                  <div className="message-item__copy">
                    <div className="message-item__top">
                      <strong>{item.actor}</strong>
                      <small>{item.time}</small>
                    </div>
                    <span className="message-item__subject">{item.subject}</span>
                    <p className="message-item__preview">{item.preview}</p>
                    <span className="message-item__tag">{item.status}</span>
                  </div>
                  {item.unread && <span className="message-unread-dot" />}
                </div>
              ))}
            </div>

            {/* Conversation Active Card */}
            {activeThread && (
              <div className="messages-conversation-card">
                <div className="convo-head">
                  <div className="convo-author">
                    <Avatar name={activeThread.avatar} size="sm" />
                    <div>
                      <strong>{activeThread.actor}</strong>
                      <small>{activeThread.role}</small>
                    </div>
                  </div>
                  <Link
                    to={`/reviews/${activeThread.submissionId}`}
                    onClick={onClose}
                    className="convo-open-link"
                  >
                    Open Review Report <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="convo-bubble">
                  <p>{activeThread.preview}</p>
                  <span className="convo-time">{activeThread.time}</span>
                </div>

                {/* Quick Reply Form */}
                <form className="convo-reply-form" onSubmit={handleSendReply}>
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${activeThread.actor.split(' ')[0]}...`}
                    className="convo-input"
                  />
                  <Button type="submit" size="sm" icon={Send} disabled={!replyText.trim()}>
                    Send
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Transactional Email Notification Specimen */}
        {activeTab === 'email' && (
          <div className="messages-email-specimen-view">
            <div className="email-meta-bar">
              <span className="email-meta-label">DISPATCH SPECIMEN</span>
              <span className="email-meta-sub">Standard Transactional Notification (RFC 5322)</span>
            </div>

            <div className="email-card">
              {/* Email Envelope Header */}
              <div className="email-card__envelope">
                <div className="email-card__row">
                  <span className="email-card__key">From:</span>
                  <span className="email-card__val">
                    Aster &amp; Oak Klarity Desk &lt;governance@klarity.asterandoak.com&gt;
                  </span>
                </div>
                <div className="email-card__row">
                  <span className="email-card__key">To:</span>
                  <span className="email-card__val">creator@asterandoak.com</span>
                </div>
                <div className="email-card__row">
                  <span className="email-card__key">Subject:</span>
                  <strong className="email-card__val email-card__val--subject">
                    [Action Required] Review Report: Spring Collection Launch Plate (Score 84/100)
                  </strong>
                </div>
              </div>

              {/* Email Body Content */}
              <div className="email-card__body">
                <div className="email-brand-strip">
                  <BrandMark size={28} />
                  <span className="email-brand-name">Aster &amp; Oak · Klarity Desk</span>
                </div>

                <div className="email-hero-message">
                  <h2>Editorial Feedback Ready</h2>
                  <p>
                    Your draft <strong>Spring Collection Launch Plate</strong> was evaluated by brand
                    director Maya Lin and the automated governance pipeline.
                  </p>
                </div>

                {/* Score Pill in Email */}
                <div className="email-score-banner">
                  <div className="email-score-box">
                    <span className="email-score-large">84</span>
                    <span className="email-score-denom">/100</span>
                  </div>
                  <div>
                    <span className="email-status-pill">2 Terms Require Adjustment</span>
                    <p className="email-status-note">
                      Voice &amp; Tone is 98% consistent. Two lexicon terms need correction.
                    </p>
                  </div>
                </div>

                {/* Flagged Items */}
                <div className="email-flags-box">
                  <h4>Flagged in your draft:</h4>
                  <ul>
                    <li>
                      <span className="flag-dot dot--orange" />
                      <strong>&quot;seamless&quot;</strong> — Flagged buzzword. Replace with
                      &quot;considered&quot; or &quot;meticulous&quot;.
                    </li>
                    <li>
                      <span className="flag-dot dot--red" />
                      <strong>&quot;eco-friendly&quot;</strong> — Unsubstantiated ESG claim. Requires
                      third-party certification or specific material name.
                    </li>
                  </ul>
                </div>

                {/* Reviewer Note */}
                <div className="email-reviewer-quote">
                  <div className="email-reviewer-quote__head">
                    <Avatar name="Maya Lin" size="xs" />
                    <strong>Maya Lin (Brand Director) noted:</strong>
                  </div>
                  <blockquote>
                    &quot;Overall the sensory rhythm and tone feel right at home. Once those two words
                    are updated, I&apos;ll sign off on publication immediately.&quot;
                  </blockquote>
                </div>

                {/* Email Call to Action */}
                <div className="email-cta-wrap">
                  <Link
                    to="/reviews/1"
                    onClick={onClose}
                    className="email-btn-cta"
                  >
                    Open Review Desk in Klarity &rarr;
                  </Link>
                  <small className="email-cta-sub">
                    Direct workspace link valid for authenticated team members.
                  </small>
                </div>

                <div className="email-footer-legal">
                  <p>Aster &amp; Oak Brand Governance Desk · 42 Artisan Row, Portland OR</p>
                  <p>
                    You received this transactional dispatch because your account is assigned to
                    editorial submissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
