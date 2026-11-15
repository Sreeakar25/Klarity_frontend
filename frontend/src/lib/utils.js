export const cx = (...values) => values.filter(Boolean).join(' ')

export const statusMeta = {
  approved: { label: 'Approved', tone: 'good' },
  needs_changes: { label: 'Changes requested', tone: 'warn' },
  rejected: { label: 'Rejected', tone: 'bad' },
  reviewing: { label: 'In review', tone: 'info' },
  pending: { label: 'Pending', tone: 'muted' },
}

export const severityMeta = {
  critical: { label: 'Blocking', tone: 'bad' },
  warning: { label: 'Warning', tone: 'warn' },
  suggestion: { label: 'Suggestion', tone: 'info' },
}

export const categoryLabels = {
  tone: 'Tone',
  terminology: 'Terminology',
  facts: 'Facts',
  visual: 'Visual',
  grammar: 'Grammar',
}

export const typeLabels = {
  text: 'Copy',
  html: 'Page',
  document: 'Document',
  image: 'Visual',
  video: 'Video',
}

export const latestReport = (submission) => {
  if (!submission?.reports?.length) return null
  return [...submission.reports].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0]
}

export const scoreTone = (score) => {
  if (score >= 85) return 'good'
  if (score >= 70) return 'warn'
  return 'bad'
}

export const formatDate = (value, options = {}) => {
  if (!value) return '—'
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(options.year ? { year: 'numeric' } : {}),
  }).format(date)
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export const timeAgo = (value) => {
  if (!value) return '—'
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.max(1, Math.round(diff / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(value)
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

export const formatCount = (value) => new Intl.NumberFormat('en-GB').format(value)

export const percent = (value, digits = 0) =>
  `${Number(value).toFixed(digits)}%`

export const deltaLabel = (value, suffix = '%') => {
  if (value === 0) return 'No change'
  return `${value > 0 ? '+' : ''}${Number(value).toFixed(1)}${suffix}`
}

export const ACTION_STATUS = {
  approved: 'approved',
  rejected: 'rejected',
  changes_requested: 'needs_changes',
}

export const actionLabel = {
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes requested',
  submitted: 'Submitted',
}

/* A small local stand-in for the API analyser so the app still works offline. */
export const localAnalyse = (title, text, contentType, guidelines = []) => {
  const lowered = `${title}\n${text}`.toLowerCase()
  const found = []
  const byTitle = (needle) => guidelines.find((item) => item.title.toLowerCase().includes(needle))

  const add = (severity, category, issueTitle, description, evidence, fix, guideline) => {
    if (found.some((item) => item.title === issueTitle)) return
    found.push({
      id: -Date.now() - found.length,
      severity,
      category,
      title: issueTitle,
      description,
      evidence,
      suggested_fix: fix,
      guideline_id: guideline?.id ?? null,
    })
  }

  const terms = [
    ['game-changing', 'tone', 'Hype language', 'The brand voice is grounded and specific; this phrase is a claim without substance.', 'Replace the phrase with a concrete observation.', 'Brand voice principles'],
    ['seamless', 'terminology', 'Empty adjective', "'Seamless' has appeared in dozens of pieces this quarter and no longer carries meaning.", 'Say what is actually continuous or easy.', 'Words we use and avoid'],
    ['revolutionary', 'tone', 'Hype language', 'Revolutionary reads as marketing noise next to the brand voice.', 'Keep the specific benefit and remove the hype.', 'Brand voice principles'],
    ['eco-friendly', 'terminology', 'Unsubstantiated term', 'Use a specific material or process instead of the banned umbrella term.', 'Name the fibre, dye process, or certification.', 'Words we use and avoid'],
    ['utilize', 'terminology', 'Formal filler', "Prefer 'use'. It is shorter and warmer.", "Replace 'utilize'.", 'Words we use and avoid'],
    ['leverage', 'terminology', 'Corporate filler', "Prefer 'use' or 'build on'.", "Replace 'leverage'.", 'Words we use and avoid'],
    ["world's best", 'facts', 'Unsupported superlative', 'A superlative needs a named, verifiable source.', 'Link the ranking body and year, or remove the claim.', 'Claim substantiation'],
  ]

  terms.forEach(([term, category, issueTitle, description, fix, guidelineTitle]) => {
    if (lowered.includes(term)) {
      add(
        category === 'facts' ? 'critical' : 'warning',
        category,
        issueTitle,
        description,
        `Found “${term}” in the submitted copy.`,
        fix,
        byTitle(guidelineTitle.split(' ')[0]),
      )
    }
  })

  ;['100% sustainable', 'carbon neutral', 'zero waste', 'fully recyclable'].forEach((term) => {
    if (lowered.includes(term)) {
      add(
        'critical',
        'facts',
        'Unsubstantiated sustainability claim',
        'A sustainability claim needs a named certification, standard, or measured figure before it can ship.',
        `“${term}” appears without a source.`,
        'State the material or certification and link the evidence.',
        byTitle('sustain'),
      )
    }
  })

  if ((text.match(/!/g) || []).length >= 3) {
    add(
      'suggestion',
      'tone',
      'Too many exclamation marks',
      'The brand voice is warm, not shouty. Repeated exclamation marks flatten the emphasis.',
      'Three or more exclamation marks in one piece.',
      'Keep at most one, or remove them and strengthen the verb.',
      byTitle('voice'),
    )
  }

  if (contentType === 'image') {
    add(
      'warning',
      'visual',
      'Logo clear space cannot be verified',
      'The submitted visual is a flattened preview. The logo lockup needs at least 24px of clear space.',
      'No layered source file was supplied.',
      'Upload the layered file or confirm the lockup in the brand kit.',
      byTitle('logo'),
    )
  }

  const order = { critical: 0, warning: 1, suggestion: 2 }
  found.sort((a, b) => order[a.severity] - order[b.severity])
  const penalty = { critical: 14, warning: 6, suggestion: 2 }
  const score = Math.max(42, Math.min(99, 100 - found.reduce((sum, item) => sum + penalty[item.severity], 0)))
  const summary = found.length
    ? `Found ${found.length} guideline ${found.length === 1 ? 'issue' : 'issues'}. ${
        found.some((item) => item.severity === 'critical')
          ? 'At least one claim needs evidence before this can publish.'
          : 'A few edits will bring it back on brand.'
      }`
    : 'No guideline breaches found. The piece keeps the brand voice and every claim is specific.'

  return { score, summary, issues: found }
}
