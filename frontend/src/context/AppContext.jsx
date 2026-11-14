import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import demoData, { activity as demoActivity } from '../data/demo'
import { api } from '../lib/api'
import { ACTION_STATUS, latestReport, localAnalyse } from '../lib/utils'

const AppContext = createContext(null)

const NOW = () => new Date().toISOString()
const nextId = (items) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1)

const emptyAction = (kind, actor, comment) => ({
  id: -Date.now(),
  action: kind,
  performed_by: actor,
  comment,
  created_at: NOW(),
})

export function AppProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [toasts, setToasts] = useState([])
  const toastTimers = useRef(new Map())
  const currentUser = 'Kruthik Kamegaonkar'

  const toast = useCallback((message, tone = 'good') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((items) => [...items, { id, message, tone }])
    const timer = window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id))
      toastTimers.current.delete(id)
    }, 4200)
    toastTimers.current.set(id, timer)
  }, [])

  useEffect(() => {
    let alive = true
    api
      .bootstrap()
      .then((payload) => {
        if (!alive) return
        setData(payload)
        setConnected(true)
      })
      .catch(() => {
        if (!alive) return
        setData(demoData)
        setConnected(false)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
      toastTimers.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      const payload = await api.bootstrap()
      setData(payload)
      setConnected(true)
      return payload
    } catch {
      setConnected(false)
      return null
    }
  }, [])

  const createSubmission = useCallback(
    async (payload) => {
      try {
        const created = await api.createSubmission(payload)
        await refresh()
        toast('Review complete. The new report is ready.')
        return created
      } catch {
        const analysed = localAnalyse(payload.title, payload.content_text, payload.content_type, data?.guidelines)
        const id = nextId(data?.submissions || [])
        const createdAt = NOW()
        const created = {
          id,
          title: payload.title,
          content_type: payload.content_type,
          content_text: payload.content_text,
          status: 'reviewing',
          submitted_by: payload.submitted_by || currentUser,
          submitted_at: createdAt,
          reviewed_at: null,
          reviewer_notes: null,
          reports: [
            {
              id: Date.now(),
              submission_id: id,
              overall_score: analysed.score,
              summary: analysed.summary,
              created_at: createdAt,
              issues: analysed.issues,
              actions: [],
            },
          ],
        }
        setData((current) => ({
          ...current,
          submissions: [created, ...(current?.submissions || [])],
          stats: {
            ...current.stats,
            total_submissions: current.stats.total_submissions + 1,
            pending_reviews: current.stats.pending_reviews + 1,
            open_issues: current.stats.open_issues + analysed.issues.length,
          },
          activity: [
            {
              id: `submission-${id}`,
              kind: 'submitted',
              actor: payload.submitted_by || currentUser,
              title: payload.title,
              submission_id: id,
              detail: 'Submitted for review',
              created_at: createdAt,
            },
            ...(current?.activity || []),
          ].slice(0, 16),
        }))
        toast('Review complete. Running in local demo mode.', 'info')
        return created
      }
    },
    [data, currentUser, refresh, toast],
  )

  const reviewSubmission = useCallback(
    async (submissionId, action, comment) => {
      const actor = currentUser
      try {
        const updated = await api.reviewSubmission(submissionId, {
          action,
          performed_by: actor,
          comment: comment || null,
        })
        await refresh()
        toast(
          action === 'approved'
            ? 'Approved. The creator has been notified.'
            : action === 'rejected'
              ? 'Rejected. The decision is in the audit trail.'
              : 'Changes requested. The creator can revise and resubmit.',
          action === 'rejected' ? 'warn' : 'good',
        )
        return updated
      } catch {
        setData((current) => {
          const submissions = current.submissions.map((submission) => {
            if (submission.id !== submissionId) return submission
            const reports = [...submission.reports]
            const report = latestReport(submission)
            if (report) {
              const index = reports.findIndex((item) => item.id === report.id)
              reports[index] = {
                ...report,
                actions: [...(report.actions || []), emptyAction(action, actor, comment)],
              }
            }
            return {
              ...submission,
              status: ACTION_STATUS[action],
              reviewed_at: NOW(),
              reviewer_notes: comment || submission.reviewer_notes,
              reports,
            }
          })
          const target = submissions.find((item) => item.id === submissionId)
          return {
            ...current,
            submissions,
            stats: {
              ...current.stats,
              pending_reviews: Math.max(
                0,
                current.stats.pending_reviews -
                  (['pending', 'reviewing'].includes(
                    current.submissions.find((item) => item.id === submissionId)?.status,
                  )
                    ? 1
                    : 0),
              ),
            },
            activity: [
              {
                id: `action-${Date.now()}`,
                kind: action,
                actor,
                title: target?.title || 'Submission',
                submission_id: submissionId,
                detail: comment || null,
                created_at: NOW(),
              },
              ...(current?.activity || []),
            ].slice(0, 16),
          }
        })
        toast(
          action === 'approved'
            ? 'Approved. The decision is in the local audit trail.'
            : action === 'rejected'
              ? 'Rejected. The decision is in the local audit trail.'
              : 'Changes requested. The creator can revise and resubmit.',
          action === 'rejected' ? 'warn' : 'good',
        )
        return { id: submissionId }
      }
    },
    [currentUser, refresh, toast],
  )

  const createGuideline = useCallback(
    async (payload) => {
      try {
        const created = await api.createGuideline(payload)
        await refresh()
        toast('Guideline published to the library.')
        return created
      } catch {
        const createdAt = NOW()
        const created = {
          ...payload,
          id: nextId(data?.guidelines || []),
          created_at: createdAt,
          updated_at: createdAt,
        }
        setData((current) => ({
          ...current,
          guidelines: [created, ...(current?.guidelines || [])],
          stats: { ...current.stats, active_guidelines: current.stats.active_guidelines + 1 },
        }))
        toast('Guideline added in local demo mode.', 'info')
        return created
      }
    },
    [data, refresh, toast],
  )

  const updateGuideline = useCallback(
    async (id, payload) => {
      try {
        const updated = await api.updateGuideline(id, payload)
        await refresh()
        toast('Guideline updated.')
        return updated
      } catch {
        let updated
        setData((current) => ({
          ...current,
          guidelines: current.guidelines.map((guideline) => {
            if (guideline.id !== id) return guideline
            updated = { ...guideline, ...payload, updated_at: NOW() }
            return updated
          }),
        }))
        toast('Guideline updated in local demo mode.', 'info')
        return updated
      }
    },
    [refresh, toast],
  )

  const dismissToast = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id))
    const timer = toastTimers.current.get(id)
    if (timer) window.clearTimeout(timer)
    toastTimers.current.delete(id)
  }, [])

  const value = useMemo(
    () => ({
      data,
      loading,
      connected,
      currentUser,
      toasts,
      toast,
      dismissToast,
      refresh,
      createSubmission,
      reviewSubmission,
      createGuideline,
      updateGuideline,
    }),
    [
      data,
      loading,
      connected,
      currentUser,
      toasts,
      toast,
      dismissToast,
      refresh,
      createSubmission,
      reviewSubmission,
      createGuideline,
      updateGuideline,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}

export { demoActivity }
