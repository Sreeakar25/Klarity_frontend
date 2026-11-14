import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, Check, LoaderCircle, X } from 'lucide-react'
import { categoryLabels, cx, initials, severityMeta, statusMeta } from '../lib/utils'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  trailing: Trailing,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={cx('btn', `btn--${variant}`, `btn--${size}`, className)}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="spin" size={16} /> : Icon ? <Icon size={16} /> : null}
      <span>{children}</span>
      {Trailing ? <Trailing size={15} /> : null}
    </button>
  )
}

export function IconButton({ label, children, className = '', ...props }) {
  return (
    <button className={cx('icon-btn', className)} aria-label={label} title={label} {...props}>
      {children}
    </button>
  )
}

export function Panel({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={cx('panel', className)} {...props}>
      {children}
    </Tag>
  )
}

export function SectionHead({ title, description, action, className = '' }) {
  return (
    <div className={cx('section-head', className)}>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="section-head__action">{action}</div> : null}
    </div>
  )
}

export function StatusPill({ status, className = '' }) {
  const meta = statusMeta[status] || { label: status, tone: 'muted' }
  return (
    <span className={cx('pill', `pill--${meta.tone}`, className)}>
      <span className="pill__dot" aria-hidden="true" />
      {meta.label}
    </span>
  )
}

export function SeverityPill({ severity, className = '' }) {
  const meta = severityMeta[severity] || { label: severity, tone: 'muted' }
  return <span className={cx('pill', `pill--${meta.tone}`, 'pill--severity', className)}>{meta.label}</span>
}

export function CategoryTag({ category }) {
  return <span className={cx('tag', `tag--${category}`)}>{categoryLabels[category] || category}</span>
}

export function ScorePill({ score, size = 'md' }) {
  const tone = score >= 85 ? 'good' : score >= 70 ? 'warn' : 'bad'
  return (
    <span className={cx('score-pill', `score-pill--${tone}`, `score-pill--${size}`)}>
      <strong>{Math.round(score)}</strong>
      <span>/100</span>
    </span>
  )
}

export function Avatar({ name = '', size = 'md', className = '' }) {
  return (
    <span className={cx('avatar', `avatar--${size}`, className)} aria-hidden="true" title={name}>
      {initials(name)}
    </span>
  )
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cx('segmented__item', value === option.value && 'is-active')}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Tabs({ options, value, onChange, label }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={cx('tabs__item', value === option.value && 'is-active')}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined ? <span className="tabs__count">{option.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function Field({ label, hint, error, children, htmlFor }) {
  return (
    <div className={cx('field', error && 'field--error')}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <p className="field__error">{error}</p> : hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  )
}

export function Drawer({ open, onClose, title, description, children, footer, width = '540px' }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => {
      const focusable = panelRef.current?.querySelector(
        'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])',
      )
      focusable?.focus?.()
    }, 20)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="drawer-shell">
      <button className="drawer-backdrop" aria-label="Close panel" onClick={onClose} />
      <aside
        className="drawer"
        style={{ '--drawer-width': width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        ref={panelRef}
      >
        <header className="drawer__head">
          <div>
            <h2 id="drawer-title">{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <IconButton label="Close panel" onClick={onClose}>
            <X size={19} />
          </IconButton>
        </header>
        <div className="drawer__body">{children}</div>
        {footer ? <footer className="drawer__foot">{footer}</footer> : null}
      </aside>
    </div>,
    document.body,
  )
}

export function EmptyState({ icon: Icon, title, description, action, compact = false }) {
  return (
    <div className={cx('empty', compact && 'empty--compact')}>
      {Icon ? (
        <span className="empty__icon">
          <Icon size={22} />
        </span>
      ) : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  )
}

export function Meter({ value, tone = 'good', label }) {
  return (
    <div className={cx('meter', `meter--${tone}`)} aria-label={label} role="img">
      <span style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
    </div>
  )
}

export function InlineLink({ children, className = '', ...props }) {
  return (
    <a className={cx('inline-link', className)} {...props}>
      {children}
      <ArrowUpRight size={13} />
    </a>
  )
}

export function ToastRegion({ toasts, onDismiss }) {
  return createPortal(
    <div className="toast-region" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={cx('toast', `toast--${toast.tone}`)}>
          <span className="toast__icon">
            {toast.tone === 'good' ? <Check size={14} /> : <span className="toast__dot" />}
          </span>
          <p>{toast.message}</p>
          <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}

export function Skeleton({ className = '' }) {
  return <span className={cx('skeleton', className)} aria-hidden="true" />
}
