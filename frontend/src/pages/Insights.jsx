import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Download,
  Flame,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PulseChart, VolumeBars, Heatmap } from '../components/Charts'
import { Avatar, CategoryTag, Panel, SectionHead, Segmented } from '../components/UI'
import { categoryLabels, cx, formatCount } from '../lib/utils'

const flaggedTerms = [
  { term: 'seamless', count: 34, change: 8 },
  { term: 'eco-friendly', count: 28, change: 4 },
  { term: 'game-changing', count: 19, change: -2 },
  { term: 'utilize', count: 14, change: 1 },
  { term: 'carbon neutral', count: 11, change: 5 },
  { term: 'leverage', count: 9, change: -3 },
]

const team = [
  { name: 'Kruthik Kamegaonkar', role: 'Admin', reviewed: 32, score: 92, hours: '2.4h', approval: 96 },
  { name: 'Ashwik Saxena', role: 'Reviewer', reviewed: 64, score: 89, hours: '4.2h', approval: 94 },
  { name: 'Maya Iyer', role: 'Reviewer', reviewed: 58, score: 87, hours: '3.8h', approval: 92 },
  { name: 'Maddi Abhinav', role: 'Reviewer', reviewed: 46, score: 86, hours: '5.1h', approval: 89 },
]

const heatValues = [
  1, 2, 3, 2, 4, 3, 2, 2, 4, 4, 3, 1, 3, 4, 4, 3, 2, 4, 3, 1, 2, 3, 4, 4, 3, 2, 1, 3, 4, 4, 2, 1, 3, 4, 3,
  2, 2, 3, 4, 3, 1, 2,
]

const toneFor = (change) => (change > 0 ? 'warn' : 'good')

export function Insights() {
  const { data, toast } = useApp()
  const [period, setPeriod] = useState('30d')
  const days = period === '7d' ? 7 : period === '14d' ? 14 : 30
  const chartData = data.trends.slice(-days)

  const categories = useMemo(() => {
    const totals = data.issue_breakdown.reduce((result, item) => {
      if (!result[item.category]) result[item.category] = { total: 0, critical: 0, warning: 0, suggestion: 0 }
      result[item.category].total += item.count
      result[item.category][item.severity] += item.count
      return result
    }, {})
    return Object.entries(totals)
      .map(([category, value]) => ({ category, ...value }))
      .sort((a, b) => b.total - a.total)
  }, [data.issue_breakdown])

  const totalIssues = categories.reduce((sum, item) => sum + item.total, 0)
  const maxTerm = Math.max(...flaggedTerms.map((item) => item.count))

  const weeks = useMemo(() => {
    const result = []
    for (let index = 0; index < 5; index += 1) {
      const slice = data.trends.slice(index * 6, index * 6 + 6)
      result.push({
        label: `W${42 + index}`,
        value: slice.reduce((sum, point) => sum + point.submissions, 0),
      })
    }
    return result
  }, [data.trends])

  const exportReport = () => {
    const rows = [
      ['Klarity governance report'],
      ['Generated', new Date().toISOString()],
      [],
      ['Metric', 'Value'],
      ['Content reviewed', data.stats.total_submissions],
      ['Approval rate', `${data.stats.approval_rate}%`],
      ['Average score', data.stats.avg_score],
      ['Open issues', data.stats.open_issues],
      [],
      ['Issue category', 'Count'],
      ...categories.map((item) => [categoryLabels[item.category] || item.category, item.total]),
      [],
      ['Flagged term', 'Count'],
      ...flaggedTerms.map((item) => [item.term, item.count]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${cell ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'klarity-governance-report.csv'
    anchor.click()
    URL.revokeObjectURL(url)
    toast('Governance report exported as CSV.')
  }

  return (
    <div className="insights-page">
      <section className="page-head">
        <div>
          <h1>Insights</h1>
          <p>The patterns behind the scores. What keeps slipping, who is moving fastest, and where the rules need work.</p>
        </div>
        <div className="page-head__actions">
          <span className="insight-stat">
            <TrendingUp size={15} /> Quality up 1.6 pts this month
          </span>
          <button type="button" className="btn btn--secondary btn--md" onClick={exportReport}>
            <Download size={15} /> <span>Export report</span>
          </button>
        </div>
      </section>

      <section className="insights-hero">
        <Panel className="insight-chart-panel">
          <SectionHead
            title="The trend is quietly good"
            description="Average review score across every published piece."
            action={
              <Segmented
                label="Insight period"
                value={period}
                onChange={setPeriod}
                options={[
                  { value: '7d', label: '7d' },
                  { value: '14d', label: '14d' },
                  { value: '30d', label: '30d' },
                ]}
              />
            }
          />
          <div className="insight-chart-score">
            <strong>{data.stats.avg_score.toFixed(1)}</strong>
            <span>/100</span>
            <em>
              <ArrowUpRight size={13} /> 1.6 pts
            </em>
          </div>
          <PulseChart data={chartData} height={222} minScore={80} maxScore={94} target={85} />
        </Panel>

        <Panel className="term-panel">
          <SectionHead
            title="The words doing damage"
            description="Most flagged terms across the last 90 days."
            action={<Flame size={18} className="term-panel__flame" />}
          />
          <ul className="term-list">
            {flaggedTerms.map((item, index) => (
              <li key={item.term}>
                <span className="term-list__rank">{String(index + 1).padStart(2, '0')}</span>
                <span className="term-list__word">{item.term}</span>
                <span className="term-list__track">
                  <span className="term-list__bar" style={{ width: `${(item.count / maxTerm) * 100}%` }} />
                </span>
                <strong>{item.count}</strong>
                <span className={cx('term-list__change', `is-${toneFor(item.change)}`)}>
                  {item.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(item.change)}
                </span>
              </li>
            ))}
          </ul>
          <Link className="term-panel__link" to="/guidelines?guideline=2">
            <BookOpen size={14} /> Open the terminology guideline <ArrowUpRight size={13} />
          </Link>
        </Panel>
      </section>

      <section className="insights-row">
        <Panel className="mix-panel">
          <SectionHead
            title="Where the issues live"
            description={`${formatCount(totalIssues)} findings across ${categories.length} categories.`}
          />
          <div className="mix-list">
            {categories.map((item) => (
              <div key={item.category} className="mix-row">
                <div className="mix-row__head">
                  <CategoryTag category={item.category} />
                  <span>{formatCount(item.total)}</span>
                </div>
                <div className="mix-row__bar" role="img" aria-label={`${categoryLabels[item.category]}: ${item.total} issues`}>
                  {item.critical > 0 ? (
                    <span
                      className="mix-row__segment mix-row__segment--critical"
                      style={{ width: `${(item.critical / item.total) * 100}%` }}
                    />
                  ) : null}
                  {item.warning > 0 ? (
                    <span
                      className="mix-row__segment mix-row__segment--warning"
                      style={{ width: `${(item.warning / item.total) * 100}%` }}
                    />
                  ) : null}
                  {item.suggestion > 0 ? (
                    <span
                      className="mix-row__segment mix-row__segment--suggestion"
                      style={{ width: `${(item.suggestion / item.total) * 100}%` }}
                    />
                  ) : null}
                </div>
                <div className="mix-row__legend">
                  {item.critical ? <span><i className="dot-critical" />{item.critical} blocking</span> : null}
                  {item.warning ? <span><i className="dot-warning" />{item.warning} warnings</span> : null}
                  {item.suggestion ? <span><i className="dot-suggestion" />{item.suggestion} notes</span> : null}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="volume-panel">
          <SectionHead
            title="Review volume"
            description="Pieces submitted each week, last five weeks."
            action={<span className="volume-panel__total">{formatCount(data.stats.reviews_this_week)} this week</span>}
          />
          <VolumeBars data={weeks} height={230} />
          <p className="volume-panel__note">
            <Sparkles size={14} /> Volume is up 15.2% over the prior month. Review time held steady.
          </p>
        </Panel>
      </section>

      <section className="insights-row insights-row--lower">
        <Panel className="heat-panel">
          <SectionHead
            title="When reviews happen"
            description="Six weeks of review volume, Monday through Sunday."
            action={<span className="heat-panel__key">Inner ring = busier</span>}
          />
          <Heatmap data={heatValues.map((value) => ({ value }))} />
          <div className="heat-panel__note">
            <span>
              <strong>Thursday</strong> is the busiest review day. <strong>Monday morning</strong> is the quietest.
            </span>
            <Link to="/reviews">Open the queue <ArrowUpRight size={13} /></Link>
          </div>
        </Panel>

        <Panel className="team-panel">
          <SectionHead
            title="Reviewer performance"
            description="Throughput and quality by reviewer, last 30 days."
            action={<span className="live-tag"><span /> Live</span>}
          />
          <div className="table-wrap">
            <table className="data-table data-table--team">
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Reviewed</th>
                  <th>Avg. score</th>
                  <th>Turnaround</th>
                  <th>Approval</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member.name}>
                    <td>
                      <span className="team-cell">
                        <Avatar name={member.name} size="sm" />
                        <span>
                          <strong>{member.name.split(' ')[0]}</strong>
                          <small>{member.role}</small>
                        </span>
                      </span>
                    </td>
                    <td>{member.reviewed}</td>
                    <td>
                      <span className={cx('score-text', member.score >= 85 ? 'is-good' : 'is-warn')}>
                        {member.score}
                      </span>
                    </td>
                    <td>{member.hours}</td>
                    <td>{member.approval}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section className="gap-callout">
        <div className="gap-callout__blob" aria-hidden="true" />
        <div className="gap-callout__copy">
          <span className="gap-callout__tag">
            <BookOpen size={13} /> Guideline gap
          </span>
          <h2>The facts library is carrying too much weight.</h2>
          <p>
            Facts accounts for <strong>23 issues</strong> but only <strong>two guidelines</strong>. A worked example
            for sustainability claims would give creators a specific pattern to follow, not another abstract rule.
          </p>
          <Link to="/guidelines?guideline=3" className="btn btn--light btn--md">
            Review the facts library <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="gap-callout__stats">
          <div>
            <strong>23</strong>
            <span>fact issues</span>
          </div>
          <div>
            <strong>2</strong>
            <span>guidelines</span>
          </div>
          <div>
            <strong>19</strong>
            <span>blocking</span>
          </div>
        </div>
      </section>
    </div>
  )
}
