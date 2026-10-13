
import { useState } from 'react'

export default function ReportIssue({ reports = [], onSubmit }) {
  const [form, setForm] = useState({
    type: 'Pothole',
    severity: 'Medium',
    location: '',
    description: ''
  })
  const [message, setMessage] = useState('')

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e) {
    e.preventDefault()
    setMessage('')

    if (!form.location.trim() || !form.description.trim()) {
      setMessage('Please fill in all fields.')
      return
    }

    const duplicate = reports.find(r =>
      r.status === 'ACTIVE' &&
      r.type?.toLowerCase() === form.type.toLowerCase() &&
      r.location?.trim().toLowerCase() === form.location.trim().toLowerCase()
    )

    if (duplicate) {
      const confirmReport = window.confirm(
        'A similar active issue already exists at this location. Confirm this issue?'
      )
      if (!confirmReport) return
    }

    try {
      await onSubmit(form)
      setForm({
        type: 'Pothole',
        severity: 'Medium',
        location: '',
        description: ''
      })
      setMessage('Report submitted successfully!')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not submit the report.')
    }
  }

  return (
    <div className="page form-page">
      <div className="page-heading">
        <span className="eyebrow">MAKE A DIFFERENCE</span>
        <h1>Report a road issue</h1>
        <p>Help authorities identify and resolve road problems in your area.</p>
      </div>

      <div className="form-layout">
        <form className="panel report-form" onSubmit={submit}>
          <h2>Issue information</h2>
          <p className="muted">Please provide accurate details.</p>

          <label>Issue type</label>
          <select name="type" value={form.type} onChange={change}>
            <option>Pothole</option>
            <option>Waterlogging</option>
            <option>Accident</option>
            <option>Roadblock</option>
            <option>Damaged Road</option>
            <option>Other</option>
          </select>

          <label>Severity</label>
          <div className="severity-options">
            {['Low', 'Medium', 'High'].map(level => (
              <button
                key={level}
                type="button"
                className={`severity-choice ${level.toLowerCase()} ${
                  form.severity === level ? 'selected' : ''
                }`}
                onClick={() => setForm({ ...form, severity: level })}
              >
                <span>●</span> {level}
              </button>
            ))}
          </div>

          <label>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={change}
            placeholder="e.g. Miyapur, Hyderabad"
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            placeholder="Describe the road issue and nearby landmarks..."
            rows="5"
            required
          />

          {message && <div className="form-message">{message}</div>}

          <button className="primary-btn full-width" type="submit">
            Submit Report →
          </button>
        </form>

        <aside className="tips-card">
          <div className="tips-icon">💡</div>
          <h3>Tips for a useful report</h3>
          <ul>
            <li>Give a clear location or nearby landmark.</li>
            <li>Choose severity based on the risk involved.</li>
            <li>Explain how the issue affects commuters.</li>
            <li>Check existing reports to avoid duplicates.</li>
          </ul>
          <div className="tips-bottom">
            <span>🌿</span>
            <p>Every report brings us one step closer to safer roads.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
