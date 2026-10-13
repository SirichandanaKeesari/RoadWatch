
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Reports({ reports = [] }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [severity, setSeverity] = useState('ALL')

  const filtered = useMemo(() => reports.filter(r => {
    const text = `${r.type} ${r.location} ${r.description}`.toLowerCase()
    return text.includes(search.toLowerCase()) &&
      (status === 'ALL' || r.status === status) &&
      (severity === 'ALL' || r.severity === severity)
  }), [reports, search, status, severity])

  return (
    <div className="page">
      <div className="page-heading heading-row">
        <div>
          <span className="eyebrow">COMMUNITY REPORTS</span>
          <h1>Road issue directory</h1>
          <p>Explore and track reported road issues.</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/report')}>
          + New report
        </button>
      </div>

      <div className="filter-bar">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search type, location, description..."
        />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="RESOLVED">Resolved</option>
          <option value="INVALID">Invalid</option>
        </select>
        <select value={severity} onChange={e => setSeverity(e.target.value)}>
          <option value="ALL">All severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div className="results-label">{filtered.length} reports found</div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div>🔎</div>
          <h3>No matching reports</h3>
          <p>Try changing your search or filters.</p>
        </div>
      ) : (
        <div className="report-grid">
          {filtered.map(report => (
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
                <span className="text-btn">View details →</span>
              </div>
              <div className="report-meta">
                Confirmations: {report.confirmationCount ?? 0}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
