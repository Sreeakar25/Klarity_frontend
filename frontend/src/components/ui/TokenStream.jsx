import { useEffect, useState } from 'react'

export function TokenStream({ text = '', speed = 25, onComplete, className = '' }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let idx = 0
    const interval = setInterval(() => {
      idx += 1
      setDisplayed(text.slice(0, idx))
      if (idx >= text.length) {
        clearInterval(interval)
        setDone(true)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span className={`kn-token-stream ${className}`}>
      <span>{displayed}</span>
      {!done && <span className="kn-token-stream__caret" aria-hidden="true" />}
    </span>
  )
}
