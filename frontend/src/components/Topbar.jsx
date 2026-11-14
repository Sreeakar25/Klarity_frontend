import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Menu,
  Plus,
  Search,
  Settings,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Avatar, Button, IconButton } from './UI'
import { CommandPalette } from './CommandPalette'
import { actionLabel, cx, timeAgo } from '../lib/utils'

const titles = [
  ['/', 'Overview'],
  ['/reviews', 'Reviews'],
  ['/guidelines', 'Guidelines'],
  ['/assets', 'Brand assets'],
  ['/insights', 'Insights'],
  ['/settings', 'Settings'],
]

const kindIcon = {
  approved: Check,
  rejected: X,
  changes_requested: CircleDot,
  submitted: Plus,
}

export function Topbar({ onMenu, onNewReview, currentPath }) {
  const { data } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const barRef = useRef(null)

  const title = currentPath?.startsWith('/reviews/')
    ? 'Review report'
    : titles.find(([path]) => path === location.pathname)?.[1] || 'Overview'

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((value) => !value)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!openMenu) return undefined
    const onPointer = (event) => {
      if (barRef.current && !barRef.current.contains(event.target)) setOpenMenu(null)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [openMenu])

  const openReview = (id) => {
    setOpenMenu(null)
    navigate(`/reviews/${id}`)
  }

  return (
    <>
      <header className="topbar" ref={barRef}>
        <div className="topbar__left">
          <IconButton label="Open navigation" className="topbar__menu" onClick={onMenu}>
            <Menu size={20} />
          </IconButton>
          <div className="crumbs">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{title}</strong>
          </div>
        </div>

        <div className="topbar__right">
          <button className="search-trigger" type="button" onClick={() => setPaletteOpen(true)}>
            <Search size={16} />
            <span>Search reviews and guidelines</span>
            <kbd>⌘ K</kbd>
          </button>

          <div className="topbar__popover-wrap">
            <IconButton
              label="Notifications"
              className={cx('has-indicator', openMenu === 'notifications' && 'is-active')}
              onClick={() => setOpenMenu(openMenu === 'notifications' ? null : 'notifications')}
            >
              <Bell size={18} />
              <span className="indicator" />
            </IconButton>
            {openMenu === 'notifications' ? (
              <div className="popover popover--notifications">
                <div className="popover__head">
                  <div>
                    <h3>Notifications</h3>
                    <p>Recent review activity</p>
                  </div>
                  <span className="popover__count">{data?.activity?.length || 0}</span>
                </div>
                <ul className="notification-list">
                  {(data?.activity || []).slice(0, 5).map((item) => {
                    const Icon = kindIcon[item.kind] || CircleDot
                    return (
                      <li key={item.id}>
                        <button onClick={() => openReview(item.submission_id)}>
                          <span className={cx('notification-list__icon', `kind-${item.kind}`)}>
                            <Icon size={14} />
                          </span>
                          <span>
                            <strong>{actionLabel[item.kind] || 'Updated'}</strong>
                            <p>{item.title}</p>
                            <small>
                              {item.actor} · {timeAgo(item.created_at)}
                            </small>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <button className="popover__footer" onClick={() => { setOpenMenu(null); navigate('/reviews') }}>
                  Open the review queue <ChevronRight size={14} />
                </button>
              </div>
            ) : null}
          </div>

          <span className="topbar__divider" aria-hidden="true" />

          <div className="topbar__popover-wrap">
            <button
              className={cx('user-chip', openMenu === 'user' && 'is-active')}
              type="button"
              onClick={() => setOpenMenu(openMenu === 'user' ? null : 'user')}
            >
              <Avatar name="Kruthik Kamegaonkar" />
              <span className="user-chip__copy">
                <strong>Kruthik</strong>
                <small>Admin</small>
              </span>
              <ChevronDown size={14} />
            </button>
            {openMenu === 'user' ? (
              <div className="popover popover--user">
                <div className="popover__identity">
                  <Avatar name="Kruthik Kamegaonkar" size="lg" />
                  <div>
                    <strong>Kruthik Kamegaonkar</strong>
                    <p>kruthik@localhost5000.dev</p>
                  </div>
                </div>
                <button onClick={() => { setOpenMenu(null); navigate('/settings') }}>
                  <Settings size={15} /> Workspace settings
                </button>
                <div className="popover__meta">
                  <span>Aster &amp; Oak</span>
                  <span>Admin</span>
                </div>
              </div>
            ) : null}
          </div>

          <Button size="sm" icon={Plus} onClick={onNewReview} className="topbar__new">
            New review
          </Button>
        </div>
      </header>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}
