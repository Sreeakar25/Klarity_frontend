import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileText,
  Layers,
  RotateCcw,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { BrandMark } from '../components/BrandMark'

export function Hero() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const [applied, setApplied] = useState(false)
  const [scoreDisplay, setScoreDisplay] = useState(84)
  const scoreObj = useRef({ val: 84 })

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.hero-tagline', {
        opacity: 0,
        y: -10,
        duration: 0.5,
      })
        .from(
          '.hero-title',
          {
            opacity: 0,
            y: 20,
            duration: 0.7,
          },
          '-=0.3'
        )
        .from(
          '.hero-subtitle',
          {
            opacity: 0,
            y: 16,
            duration: 0.6,
          },
          '-=0.4'
        )
        .from(
          '.hero-cta-group',
          {
            opacity: 0,
            y: 12,
            duration: 0.5,
          },
          '-=0.4'
        )
        .from(
          '.hero-proof-strip',
          {
            opacity: 0,
            y: 10,
            duration: 0.4,
          },
          '-=0.3'
        )
        .from(
          '.hero-plate',
          {
            opacity: 0,
            y: 28,
            scale: 0.985,
            duration: 0.8,
          },
          '-=0.2'
        )
        .from(
          '.hero-pillar-card',
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.12,
          },
          '-=0.3'
        )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const handleToggle = () => {
    const nextState = !applied
    setApplied(nextState)
    const targetScore = nextState ? 98 : 84

    gsap.to(scoreObj.current, {
      val: targetScore,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        setScoreDisplay(Math.round(scoreObj.current.val))
      },
    })

    gsap.fromTo(
      '.hero-plate__content-box',
      { backgroundColor: nextState ? 'rgba(41, 142, 228, 0.04)' : 'rgba(184, 91, 53, 0.04)' },
      { backgroundColor: 'var(--paper)', duration: 0.5, ease: 'power2.out' }
    )
  }

  return (
    <div className="hero-page" ref={heroRef}>
      {/* Top Navigation */}
      <header className="hero-nav">
        <div className="hero-nav__inner">
          <Link to="/hero" className="hero-brand">
            <BrandMark size={32} />
            <div className="hero-brand__copy">
              <span className="hero-brand__name">Klarity</span>
              <span className="hero-brand__label">Editorial Brand Intelligence</span>
            </div>
          </Link>

          <nav className="hero-nav__links">
            <a href="#proof-desk">Review Desk</a>
            <a href="#pillars">Architecture</a>
            <Link to="/guidelines">Guidelines</Link>
            <Link to="/assets">Assets</Link>
          </nav>

          <div className="hero-nav__actions">
            <Link to="/reviews" className="hero-btn hero-btn--sm hero-btn--primary">
              <span>Open Workspace</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Masthead */}
      <section className="hero-masthead">
        <div className="hero-container hero-masthead__content">
          <div className="hero-tagline">
            <span className="hero-tagline__dot" aria-hidden="true" />
            <span>Brand Intelligence &amp; Editorial Verification</span>
          </div>

          <h1 className="hero-title">
            Brand rules that live inside the work, <br className="hero-title__br" />
            not in an 80-page PDF<span className="hero-accent">.</span>
          </h1>

          <p className="hero-subtitle">
            Klarity evaluates copy, digital surfaces, and creative assets against live guidelines before
            publishing. Line-by-line inspection, verified claim substantiation, and token-bound design fidelity.
          </p>

          <div className="hero-cta-group">
            <a href="#proof-desk" className="hero-btn hero-btn--lg hero-btn--primary">
              <span>Inspect Live Proof Desk</span>
              <ArrowRight size={16} />
            </a>
            <Link to="/guidelines" className="hero-btn hero-btn--lg hero-btn--secondary">
              <BookOpen size={16} />
              <span>Explore Guidelines</span>
            </Link>
          </div>

          <div className="hero-proof-strip">
            <div className="hero-proof-item">
              <CheckCircle2 size={14} />
              <span>Live Tone &amp; Lexicon Verification</span>
            </div>
            <span className="hero-proof-divider" />
            <div className="hero-proof-item">
              <CheckCircle2 size={14} />
              <span>ESG &amp; Legal Claim Substantiation</span>
            </div>
            <span className="hero-proof-divider" />
            <div className="hero-proof-item">
              <CheckCircle2 size={14} />
              <span>Token-Bound Palette &amp; Specimen Rules</span>
            </div>
          </div>
        </div>

        {/* Centerpiece: Real Editorial Proof Desk */}
        <div className="hero-container hero-plate-container" id="proof-desk">
          <div className="hero-plate">
            <div className="hero-plate__topbar">
              <div className="hero-plate__doc-info">
                <FileText size={15} />
                <span className="hero-plate__doc-title">Aster &amp; Oak · Spring Collection Launch Plate</span>
                <span className="hero-plate__doc-channel">Web Editorial · v1.4</span>
              </div>

              <div className="hero-plate__topbar-right">
                <button
                  type="button"
                  className={`hero-plate__toggle-btn ${applied ? 'hero-plate__toggle-btn--active' : ''}`}
                  onClick={handleToggle}
                  aria-pressed={applied}
                >
                  <RotateCcw size={13} />
                  <span>{applied ? 'Revert to Flagged Draft' : 'Apply Guideline Rules'}</span>
                </button>
              </div>
            </div>

            <div className="hero-plate__body">
              {/* Left Pane: Copy Specimen */}
              <div className="hero-plate__editor">
                <div className="hero-plate__pane-head">
                  <div className="hero-plate__pane-meta">
                    <span className="hero-plate__channel-indicator">Draft Copy Specimen</span>
                    <span className="hero-plate__meta-tags">
                      {applied ? '✓ 0 issues detected' : '⚠️ 2 issues flagged'}
                    </span>
                  </div>
                  <div className="hero-plate__legend">
                    <span className="hero-legend-dot hero-legend-dot--warn" /> Flagged Buzzword
                    <span className="hero-legend-dot hero-legend-dot--danger" /> Unverified Claim
                  </div>
                </div>

                <div className="hero-plate__content-box">
                  <p>
                    Aster &amp; Oak creates thoughtful homeware with an organic sage aesthetic. Our
                    new collection delivers{' '}
                    {applied ? (
                      <mark className="hero-highlight hero-highlight--approved">
                        effortless cohesion
                        <span className="hero-tooltip">✓ Approved: Aster &amp; Oak Calm Tone spec</span>
                      </mark>
                    ) : (
                      <mark className="hero-highlight hero-highlight--warn">
                        seamless
                        <span className="hero-tooltip">⚠️ Flagged: Overused buzzword per Voice Guide §3.1</span>
                      </mark>
                    )}{' '}
                    craftsmanship across both digital and physical living environments.
                  </p>
                  <p>
                    Every vessel is fired in small batches to maintain{' '}
                    {applied ? (
                      <mark className="hero-highlight hero-highlight--approved">
                        responsibly sourced and documented
                        <span className="hero-tooltip">✓ Approved: Verified claim against FSC Certificate #2026-B</span>
                      </mark>
                    ) : (
                      <mark className="hero-highlight hero-highlight--danger">
                        eco-friendly
                        <span className="hero-tooltip">🚫 Flagged: Unsubstantiated ESG claim per legal guide</span>
                      </mark>
                    )}{' '}
                    integrity without compromise.
                  </p>
                </div>

                <div className="hero-plate__editor-foot">
                  <div className="hero-plate__word-count">
                    <span>Length: 54 words</span>
                    <span>·</span>
                    <span>Reading time: 14 sec</span>
                    <span>·</span>
                    <span>Target Tone: Calm &amp; Grounded</span>
                  </div>
                  <div className="hero-plate__audit-pills">
                    <span className="hero-audit-pill hero-audit-pill--good">Tone: 98% Consistent</span>
                    <span
                      className={`hero-audit-pill ${applied ? 'hero-audit-pill--good' : 'hero-audit-pill--clay'}`}
                    >
                      {applied ? 'All Checks Passed' : '2 Flags Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Pane: Review Intelligence Desk */}
              <div className="hero-plate__sidebar">
                <div className="hero-plate__score-card">
                  <div className="hero-score-header">
                    <span className="hero-score-label">Brand Compliance Index</span>
                    <span className={`hero-score-badge ${applied ? 'hero-score-badge--good' : 'hero-score-badge--clay'}`}>
                      {applied ? 'Approved to Publish' : 'Action Required'}
                    </span>
                  </div>

                  <div className="hero-score-num">
                    <span>{scoreDisplay}</span>
                    <small>/100</small>
                  </div>

                  <div className="hero-score-bar">
                    <div
                      className="hero-score-bar__fill"
                      style={{
                        width: `${scoreDisplay}%`,
                        backgroundColor: applied ? 'var(--good)' : 'var(--clay)',
                      }}
                    />
                  </div>

                  <p className="hero-score-note">
                    {applied
                      ? 'All voice, terminology, and legal claims meet Aster & Oak guidelines.'
                      : '2 terms require editorial adjustments before publishing.'}
                  </p>
                </div>

                <div className="hero-plate__rules">
                  <span className="hero-rules-head">Evaluation Breakdown</span>
                  <div className="hero-rule-row">
                    <span>Voice &amp; Tone Register</span>
                    <strong className="text-good">98%</strong>
                  </div>
                  <div className="hero-rule-row">
                    <span>Approved Lexicon</span>
                    <strong className={applied ? 'text-good' : 'text-clay'}>
                      {applied ? '99%' : '74%'}
                    </strong>
                  </div>
                  <div className="hero-rule-row">
                    <span>ESG Claim Substantiation</span>
                    <strong className={applied ? 'text-good' : 'text-danger'}>
                      {applied ? '100%' : '65%'}
                    </strong>
                  </div>
                  <div className="hero-rule-row">
                    <span>Visual Asset Tokens</span>
                    <strong className="text-good">100%</strong>
                  </div>
                </div>

                <Link to="/reviews" className="hero-plate__cta">
                  <span>Open Full Review Desk</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Architectural Pillars */}
      <section className="hero-pillars-section" id="pillars">
        <div className="hero-container">
          <div className="hero-section-head">
            <span className="hero-section-pill">How Klarity Works</span>
            <h2 className="hero-section-title">A Living Standard, Not a Shelf Document</h2>
            <p className="hero-section-sub">
              Most brand guidelines sit forgotten in static presentations. Klarity puts rules directly into
              the publishing workflow where copy, images, and surfaces are created.
            </p>
          </div>

          <div className="hero-pillars-grid">
            <div className="hero-pillar-card">
              <div className="hero-pillar-icon">
                <BookOpen size={22} />
              </div>
              <h3>Living Guidelines</h3>
              <p>
                Define tone parameters, banned jargon, approved phrasing, and mandatory legal disclosures.
                When guidelines evolve, every desk and automated check updates instantly.
              </p>
              <Link to="/guidelines" className="hero-pillar-link">
                <span>View Guidelines Spec</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="hero-pillar-card">
              <div className="hero-pillar-icon">
                <Scale size={22} />
              </div>
              <h3>Line-by-Line Review Desk</h3>
              <p>
                Triage submitted campaign copy, press plates, and website launches. Automated scans highlight
                unsubstantiated claims and voice drift with clear rationale and replacement suggestions.
              </p>
              <Link to="/reviews" className="hero-pillar-link">
                <span>Explore Review Queue</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="hero-pillar-card">
              <div className="hero-pillar-icon">
                <Layers size={22} />
              </div>
              <h3>Token-Bound Brand Assets</h3>
              <p>
                Verify color hex codes, SVG typography marks, and campaign templates against single-source tokens.
                Eliminates stale logos and unapproved palette variations across channels.
              </p>
              <Link to="/assets" className="hero-pillar-link">
                <span>Inspect Asset Tokens</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Grounded Call to Action */}
      <section className="hero-bottom-cta">
        <div className="hero-container">
          <div className="hero-cta-box">
            <BrandMark size={40} />
            <h2>Bring Discipline to Every Brand Touchpoint</h2>
            <p>
              Explore the Aster &amp; Oak workspace to see how live guidelines and automated reviews
              maintain editorial excellence.
            </p>
            <div className="hero-cta-buttons">
              <Link to="/reviews" className="hero-btn hero-btn--lg hero-btn--primary">
                <span>Open Review Desk</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/guidelines" className="hero-btn hero-btn--lg hero-btn--secondary">
                <span>Browse Guidelines</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="hero-footer">
        <div className="hero-container hero-footer__inner">
          <div className="hero-footer__brand">
            <BrandMark size={24} />
            <span className="hero-footer__name">Klarity</span>
            <span className="hero-footer__divider">·</span>
            <small>© 2026 Klarity. Archival brand governance.</small>
          </div>
          <div className="hero-footer__links">
            <Link to="/reviews">Reviews</Link>
            <Link to="/guidelines">Guidelines</Link>
            <Link to="/assets">Assets</Link>
            <Link to="/calendar">Calendar</Link>
            <Link to="/login">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
