import { StatusDot } from './StatusDot'

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  dotStatus = 'online',
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <span className={`kn-badge kn-badge--${variant} kn-badge--${size} ${className}`} {...props}>
      {dot && <StatusDot status={dotStatus} size="xs" />}
      {Icon && <Icon size={size === 'sm' ? 12 : 14} className="kn-badge__icon" />}
      <span>{children}</span>
    </span>
  )
}
