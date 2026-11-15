import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('klarity_role') || 'creator')
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
    toast(newRole === 'lead' ? 'Switched to Governance Lead (Higher-up)' : 'Switched to Employee / Team Member', 'good')
  }

  const isLead = currentRole === 'lead'

  return <AppContext.Provider value={{
    user, data, loading, connected, toasts, toast, dismissToast, refresh, authenticate, logout,
    currentUser: user?.username || '',
    currentRole,
    switchRole,
    isLead,
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
