import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

const AppContext = createContext(null)

const DEFAULT_VISIBILITY = {
  admin: {
    overview: true,
    studio: false,       // Admins & Reviewers govern and audit; they do not author content
    reviews: true,
    calendar: true,
    guidelines: true,
    assets: true,
    insights: true,
    settings: true,
  },
  member: {
    overview: true,
    studio: true,        // Team member authoring workspace
    reviews: true,       // personal submissions
    calendar: false,
    guidelines: true,
    assets: true,
    insights: false,
    settings: false,
  },
}

const VISIBILITY_STORAGE_KEY = 'klarity_role_visibility_matrix.v1'

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('klarity_role') || 'owner')
  const [visibilitySettings, setVisibilitySettings] = useState(() => {
    try {
      const stored = localStorage.getItem(VISIBILITY_STORAGE_KEY)
      return stored ? { ...DEFAULT_VISIBILITY, ...JSON.parse(stored) } : DEFAULT_VISIBILITY
    } catch {
      return DEFAULT_VISIBILITY
    }
  })
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const toast = useCallback((message, tone = 'good') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(items => [...items, { id, message, tone }])
    timers.current.set(id, setTimeout(() => {
      setToasts(items => items.filter(item => item.id !== id))
      timers.current.delete(id)
    }, 4200))
  }, [])
  const dismissToast = id => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts(items => items.filter(item => item.id !== id))
  }
  const refresh = useCallback(async () => {
    try {
      const payload = await api.bootstrap()
      setData(payload)
      setConnected(true)
      return payload
    } catch (error) {
      setConnected(false)
      if (error.status === 401) { setUser(null); setData(null) }
      throw error
    }
  }, [])
  useEffect(() => {
    let alive = true
    api.me().then(async account => {
      if (!alive) return
      setUser(account)
      await refresh()
    }).catch(error => {
      if (alive && error.status !== 401) toast('Cannot reach the workspace. Please try again.', 'warn')
    }).finally(() => { if (alive) setLoading(false) })
    return () => {
      alive = false
      timers.current.forEach(clearTimeout)
    }
  }, [refresh, toast])
  const authenticate = async (mode, payload) => {
    const account = await api[mode](payload)
    setUser(account)
    await refresh()
  }
  const logout = async () => {
    await api.logout()
    setUser(null)
    setData(null)
    setConnected(false)
  }
  const mutate = async (operation, message) => {
    try {
      const result = await operation()
      await refresh()
      toast(message)
      return result
    } catch (error) {
      if (error.status === 401) { setUser(null); setData(null) }
      toast(error.message, 'warn')
      throw error
    }
  }

  const switchRole = (newRole) => {
    setCurrentRole(newRole)
    localStorage.setItem('klarity_role', newRole)
    const roleLabels = {
      owner: 'Stage 1 · Brand Owner (Executive Governance)',
      reviewer: 'Stage 2 · Reviewer (Compliance Inspector)',
      member: 'Stage 3 · Team Member (Creator Studio)',
    }
    toast(`Active Perspective: ${roleLabels[newRole] || newRole}`, 'good')
  }

  const userAccountRole = (user?.role || 'owner').toLowerCase()
  const activeRole = currentRole || userAccountRole

  const isOwner = activeRole === 'owner' || activeRole === 'admin'
  const isReviewer = activeRole === 'reviewer'
  const isMember = activeRole === 'member' || activeRole === 'creator'
  const isLead = isOwner || isReviewer

  const updateRoleVisibility = (targetRole, moduleKey, isVisible) => {
    if (!isOwner) {
      toast('Only the Brand Owner can modify role visibility permissions.', 'warn')
      return
    }
    setVisibilitySettings((prev) => {
      const updated = {
        ...prev,
        [targetRole]: {
          ...(prev[targetRole] || {}),
          [moduleKey]: isVisible,
        },
      }
      try {
        localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(updated))
      } catch {}
      return updated
    })
    toast(`Updated ${targetRole} visibility for ${moduleKey}.`, 'good')
  }

  const canViewModule = (moduleKey) => {
    // Creator studio is an authoring workstation exclusively for Team Members (creators).
    // Brand Owners and Reviewers audit and govern; they do not author content.
    if (moduleKey === 'studio') {
      return isMember && (visibilitySettings.member?.studio ?? true)
    }
    if (isOwner) return true // Brand Owner has full executive governance visibility
    if (isReviewer) {
      // Reviewers inherit admin visibility matrix
      return visibilitySettings.admin?.[moduleKey] ?? true
    }
    // Team member view matrix
    return visibilitySettings.member?.[moduleKey] ?? false
  }

  return <AppContext.Provider value={{
    user, data, loading, connected, toasts, toast, dismissToast, refresh, authenticate, logout,
    currentUser: user?.username || '',
    currentRole: activeRole,
    switchRole,
    isOwner,
    isReviewer,
    isMember,
    isLead,
    visibilitySettings,
    updateRoleVisibility,
    canViewModule,
    createSubmission: payload => mutate(() => api.createSubmission(payload), 'Review complete. The report is ready.'),
    reviewSubmission: (id, action, comment) => mutate(() => api.reviewSubmission(id, {
      action, comment: comment || null, performed_by: user.username,
    }), 'Review decision saved.'),
    createGuideline: payload => {
      if (!isLead) {
        toast('Only Brand Leads and Higher-ups can author guidelines.', 'warn')
        throw new Error('Unauthorized: higherups and leads author guidelines.')
      }
      return mutate(() => api.createGuideline(payload), 'Guideline published.')
    },
    updateGuideline: (id, payload) => {
      if (!isLead) {
        toast('Only Brand Leads and Higher-ups can edit guidelines.', 'warn')
        throw new Error('Unauthorized: higherups and leads author guidelines.')
      }
      return mutate(() => api.updateGuideline(id, payload), 'Guideline updated.')
    },
  }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
