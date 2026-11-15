import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  EyeOff,
  FileCheck2,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
  Sparkles,
  User,
} from 'lucide-react'
import { BrandMark } from '../components/BrandMark'
import { useApp } from '../context/AppContext'
import { api } from '../lib/api'

export function Login() {
  const { user, data, authenticate } = useApp()
  const [register, setRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('owner')
  const [brandCode, setBrandCode] = useState('')
  const [brandName, setBrandName] = useState('Aster & Oak')
  const [brandValues, setBrandValues] = useState('Authenticity, craft, sustainability, quiet confidence')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [pendingNotice, setPendingNotice] = useState(false)
  const [activeCodeHint, setActiveCodeHint] = useState('KLARITY-2026')

  useEffect(() => {
    api.brandCodeHint().then(res => {
      if (res?.brand_code) setActiveCodeHint(res.brand_code)
      if (res?.brand_name) setBrandName(res.brand_name)
    }).catch(() => {})
  }, [])

  if (user && data) return <Navigate to="/" replace />

  const isAdmin = role === 'owner'

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSuccessMsg('')
    setPendingNotice(false)

    try {
      if (register) {
        const res = await api.register({
          username,
          email,
          password,
          role,
          brand_code: isAdmin ? undefined : brandCode,
          brand_name: isAdmin ? brandName : undefined,
          brand_values: isAdmin ? brandValues : undefined,
        })

        if (res?.is_approved) {
          setSuccessMsg(`Admin account "${username}" created successfully! You can sign in below.`)
          setPendingNotice(false)
        } else {
          setSuccessMsg(`Brand Value Code verified! Your ${role === 'reviewer' ? 'Reviewer' : 'Team Member'} account registration is submitted.`)
          setPendingNotice(true)
        }
        setRegister(false)
        setPassword('')
      } else {
        await authenticate('login', { identifier: email, password })
      }
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-nav">
        <Link to="/hero" className="login-back-link">
          <ArrowLeft size={16} />
          Back to Product Overview
        </Link>
      </div>
      <div className="login-container">
        <div className="login-card" style={{ maxWidth: register ? '540px' : '480px' }}>
          <div className="login-card__header">
            <Link to="/hero" className="login-brand">
              <BrandMark size={42} />
              <span className="login-brand__name">Klarity</span>
            </Link>
            <h1 className="login-title">{register ? 'Create your account' : 'Sign in to your workspace'}</h1>
            <p className="login-subtitle">
              {register
                ? isAdmin
                  ? 'Define brand identity & core values for the workspace.'
                  : 'Enter your brand value code to request account authorization.'
                : 'Enter your username or email and password.'}
            </p>
          </div>

          {successMsg && (
            <div className="login-alert-success" role="status" style={{ marginBottom: '18px' }}>
              {pendingNotice ? (
                <Clock size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#b45309' }} />
              ) : (
                <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#16a34a' }} />
              )}
              <div>
                <strong>{pendingNotice ? 'Pending Admin / Owner Verification' : 'Registration Complete'}</strong>
                <div style={{ marginTop: '2px', fontSize: '12.5px' }}>{successMsg}</div>
                {pendingNotice && (
                  <div style={{ marginTop: '6px', fontSize: '11.5px', color: 'var(--muted)' }}>
                    Your account needs to be verified by a Brand Owner/Admin before you can log in.
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="login-alert-error" role="alert" style={{ marginBottom: '18px' }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          <form className="login-form" onSubmit={submit}>
            {register && (
              <div className="login-field">
                <label>Account Role &amp; Permission Tier</label>
                <div className="login-role-selector">
                  <button
                    type="button"
                    className={`login-role-card ${role === 'owner' ? 'is-active' : ''}`}
                    onClick={() => setRole('owner')}
                  >
                    <div className="login-role-card__header">
                      <Crown size={14} color={role === 'owner' ? 'var(--sage)' : 'var(--muted)'} />
                      <span>Admin</span>
                    </div>
                    <small>Stage 1 · Brand Owner</small>
                  </button>
                  <button
                    type="button"
                    className={`login-role-card ${role === 'reviewer' ? 'is-active' : ''}`}
                    onClick={() => setRole('reviewer')}
                  >
                    <div className="login-role-card__header">
                      <FileCheck2 size={14} color={role === 'reviewer' ? 'var(--sage)' : 'var(--muted)'} />
                      <span>Reviewer</span>
                    </div>
                    <small>Stage 2 · Editorial Auditor</small>
                  </button>
                  <button
                    type="button"
                    className={`login-role-card ${role === 'member' ? 'is-active' : ''}`}
                    onClick={() => setRole('member')}
                  >
                    <div className="login-role-card__header">
                      <User size={14} color={role === 'member' ? 'var(--sage)' : 'var(--muted)'} />
                      <span>User</span>
                    </div>
                    <small>Stage 3 · Team Member</small>
                  </button>
                </div>
              </div>
            )}

            {register && (
              <div className="login-field">
                <label htmlFor="username">Username</label>
                <div className="login-input-wrap">
                  <User size={16} className="login-input-icon" />
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    minLength={3}
                    maxLength={80}
                    pattern="[a-zA-Z0-9_.-]+"
                    placeholder="e.g. alex_brand"
                    required
                  />
                </div>
              </div>
            )}

            <div className="login-field">
              <label htmlFor="login-email">{register ? 'Email' : 'Username or email'}</label>
              <div className="login-input-wrap">
                <Mail size={16} className="login-input-icon" />
                <input
                  id="login-email"
                  type={register ? 'email' : 'text'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete={register ? 'email' : 'username'}
                  maxLength={254}
                  placeholder={register ? 'you@company.com' : 'username or email'}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <Lock size={16} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  minLength={register ? 8 : 1}
                  maxLength={128}
                  required
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {register && <small>Use at least 8 characters.</small>}
            </div>

            {/* BRAND VALUE CODE: Required for User & Reviewer */}
            {register && !isAdmin && (
              <div className="login-field" style={{ background: 'var(--paper)', border: '1px solid var(--line-strong)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label htmlFor="brand-code" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <KeyRound size={13} color="var(--sage)" />
                    Brand Value Code
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--cream)', padding: '2px 6px', borderRadius: '4px' }}>
                    Code: <strong>{activeCodeHint}</strong>
                  </span>
                </div>
                <div className="login-input-wrap">
                  <input
                    id="brand-code"
                    type="text"
                    value={brandCode}
                    onChange={(e) => setBrandCode(e.target.value)}
                    placeholder="Enter brand code (e.g. KLARITY-2026)"
                    required
                  />
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--muted)', lineHeight: 1.35 }}>
                  🛡️ Reviewer &amp; User accounts verify this code and require <strong>Owner/Admin verification</strong> before sign in.
                </p>
              </div>
            )}

            {/* BRAND IDENTITY & VALUES: ONLY FOR ADMIN */}
            {register && isAdmin && (
              <div className="login-brand-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <Sparkles size={14} color="var(--sage)" />
                  <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>Brand Identity &amp; Values (Admin Only)</strong>
                </div>
                <div>
                  <label htmlFor="brand-name">Brand / Organization Name</label>
                  <input
                    id="brand-name"
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Aster & Oak"
                  />
                </div>
                <div>
                  <label htmlFor="brand-values">Core Brand Values &amp; Guidance</label>
                  <textarea
                    id="brand-values"
                    rows={2}
                    value={brandValues}
                    onChange={(e) => setBrandValues(e.target.value)}
                    placeholder="e.g. Authenticity, craftsmanship, quiet confidence..."
                  />
                </div>
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={busy}>
              <span>{busy ? 'Please wait…' : register ? (isAdmin ? 'Create Admin Account' : 'Submit for Verification') : 'Sign in'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="login-sso-btn"
              disabled={busy}
              onClick={() => {
                setRegister(!register)
                setError('')
                setSuccessMsg('')
                setPassword('')
              }}
            >
              {register ? 'Already have an account? Sign in' : 'Create an account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
