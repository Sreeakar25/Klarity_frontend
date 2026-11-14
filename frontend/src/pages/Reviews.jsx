import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  LayoutTemplate,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  Button,
  EmptyState,
  Panel,
  ScorePill,
  StatusPill,
  Tabs,
} from '../components/UI'
import {
  cx,
  formatDate,
  latestReport,
  scoreTone,
  timeAgo,
  typeLabels,
} from '../lib/utils'

const typeIcon = { text: FileText, html: LayoutTemplate, image: Image }

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'reviewing', label: 'In review' },
  { value: 'needs_changes', label: 'Changes' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const PAGE_SIZE = 10

export function Reviews({ onNewReview }) {
  const { data } = useApp()
  const navigate = useNavigate()
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(0)

  const counts = useMemo(() => {
    const base = { all: data.submissions.length }
    data.submissions.forEach((item) => {
      base[item.status] = (base[item.status] || 0) + 1
    })
    return base
  }, [data.submissions])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const result = data.submissions.filter((item) => {
      const matchesStatus = status === 'all' || item.status === status
      const matchesType = type === 'all' || item.content_type === type
      const matchesQuery =
        !needle ||
        item.title.toLowerCase().includes(needle) ||
        item.submitted_by.toLowerCase().includes(needle)
      return matchesStatus && matchesType && matchesQuery
    })
    return result.sort((a, b) => {
      if (sort === 'score') {
        return (latestReport(b)?.overall_score || 0) - (latestReport(a)?.overall_score || 0)
      }
      if (sort === 'oldest') return new Date(a.submitted_at) - new Date(b.submitted_at)
      return new Date(b.submitted_at) - new Date(a.submitted_at)
    })
  }, [data.submissions, query, sort, status, type])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const visible = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  const reset = () => {
    setStatus('all')
    setType('all')
    setQuery('')
    setPage(0)
  }

  return (
    <div className="reviews-page">
      <section className="page-head">
        <div>
          <h1>Reviews</h1>
          <p>
            Every piece of content that has passed through the workspace, with its evidence and decision.
          </p>
        </div>
        <div className="page-head__actions">
          <span className="review-count">
            <strong>{data.stats.pending_reviews}</strong> waiting on a reviewer
          </span>
          <Button icon={Plus} onClick={onNewReview}>
            New review
          </Button>
        </div>
      </section>

      <Panel className="reviews-panel">
        <div className="reviews-toolbar">
          <Tabs
            label="Filter by status"
            value={status}
            onChange={(value) => {
              setStatus(value)
              setPage(0)
            }}
            options={statusTabs.map((tab) => ({ ...tab, count: counts[tab.value] || 0 }))}
          />
          <div className="reviews-toolbar__controls">
            <label className="search-field search-field--small">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(0)
                }}
                placeholder="Search title or owner"
                aria-label="Search reviews"
              />
              {query ? (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={14} />
                </button>
              ) : null}
            </label>
            <label className="select-field">
              <SlidersHorizontal size={14} />
              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value)
                  setPage(0)
                }}
                aria-label="Filter by content type"
              >
                <option value="all">All types</option>
                <option value="text">Copy</option>
                <option value="html">Pages</option>
                <option value="image">Visuals</option>
              </select>
            </label>
            <label className="select-field select-field--plain">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort reviews"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="score">Highest score</option>
              </select>
            </label>
          </div>
        </div>

        {visible.length ? (
          <>
            <div className="table-wrap">
              <table className="data-table data-table--reviews">
                <thead>
                  <tr>
                    <th>Content</th>
                    <th>Owner</th>
                    <th>Submitted</th>
                    <th>Issues</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th aria-label="Open" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => {
                    const report = latestReport(item)
                    const Icon = typeIcon[item.content_type] || FileText
                    const critical = report?.issues?.filter((issue) => issue.severity === 'critical').length || 0
                    return (
                      <tr
                        key={item.id}
                        onClick={() => navigate(`/reviews/${item.id}`)}
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            navigate(`/reviews/${item.id}`)
                          }
                        }}
                      >
                        <td>
                          <span className="table-title">
                            <span className="table-title__icon">
                              <Icon size={15} />
                            </span>
                            <span>
                              <strong>{item.title}</strong>
                              <small>
                                {typeLabels[item.content_type]} · {timeAgo(item.submitted_at)}
                              </small>
                            </span>
                          </span>
                        </td>
                        <td>
                          <span className="owner-cell">
                            <span className="owner-cell__dot" />
                            {item.submitted_by}
                          </span>
                        </td>
                        <td className="muted-cell">{formatDate(item.submitted_at)}</td>
                        <td>
                          {report ? (
                            <span className={cx('issue-count', critical > 0 && 'has-critical')}>
                              {report.issues.length}
                              {critical > 0 ? <i>{critical} blocking</i> : null}
                            </span>
                          ) : (
                            <span className="muted-cell">—</span>
                          )}
                        </td>
                        <td>{report ? <ScorePill score={report.overall_score} size="sm" /> : '—'}</td>
                        <td>
                          <StatusPill status={item.status} />
                        </td>
                        <td>
                          <Link
                            to={`/reviews/${item.id}`}
                            className="row-open"
                            aria-label={`Open ${item.title}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <ArrowUpRight size={15} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-pagination">
              <p>
                Showing <strong>{currentPage * PAGE_SIZE + 1}</strong>–
                <strong>{Math.min(filtered.length, (currentPage + 1) * PAGE_SIZE)}</strong> of{' '}
                <strong>{filtered.length}</strong> reviews
              </p>
              <div>
                <button
                  type="button"
                  className="pager-btn"
                  onClick={() => setPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <span className="pager-count">
                  {currentPage + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  className="pager-btn"
                  onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))}
                  disabled={currentPage >= pageCount - 1}
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={Search}
            title="No reviews match this view"
            description="Clear the search or filters to see the full queue again."
            action={
              <Button variant="secondary" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        )}
      </Panel>
    </div>
  )
}
