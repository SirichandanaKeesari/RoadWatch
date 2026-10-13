
import { useNavigate } from 'react-router-dom'

export default function Dashboard({ reports = [] }) {
  const navigate = useNavigate()

  const active = reports.filter(r => r.status === 'ACTIVE').length
  const resolved = reports.filter(r => r.status === 'RESOLVED').length
  const pending = reports.filter(r => r.reviewStatus === 'PENDING').length

  return (
    <div className="page">
      <section className="hero">
        <div>
          <span className="eyebrow">CIVIC ISSUE MANAGEMENT</span>
          <h1>Let's make our roads <span>safer.</span></h1>
          <p>Report road problems, follow their progress, and help
            build a safer community for everyone.</p>
          <button className="primary-btn" onClick={() => navigate('/report')}>
            + Report an Issue
          </button>
        </div>
        <div className="hero-art">🛣️</div>
      </section>

      <div className="section-heading">
        <div>
          <h2>Your city at a glance</h2>
          <p>Overview of reported road issues</p>
        </div>
        <button className="text-btn" onClick={() => navigate('/reports')}>
          View all reports →
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon mint">📋</div>
          <span>Total reports</span>
          <h2>{reports.length}</h2>
          <small>Issues reported by citizens</small>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚠️</div>
          <span>Active issues</span>
          <h2>{active}</h2>
          <small>Requiring attention</small>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">✓</div>
          <span>Resolved issues</span>
          <h2>{resolved}</h2>
          <small>Marked as resolved</small>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">◷</div>
          <span>Pending review</span>
          <h2>{pending}</h2>
          <small>Awaiting admin review</small>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Recent reports</h2>
          <p>The latest road issues in your community</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <div>🌱</div>
          <h3>It's quiet on the roads!</h3>
          <p>No reports yet. Be the first to report an issue.</p>
          <button className="primary-btn" onClick={() => navigate('/report')}>
            Create first report
          </button>
        </div>
      ) : (
        <div className="report-grid">
          {[...reports].slice(-4).reverse().map(report => (
            <article
              className="report-card clickable"
              key={report.id}
              onClick={() => navigate(`/reports/${report.id}`)}
            >
              <div className="report-card-top">
                <span className="issue-icon">🚧</span>
                <span className={`badge ${String(report.severity || '').toLowerCase()}`}>
                  {report.severity}
                </span>
              </div>
              <h3>{report.type}</h3>
              <p className="location">📍 {report.location}</p>
              <p className="description">{report.description}</p>
              <div className="card-footer">
                <span className={`badge ${String(report.status || '').toLowerCase()}`}>
                  {report.status}
                </span>
                <span className="text-btn">Details →</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
