import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function submit(e) {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) {
      alert('Invalid credentials')
      return
    }

  // store full user record locally so avatar/followers/following persist
  const localUser = Object.assign({}, found)
  localStorage.setItem('user', JSON.stringify(localUser))
    window.dispatchEvent(new Event('authChange'))
    // open the app home in a new tab after successful login so the current page remains
    try { window.open('/', '_blank') } catch (e) { /* ignore */ }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Linked<span className="logo-blue">In</span></div>
        <h2>Sign in</h2>
        <form onSubmit={submit}>
          <div>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="auth-actions">
            <button type="submit" className="primary">Sign in</button>
            <Link to="/signup" className="ghost-link">Create account</Link>
          </div>
          <div style={{ marginTop: 8 }}>
            <Link to="/forgot" className="ghost-link">Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
