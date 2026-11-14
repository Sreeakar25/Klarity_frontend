import { useMemo, useState } from 'react'
import { cx, formatCount } from '../lib/utils'

const smoothPath = (points) => {
  if (points.length < 2) return ''
  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    const control = (current.x + next.x) / 2
    path += ` C ${control} ${current.y}, ${control} ${next.y}, ${next.x} ${next.y}`
  }
  return path
}

export function PulseChart({
  data = [],
  height = 244,
  minScore = 78,
  maxScore = 94,
  target = 85,
  label = 'Content health trend',
}) {
  const [active, setActive] = useState(null)
  const width = 760
  const padX = 10
  const padTop = 20
  const padBottom = 28
  const innerHeight = height - padTop - padBottom
  const values = data.map((point) => point.avg_score ?? point.value ?? 0)
  const low = Math.min(minScore, ...values.filter(Boolean)) - 1
  const high = Math.max(maxScore, ...values.filter(Boolean)) + 1
  const span = Math.max(1, high - low)

  const points = useMemo(
    () =>
      data.map((point, index) => {
        const value = point.avg_score ?? point.value ?? low
        const x = padX + (index * (width - padX * 2)) / Math.max(1, data.length - 1)
        const y = padTop + ((high - value) / span) * innerHeight
        return { ...point, value, x, y }
      }),
    [data, high, low, span, innerHeight],
  )

  const linePath = smoothPath(points)
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${height - padBottom} L ${points[0].x} ${height - padBottom} Z`
    : ''
  const targetY = padTop + ((high - target) / span) * innerHeight
  const activePoint = active !== null ? points[active] : null
  const gridLines = [0, 1, 2, 3].map((step) => {
    const value = low + (span * step) / 3
    return { value, y: padTop + ((high - value) / span) * innerHeight }
  })

  const handlePointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    const index = Math.round(ratio * (points.length - 1))
    setActive(index)
  }

  if (!points.length) return null

  return (
    <div className="pulse-chart" style={{ '--chart-height': `${height}px` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="pulse-chart__svg"
        role="img"
        aria-label={`${label}: ${Math.round(values[values.length - 1])} out of 100`}
        onPointerMove={handlePointer}
        onPointerLeave={() => setActive(null)}
      >
        {gridLines.map((line) => (
          <g key={line.value}>
            <line
              x1={padX}
              y1={line.y}
              x2={width - padX}
              y2={line.y}
              className="pulse-chart__grid"
            />
            <text x={width - padX} y={line.y - 6} textAnchor="end" className="pulse-chart__axis">
              {Math.round(line.value)}
            </text>
          </g>
        ))}
        <line
          x1={padX}
          y1={targetY}
          x2={width - padX}
          y2={targetY}
          className="pulse-chart__target"
        />
        <text x={padX + 6} y={targetY - 7} className="pulse-chart__target-label">
          Target {target}
        </text>
        <path d={areaPath} className="pulse-chart__area" />
        <path d={linePath} className="pulse-chart__line" />
        {activePoint ? (
          <>
            <line
              x1={activePoint.x}
              y1={padTop}
              x2={activePoint.x}
              y2={height - padBottom}
              className="pulse-chart__cursor"
            />
            <circle cx={activePoint.x} cy={activePoint.y} r="6.5" className="pulse-chart__dot-halo" />
            <circle cx={activePoint.x} cy={activePoint.y} r="3.6" className="pulse-chart__dot" />
          </>
        ) : (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="3.4"
            className="pulse-chart__dot"
          />
        )}
        {[0, 6, 13, 20, 29].map((index) => {
          const point = points[index]
          if (!point) return null
          return (
            <text
              key={point.date || index}
              x={point.x}
              y={height - 7}
              textAnchor={index === 0 ? 'start' : index === 29 ? 'end' : 'middle'}
              className="pulse-chart__axis pulse-chart__axis--x"
            >
              {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
                new Date(`${point.date}T12:00:00`),
              )}
            </text>
          )
        })}
      </svg>
      {activePoint ? (
        <div
          className="chart-tooltip"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${Math.max(0, (activePoint.y / height) * 100 - 14)}%`,
          }}
        >
          <strong>{activePoint.value.toFixed(1)}</strong>
          <span>
            {formatCount(activePoint.submissions)} reviewed ·{' '}
            {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
              new Date(`${activePoint.date}T12:00:00`),
            )}
          </span>
        </div>
      ) : null}
    </div>
  )
}

export function VolumeBars({ data = [], height = 160 }) {
  const max = Math.max(1, ...data.map((item) => item.value ?? item.submissions ?? 0))
  return (
    <div className="volume-bars" style={{ height }}>
      {data.map((item, index) => {
        const value = item.value ?? item.submissions ?? 0
        const percent = Math.max(4, (value / max) * 100)
        return (
          <div className="volume-bars__col" key={item.label ?? item.date ?? index}>
            <span className="volume-bars__value">{value}</span>
            <span className="volume-bars__bar" style={{ height: `${percent}%` }} />
            <span className="volume-bars__label">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function Heatmap({ weeks = 6, data = [] }) {
  const cells = Array.from({ length: weeks * 7 }, (_, index) => {
    const point = data[index % Math.max(1, data.length)] || {}
    return point.value ?? ((index * 7 + 3) % 5)
  })
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div className="heatmap">
      <div className="heatmap__days">
        {days.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="heatmap__grid" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
        {Array.from({ length: 7 }).map((_, row) =>
          Array.from({ length: weeks }).map((__, column) => {
            const value = cells[column * 7 + row] ?? 0
            return (
              <span
                key={`${row}-${column}`}
                className={cx('heatmap__cell', `heatmap__cell--${Math.min(4, value)}`)}
                title={`Week ${column + 1}, ${days[row]}: ${value} reviews`}
              />
            )
          }),
        )}
      </div>
      <div className="heatmap__legend">
        <span>Quiet</span>
        {[0, 1, 2, 3, 4].map((value) => (
          <span key={value} className={cx('heatmap__cell', `heatmap__cell--${value}`)} />
        ))}
        <span>Busy</span>
      </div>
    </div>
  )
}
