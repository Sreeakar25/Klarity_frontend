import { useLayoutEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  ChartNoAxesCombined,
  ChevronDown,
  FileClock,
  HelpCircle,
  Images,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { BrandMark } from './BrandMark'
import { AnimatedValue } from './AnimatedValue'
import { useApp } from '../context/AppContext'
import { cx } from '../lib/utils'
import { animateSlidingPill } from '../lib/animations'

const items = [
  { to: '/', key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/studio', key: 'studio', label: 'Creator Studio', icon: Sparkles },
  { to: '/reviews', key: 'reviews', label: 'Reviews', icon: FileClock, badge: true },
  { to: '/calendar', key: 'calendar', label: 'Calendar', icon: Calendar },
  { to: '/guidelines', key: 'guidelines', label: 'Guidelines', icon: BookOpen },
  { to: '/assets', key: 'assets', label: 'Brand assets', icon: Images },
  { to: '/insights', key: 'insights', label: 'Insights', icon: ChartNoAxesCombined },
]

export function Sidebar({ open, onClose, onNewReview }) {
  const { data, toast, isLead, currentUser, canViewModule, isOwner, pendingApprovalsCount } = useApp()
  const location = useLocation()
  const queue = isLead
    ? (data?.stats?.pending_reviews ?? 0)
    : (data?.submissions || []).filter((item) => {
        const author = (item.submitted_by || '').toLowerCase().trim()
        const userLower = (currentUser || '').toLowerCase().trim()
        const isMine = userLower && (author === userLower || author.includes(userLower) || userLower.includes(author))
        return isMine && (item.status === 'reviewing' || item.status === 'pending' || item.status === 'needs_changes')
      }).length
  const score = data?.stats?.avg_score ?? 88

  const navRef = useRef(null)
  const pillRef = useRef(null)
  const initialRef = useRef(false)

  const updatePill = () => {
    animateSlidingPill({
      containerEl: navRef.current,
      pillEl: pillRef.current,
      activeSelector: '.nav-item.is-active',
      isInitialRef: initialRef,
      isVertical: true,
    })
  }

  useLayoutEffect(() => {
    const timer = requestAnimationFrame(() => {
      updatePill()
    })
    const handleResize = () => updatePill()
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [location.pathname])

  return (
    <aside className={cx('sidebar', open && 'is-open')} aria-label="Primary navigation">
      <div className="sidebar__top">
        <NavLink to="/" className="brand-lockup" onClick={onClose}>
          <BrandMark size={34} />
          <span className="brand-lockup__word">Klarity</span>
        </NavLink>
        <button
          className={cx('workspace-switch', !isLead && 'workspace-switch--readonly')}
          type="button"
          onClick={() => {
            if (!isLead) {
              toast('Workspace creation and switching is restricted to Brand Owners and Reviewers.', 'warn')
            } else {
              toast('Aster & Oak is the primary active workspace.', 'info')
            }
          }}
          title={!isLead ? 'Assigned workspace (Governed by Brand Leads)' : 'Workspace settings'}
        >
          <span className="workspace-switch__mark">A&O</span>
          <span className="workspace-switch__copy">
            <strong>Aster &amp; Oak</strong>
            <small>{isLead ? 'Brand workspace' : 'Assigned workspace'}</small>
          </span>
          {isLead ? <ChevronDown size={15} /> : <Lock size={13} style={{ opacity: 0.6 }} />}
        </button>
      </div>

      <nav className="sidebar__nav sidebar__nav--animated" ref={navRef}>
        <div className="nav-highlight-pill" ref={pillRef} aria-hidden="true" />
        <p className="sidebar__label">Workspace</p>
        {items.filter(item => canViewModule(item.key)).map((item) => {
          const Icon = item.icon
          const label = item.to === '/reviews' && !isLead ? 'My submissions' : item.label
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cx('nav-item', isActive && 'is-active')}
              onClick={onClose}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {item.badge && queue > 0 ? <span className="nav-item__badge">{queue}</span> : null}
            </NavLink>
          )
        })}

        <p className="sidebar__label sidebar__label--second">Manage</p>
        {isOwner && (
          <NavLink
            to="/settings#team"
            className={({ isActive }) => cx('nav-item', isActive && 'is-active')}
            onClick={onClose}
            title="Brand Owner Access Governance & User Confirmations"
          >
            <ShieldCheck size={18} strokeWidth={1.8} />
            <span>Brand Owner Control</span>
            {pendingApprovalsCount > 0 && (
              <span
                className="nav-item__badge"
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '10.5px',
                  minWidth: '18px',
                  height: '18px',
                }}
              >
                {pendingApprovalsCount}
              </span>
            )}
          </NavLink>
        )}
        {canViewModule('settings') && (
          <NavLink
            to="/settings"
            end
            className={({ isActive }) => cx('nav-item', isActive && 'is-active')}
            onClick={onClose}
          >
            <Settings size={18} strokeWidth={1.8} />
            <span>Settings</span>
          </NavLink>
        )}
        <NavLink
          to="/hero"
          className={({ isActive }) => cx('nav-item', isActive && 'is-active')}
          onClick={onClose}
        >
          <Sparkles size={18} strokeWidth={1.8} />
          <span>Product overview</span>
        </NavLink>
        <a
          href="#help-docs"
          className="nav-item"
          onClick={(e) => {
            e.preventDefault()
            toast('Help & Docs: Reference the Aster & Oak Brand Guidelines and governance workflow.', 'info')
            onClose()
          }}
        >
          <LifeBuoy size={18} strokeWidth={1.8} />
          <span>Help &amp; docs</span>
        </a>
      </nav>

      <div className="sidebar__bottom">
        <NavLink to="/insights" className="rail-health" onClick={onClose}>
          <div className="rail-health__head">
            <span>Brand health</span>
          </div>
          <div className="rail-health__value">
            <AnimatedValue value={Math.round(score)} suffix="/100" />
          </div>
          <div className="rail-health__track">
            <span style={{ width: `${score}%` }} />
          </div>
          <p>Up 1.6 points over the last 30 days</p>
        </NavLink>
      </div>
    </aside>
  )
}
