export function Kbd({ children, className = '', ...props }) {
  return (
    <kbd className={`kn-kbd ${className}`} {...props}>
      {children}
    </kbd>
  )
}
