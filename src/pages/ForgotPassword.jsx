import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState('request') // request, reset, done
  const [user, setUser] = useState(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  function handleRequest(e) {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const found = users.find((u) => u.email === email)
    if (!found) {
      alert('No account found for that email')
      return
    }
    setUser(found)
    setStage('reset')
  }

  function handleReset(e) {
    e.preventDefault()
    if (password.length < 6) { alert('Password must be at least 6 characters'); return }
    if (password !== confirm) { alert('Passwords do not match'); return }
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const idx = users.findIndex((u) => u.email === user.email)
    if (idx >= 0) {
      users[idx].password = password
      localStorage.setItem('users', JSON.stringify(users))
    }
    // If the currently logged-in user is the same account, update their stored copy too
    try {
      const curRaw = localStorage.getItem('user')
      if (curRaw) {
        const cur = JSON.parse(curRaw)
        if (cur.email === user.email) {
          cur.password = password
          localStorage.setItem('user', JSON.stringify(cur))
          window.dispatchEvent(new Event('authChange'))
        }
      }
    } catch (e) { /* ignore */ }

    setStage('done')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Linked<span className="logo-blue">In</span></div>
        {stage === 'request' && (
          <>
            <h2>Forgot password</h2>
            <p className="muted">Enter your account email and we'll let you reset the password.</p>
            <form onSubmit={handleRequest}>
              <div>
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
              </div>
              <div className="auth-actions">
                <button type="submit" className="primary">Continue</button>
                <Link to="/login" className="ghost-link">Back to sign in</Link>
              </div>
            </form>
          </>
        )}

        {stage === 'reset' && (
          <>
            <h2>Reset password</h2>
            <p className="muted">Reset password for <strong>{user && user.email}</strong></p>
            <form onSubmit={handleReset}>
              <div>
                <label>New password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div>
                <label>Confirm password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
              <div className="auth-actions">
                <button type="submit" className="primary">Set password</button>
                <Link to="/login" className="ghost-link">Cancel</Link>
              </div>
            </form>
          </>
        )}

        {stage === 'done' && (
          <>
            <h2>Password updated</h2>
            <p className="muted">Your password has been updated. You can now sign in with your new password.</p>
            <div style={{ textAlign: 'right', marginTop: 10 }}>
              <Link to="/login"><button className="primary">Sign in</button></Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
