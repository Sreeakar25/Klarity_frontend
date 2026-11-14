import { useEffect, useRef, useState } from 'react'
import { animateNumber, isReducedMotion } from '../lib/animations'

export function AnimatedValue({ value, suffix = '', duration = 750, className = '' }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(0)

  useEffect(() => {
    if (value === undefined || value === null) return

    const str = String(value).trim()
    const isPercent = str.endsWith('%')
    const cleanStr = str.replace(/[%,]/g, '')
    const num = parseFloat(cleanStr)

    if (Number.isNaN(num) || isReducedMotion()) {
      setDisplay(value)
      return
    }

    const hasDecimal = cleanStr.includes('.')
    const decimals = hasDecimal ? cleanStr.split('.')[1].length : 0
    const hasComma = str.includes(',')

    const fromVal = prevRef.current
    prevRef.current = num

    const formatter = (v) => {
      let formatted = v.toFixed(decimals)
      if (hasComma) {
        const parts = formatted.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        formatted = parts.join('.')
      }
      if (isPercent) formatted += '%'
      return formatted
    }

    const cancel = animateNumber({
      from: fromVal,
      to: num,
      duration,
      formatter,
      onUpdate: (formatted) => setDisplay(formatted),
    })

    return cancel
  }, [value, duration])

  return (
    <>
      <strong className={className}>{display}</strong>
      {suffix ? <small>{suffix}</small> : null}
    </>
  )
}
