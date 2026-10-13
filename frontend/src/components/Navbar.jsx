
import { NavLink, useNavigate } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate()

  return (
    <header className="navbar">
      <div className="brand" onClick={() => navigate('/')}>
        <div className="brand-icon">R</div>
        <div>
          <h2>RoadWatch</h2>
          <span>Smart streets. Safer journeys.</span>
        </div>
      </div>

      <nav className="nav-links">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/report">Report Issue</NavLink>
        <NavLink to="/reports">All Reports</NavLink>
        {user?.role === 'ADMIN' && (
          <NavLink to="/admin">Admin Panel</NavLink>
        )}
      </nav>

      <div className="nav-user">
        <div className="avatar">
          {(user?.name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div className="user-info">
          <strong>{user?.name || 'Citizen'}</strong>
          <span>{user?.role || 'USER'}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}
