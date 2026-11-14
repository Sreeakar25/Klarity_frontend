import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Lock,
  Play,
  RotateCcw,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { BrandMark } from '../components/BrandMark'
import { AnimatedValue } from '../components/AnimatedValue'

export function Hero() {
  const navigate = useNavigate()
  const [fixedTerm, setFixedTerm] = useState(false)
  const [activeTab, setActiveTab] = useState('review')

  return (
    <div className="hero-page">
      {/* Top Navigation */}
      <header className="hero-nav">
        <div className="hero-nav__inner">
          <Link to="/hero" className="hero-brand">
            <BrandMark size={32} />
            <div className="hero-brand__copy">
              <span className="hero-brand__name">Klarity</span>
              <span className="hero-brand__badge">Intelligence</span>
            </div>
          </Link>

          <nav className="hero-nav__links">
            <a href="#features">Features</a>
            <a href="#demo">Live Demo</a>
            <a href="#governance">Governance</a>
            <a href="#metrics">Impact</a>
          </nav>

          <div className="hero-nav__actions">
            <Link to="/login" className="hero-btn hero-btn--primary">
              <Lock size={14} />
              <span>Enterprise Sign In</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Header */}
      <section className="hero-masthead">
        <div className="hero-masthead__glow" aria-hidden="true" />
        <div className="hero-container hero-masthead__content">
          <h1 className="hero-title">
            Professional Brand Intelligence <br className="hero-title__br" />
            for Modern Enterprises<span className="hero-accent">.</span>
          </h1>

          <p className="hero-subtitle">
            Autonomous brand governance that eliminates voice drift before it publishes.
            Real-time copy auditing, visual asset compliance, and approved lexicon enforcement
            across every marketing touchpoint.
          </p>

          <div className="hero-cta-group">
            <Link to="/login" className="hero-btn hero-btn--lg hero-btn--primary">
              <Lock size={16} />
              <span>Enterprise Sign In</span>
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="hero-proof-strip">
            <span className="hero-proof-item">
              <CheckCircle2 size={14} /> No browser plugins required
            </span>
            <span className="hero-proof-divider" />
            <span className="hero-proof-item">
              <ShieldCheck size={14} /> SOC2 Type II &amp; ISO 27001
            </span>
            <span className="hero-proof-divider" />
            <span className="hero-proof-item">
              <Zap size={14} /> Instant REST API &amp; Webhooks
            </span>
          </div>
        </div>

        {/* Live Interactive Product Plate (Stitch Mockup) */}
        <div className="hero-container hero-plate-container" id="demo">
          <div className="hero-plate">
            <div className="hero-plate__topbar">
              <div className="hero-plate__dots">
                <span />
                <span />
                <span />
              </div>
              <div className="hero-plate__url">
                <Lock size={11} />
                <span>klarity.ai/workspace/aster-oak/review-desk</span>
              </div>
              <div className="hero-plate__status">
                <span className="hero-plate__status-dot" />
                <span>AI Governance Engine Active</span>
              </div>
            </div>

            <div className="hero-plate__body">
              {/* Left: Copy Audit Interactive Pane */}
              <div className="hero-plate__editor">
                <div className="hero-plate__pane-head">
                  <div className="hero-plate__pane-title">
                    <FileText size={15} />
                    <strong>Spring Campaign Launch Plate</strong>
                    <span className="hero-plate__tag">v1.4 draft</span>
                  </div>
                  <button
                    type="button"
                    className="hero-plate__reset-btn"
                    onClick={() => setFixedTerm((v) => !v)}
                  >
                    <RotateCcw size={13} />
                    <span>{fixedTerm ? 'Reset Sample' : 'Auto-Fix With Lexicon'}</span>
                  </button>
                </div>

                <div className="hero-plate__content-box">
                  <p>
                     Aster &amp; Oak creates thoughtful homeware with an organic sage aesthetic. Our
                    new collection delivers{' '}
                    {fixedTerm ? (
                      <mark className="hero-highlight hero-highlight--approved">
                        effortless cohesion
                        <span className="hero-tooltip">✓ Approved replacement for buzzword</span>
                      </mark>
                    ) : (
                      <mark className="hero-highlight hero-highlight--warn">
                        seamless
                        <span className="hero-tooltip">⚠️ Flagged term: overused buzzword (90d max: 12)</span>
                      </mark>
                    )}{' '}
                    craftsmanship across both digital and physical living environments.
                  </p>
                  <p>
                    Every vessel is fired in small batches to maintain{' '}
                    {fixedTerm ? (
                      <mark className="hero-highlight hero-highlight--approved">
                        responsibly sourced
                        <span className="hero-tooltip">✓ Verified claim with documentation</span>
                      </mark>
                    ) : (
                      <mark className="hero-highlight hero-highlight--danger">
                        eco-friendly
                        <span className="hero-tooltip">🚫 Unsubstantiated ESG claim (legal requirement #14)</span>
                      </mark>
                    )}{' '}
                    integrity without compromise.
                  </p>
                </div>

                <div className="hero-plate__editor-foot">
                  <div className="hero-plate__word-count">
                    <span>Word count: 54 words</span>
                    <span>·</span>
                    <span>Reading time: 14 sec</span>
                  </div>
                  <div className="hero-plate__audit-pills">
                    <span className="hero-audit-pill hero-audit-pill--good">Tone: 94% Calm</span>
                    <span className="hero-audit-pill hero-audit-pill--clay">
                      {fixedTerm ? '0 Warnings' : '2 Warnings'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Live Intelligence Sidebar */}
              <div className="hero-plate__sidebar">
                <div className="hero-plate__score-card">
                  <span className="hero-score-label">Brand Health Score</span>
                  <div className="hero-score-num">
                    <AnimatedValue value={fixedTerm ? 96 : 84} />
                    <small>/100</small>
                  </div>
                  <div className="hero-score-bar">
                    <div
                      className="hero-score-bar__fill"
                      style={{ width: `${fixedTerm ? 96 : 84}%` }}
                    />
                  </div>
                  <p className="hero-score-note">
                    {fixedTerm
                      ? '✨ 100% compliant with Aster & Oak voice guidelines.'
                      : '2 terms require team sign-off before publishing.'}
                  </p>
                </div>

                <div className="hero-plate__rules">
                  <span className="hero-rules-head">Category Breakdown</span>
                  <div className="hero-rule-row">
                    <span>Voice &amp; Tone</span>
                    <strong className="text-good">98%</strong>
                  </div>
                  <div className="hero-rule-row">
                    <span>Terminology</span>
                    <strong className={fixedTerm ? 'text-good' : 'text-clay'}>
                      {fixedTerm ? '96%' : '74%'}
                    </strong>
                  </div>
                  <div className="hero-rule-row">
                    <span>ESG &amp; Legal</span>
                    <strong className={fixedTerm ? 'text-good' : 'text-danger'}>
                      {fixedTerm ? '95%' : '68%'}
                    </strong>
                  </div>
                  <div className="hero-rule-row">
                    <span>Visual Consistency</span>
                    <strong className="text-good">99%</strong>
                  </div>
                </div>

                <Link to="/" className="hero-plate__cta">
                  <span>Open Full Review Desk</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="hero-metrics-section" id="metrics">
        <div className="hero-container">
          <div className="hero-metrics-grid">
            <div className="hero-metric-card">
              <span className="hero-metric-number">
                <AnimatedValue value={85} suffix="%" />
              </span>
              <strong className="hero-metric-title">Faster Review Velocity</strong>
              <p className="hero-metric-desc">
                Reduce manual compliance reviews from days to minutes with continuous background auditing.
              </p>
            </div>

            <div className="hero-metric-card">
              <span className="hero-metric-number">
                <AnimatedValue value={14} suffix="k+" />
              </span>
              <strong className="hero-metric-title">Pieces Governed</strong>
              <p className="hero-metric-desc">
                High-volume social, web, email, and packaging assets validated with zero drift.
              </p>
            </div>

            <div className="hero-metric-card">
              <span className="hero-metric-number">
                <AnimatedValue value={99} suffix=".4%" />
              </span>
              <strong className="hero-metric-title">Lexicon Fidelity</strong>
              <p className="hero-metric-desc">
                Consistently enforce approved terminology, banned buzzwords, and legal disclaimers.
              </p>
            </div>

            <div className="hero-metric-card">
              <span className="hero-metric-number">
                <AnimatedValue value={0} />
              </span>
              <strong className="hero-metric-title">Stale Assets in Prod</strong>
              <p className="hero-metric-desc">
                Centralized token library prevents outdated logos, deprecated palettes, and old slogans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Features Section */}
      <section className="hero-features-section" id="features">
        <div className="hero-container">
          <div className="hero-section-head">
            <span className="hero-section-pill">Intelligence Stack</span>
            <h2 className="hero-section-title">Built for Calm, Certain Brand Governance</h2>
            <p className="hero-section-sub">
              Everything your brand, creative, and legal teams need to move fast without losing control.
            </p>
          </div>

          <div className="hero-bento-grid">
            <div className="hero-bento-card hero-bento-card--large">
              <div className="hero-bento-icon">
                <Shield size={24} />
              </div>
              <h3>Autonomous Voice Guardrails</h3>
              <p>
                Continuous natural language auditing detects off-brand adjectives, passive sentence
                structures, and rogue marketing speak before work reaches creative leadership.
              </p>
              <div className="hero-bento-visual hero-bento-visual--tags">
                <span className="bento-tag bento-tag--good">✓ Calm &amp; Considered</span>
                <span className="bento-tag bento-tag--good">✓ Editorial Warmth</span>
                <span className="bento-tag bento-tag--bad">✕ Hyperbolic claims</span>
                <span className="bento-tag bento-tag--bad">✕ Unverified jargon</span>
              </div>
            </div>

            <div className="hero-bento-card">
              <div className="hero-bento-icon">
                <BookOpen size={24} />
              </div>
              <h3>Live Brand Guidelines</h3>
              <p>
                Interactive, machine-readable rule sets that live directly in the reviewer's flow.
                No 80-page static PDFs lost in Drive.
              </p>
            </div>

            <div className="hero-bento-card">
              <div className="hero-bento-icon">
                <FileCheck2 size={24} />
              </div>
              <h3>Live Asset Previews</h3>
              <p>
                Direct token binding for SVG campaign plates, typography lockups, and social templates.
                Always verified against source hexes.
              </p>
            </div>

            <div className="hero-bento-card hero-bento-card--large">
              <div className="hero-bento-icon">
                <Scale size={24} />
              </div>
              <h3>Automated Review Desk &amp; Sign-Offs</h3>
              <p>
                Triage incoming submissions, assign severity tags (blocking, warning, note), and export
                annotated brand audit reports with one click.
              </p>
              <div className="hero-bento-visual hero-bento-visual--stats">
                <div className="bento-stat">
                  <strong>12 min</strong>
                  <span>Avg turnaround</span>
                </div>
                <div className="bento-stat">
                  <strong>100%</strong>
                  <span>Audit trail logged</span>
                </div>
                <div className="bento-stat">
                  <strong>REST API</strong>
                  <span>Seamless CI/CD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="hero-bottom-cta">
        <div className="hero-container">
          <div className="hero-cta-box">
            <BrandMark size={48} />
            <h2>Ready to Elevate Your Brand Governance?</h2>
            <p>
              Experience Klarity’s calm editorial review desk. Explore the interactive workspace
              or connect with your enterprise team.
            </p>
            <div className="hero-cta-buttons">
              <Link to="/login" className="hero-btn hero-btn--lg hero-btn--primary">
                <Lock size={16} />
                <span>Enterprise Sign In</span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hero-footer">
        <div className="hero-container hero-footer__inner">
          <div className="hero-footer__brand">
            <BrandMark size={28} />
            <span>Klarity</span>
            <small>© 2026 Klarity Intelligence Inc. All rights reserved.</small>
          </div>
          <div className="hero-footer__links">
            <Link to="/login">Enterprise Sign In</Link>
            <Link to="/reviews">Reviews</Link>
            <Link to="/guidelines">Guidelines</Link>
            <Link to="/assets">Brand Assets</Link>
            <Link to="/login">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
