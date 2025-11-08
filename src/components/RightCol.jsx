import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RightCol() {
  const [users, setUsers] = useState([])
  const raw = localStorage.getItem('user')
  const current = raw ? JSON.parse(raw) : null
  const navigate = useNavigate()

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('users') || '[]')
    setUsers(u)
    function onAuth() {
      const r = localStorage.getItem('users')
      setUsers(r ? JSON.parse(r) : [])
    }
    window.addEventListener('authChange', onAuth)
    return () => window.removeEventListener('authChange', onAuth)
  }, [])

  function toggleFollow(targetId) {
    if (!current) return alert('Sign in to follow')
    const all = JSON.parse(localStorage.getItem('users') || '[]')
    const meIdx = all.findIndex((u) => u.id === current.id)
    const themIdx = all.findIndex((u) => u.id === targetId)
    if (meIdx < 0 || themIdx < 0) return
    if (!Array.isArray(all[meIdx].following)) all[meIdx].following = []
    if (!Array.isArray(all[themIdx].followers)) all[themIdx].followers = []
    const amFollowing = all[meIdx].following.indexOf(targetId) >= 0
    if (amFollowing) {
      all[meIdx].following = all[meIdx].following.filter((id) => id !== targetId)
      all[themIdx].followers = all[themIdx].followers.filter((id) => id !== current.id)
    } else {
      all[meIdx].following = Array.from(new Set([...(all[meIdx].following||[]), targetId]))
      all[themIdx].followers = Array.from(new Set([...(all[themIdx].followers||[]), current.id]))
    }
    localStorage.setItem('users', JSON.stringify(all))
    const updatedMe = all.find((u) => u.id === current.id)
    if (updatedMe) localStorage.setItem('user', JSON.stringify(updatedMe))
    window.dispatchEvent(new Event('authChange'))
    setUsers(all)
  }

  return (
    <div>
      <div className="placeholder">All users</div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {users.length === 0 && <div className="muted">No users</div>}
        {users.map((u) => (
          <div key={u.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--card)', padding: 8, borderRadius: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flex: '0 0 44px' }}>
              {u.avatar ? <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.name ? u.name[0] : 'U'}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate(`/profile/${u.id}`)}>{u.name}</div>
              <div className="muted small">{(Array.isArray(u.followers) ? u.followers.length : 0)} followers</div>
            </div>
            <div>
              {current && current.id !== u.id ? (
                <button className="primary" onClick={() => toggleFollow(u.id)}>{(current.following||[]).indexOf(u.id) >= 0 ? 'Unfollow' : 'Follow'}</button>
              ) : (
                <button className="primary" onClick={() => navigate('/profile/' + u.id)}>View</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
