import { useLayoutEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  ChartNoAxesCombined,
  ChevronDown,
  FileClock,
  Images,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Sparkles,
} from 'lucide-react'
import { BrandMark } from './BrandMark'
import { AnimatedValue } from './AnimatedValue'
import { useApp } from '../context/AppContext'
import { cx } from '../lib/utils'
import { animateSlidingPill } from '../lib/animations'

const items = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/studio', label: 'Creator Studio', icon: Sparkles },
  { to: '/reviews', label: 'Reviews', icon: FileClock, badge: true },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/guidelines', label: 'Guidelines', icon: BookOpen },
  { to: '/assets', label: 'Brand assets', icon: Images },
  { to: '/insights', label: 'Insights', icon: ChartNoAxesCombined },
]

export function Sidebar({ open, onClose, onNewReview }) {
  const { data, toast } = useApp()
  const location = useLocation()
  const queue = data?.stats?.pending_reviews ?? 0
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
          className="workspace-switch"
          type="button"
          onClick={() => toast('Aster & Oak is the only workspace in this demo.', 'info')}
        >
          <span className="workspace-switch__mark">A&O</span>
          <span className="workspace-switch__copy">
            <strong>Aster &amp; Oak</strong>
            <small>Brand workspace</small>
          </span>
          <ChevronDown size={15} />
        </button>
      </div>

      <nav className="sidebar__nav sidebar__nav--animated" ref={navRef}>
        <div className="nav-highlight-pill" ref={pillRef} aria-hidden="true" />
        <p className="sidebar__label">Workspace</p>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cx('nav-item', isActive && 'is-active')}
              onClick={onClose}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
              {item.badge && queue > 0 ? <span className="nav-item__badge">{queue}</span> : null}
            </NavLink>
          )
        })}

        <p className="sidebar__label sidebar__label--second">Manage</p>
        <NavLink
          to="/settings"
          className={({ isActive }) => cx('nav-item', isActive && 'is-active')}
          onClick={onClose}
        >
          <Settings size={18} strokeWidth={1.8} />
          <span>Settings</span>
        </NavLink>
        <NavLink
          to="/hero"
          className={({ isActive }) => cx('nav-item', isActive && 'is-active')}
          onClick={onClose}
        >
          <Sparkles size={18} strokeWidth={1.8} />
          <span>Product overview</span>
        </NavLink>
        <button className="nav-item nav-item--button" type="button" onClick={() => toast('Docs are coming next in this build.', 'info')}>
          <LifeBuoy size={18} strokeWidth={1.8} />
          <span>Help &amp; docs</span>
        </button>
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
