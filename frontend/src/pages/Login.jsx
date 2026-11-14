import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { BrandMark } from '../components/BrandMark'
import { useApp } from '../context/AppContext'

export function Login() {
  const navigate = useNavigate()
  const { toast } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast('Signed in as ' + (email || 'Kruthik Kamegaonkar') + '.', 'good')
      navigate('/')
    }, 600)
  }

  const handleQuickLogin = (roleEmail, name) => {
    setEmail(roleEmail)
    setPassword('••••••••••••')
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast(`Signed in as ${name} (${roleEmail}).`, 'good')
      navigate('/')
    }, 450)
  }

  return (
    <div className="login-page">
      <div className="login-nav">
        <Link to="/hero" className="login-back-link">
          <ArrowLeft size={16} />
          <span>Back to Product Overview</span>
        </Link>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-card__header">
            <Link to="/hero" className="login-brand">
              <BrandMark size={42} />
              <div className="login-brand__text">
                <span className="login-brand__name">Klarity</span>
                <span className="login-brand__sub">Brand Intelligence</span>
              </div>
            </Link>

            <h1 className="login-title">Sign in to your brand workspace</h1>
            <p className="login-subtitle">
              Enter your enterprise credentials to access the Aster &amp; Oak review desk.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-email">Work Email</label>
              <div className="login-input-wrap">
                <Mail size={16} className="login-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-field__labels">
                <label htmlFor="login-password">Password</label>
                <a
                  href="#forgot"
                  className="login-forgot-link"
                  onClick={(e) => {
                    e.preventDefault()
                    toast('Password reset link dispatched to your verified work email.', 'info')
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="login-input-wrap">
                <Lock size={16} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="admin123 (or any password)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Authenticating…' : 'Sign in to Workspace'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="login-divider">
            <span>or single sign-on</span>
          </div>

          <div className="login-sso-buttons">
            <button
              type="button"
              className="login-sso-btn"
              onClick={() => handleQuickLogin('kruthik@asteroak.com', 'Kruthik (Brand Lead)')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Continue with Google Workspace</span>
            </button>

            <button
              type="button"
              className="login-sso-btn"
              onClick={() => handleQuickLogin('demo@klarity.ai', 'Enterprise Reviewer')}
            >
              <KeyRound size={17} />
              <span>Continue with Okta / SAML SSO</span>
            </button>
          </div>

          <div className="login-quick-demo">
            <div className="login-quick-demo__head">
              <Sparkles size={13} />
              <span>Admin Accounts (Password: <code>admin123</code>):</span>
            </div>
            <div className="login-quick-demo__actions">
              <button
                type="button"
                onClick={() => handleQuickLogin('kruthik@localhost5000.dev', 'Kruthik Kamegaonkar (Admin)')}
              >
                👑 Kruthik (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ashwik@localhost5000.dev', 'Ashwik Saxena (Topper / Admin)')}
              >
                ⭐ Ashwik (Topper)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('abhinav@localhost5000.dev', 'Maddi Abhinav (Admin)')}
              >
                🛡️ Abhinav (Admin)
              </button>
            </div>
          </div>

          <div className="login-footer">
            <div className="login-trust-pill">
              <ShieldCheck size={14} />
              <span>SOC2 Type II Certified · 256-bit TLS · Zero Data Training Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
