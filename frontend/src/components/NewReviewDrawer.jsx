import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, FileCheck2, FileText, Image, LayoutTemplate, ScanSearch, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, Drawer, Field } from './UI'

const contentTypes = [
  { value: 'text', label: 'Copy', icon: FileText },
  { value: 'html', label: 'Page', icon: LayoutTemplate },
  { value: 'document', label: 'Document', icon: FileCheck2 },
  { value: 'image', label: 'Visual', icon: Image },
]

const emptyForm = {
  title: '',
  content_type: 'text',
  submitted_by: 'Kruthik Kamegaonkar',
  content_text: '',
}

export function NewReviewDrawer({ open, onClose }) {
  const { createSubmission, currentUser } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, submitted_by: currentUser })
      setErrors({})
      setSubmitting(false)
    }
  }, [open, currentUser])

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Give the review a title so the team can find it.'
    if (form.content_text.trim().length < 20) nextErrors.content_text = 'Add at least a sentence of content to review.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    setSubmitting(true)
    try {
      const created = await createSubmission({
        title: form.title.trim(),
        content_type: form.content_type,
        content_text: form.content_text.trim(),
        submitted_by: form.submitted_by || currentUser,
      })
      onClose()
      if (created?.id) navigate(`/reviews/${created.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New review"
      description="Paste the content. Klarity checks it against the live guideline library before it reaches an audience."
      width="600px"
      footer={
        <div className="drawer__actions">
          <Button variant="ghost" onClick={onClose} type="button" disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="new-review-form" loading={submitting} icon={ScanSearch}>
            {submitting ? 'Reviewing content' : 'Run review'}
          </Button>
        </div>
      }
    >
      <form id="new-review-form" className="review-form" onSubmit={submit}>
        <Field label="Review title" htmlFor="review-title" error={errors.title}>
          <input
            id="review-title"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder="e.g. Spring collection · product page"
            autoComplete="off"
          />
        </Field>

        <div className="form-row">
          <Field label="Content type" htmlFor="review-type">
            <div className="type-choice" role="radiogroup" aria-label="Content type">
              {contentTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    role="radio"
                    aria-checked={form.content_type === type.value}
                    className={form.content_type === type.value ? 'is-selected' : ''}
                    onClick={() => update('content_type', type.value)}
                  >
                    <Icon size={16} />
                    {type.label}
                  </button>
                )
              })}
            </div>
          </Field>
        </div>

        <Field
          label="Submitted by"
          htmlFor="review-owner"
          hint="The audit trail records who submitted the piece."
        >
          <input
            id="review-owner"
            value={form.submitted_by}
            onChange={(event) => update('submitted_by', event.target.value)}
            autoComplete="off"
          />
        </Field>

        <Field
          label="Content"
          htmlFor="review-content"
          error={errors.content_text}
          hint={`${form.content_text.trim().split(/\s+/).filter(Boolean).length} words · checked against 12 guidelines`}
        >
          <textarea
            id="review-content"
            value={form.content_text}
            onChange={(event) => update('content_text', event.target.value)}
            placeholder="Paste the copy, caption, page text, or describe the visual asset…"
            rows={9}
          />
        </Field>

        <div className="review-form__hint">
          <Sparkles size={16} />
          <div>
            <strong>What runs</strong>
            <p>
              Tone, approved terminology, claim substantiation, sustainability language, and visual clear space.
              The report cites the guideline behind every issue.
            </p>
          </div>
        </div>

        <ul className="review-form__steps" aria-label="Review steps">
          {['Read the content', 'Match against guidelines', 'Score and evidence', 'Route to a human'].map(
            (step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                {step}
                {index < 3 ? <Check size={13} /> : null}
              </li>
            ),
          )}
        </ul>
      </form>
    </Drawer>
  )
}
