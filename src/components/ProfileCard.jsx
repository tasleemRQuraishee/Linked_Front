import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProfileCard() {
  const raw = localStorage.getItem('user')
  const initialUser = raw ? JSON.parse(raw) : null

  const [localUser, setLocalUser] = useState(initialUser)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(initialUser ? initialUser.name : '')
  const [preview, setPreview] = useState(initialUser ? initialUser.avatar || null : null)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [followersList, setFollowersList] = useState([])
  const [followingList, setFollowingList] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    function onAuth() {
      const r = localStorage.getItem('user')
      const u = r ? JSON.parse(r) : null
      setLocalUser(u)
      setName(u ? u.name : '')
      setPreview(u ? u.avatar || null : null)
    }
    window.addEventListener('authChange', onAuth)
    return () => window.removeEventListener('authChange', onAuth)
  }, [])

  function onFileChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return alert('Please select an image')
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  function saveProfile() {
    const base = localUser || initialUser || {}
    const newUser = Object.assign({}, base, { name: name || 'Guest', avatar: preview || null })
    if (!newUser.id) newUser.id = Date.now()
    // update the users list so changes persist across sessions
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const idx = users.findIndex((u) => u.id === newUser.id)
    if (idx >= 0) {
      // preserve followers/following if present on stored user
      const preserved = Object.assign({}, users[idx])
      users[idx] = Object.assign({}, preserved, newUser)
    } else {
      users.push(newUser)
    }
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('user', JSON.stringify(newUser))
    // inform other components (NavBar etc.)
    window.dispatchEvent(new Event('authChange'))
    setEditing(false)
  }

  function cancel() {
    const src = localUser || initialUser || null
    setName(src ? src.name : '')
    setPreview(src ? src.avatar || null : null)
    setEditing(false)
  }

  return (
    <div className="profile-card">
      <div className="avatar">
        {preview ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (localUser ? localUser.name[0] : 'G')}
      </div>
      {!editing ? (
        <>
          <h3>{localUser ? localUser.name : 'Guest'}</h3>
          <p className="muted">{localUser ? 'Member' : 'Visitor'}</p>
          {localUser && (
            <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: '0.95rem' }}>
              <button className="ghost-link" onClick={() => {
                const users = JSON.parse(localStorage.getItem('users') || '[]')
                const list = (Array.isArray(localUser.followers) ? localUser.followers : []).map((id) => users.find((u) => String(u.id) === String(id))).filter(Boolean)
                setFollowersList(list)
                setShowFollowers(true)
              }}><strong style={{ color: 'var(--accent)' }}>{(Array.isArray(localUser.followers) ? localUser.followers.length : 0)}</strong> followers</button>
              {' · '}
              <button className="ghost-link" onClick={() => {
                const users = JSON.parse(localStorage.getItem('users') || '[]')
                const list = (Array.isArray(localUser.following) ? localUser.following : []).map((id) => users.find((u) => String(u.id) === String(id))).filter(Boolean)
                setFollowingList(list)
                setShowFollowing(true)
              }}><strong style={{ color: 'var(--accent)' }}>{(Array.isArray(localUser.following) ? localUser.following.length : 0)}</strong> following</button>
            </div>
          )}
          {localUser ? (
            <button className="connect" onClick={() => setEditing(true)}>Edit profile</button>
          ) : (
            <button className="connect" onClick={() => { try { window.open('/signup', '_blank') } catch (e) {} }}>Sign up</button>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'left' }}>
          <label style={{ fontWeight: 700 }}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <label style={{ fontWeight: 700, marginTop: 8 }}>Avatar</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
          {preview && <div style={{ marginTop: 8 }}><img src={preview} alt="preview" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} /></div>}
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button className="primary" onClick={saveProfile}>Save</button>
            <button className="ghost" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}
      {/* Followers / Following modals placed outside of the edit conditional */}
      {showFollowers && (
        <div className="share-modal-backdrop" onMouseDown={() => setShowFollowers(false)}>
          <div className="share-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>Followers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflow: 'auto' }}>
              {followersList.length === 0 && <div className="muted">No followers</div>}
              {followersList.map((u) => (
                <div key={u.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="avatar-btn" onClick={() => { setShowFollowers(false); navigate(`/profile/${u.id}`) }}>
                    {u.avatar ? <img src={u.avatar} alt={u.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: 6, background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.name ? u.name[0] : 'U'}</div>}
                  </button>
                  <div style={{ flex: 1 }}>{u.name}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <button className="primary" onClick={() => setShowFollowers(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showFollowing && (
        <div className="share-modal-backdrop" onMouseDown={() => setShowFollowing(false)}>
          <div className="share-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>Following</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflow: 'auto' }}>
              {followingList.length === 0 && <div className="muted">Not following anyone</div>}
              {followingList.map((u) => (
                <div key={u.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="avatar-btn" onClick={() => { setShowFollowing(false); navigate(`/profile/${u.id}`) }}>
                    {u.avatar ? <img src={u.avatar} alt={u.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: 6, background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.name ? u.name[0] : 'U'}</div>}
                  </button>
                  <div style={{ flex: 1 }}>{u.name}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <button className="primary" onClick={() => setShowFollowing(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
