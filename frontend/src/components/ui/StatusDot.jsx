export function StatusDot({
  status = 'online',
  pulse = false,
  size = 'sm',
  className = '',
  ...props
}) {
  return (
    <span
      className={`kn-status-dot kn-status-dot--${status} kn-status-dot--${size} ${pulse ? 'is-pulsing' : ''} ${className}`}
      aria-hidden="true"
      {...props}
    >
      <span className="kn-status-dot__circle" />
      {pulse && <span className="kn-status-dot__ring" />}
    </span>
  )
}
