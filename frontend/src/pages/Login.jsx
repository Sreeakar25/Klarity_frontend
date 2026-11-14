import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { BrandMark } from '../components/BrandMark'
import { useApp } from '../context/AppContext'

export function Login() {
  const { user, data, authenticate } = useApp()
  const [register, setRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (user && data) return <Navigate to="/" replace />
  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await authenticate(register ? 'register' : 'login', register
        ? { username, email, password } : { identifier: email, password })
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }
  return <div className="login-page">
    <div className="login-nav"><Link to="/hero" className="login-back-link"><ArrowLeft size={16} />Back to Product Overview</Link></div>
    <div className="login-container"><div className="login-card">
      <div className="login-card__header">
        <Link to="/hero" className="login-brand"><BrandMark size={42} /><span className="login-brand__name">Klarity</span></Link>
        <h1 className="login-title">{register ? 'Create your account' : 'Sign in to your workspace'}</h1>
        <p className="login-subtitle">{register ? 'Use a username and your email, including Gmail.' : 'Enter your username or email and password.'}</p>
      </div>
      <form className="login-form" onSubmit={submit}>
        {register && <div className="login-field"><label htmlFor="username">Username</label><div className="login-input-wrap">
          <input id="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" minLength={3} maxLength={80} pattern="[a-zA-Z0-9_.-]+" required />
        </div></div>}
        <div className="login-field"><label htmlFor="login-email">{register ? 'Email' : 'Username or email'}</label><div className="login-input-wrap">
          <Mail size={16} className="login-input-icon" /><input id="login-email" type={register ? 'email' : 'text'} value={email} onChange={e => setEmail(e.target.value)} autoComplete={register ? 'email' : 'username'} maxLength={254} required />
        </div></div>
        <div className="login-field"><label htmlFor="login-password">Password</label><div className="login-input-wrap">
          <Lock size={16} className="login-input-icon" /><input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 8 : 1} maxLength={128} required />
          <button type="button" className="login-pw-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>{register && <small>Use at least 8 characters.</small>}</div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" className="login-submit-btn" disabled={busy}><span>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</span><ArrowRight size={16} /></button>
        <button type="button" className="login-sso-btn" disabled={busy} onClick={() => { setRegister(!register); setError(''); setPassword('') }}>{register ? 'Already have an account? Sign in' : 'Create an account'}</button>
      </form>
    </div></div>
  </div>
}
