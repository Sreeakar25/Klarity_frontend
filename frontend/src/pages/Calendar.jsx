import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileClock,
  FileText,
  Filter,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Plus,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, Drawer, Panel, ScorePill, StatusPill, Tabs } from '../components/UI'
import { cx, formatDate, latestReport } from '../lib/utils'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const MONTH_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
]

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Single multi-day milestone matching reference screenshot
const MULTI_DAY_CAMPAIGNS = [
  {
    id: 'camp-offsite',
    title: 'Team offsite',
    startDate: '2026-11-30',
    endDate: '2026-12-02',
    tone: 'good',
    detail: 'Quarterly brand governance and editorial planning offsite.',
  },
]

export function Calendar({ onNewReview }) {
  const { data } = useApp()
  const navigate = useNavigate()

  // Base state defaults to simulated workspace date (Nov 14, 2026)
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(10) // 0-indexed: 10 = November
  const [viewMode, setViewMode] = useState('month') // 'month' | 'week' | 'agenda'
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'submitted' | 'approved' | 'reviewing' | 'needs_changes'
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState(null)

  // Current today marker in workspace time
  const TODAY_STR = '2026-11-14'

  // Extract events cleanly (one canonical activity entry per submission to avoid clutter)
  const allEvents = useMemo(() => {
    if (!data?.submissions) return []
    const events = []

    data.submissions.forEach((sub) => {
      const report = latestReport(sub)
      const score = report?.overall_score

      // Place event on reviewed date if reviewed, otherwise on submitted date
      const timestamp = sub.reviewed_at || sub.submitted_at
      if (!timestamp) return

      const dateStr = timestamp.slice(0, 10)
      const timeStr = timestamp.slice(11, 16)

      // Color tone matching Klarity cream/sage palette
      let tone = 'neutral'
      if (sub.status === 'approved') {
        tone = 'good' // Semantic Green
      } else if (sub.status === 'reviewing') {
        tone = 'sage' // Klarity Blue
      } else if (sub.status === 'needs_changes') {
        tone = 'warn' // Warm Clay
      } else {
        tone = 'neutral' // Warm Cream Paper
      }

      events.push({
        id: `ev-${sub.id}`,
        submissionId: sub.id,
        status: sub.status,
        tone: tone,
        title: sub.title,
        author: sub.submitted_by,
        date: dateStr,
        time: timeStr,
        rawDate: new Date(timestamp),
        contentType: sub.content_type,
        contentText: sub.content_text,
        score: score,
        report: report,
        detail: sub.reviewer_notes || report?.summary || `Review by ${sub.submitted_by}`,
      })
    })

    return events
  }, [data?.submissions])

  // Dynamic status tabs counts for the GSAP sliding pill
  const statusTabs = useMemo(() => {
    const counts = { all: allEvents.length }
    allEvents.forEach((ev) => {
      counts[ev.status] = (counts[ev.status] || 0) + 1
    })

    return [
      { value: 'all', label: 'All', count: counts.all },
      { value: 'reviewing', label: 'In review', count: counts.reviewing || 0 },
      { value: 'needs_changes', label: 'Changes', count: counts.needs_changes || 0 },
      { value: 'approved', label: 'Approved', count: counts.approved || 0 },
      { value: 'rejected', label: 'Rejected', count: counts.rejected || 0 },
    ]
  }, [allEvents])

  // Filter events by search & status
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      if (statusFilter !== 'all' && ev.status !== statusFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = ev.title.toLowerCase().includes(q)
        const matchAuthor = ev.author.toLowerCase().includes(q)
        const matchDetail = ev.detail.toLowerCase().includes(q)
        if (!matchTitle && !matchAuthor && !matchDetail) return false
      }
      return true
    })
  }, [allEvents, statusFilter, searchQuery])

  // Index events by "YYYY-MM-DD"
  const eventsByDate = useMemo(() => {
    const map = new Map()
    filteredEvents.forEach((ev) => {
      const list = map.get(ev.date) || []
      list.push(ev)
      map.set(ev.date, list)
    })
    return map
  }, [filteredEvents])

  // Calendar Grid Calculation (Monday to Sunday)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Day of week for 1st of month: 0=Sun, 1=Mon, ..., 6=Sat
    // Convert to Monday=0 index: (day + 6) % 7
    const startDayIndex = (firstDay.getDay() + 6) % 7

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()

    const days = []

    // 1. Preceding month days
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum)
      const dateStr = prevDate.toISOString().slice(0, 10)
      days.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === TODAY_STR,
        events: eventsByDate.get(dateStr) || [],
      })
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const currDate = new Date(currentYear, currentMonth, dayNum)
      // Format as YYYY-MM-DD safely
      const m = String(currentMonth + 1).padStart(2, '0')
      const d = String(dayNum).padStart(2, '0')
      const dateStr = `${currentYear}-${m}-${d}`
      days.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === TODAY_STR,
        events: eventsByDate.get(dateStr) || [],
      })
    }

    // 3. Trailing next month days to complete 35 or 42 grid cells
    const totalCells = days.length <= 35 ? 35 : 42
    const remaining = totalCells - days.length
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextDate = new Date(currentYear, currentMonth + 1, dayNum)
      const m = String((currentMonth + 2 > 12 ? 1 : currentMonth + 2)).padStart(2, '0')
      const y = currentMonth + 2 > 12 ? currentYear + 1 : currentYear
      const d = String(dayNum).padStart(2, '0')
      const dateStr = `${y}-${m}-${d}`
      days.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === TODAY_STR,
        events: eventsByDate.get(dateStr) || [],
      })
    }

    return days
  }, [currentYear, currentMonth, eventsByDate])

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleToday = () => {
    setCurrentYear(2026)
    setCurrentMonth(10) // November 2026
  }

  const formatEventTime = (timeStr) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':').map(Number)
    const ampm = h >= 12 ? 'pm' : 'am'
    const hr = h % 12 || 12
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`
  }

  return (
    <div className="calendar-page">
      {/* Calendar Header Panel */}
      <Panel className="calendar-card">
        <header className="calendar-head">
          {/* Left: Date Badge + Title + Week indicator */}
          <div className="calendar-head__left">
            <div className="calendar-badge">
              <div className="calendar-badge__top">
                <span className="calendar-badge__month">{MONTH_SHORT[currentMonth]}</span>
              </div>
              <div className="calendar-badge__bottom">
                <span className="calendar-badge__day">14</span>
              </div>
            </div>
            <div className="calendar-title-group">
              <div className="calendar-title-row">
                <h1>{MONTH_NAMES[currentMonth]} {currentYear}</h1>
                <span className="calendar-week-tag">Week 2</span>
              </div>
              <p className="calendar-range-sub">
                1 {MONTH_SHORT[currentMonth]} {currentYear} – {new Date(currentYear, currentMonth + 1, 0).getDate()} {MONTH_SHORT[currentMonth]} {currentYear}
              </p>
            </div>
          </div>

          {/* Right: Controls & Actions */}
          <div className="calendar-head__right">
            {/* Search Filter */}
            <label className="calendar-search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search events or submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search calendar"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="calendar-search__clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </label>

            {/* Navigation Group */}
            <div className="calendar-nav-group">
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                title="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="calendar-today-btn"
                onClick={handleToday}
              >
                Today
              </button>
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={handleNextMonth}
                aria-label="Next month"
                title="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="calendar-view-select">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                aria-label="Select calendar view"
              >
                <option value="month">Month view</option>
                <option value="week">Week view</option>
                <option value="agenda">Agenda view</option>
              </select>
              <ChevronDown size={14} className="calendar-select-arrow" />
            </div>

            {/* Primary Action Button */}
            <Button
              icon={Plus}
              variant="primary"
              onClick={onNewReview}
              className="calendar-add-btn"
            >
              New review
            </Button>
          </div>
        </header>

        {/* Activity Filter Tabs with GSAP Sliding Pill */}
        <div className="calendar-filters-bar">
          <Tabs
            label="Filter activities"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusTabs}
          />
          <div className="calendar-filters-legend">
            <span className="legend-dot legend-dot--sage" /> In Review
            <span className="legend-dot legend-dot--good" /> Approved
            <span className="legend-dot legend-dot--warn" /> Changes Needed
            <span className="legend-dot legend-dot--neutral" /> Submitted
          </div>
        </div>

        {/* ---------------- Month View ---------------- */}
        {viewMode === 'month' && (
          <div className="calendar-grid-wrap">
            {/* Days of Week Header */}
            <div className="calendar-weekdays-row">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="calendar-weekday-cell">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid Cells */}
            <div className="calendar-month-grid">
              {calendarDays.map((cell, idx) => {
                // Check if any multi-day campaign starts or runs on this day
                const activeCampaigns = MULTI_DAY_CAMPAIGNS.filter(
                  (c) => cell.dateStr >= c.startDate && cell.dateStr <= c.endDate
                )

                const visibleEvents = cell.events.slice(0, 2)
                const overflowCount = cell.events.length - 2

                return (
                  <div
                    key={cell.dateStr + idx}
                    className={cx(
                      'calendar-day-cell',
                      !cell.isCurrentMonth && 'is-outside-month',
                      cell.isToday && 'is-today'
                    )}
                  >
                    {/* Day Cell Header */}
                    <div className="calendar-day-top">
                      <span className={cx('calendar-day-number', cell.isToday && 'calendar-day-number--today')}>
                        {cell.dayNumber}
                      </span>
                    </div>

                    {/* Multi-Day Banner Pill (Nov 30 - Dec 2) */}
                    {activeCampaigns.map((camp) => (
                      <div
                        key={camp.id}
                        className={cx('calendar-banner-pill', `calendar-banner-pill--${camp.tone}`)}
                        title={`${camp.title} (${camp.startDate} – ${camp.endDate})`}
                      >
                        <span className="calendar-banner-text">{camp.title}</span>
                      </div>
                    ))}

                    {/* Event Pills List (Max 2 visible) */}
                    <div className="calendar-events-stack">
                      {visibleEvents.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          className={cx('calendar-event-pill', `calendar-event-pill--${ev.tone}`)}
                          onClick={() => setSelectedEvent(ev)}
                          title={`${ev.title} (${ev.detail})`}
                        >
                          <span className="calendar-event-pill__title">{ev.title}</span>
                          <span className="calendar-event-pill__time">
                            {formatEventTime(ev.time)}
                          </span>
                        </button>
                      ))}

                      {/* Clean Overflow link: "1 more...", "2 more..." */}
                      {overflowCount > 0 && (
                        <button
                          type="button"
                          className="calendar-overflow-link"
                          onClick={() => setSelectedDayEvents(cell)}
                        >
                          {overflowCount} more...
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ---------------- Week View ---------------- */}
        {viewMode === 'week' && (
          <div className="calendar-week-view">
            <div className="calendar-week-grid">
              {calendarDays.slice(7, 14).map((day) => (
                <div key={day.dateStr} className={cx('calendar-week-col', day.isToday && 'is-today')}>
                  <div className="calendar-week-col__head">
                    <span className="calendar-week-col__name">{new Date(day.dateStr).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className={cx('calendar-week-col__num', day.isToday && 'is-today')}>{day.dayNumber}</span>
                  </div>
                  <div className="calendar-week-col__body">
                    {day.events.length === 0 ? (
                      <div className="calendar-col-empty">No reviews</div>
                    ) : (
                      day.events.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          className={cx(
                            'calendar-week-card',
                            ev.status === 'approved' && 'calendar-week-card--good',
                            ev.type === 'submitted' && 'calendar-week-card--sage',
                            ev.status === 'needs_changes' && 'calendar-week-card--warn'
                          )}
                          onClick={() => setSelectedEvent(ev)}
                        >
                          <div className="calendar-week-card__top">
                            <span className="calendar-week-card__time">{formatEventTime(ev.time)}</span>
                            {ev.score !== null && <ScorePill score={ev.score} size="sm" />}
                          </div>
                          <strong>{ev.title}</strong>
                          <small>{ev.author}</small>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- Agenda View ---------------- */}
        {viewMode === 'agenda' && (
          <div className="calendar-agenda-view">
            {filteredEvents.length === 0 ? (
              <div className="calendar-agenda-empty">
                <p>No activity found matching your filters.</p>
              </div>
            ) : (
              <div className="calendar-agenda-list">
                {filteredEvents
                  .sort((a, b) => b.rawDate - a.rawDate)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="calendar-agenda-row"
                      onClick={() => setSelectedEvent(ev)}
                    >
                      <div className="calendar-agenda-date">
                        <strong>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
                        <small>{formatEventTime(ev.time)}</small>
                      </div>
                      <div className="calendar-agenda-main">
                        <div className="calendar-agenda-title-row">
                          <h4>{ev.title}</h4>
                          <StatusPill status={ev.status} />
                        </div>
                        <p>{ev.detail}</p>
                        <span className="calendar-agenda-meta">
                          <User size={13} /> {ev.author} • {ev.contentType.toUpperCase()}
                        </span>
                      </div>
                      <div className="calendar-agenda-right">
                        {ev.score !== null && <ScorePill score={ev.score} size="md" />}
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/reviews/${ev.submissionId}`)
                          }}
                        >
                          View <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </Panel>

      {/* Single Event Detail Drawer */}
      <Drawer
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Review detail'}
        description={`Activity logged on ${selectedEvent?.date ? formatDate(selectedEvent.date) : ''} at ${formatEventTime(selectedEvent?.time)}`}
        width="560px"
      >
        {selectedEvent && (
          <div className="calendar-detail-drawer">
            <div className="calendar-detail-header-card panel">
              <div className="calendar-detail-tags">
                <StatusPill status={selectedEvent.status} />
                {selectedEvent.score !== null && (
                  <ScorePill score={selectedEvent.score} size="md" />
                )}
              </div>
              <h3>{selectedEvent.title}</h3>
              <p className="calendar-detail-author">
                <User size={14} /> Submitted by <strong>{selectedEvent.author}</strong>
              </p>
            </div>

            <div className="calendar-detail-section">
              <h4>Review status & summary</h4>
              <p className="calendar-detail-notes">{selectedEvent.detail}</p>
            </div>

            {selectedEvent.contentText && (
              <div className="calendar-detail-section">
                <h4>Submission excerpt</h4>
                <div className="calendar-detail-excerpt">
                  {selectedEvent.contentText}
                </div>
              </div>
            )}

            <div className="calendar-detail-actions">
              <Button
                variant="primary"
                icon={ArrowUpRight}
                onClick={() => {
                  const id = selectedEvent.submissionId
                  setSelectedEvent(null)
                  navigate(`/reviews/${id}`)
                }}
              >
                Open in Review Studio
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Overflow Day Drawer */}
      <Drawer
        open={Boolean(selectedDayEvents)}
        onClose={() => setSelectedDayEvents(null)}
        title={selectedDayEvents ? `${formatDate(selectedDayEvents.dateStr)}` : 'Day schedule'}
        description={`${selectedDayEvents?.events?.length || 0} brand governance events logged`}
        width="520px"
      >
        {selectedDayEvents && (
          <div className="calendar-day-overflow-list">
            {selectedDayEvents.events.map((ev) => (
              <div
                key={ev.id}
                className="calendar-overflow-item panel"
                onClick={() => {
                  setSelectedDayEvents(null)
                  setSelectedEvent(ev)
                }}
              >
                <div className="calendar-overflow-item__head">
                  <span className="calendar-overflow-time">{formatEventTime(ev.time)}</span>
                  <StatusPill status={ev.status} />
                </div>
                <strong>{ev.title}</strong>
                <p>{ev.detail}</p>
                <small>By {ev.author}</small>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default Calendar
