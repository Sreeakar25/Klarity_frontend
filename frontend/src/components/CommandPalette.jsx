import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, CornerDownLeft, FileClock, Search, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { cx, latestReport, statusMeta } from '../lib/utils'
import { animatePaletteIn, animatePaletteOut } from '../lib/animations'

const pageRoutes = [
  { label: 'Overview', path: '/', description: 'Brand health, queue, recent reviews' },
  { label: 'Reviews', path: '/reviews', description: 'Every submission and decision' },
  { label: 'Guidelines', path: '/guidelines', description: 'The source of truth' },
  { label: 'Brand assets', path: '/assets', description: 'Logo, palette, type, campaign plates' },
  { label: 'Insights', path: '/insights', description: 'Patterns and governance signals' },
  { label: 'Settings', path: '/settings', description: 'Workspace and review defaults' },
]

export function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const { data } = useApp()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const paletteRef = useRef(null)
  const backdropRef = useRef(null)
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setQuery('')
      const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
      return () => window.clearTimeout(timer)
    } else if (mounted) {
      animatePaletteOut(paletteRef.current, backdropRef.current, () => {
        setMounted(false)
      })
    }
  }, [open])

  useEffect(() => {
    if (mounted && open) {
      animatePaletteIn(paletteRef.current, backdropRef.current)
    }
  }, [mounted, open])

  const requestClose = () => {
    animatePaletteOut(paletteRef.current, backdropRef.current, () => {
      setMounted(false)
      onClose()
    })
  }

  useEffect(() => {
    if (!mounted || !open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') requestClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [mounted, open])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const pages = pageRoutes
      .filter((page) => !needle || page.label.toLowerCase().includes(needle))
      .map((page) => ({ ...page, kind: 'page' }))
    const submissions = (data?.submissions || [])
      .filter((item) => !needle || item.title.toLowerCase().includes(needle) || item.submitted_by.toLowerCase().includes(needle))
      .slice(0, 6)
      .map((item) => ({
        label: item.title,
        path: `/reviews/${item.id}`,
        kind: 'review',
        description: `${item.submitted_by} · ${statusMeta[item.status]?.label || item.status}`,
        report: latestReport(item),
      }))
    const guidelines = (data?.guidelines || [])
      .filter((item) => !needle || item.title.toLowerCase().includes(needle))
      .slice(0, 5)
      .map((item) => ({
        label: item.title,
        path: `/guidelines?guideline=${item.id}`,
        kind: 'guideline',
        description: `${item.category} · priority ${item.priority}`,
      }))
    return [...pages, ...submissions, ...guidelines].slice(0, 12)
  }, [data, query])

  if (!mounted) return null

  const choose = (result) => {
    requestClose()
    navigate(result.path)
  }

  return createPortal(
    <div className="palette-shell">
      <button ref={backdropRef} className="palette-backdrop" onClick={requestClose} aria-label="Close search" />
      <div ref={paletteRef} className="palette" role="dialog" aria-modal="true" aria-label="Search Klarity">
        <div className="palette__input">
          <Search size={19} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reviews, guidelines, pages…"
            aria-label="Search"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && results[0]) choose(results[0])
            }}
          />
          <kbd>ESC</kbd>
        </div>
        <div className="palette__body">
          {results.length ? (
            <>
              <p className="palette__label">{query ? 'Matches' : 'Jump to'}</p>
              <ul>
                {results.map((result) => {
                  const Icon =
                    result.kind === 'review' ? FileClock : result.kind === 'guideline' ? BookOpen : Sparkles
                  return (
                    <li key={`${result.kind}-${result.path}`}>
                      <button onClick={() => choose(result)}>
                        <span className={cx('palette__icon', `palette__icon--${result.kind}`)}>
                          <Icon size={16} />
                        </span>
                        <span className="palette__copy">
                          <strong>{result.label}</strong>
                          <small>{result.description}</small>
                        </span>
                        {result.report ? (
                          <span
                            className={cx(
                              'palette__score',
                              result.report.overall_score < 70
                                ? 'is-bad'
                                : result.report.overall_score < 85
                                  ? 'is-warn'
                                  : '',
                            )}
                          >
                            {Math.round(result.report.overall_score)}
                          </span>
                        ) : null}
                        <CornerDownLeft size={14} className="palette__return" />
                        {result.kind === 'page' ? <ArrowRight size={14} className="palette__return" /> : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <div className="palette__empty">
              <p>No matches for “{query}”.</p>
              <span>Try a title, a creator, or a guideline.</span>
            </div>
          )}
        </div>
        <footer className="palette__foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to move
          </span>
          <span>
            <kbd>↵</kbd> to open
          </span>
          <span className="palette__foot-brand">Klarity search</span>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
