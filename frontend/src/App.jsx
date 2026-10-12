
import Auth from './Auth.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'http://localhost:8080/api/reports'

axios.interceptors.request.use((config) => {
  try {
    const savedUser = JSON.parse(
      sessionStorage.getItem('roadwatchUser')
    )

    if (savedUser?.token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${savedUser.token}`
    }
  } catch (error) {
    sessionStorage.removeItem('roadwatchUser')
  }

  return config
})

function Navbar({ currentUser, onLogout }) {
  return (
    <nav className="navbar">
      <h2>🚧 RoadWatch</h2>
      <span>Smart Road Reporting</span>

      <div className="navbar-user">
        {currentUser && (
          <span>
            Welcome, {currentUser.name} ({currentUser.role})
          </span>
        )}

        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

function ReportCard({ title, value }) {
  return (
    <div className="card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  )
}

function App() {
  const [reportType, setReportType] = useState('Pothole')
  const [severity, setSeverity] = useState('Medium')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [duplicateReport, setDuplicateReport] = useState(null)

  const [selectedReport, setSelectedReport] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editType, setEditType] = useState('')
  const [editSeverity, setEditSeverity] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editMessage, setEditMessage] = useState('')

  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState('')

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem('roadwatchUser')
      ) || null
    } catch {
      return null
    }
  })

  const [authChecked, setAuthChecked] = useState(() => {
    try {
      return !!sessionStorage.getItem('roadwatchUser')
    } catch {
      return false
    }
  })

  const isAdmin = currentUser?.role === 'ADMIN'

  function handleLogin(userData) {
    sessionStorage.setItem(
      'roadwatchUser',
      JSON.stringify(userData)
    )
    setCurrentUser(userData)
    setAuthChecked(true)
  }

  function handleLogout() {
    sessionStorage.removeItem('roadwatchUser')
    setCurrentUser(null)
    setAuthChecked(false)
    setSelectedReport(null)
    setIsEditing(false)
  }

  
async function loadReports() {
  try {
    setError('')
    const response = await axios.get(API_URL)

    console.log('Updated reports from backend:', response.data)

    setReports(response.data)
  } catch (err) {
    console.error(err)
    setError('Could not load reports. Check Spring Boot and CORS.')
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    if (currentUser?.token) {
      loadReports()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  async function openReport(report) {
    setSelectedReport(report)
    setIsEditing(false)
    setComments([])
    setCommentsError('')
    setCommentsLoading(true)

    try {
      const response = await axios.get(
        `${API_URL}/${report.id}/comments`
      )
      setComments(response.data)
    } catch (err) {
      console.error(err)
      setCommentsError(
        'Could not load comments for this report.'
      )
    } finally {
      setCommentsLoading(false)
    }
  }

  function startEditing() {
    if (!isAdmin || !selectedReport) return

    setEditType(selectedReport.type)
    setEditSeverity(selectedReport.severity)
    setEditLocation(selectedReport.location)
    setEditDescription(selectedReport.description)
    setEditMessage('')
    setIsEditing(true)
  }

  async function saveReport(e) {
    e.preventDefault()

    if (!isAdmin) {
      setEditMessage('Only admins can edit reports.')
      return
    }

    if (
      !editType.trim() ||
      !editLocation.trim() ||
      !editDescription.trim()
    ) {
      setEditMessage('Please fill in all fields.')
      return
    }

    try {
      const response = await axios.put(
        `${API_URL}/${selectedReport.id}`,
        {
          type: editType.trim(),
          severity: editSeverity,
          location: editLocation.trim(),
          description: editDescription.trim()
        }
      )

      setSelectedReport(response.data)
      setIsEditing(false)
      setEditMessage('Report updated successfully!')

      await loadReports()
    } catch (err) {
      console.error(err)
      setEditMessage(
        err.response?.status === 403
          ? 'Only admins can edit reports.'
          : 'Could not update report.'
      )
    }
  }

  async function updateReportStatus(status) {
    if (!isAdmin || !selectedReport) return

    try {
      const response = await axios.patch(
        `${API_URL}/${selectedReport.id}/status`,
        null,
        { params: { status } }
      )

      setSelectedReport(response.data)
      setMessage(`Report status changed to ${status}.`)
      await loadReports()
    } catch (err) {
      console.error(err)
      setMessage(
        err.response?.status === 403
          ? 'Only admins can change report status.'
          : 'Could not update report status.'
      )
    }
  }

  async function reviewReport(reviewStatus) {
    if (!isAdmin || !selectedReport) return

    try {
      const response = await axios.patch(
        `${API_URL}/${selectedReport.id}/review`,
        null,
        { params: { reviewStatus } }
      )

      setSelectedReport(response.data)
      setMessage(`Report review status changed to ${reviewStatus}.`)
      await loadReports()
    } catch (err) {
      console.error(err)
      setMessage(
        err.response?.status === 403
          ? 'Only admins can review reports.'
          : 'Could not update review status.'
      )
    }
  }

  async function submitReport(e) {
    e.preventDefault()
    setMessage('')

    if (!location.trim() || !description.trim()) {
      setMessage('Please fill in all fields.')
      return
    }

    const normalizedType = reportType.trim().toLowerCase()
    const normalizedLocation = location.trim().toLowerCase()

    const matchingReports = reports.filter(report =>
      report.type?.trim().toLowerCase() === normalizedType &&
      report.location?.trim().toLowerCase() === normalizedLocation
    )

    const invalidReport = matchingReports.find(
      report => report.status?.toUpperCase() === 'INVALID'
    )

    if (invalidReport) {
      setMessage(
        'This issue has been rejected by the authorities. ' +
        'Please contact them if you believe the decision is incorrect.'
      )
      return
    }

    const activeReport = matchingReports.find(
      report => report.status?.toUpperCase() === 'ACTIVE'
    )

    if (activeReport) {
      setDuplicateReport(activeReport)
      return
    }

    await createReport()
  }

  async function createReport() {
    const newReport = {
      type: reportType,
      severity,
      location: location.trim(),
      description: description.trim()
    }

    try {
      await axios.post(API_URL, newReport)

      setMessage('Report submitted successfully!')
      setLocation('')
      setDescription('')
      setDuplicateReport(null)

      await loadReports()
    } catch (err) {
      console.error(err)

      if (err.response?.status === 409) {
        setMessage(
          err.response?.data?.detail ||
          'This issue has already been rejected.'
        )
      } else {
        setMessage(
          'Could not submit report. Please check the backend.'
        )
      }

      await loadReports()
    }
  }

  async function confirmExistingReport() {
    if (!duplicateReport) return

    if (!description.trim()) {
      setMessage(
        'Please describe the issue before confirming it.'
      )
      setDuplicateReport(null)
      return
    }

    try {
      await axios.post(API_URL, {
        type: duplicateReport.type,
        severity,
        location: duplicateReport.location,
        description: description.trim()
      })

      setMessage(
        'Thank you! Your confirmation has been recorded.'
      )
      setLocation('')
      setDescription('')
      setDuplicateReport(null)

      await loadReports()
    } catch (err) {
      console.error(err)

      if (err.response?.status === 409) {
        setMessage(
          err.response?.data?.detail ||
          'This issue has already been rejected.'
        )
      } else {
        setMessage(
          'Could not confirm the existing report.'
        )
      }

      await loadReports()
    }
  }

  const activeCount = reports.filter(
    report => report.status?.toUpperCase() === 'ACTIVE'
  ).length

  const resolvedCount = reports.filter(
    report => report.status?.toUpperCase() === 'RESOLVED'
  ).length

  if (!authChecked || !currentUser) {
    return <Auth onLogin={handleLogin} />
  }

  return (
    <div>
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="container">
        {selectedReport ? (
          <section className="report-details">
            <button
              type="button"
              onClick={() => {
                setSelectedReport(null)
                setIsEditing(false)
                setComments([])
                setCommentsError('')
                setMessage('')
              }}
            >
              ← Back to Dashboard
            </button>

            <h1>Report Details</h1>

            {isAdmin && (
              <button
                type="button"
                onClick={startEditing}
              >
                ✏️ Edit Report
              </button>
            )}

            {isEditing && isAdmin && (
              <form
                onSubmit={saveReport}
                className="form-section"
              >
                <h2>Edit Report</h2>

                <label>Issue Type</label>
                <select
                  value={editType}
                  onChange={e => setEditType(e.target.value)}
                >
                  <option value="Pothole">Pothole</option>
                  <option value="Waterlogging">Waterlogging</option>
                  <option value="Accident">Accident</option>
                  <option value="Roadblock">Roadblock</option>
                </select>

                <label>Severity</label>
                <select
                  value={editSeverity}
                  onChange={e => setEditSeverity(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <label>Location</label>
                <input
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  required
                />

                <label>Description</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows="3"
                  required
                />

                {editMessage && (
                  <p role="status">{editMessage}</p>
                )}

                <button type="submit">Save Changes</button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </form>
            )}

            {isAdmin && (
              <section className="form-section">
                <h2>Admin Controls</h2>

                <label>Change Report Status</label>
                <div>
                  <button
                    type="button"
                    onClick={() => updateReportStatus('ACTIVE')}
                  >
                    Mark Active
                  </button>

                  <button
                    type="button"
                    onClick={() => updateReportStatus('RESOLVED')}
                  >
                    Mark Resolved
                  </button>

                  <button
                    type="button"
                    onClick={() => updateReportStatus('INVALID')}
                  >
                    Mark Invalid
                  </button>
                </div>

                <label>Review Report</label>
                <div>
                  <button
                    type="button"
                    onClick={() => reviewReport('APPROVED')}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => reviewReport('REJECTED')}
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => reviewReport('PENDING')}
                  >
                    Set Pending
                  </button>
                </div>
              </section>
            )}

            {message && <p role="status">{message}</p>}

            <div className="card">
              <h2>
                {selectedReport.type} #{selectedReport.id}
              </h2>

              <p>
                <strong>Location:</strong>{' '}
                {selectedReport.location}
              </p>

              <p>
                <strong>Severity:</strong>{' '}
                {selectedReport.severity}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                {selectedReport.status}
              </p>

              <p>
                <strong>Review Status:</strong>{' '}
                {selectedReport.reviewStatus || 'PENDING'}
              </p>

              <p>
                <strong>Confirmations:</strong>{' '}
                {selectedReport.confirmationCount}
              </p>

              <p>
                <strong>Original Description:</strong>
              </p>

              <p>{selectedReport.description}</p>
            </div>

            <section className="reports-section">
              <h2>Issue Discussion</h2>

              <p>
                Descriptions submitted by people reporting or
                confirming this issue.
              </p>

              {commentsLoading && <p>Loading comments...</p>}

              {commentsError && (
                <p className="error-message">{commentsError}</p>
              )}

              {!commentsLoading &&
                !commentsError &&
                comments.length === 0 && (
                  <p>
                    No comments found for this report yet.
                  </p>
                )}

              {!commentsLoading &&
                comments.map(comment => (
                  <div className="card" key={comment.id}>
                    <p>
                      <strong>
                        {comment.username || 'Anonymous'}
                      </strong>
                    </p>

                    <p>{comment.description}</p>

                    <small>
                      {comment.createdAt
                        ? new Date(
                            comment.createdAt
                          ).toLocaleString()
                        : ''}
                    </small>
                  </div>
                ))}
            </section>
          </section>
        ) : (
          <>
            <h1>Road Issue Dashboard</h1>

            <p>
              Report road problems and help make roads safer.
            </p>

            <div className="cards">
              <ReportCard
                title="Total Reports"
                value={reports.length}
              />

              <ReportCard
                title="Active Issues"
                value={activeCount}
              />

              <ReportCard
                title="Resolved Issues"
                value={resolvedCount}
              />
            </div>

            {loading && <p>Loading reports...</p>}

            {error && (
              <p className="error-message">{error}</p>
            )}

            {message && <p role="status">{message}</p>}

            <section className="form-section">
              <h2>Report a Road Issue</h2>

              <form onSubmit={submitReport}>
                <label htmlFor="reportType">Issue Type</label>

                <select
                  id="reportType"
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                >
                  <option value="Pothole">Pothole</option>
                  <option value="Waterlogging">Waterlogging</option>
                  <option value="Accident">Accident</option>
                  <option value="Roadblock">Roadblock</option>
                </select>

                <label htmlFor="severity">Severity</label>

                <select
                  id="severity"
                  value={severity}
                  onChange={e => setSeverity(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <label htmlFor="location">Location</label>

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Enter road location"
                  required
                />

                <label htmlFor="description">Description</label>

                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the road issue"
                  rows="3"
                  required
                />

                <button type="submit" disabled={loading}>
                  Submit Report
                </button>
              </form>
            </section>

            <section className="reports-section">
              <h2>Reported Road Issues</h2>

              {!loading && !error && reports.length === 0 && (
                <p>
                  No reports found. Submit your first report!
                </p>
              )}

              {reports.length > 0 && (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Severity</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Confirmations</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports.map(report => (
                        <tr
                          key={report.id}
                          onClick={() => openReport(report)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view report details and comments"
                        >
                          <td>{report.id}</td>
                          <td>{report.type}</td>
                          <td>{report.severity}</td>
                          <td>{report.location}</td>
                          <td>
                            <span className="status">
                              {report.status}
                            </span>
                          </td>
                          <td>{report.confirmationCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {duplicateReport && (
        <div className="modal-overlay">
          <div
            className="duplicate-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="duplicate-title"
          >
            <h2 id="duplicate-title">Similar Issue Found</h2>

            <p>
              A matching active report already exists at this
              location. Would you like to confirm it?
            </p>

            <div className="duplicate-details">
              <p>
                <strong>Report ID:</strong> {duplicateReport.id}
              </p>

              <p>
                <strong>Type:</strong> {duplicateReport.type}
              </p>

              <p>
                <strong>Location:</strong> {duplicateReport.location}
              </p>

              <p>
                <strong>Severity:</strong> {duplicateReport.severity}
              </p>

              <p>
                <strong>Confirmations:</strong>{' '}
                {duplicateReport.confirmationCount}
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={confirmExistingReport}
              >
                Confirm Existing
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={() => setDuplicateReport(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
