
import { useState } from 'react'
import axios from 'axios'
import './Auth.css'

const API_URL = 'https://roadwatch-an3w.onrender.com/api/auth'

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      if (isLogin) {
        const response = await axios.post(`${API_URL}/login`, {
          email,
          password
        })

        onLogin(response.data)
      } else {
        const response = await axios.post(`${API_URL}/register`, {
          name,
          email,
          password
        })

        setMessage(
          typeof response.data === 'string'
            ? response.data
            : response.data.message || 'Registration successful!'
        )

        setIsLogin(true)
        setName('')
        setPassword('')
      }
    } catch (error) {
      const data = error.response?.data

      setMessage(
        typeof data === 'string'
          ? data
          : data?.message ||
            (data && typeof data === 'object'
              ? Object.values(data).join(', ')
              : 'Something went wrong. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🚧 RoadWatch</h1>
        <p className="auth-subtitle">Smart Road Reporting</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(true)
              setMessage('')
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(false)
              setMessage('')
            }}
          >
            Register
          </button>
        </div>

        <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <label>Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                maxLength={100}
                placeholder="Enter your name"
              />
            </>
          )}

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={isLogin ? undefined : 8}
            placeholder={
              isLogin
                ? 'Enter your password'
                : 'Minimum 8 characters'
            }
          />

          {message && (
            <p className="auth-message" role="status">
              {message}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Login'
                : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Auth
