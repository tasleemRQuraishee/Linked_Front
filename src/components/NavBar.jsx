import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function NavBar() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch (e) { return null }
  })
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    function handler() {
      try { setUser(JSON.parse(localStorage.getItem('user'))) } catch (e) { setUser(null) }
    }
    window.addEventListener('authChange', handler)
    return () => window.removeEventListener('authChange', handler)
  }, [])

  function logout() {
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('authChange'))
    navigate('/login')
  }

  function runSearch(q) {
    if (!q || !q.trim()) return
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  function onChange(e) {
    const v = e.target.value
    setQuery(v)
    // small suggestion engine
    if (!v.trim()) return setSuggestions([])
    const term = v.toLowerCase()
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')
    const userMatches = users.filter((u) => u.name && u.name.toLowerCase().includes(term)).slice(0,5).map((u) => ({ type: 'user', id: u.id, name: u.name, avatar: u.avatar }))
    const postMatches = posts.filter((p) => (p.text || '').toLowerCase().includes(term)).slice(0,5).map((p) => ({ type: 'post', id: p.id, text: p.text, author: p.author }))
    setSuggestions([...userMatches, ...postMatches])
  }

  function onKey(e) {
    if (e.key === 'Enter') runSearch(query)
  }

  return (
    <header className="nav">
      <div className="nav-left" style={{ position: 'relative' }}>
        <Link to="/" className="logo-text">Linked<span className="logo-blue">In</span></Link>
        <input className="search" placeholder="Search people or posts" value={query} onChange={onChange} onKeyDown={onKey} />
        {suggestions.length > 0 && (
          <div style={{ position: 'absolute', left: 120, top: 44, background: '#fff', border: '1px solid #eee', borderRadius: 8, width: 360, boxShadow: '0 6px 20px rgba(2,6,23,0.08)', zIndex: 80 }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{ padding: 8, display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }} onMouseDown={() => {
                // use onMouseDown so input blur doesn't hide before click
                if (s.type === 'user') navigate(`/profile/${s.id}`)
                else navigate(`/post/${s.id}`)
                setSuggestions([])
                setQuery('')
              }}>
                {s.type === 'user' ? (
                  <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden' }}>{s.avatar ? <img src={s.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#111827' }} />}</div>
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f3f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.author ? s.author[0] : 'P'}</div>
                )}
                <div>
                  <div style={{ fontWeight: 700 }}>{s.type === 'user' ? s.name : (s.text && s.text.length > 60 ? s.text.substring(0,60) + '...' : s.text)}</div>
                  <div className="muted small">{s.type === 'user' ? 'Person' : 'Post'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <nav className="nav-right">
        {user ? (
          <>
            <span className="muted">{user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => window.open('/login', '_blank')}>Login</button>
            <button onClick={() => window.open('/signup', '_blank')}>Sign up</button>
          </>
        )}
      </nav>
    </header>
  )
}
