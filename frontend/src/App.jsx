import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BrandMark } from './components/BrandMark'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { NewReviewDrawer } from './components/NewReviewDrawer'
import { ToastRegion } from './components/UI'
import { useApp } from './context/AppContext'
import { animatePageEnter } from './lib/animations'
import { Dashboard } from './pages/Dashboard'
import { Reviews } from './pages/Reviews'
import { ReviewDetail } from './pages/ReviewDetail'
import { Guidelines } from './pages/Guidelines'
import { Assets } from './pages/Assets'
import { Insights } from './pages/Insights'
import { Settings } from './pages/Settings'
import { Hero } from './pages/Hero'
import { Login } from './pages/Login'

function LoadingScreen() {
  const brandRef = useRef(null)

  useEffect(() => {
    if (brandRef.current) {
      animatePageEnter(brandRef.current)
    }
  }, [])

  return (
    <div className="loading-screen" ref={brandRef}>
      <div className="loading-screen__brand">
        <BrandMark size={44} />
        <span>Klarity</span>
      </div>
      <div className="loading-screen__bar">
        <span />
      </div>
      <p>Opening the brand workspace…</p>
    </div>
  )
}

function AppShell() {
  const { data, loading, toasts, dismissToast } = useApp()
  const [navOpen, setNavOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const location = useLocation()
  const pageRef = useRef(null)

  useEffect(() => {
    setNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname, location.search])

  useEffect(() => {
    if (pageRef.current) {
      const cancel = animatePageEnter(pageRef.current)
      return cancel
    }
  }, [location.pathname])

  if (loading || !data) return <LoadingScreen />

  const isPublic = location.pathname === '/hero' || location.pathname === '/login'

  if (isPublic) {
    return (
      <div className="public-shell">
        <Routes location={location}>
          <Route path="/hero" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/hero" replace />} />
        </Routes>
        <ToastRegion toasts={toasts} onDismiss={dismissToast} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onNewReview={() => {
          setNavOpen(false)
          setReviewOpen(true)
        }}
      />
      {navOpen ? <button className="nav-scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)} /> : null}
      <div className="app-main">
        <Topbar
          currentPath={location.pathname}
          onMenu={() => setNavOpen(true)}
          onNewReview={() => setReviewOpen(true)}
        />
        <main className="page" id="main">
          <div ref={pageRef} key={location.pathname} className="page-view-wrapper">
            <Routes location={location}>
              <Route path="/" element={<Dashboard onNewReview={() => setReviewOpen(true)} />} />
              <Route path="/reviews" element={<Reviews onNewReview={() => setReviewOpen(true)} />} />
              <Route path="/reviews/:id" element={<ReviewDetail />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/hero" element={<Hero />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      <NewReviewDrawer open={reviewOpen} onClose={() => setReviewOpen(false)} />
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default function App() {
  return <AppShell />
}
