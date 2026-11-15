export function ShimmerText({ children, className = '', as: Component = 'span', ...props }) {
  return (
    <Component className={`kn-shimmer-text ${className}`} {...props}>
      {children}
    </Component>
  )
}
