import { useRef } from 'react'
import { gsap } from 'gsap'
import { isReducedMotion } from '../lib/animations'

export function BrandMark({ size = 34, className = '' }) {
  const svgRef = useRef(null)

  const handleMouseEnter = () => {
    if (isReducedMotion() || !svgRef.current) return
    gsap.to(svgRef.current, {
      scale: 1.06,
      duration: 0.3,
      ease: 'back.out(2)',
    })
  }

  const handleMouseLeave = () => {
    if (isReducedMotion() || !svgRef.current) return
    gsap.to(svgRef.current, {
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Klarity mark"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ transformOrigin: 'center center', willChange: 'transform' }}
    >
      <path
        d="M32 6c14.2 0 25 9.9 25 24.3C57 46.8 44.5 58 32 58S7 46.8 7 30.3C7 15.9 17.8 6 32 6Z"
        fill="var(--sage, #298EE4)"
      />
      <path
        d="M23.5 20.5h6.1v23h-6.1v-23Zm5.7 10.6L40.8 20.5h7.5L37.5 35.6l11.4 7.9h-7.8L29.2 32.1v-1Z"
        fill="var(--paper-raised, #FBF8F1)"
      />
    </svg>
  )
}

export function OakMark({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 3c5.8 0 10.5 5.6 10.5 12.4C26.5 24.3 21.8 29 16 29S5.5 24.3 5.5 15.4C5.5 8.6 10.2 3 16 3Z"
        fill="currentColor"
      />
      <path
        d="M11 9h3v14h-3V9Zm2.8 6.4L20 9h4l-5.7 7 6 7h-4.2l-6.3-6v-1.6Z"
        fill="var(--cream, #F6F1E6)"
      />
    </svg>
  )
}
