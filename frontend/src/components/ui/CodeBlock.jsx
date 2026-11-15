import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CodeBlock({
  code = '',
  language = 'bash',
  filename,
  showLineNumbers = true,
  className = '',
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.trim().split('\n')

  return (
    <div className={`kn-code-block ${className}`}>
      {(filename || language) && (
        <div className="kn-code-block__header">
          <span className="kn-code-block__filename">{filename || language}</span>
          <button
            type="button"
            className="kn-code-block__copy"
            onClick={handleCopy}
            aria-label="Copy code to clipboard"
          >
            {copied ? <Check size={13} className="text-good" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}
      <pre className="kn-code-block__pre">
        <code>
          {lines.map((line, idx) => (
            <div key={idx} className="kn-code-block__line">
              {showLineNumbers && <span className="kn-code-block__num">{idx + 1}</span>}
              <span className="kn-code-block__text">{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}
