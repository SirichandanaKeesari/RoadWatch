
import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import ReportIssue from './pages/ReportIssue'
import Reports from './pages/Reports'
import ReportDetails from './pages/ReportDetails'
import AdminPanel from './pages/AdminPanel'
import Auth from './Auth'
import './App.css'

const API = 'http://localhost:8080/api'

export default function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('roadwatchUser'))
    } catch {
      return null
    }
  })
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(config => {
      const saved = JSON.parse(sessionStorage.getItem('roadwatchUser') || 'null')
      if (saved?.token) {
        config.headers.Authorization = `Bearer ${saved.token}`
      }
      return config
    })

    return () => axios.interceptors.request.eject(interceptor)
  }, [])

  const loadReports = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API}/reports`)
      setReports(Array.isArray(response.data) ? response.data : response.data.content || [])
    } catch (err) {
      setError(err.response?.status === 401
        ? 'Your session expired. Please log in again.'
        : 'Could not load reports. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  function handleLogin(authenticatedUser) {
    sessionStorage.setItem('roadwatchUser', JSON.stringify(authenticatedUser))
    setUser(authenticatedUser)
  }

  function handleLogout() {
    sessionStorage.removeItem('roadwatchUser')
    setUser(null)
    setReports([])
    navigate('/')
  }

  async function submitReport(form) {
    await axios.post(`${API}/reports`, form)
    await loadReports()
  }

  async function reviewReport(id, reviewStatus) {
    try {
      await axios.patch(`${API}/reports/${id}/review`, null, {
        params: { reviewStatus }
      })
      await loadReports()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update review status.')
    }
  }

  async function updateStatus(id, status) {
    try {
      await axios.patch(`${API}/reports/${id}/status`, null, {
        params: { status }
      })
      await loadReports()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update issue status.')
    }
  }

  if (!user) {
    return (
      <div className="auth-shell">
        <div className="auth-brand-panel">
          <div className="brand-icon large">R</div>
          <h1>RoadWatch</h1>
          <p>Safer roads start with you.</p>
          <div className="auth-illustration">🌳 🚦 🛣️</div>
          <p className="auth-tagline">
            Report road issues. Support your community. Make every journey safer.
          </p>
        </div>
        <div className="auth-form-panel">
          <Auth onLogin={handleLogin} />
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="main-content">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={loadReports}>Retry</button>
          </div>
        )}

        {loading && <div className="loading-line">Updating road reports...</div>}

        <Routes>
          <Route path="/" element={<Dashboard reports={reports} />} />
          <Route
            path="/report"
            element={<ReportIssue reports={reports} onSubmit={submitReport} />}
          />
          <Route path="/reports" element={<Reports reports={reports} />} />
          <Route
            path="/reports/:id"
            element={<ReportDetails reports={reports} />}
          />
          <Route
            path="/admin"
            element={user.role === 'ADMIN'
              ? <AdminPanel reports={reports} onReview={reviewReport} onStatus={updateStatus} />
              : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">🌿 RoadWatch</div>
        <p>Building safer streets, one report at a time.</p>
        <span>© 2026 RoadWatch · Community-powered road safety</span>
      </footer>
    </div>
  )
}
