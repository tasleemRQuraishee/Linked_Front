import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!name || !email || !password) { alert('Fill all fields'); return }

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.find((u) => u.email === email)) { alert('Email already used'); return }

  const user = { id: Date.now(), name, email, password, avatar: null, followers: [], following: [] }
    users.push(user)
    localStorage.setItem('users', JSON.stringify(users))

  localStorage.setItem('user', JSON.stringify({ id: user.id, name: user.name, email: user.email, avatar: null, followers: [], following: [] }))
    window.dispatchEvent(new Event('authChange'))
    // open the app home in a new tab after successful signup so the current page remains
    try { window.open('/', '_blank') } catch (e) { /* ignore */ }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Linked<span className="logo-blue">In</span></div>
        <h2>Create your account</h2>
        <form onSubmit={submit}>
          <div>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="auth-actions">
            <button type="submit" className="primary">Create account</button>
            <Link to="/login" className="ghost-link">Login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
