
import { useNavigate } from 'react-router-dom'

export default function AdminPanel({ reports = [], onReview, onStatus }) {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="page-heading">
        <span className="eyebrow">ADMINISTRATION</span>
        <h1>Admin control center</h1>
        <p>Review citizen reports and manage road issue statuses.</p>
      </div>

      <div className="admin-summary">
        <div>
          <span>Total reports</span>
          <strong>{reports.length}</strong>
        </div>
        <div>
          <span>Pending review</span>
          <strong>{reports.filter(r => r.reviewStatus === 'PENDING').length}</strong>
        </div>
        <div>
          <span>Approved</span>
          <strong>{reports.filter(r => r.reviewStatus === 'APPROVED').length}</strong>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Manage reported issues</h2>
          <p>Open any issue to see its complete details.</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <div>✨</div>
          <h3>All clear!</h3>
          <p>There are no reports to manage right now.</p>
        </div>
      ) : (
        <div className="admin-list">
          {reports.map(report => (
            <article className="admin-report-card" key={report.id}>
              <div
                className="admin-report-info"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/reports/${report.id}`)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/reports/${report.id}`)
                  }
                }}
              >
                <div className="admin-issue-icon">🚧</div>
                <div className="admin-issue-content">
                  <div className="report-card-top">
                    <h3>{report.type} <span className="report-number">#{report.id}</span></h3>
                    <span className={`badge ${String(report.severity || '').toLowerCase()}`}>
                      {report.severity}
                    </span>
                  </div>
                  <p className="location">📍 {report.location}</p>
                  <p className="description">{report.description}</p>
                  <div className="admin-badges">
                    <span className={`badge ${String(report.status || '').toLowerCase()}`}>
                      {report.status}
                    </span>
                    <span className={`badge ${String(report.reviewStatus || 'PENDING').toLowerCase()}`}>
                      {report.reviewStatus || 'PENDING'}
                    </span>
                    <span className="confirmation-label">
                      ✓ {report.confirmationCount ?? 0} confirmations
                    </span>
                  </div>
                  <span className="view-details-link">View full details →</span>
                </div>
              </div>

              <div className="admin-actions">
                <button
                  className="action-btn approve"
                  disabled={report.reviewStatus === 'APPROVED'}
                  onClick={() => onReview(report.id, 'APPROVED')}
                >
                  ✓ Approve
                </button>
                <button
                  className="action-btn reject"
                  disabled={report.reviewStatus === 'REJECTED'}
                  onClick={() => onReview(report.id, 'REJECTED')}
                >
                  ✕ Reject
                </button>
                <button
                  className="action-btn resolve"
                  disabled={report.status === 'RESOLVED'}
                  onClick={() => onStatus(report.id, 'RESOLVED')}
                >
                  Mark resolved
                </button>
                <button
                  className="action-btn neutral"
                  onClick={() => onStatus(report.id, 'ACTIVE')}
                >
                  Mark active
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
