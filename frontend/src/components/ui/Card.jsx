export function Card({ className = '', as: Tag = 'div', children, ...props }) {
  return (
    <Tag className={`kn-card ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`kn-card-header ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className = '', as: Tag = 'h3', children, ...props }) {
  return (
    <Tag className={`kn-card-title ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`kn-card-desc ${className}`} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`kn-card-content ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`kn-card-footer ${className}`} {...props}>
      {children}
    </div>
  )
}
