import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CircleAlert,
  FileText,
  PencilLine,
  Plus,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  Badge,
  Button,
  CategoryTag,
  Drawer,
  EmptyState,
  Field,
  Panel,
  Select,
  StatusDot,
  Tabs,
} from '../components/UI'
import { categoryLabels, cx, formatDate, timeAgo } from '../lib/utils'

const categories = [
  { value: 'all', label: 'All' },
  { value: 'tone', label: 'Tone' },
  { value: 'terminology', label: 'Terminology' },
  { value: 'facts', label: 'Facts' },
  { value: 'visual', label: 'Visual' },
]

const priorityLabels = { 5: 'Critical', 4: 'High', 3: 'Standard', 2: 'Reference', 1: 'Reference' }

const emptyForm = {
  title: '',
  category: 'tone',
  priority: 3,
  content: '',
}

function GuidelineDrawer({ open, onClose, editing }) {
  const { createGuideline, updateGuideline } = useApp()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [initialised, setInitialised] = useState(null)

  // Reset the form when the drawer opens for a new target.
  const targetKey = `${open}-${editing?.id || 'new'}`
  if (initialised !== targetKey) {
    setInitialised(targetKey)
    setForm(
      editing
        ? {
            title: editing.title,
            category: editing.category,
            priority: editing.priority,
            content: editing.content,
          }
        : emptyForm,
    )
    setErrors({})
  }

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!form.title.trim()) next.title = 'A guideline needs a short title.'
    if (form.content.trim().length < 30) next.content = 'Write at least a sentence of guidance.'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    setBusy(true)
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        priority: Number(form.priority),
        content: form.content.trim(),
      }
      if (editing) await updateGuideline(editing.id, payload)
      else await createGuideline(payload)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? 'Edit guideline' : 'New guideline'}
      description={
        editing
          ? 'Changes apply to the next review that runs. Existing reports keep their original evidence.'
          : 'Add a clear rule the analyser and the team can both use.'
      }
      footer={
        <div className="drawer__actions">
          <Button variant="ghost" type="button" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="guideline-form" loading={busy} icon={editing ? PencilLine : Plus}>
            {editing ? 'Save guideline' : 'Publish guideline'}
          </Button>
        </div>
      }
    >
      <form id="guideline-form" className="guideline-form" onSubmit={submit}>
        <Field label="Title" htmlFor="guideline-title" error={errors.title}>
          <input
            id="guideline-title"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder="e.g. Claim substantiation"
          />
        </Field>
        <div className="form-row form-row--two">
          <Field label="Category" htmlFor="guideline-category">
            <Select
              id="guideline-category"
              value={form.category}
              onChange={(val) => update('category', val)}
              options={[
                { value: 'tone', label: 'Tone' },
                { value: 'terminology', label: 'Terminology' },
                { value: 'facts', label: 'Facts' },
                { value: 'visual', label: 'Visual' },
              ]}
            />
          </Field>
          <Field label="Priority" htmlFor="guideline-priority" hint={priorityLabels[form.priority]}>
            <Select
              id="guideline-priority"
              value={form.priority}
              onChange={(val) => update('priority', Number(val))}
              options={[
                { value: 5, label: '5 · Critical' },
                { value: 4, label: '4 · High' },
                { value: 3, label: '3 · Standard' },
                { value: 2, label: '2 · Reference' },
                { value: 1, label: '1 · Reference' },
              ]}
            />
          </Field>
        </div>
        <Field
          label="Guidance"
          htmlFor="guideline-content"
          error={errors.content}
          hint="Write the rule and one concrete example. Specific guidance produces specific suggestions."
        >
          <textarea
            id="guideline-content"
            rows={10}
            value={form.content}
            onChange={(event) => update('content', event.target.value)}
            placeholder="What must the team do? What should they avoid? What does a good example look like?"
          />
        </Field>
        <div className="review-form__hint">
          <ShieldCheck size={16} />
          <div>
            <strong>Priority changes behaviour</strong>
            <p>Critical guidelines can block publication. Reference guidelines still show a suggestion.</p>
          </div>
        </div>
      </form>
    </Drawer>
  )
}

export function Guidelines() {
  const { data } = useApp()
  const [params, setParams] = useSearchParams()
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const selectedId = Number(params.get('guideline'))
  const selected = data.guidelines.find((item) => item.id === selectedId) || data.guidelines[0]

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return data.guidelines
      .filter((guideline) => category === 'all' || guideline.category === category)
      .filter(
        (guideline) =>
          !needle ||
          guideline.title.toLowerCase().includes(needle) ||
          guideline.content.toLowerCase().includes(needle),
      )
      .sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title))
  }, [category, data.guidelines, query])

  const countFor = (value) =>
    value === 'all'
      ? data.guidelines.length
      : data.guidelines.filter((guideline) => guideline.category === value).length

  const coverage = data.coverage.find((item) => item.category === selected?.category)

  const select = (id) => {
    const next = new URLSearchParams(params)
    next.set('guideline', String(id))
    setParams(next, { replace: true })
  }

  const openNew = () => {
    setEditing(null)
    setDrawerOpen(true)
  }

  const openEdit = () => {
    if (!selected) return
    setEditing(selected)
    setDrawerOpen(true)
  }

  return (
    <div className="guidelines-page">
      <section className="page-head">
        <div>
          <h1>Guidelines</h1>
          <p>The source of truth behind every review. Clear rules, specific examples, visible ownership.</p>
        </div>
        <div className="page-head__actions">
          <Badge variant="sage" dot dotStatus="online">
            <strong>{data.guidelines.length}</strong> active rules
          </Badge>
          <Button icon={Plus} onClick={openNew}>
            New guideline
          </Button>
        </div>
      </section>

      <Panel className="guideline-workspace">
        <div className="guideline-list">
          <div className="guideline-list__head">
            <label className="search-field search-field--small">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search guidelines"
                aria-label="Search guidelines"
              />
            </label>
            <Tabs
              label="Filter guidelines by category"
              value={category}
              onChange={setCategory}
              options={categories.map((item) => ({ ...item, count: countFor(item.value) }))}
            />
          </div>
          <div className="guideline-list__scroll">
            {filtered.length ? (
              filtered.map((guideline) => (
                <button
                  key={guideline.id}
                  type="button"
                  className={cx('guideline-item', selected?.id === guideline.id && 'is-active')}
                  onClick={() => select(guideline.id)}
                >
                  <span className={cx('guideline-item__prio', `prio-${guideline.priority}`)}>
                    {guideline.priority}
                  </span>
                  <span className="guideline-item__copy">
                    <span>
                      <CategoryTag category={guideline.category} />
                      <small>Updated {timeAgo(guideline.updated_at)}</small>
                    </span>
                    <strong>{guideline.title}</strong>
                    <p>{guideline.content}</p>
                  </span>
                  <ArrowUpRight size={14} className="guideline-item__arrow" />
                </button>
              ))
            ) : (
              <EmptyState
                compact
                icon={Search}
                title="No guidelines found"
                description="Try another category or clear the search."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setQuery('')
                      setCategory('all')
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {selected ? (
          <article className="guideline-detail">
            <header className="guideline-detail__head">
              <div>
                <div className="guideline-detail__meta">
                  <CategoryTag category={selected.category} />
                  <span className={cx('priority-chip', `prio-${selected.priority}`)}>
                    Priority {selected.priority} · {priorityLabels[selected.priority]}
                  </span>
                </div>
                <h2>{selected.title}</h2>
                <p>
                  Created {formatDate(selected.created_at, { year: true })} · Updated{' '}
                  {formatDate(selected.updated_at, { year: true })}
                </p>
              </div>
              <Button variant="secondary" size="sm" icon={PencilLine} onClick={openEdit}>
                Edit
              </Button>
            </header>

            <div className="guideline-detail__body">
              {selected.content.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="guideline-facts">
              <div>
                <span>Category</span>
                <strong>{categoryLabels[selected.category]}</strong>
              </div>
              <div>
                <span>Issues citing this category</span>
                <strong>{coverage?.issues ?? 0}</strong>
              </div>
              <div>
                <span>Priority</span>
                <strong>
                  <span className={cx('priority-dots', `prio-${selected.priority}`)}>
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <i key={dot} className={dot <= selected.priority ? 'is-filled' : ''} />
                    ))}
                  </span>
                  {priorityLabels[selected.priority]}
                </strong>
              </div>
            </div>

            <div className="guideline-note">
              <span className="guideline-note__icon">
                <CircleAlert size={17} />
              </span>
              <div>
                <strong>How this guideline is used</strong>
                <p>
                  The analyser checks priority-5 rules first and cites this document in every issue it produces.
                  Reviewers see the evidence beside the suggested fix, never as an unexplained score.
                </p>
              </div>
            </div>

            <div className="guideline-detail__foot">
              <span>
                <FileText size={14} /> {selected.content.split(/\s+/).length} words
              </span>
              <span>
                <Check size={14} /> In the live library
              </span>
              <span>
                <BookOpen size={14} /> Checked on every review
              </span>
            </div>
          </article>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="The library is empty"
            description="Add the first guideline to give the analyser something to check against."
            action={<Button onClick={openNew}>Create the first guideline</Button>}
          />
        )}
      </Panel>

      <GuidelineDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} editing={editing} />
    </div>
  )
}
