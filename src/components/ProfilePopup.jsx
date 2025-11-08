import React, { useState, useEffect } from 'react'

export default function ProfilePopup({ profile, visible, onClose }) {
  if (!visible || !profile) return null

  const current = JSON.parse(localStorage.getItem('user') || 'null')
  const users = JSON.parse(localStorage.getItem('users') || '[]')

  // try to find the full user record by id or name
  const targetBase = users.find((u) => (profile.id && u.id === profile.id) || u.name === profile.name) || profile

  const [target, setTarget] = useState(targetBase)

  useEffect(() => {
    // refresh when profile prop changes
    const fresh = JSON.parse(localStorage.getItem('users') || '[]').find((u) => (profile.id && u.id === profile.id) || u.name === profile.name) || profile
    setTarget(fresh)
  }, [profile])

  const followers = Array.isArray(target.followers) ? target.followers : []
  const following = Array.isArray(target.following) ? target.following : []

  const amFollowing = current && Array.isArray(current.following) && target.id && current.following.indexOf(target.id) >= 0

  function toggleFollow() {
    if (!current || !target || !target.id) return alert('You must be signed in to follow')

    const usersCopy = JSON.parse(localStorage.getItem('users') || '[]')
    const meIdx = usersCopy.findIndex((u) => u.id === current.id)
    const themIdx = usersCopy.findIndex((u) => u.id === target.id)

    if (meIdx >= 0 && !Array.isArray(usersCopy[meIdx].following)) usersCopy[meIdx].following = []
    if (themIdx >= 0 && !Array.isArray(usersCopy[themIdx].followers)) usersCopy[themIdx].followers = []

    if (amFollowing) {
      if (meIdx >= 0) usersCopy[meIdx].following = usersCopy[meIdx].following.filter((id) => id !== target.id)
      if (themIdx >= 0) usersCopy[themIdx].followers = usersCopy[themIdx].followers.filter((id) => id !== current.id)
    } else {
      if (meIdx >= 0) usersCopy[meIdx].following = Array.from(new Set([...(usersCopy[meIdx].following || []), target.id]))
      if (themIdx >= 0) usersCopy[themIdx].followers = Array.from(new Set([...(usersCopy[themIdx].followers || []), current.id]))
    }

    localStorage.setItem('users', JSON.stringify(usersCopy))

    // update current user stored locally
    if (meIdx >= 0) {
      const updatedMe = usersCopy[meIdx]
      localStorage.setItem('user', JSON.stringify(updatedMe))
      window.dispatchEvent(new Event('authChange'))
    }

    // update local target state to reflect new counts
    const refreshedTarget = usersCopy[themIdx] || target
    setTarget(refreshedTarget)
  }

  return (
    <div className="profile-popup-backdrop" onMouseDown={onClose}>
      <div className="profile-popup" onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {target.avatar ? (
            <img src={target.avatar} alt={`${target.name} avatar`} style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 8, background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{target.name ? target.name[0] : 'U'}</div>
          )}
          <div>
            <div style={{ fontWeight: 700 }}>{target.name}</div>
            <div className="muted small">Profile preview</div>
            <div style={{ marginTop: 6 }}>
              <strong>{(Array.isArray(target.followers) ? target.followers.length : 0)}</strong> followers · <strong>{(Array.isArray(target.following) ? target.following.length : 0)}</strong> following
              <div className="muted small">{(Array.isArray(target.followers) && Array.isArray(target.following)) ? (target.followers.filter((id) => (target.following || []).indexOf(id) >= 0).length + ' connections') : ''}</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', marginTop: 10, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {current && current.id !== target.id && (
            <button className="primary" onClick={toggleFollow}>{amFollowing ? 'Unfollow' : 'Follow'}</button>
          )}
          <button className="primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
