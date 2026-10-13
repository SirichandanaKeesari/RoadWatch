
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'

export default function ReportDetails({ reports = [] }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const report = reports.find(r => String(r.id) === String(id))
  const [comments, setComments] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`http://localhost:8080/api/reports/${id}/comments`)
      .then(res => setComments(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Comments could not be loaded.'))
  }, [id])

  if (!report) {
    return (
      <div className="page empty-state">
        <h2>Report not found</h2>
        <p>It may have been removed or is not currently loaded.</p>
        <button className="primary-btn" onClick={() => navigate('/reports')}>
          Back to reports
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="detail-header">
        <div className="detail-symbol">🚧</div>
        <div>
          <span className="eyebrow">ROAD ISSUE #{report.id}</span>
          <h1>{report.type}</h1>
          <p>📍 {report.location}</p>
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel detail-panel">
          <h2>Issue details</h2>
          <div className="detail-row">
            <span>Severity</span>
            <span className={`badge ${String(report.severity || '').toLowerCase()}`}>
              {report.severity}
            </span>
          </div>
          <div className="detail-row">
            <span>Current status</span>
            <span className={`badge ${String(report.status || '').toLowerCase()}`}>
              {report.status}
            </span>
          </div>
          <div className="detail-row">
            <span>Review status</span>
            <span className={`badge ${String(report.reviewStatus || '').toLowerCase()}`}>
              {report.reviewStatus || 'PENDING'}
            </span>
          </div>
          <div className="detail-row">
            <span>Confirmations</span>
            <strong>{report.confirmationCount ?? 0}</strong>
          </div>
          <h3>Description</h3>
          <p className="detail-description">{report.description}</p>
        </section>

        <section className="panel comments-panel">
          <h2>Community updates</h2>
          <p className="muted">Comments and updates associated with this report.</p>
          {error && <p className="muted">{error}</p>}
          {!error && comments.length === 0 && (
            <div className="empty-comments">
              <span>💬</span>
              <p>No comments available yet.</p>
            </div>
          )}
          {comments.map((comment, index) => (
            <div className="comment" key={comment.id ?? index}>
              <div className="avatar">{(comment.username || 'U')[0].toUpperCase()}</div>
              <div>
                <strong>{comment.username || 'Citizen'}</strong>
                <p>{comment.description}</p>
                {comment.createdAt && (
                  <small>{new Date(comment.createdAt).toLocaleString()}</small>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
