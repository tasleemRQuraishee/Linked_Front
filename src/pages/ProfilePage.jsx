import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { id } = useParams()
  const [target, setTarget] = useState(null)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [followersList, setFollowersList] = useState([])
  const [followingList, setFollowingList] = useState([])
  const current = JSON.parse(localStorage.getItem('user') || 'null')
  const navigate = useNavigate()

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const found = users.find((u) => String(u.id) === String(id))
    setTarget(found || null)
  }, [id])

  if (!target) return <div style={{ padding: 20 }}>Profile not found</div>

  const followers = Array.isArray(target.followers) ? target.followers : []
  const following = Array.isArray(target.following) ? target.following : []
  const amFollowing = current && Array.isArray(current.following) && current.following.indexOf(target.id) >= 0

  function toggleFollow() {
    if (!current) return alert('Sign in to follow')
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const meIdx = users.findIndex((u) => u.id === current.id)
    const themIdx = users.findIndex((u) => u.id === target.id)
    if (meIdx >= 0 && !Array.isArray(users[meIdx].following)) users[meIdx].following = []
    if (themIdx >= 0 && !Array.isArray(users[themIdx].followers)) users[themIdx].followers = []
    if (amFollowing) {
      users[meIdx].following = users[meIdx].following.filter((x) => x !== target.id)
      users[themIdx].followers = users[themIdx].followers.filter((x) => x !== current.id)
    } else {
      users[meIdx].following = Array.from(new Set([...(users[meIdx].following||[]), target.id]))
      users[themIdx].followers = Array.from(new Set([...(users[themIdx].followers||[]), current.id]))
    }
    localStorage.setItem('users', JSON.stringify(users))
    const updatedMe = users.find((u) => u.id === current.id)
    if (updatedMe) localStorage.setItem('user', JSON.stringify(updatedMe))
    window.dispatchEvent(new Event('authChange'))
    // refresh
    setTarget(users[themIdx])
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto', maxHeight: 'calc(90vh)', overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '6px 10px' }}>← Back</button>
        <div style={{ width: 8 }} />
      
        <div style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden' }}>{target.avatar ? <img src={target.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#111827' }} />}</div>
        <div>
          <h2 style={{ margin: 0 }}>{target.name}</h2>
          <div className="muted small">
            <button className="ghost-link" onClick={() => {
              const users = JSON.parse(localStorage.getItem('users') || '[]')
              const list = (Array.isArray(target.followers) ? target.followers : []).map((id) => users.find((u) => String(u.id) === String(id))).filter(Boolean)
              setFollowersList(list)
              setShowFollowers(true)
            }}>{followers.length} followers</button>
            {' · '}
            <button className="ghost-link" onClick={() => {
              const users = JSON.parse(localStorage.getItem('users') || '[]')
              const list = (Array.isArray(target.following) ? target.following : []).map((id) => users.find((u) => String(u.id) === String(id))).filter(Boolean)
              setFollowingList(list)
              setShowFollowing(true)
            }}>{following.length} following</button>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {current && current.id !== target.id && <button className="primary" onClick={toggleFollow}>{amFollowing ? 'Unfollow' : 'Follow'}</button>}
        </div>
      </div>

  <section style={{ marginTop: 20 }}>
        <h3>Posts by {target.name}</h3>
        {(() => {
          const all = JSON.parse(localStorage.getItem('posts') || '[]')
          const matched = all.filter((p) => (p.authorId && String(p.authorId) === String(target.id)) || (p.author && p.author === target.name))
          if (matched.length === 0) return <div className="muted">No posts yet</div>
          return matched.map((p) => (
            <div key={p.id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700 }}>{p.author}</div>
                <div><button className="btn-openpost" onClick={() => navigate(`/post/${p.id}`)}>Open post</button></div>
              </div>
              <div style={{ marginTop: 6 }}>{p.text}</div>
              {p.image && <div style={{ marginTop: 8 }}><img src={p.image} alt="post" style={{ maxWidth: '100%', borderRadius: 8 }} /></div>}
            </div>
          ))
        })()}
      </section>
      {/* Followers / Following modals */}
      {showFollowers && (
        <div className="share-modal-backdrop" onMouseDown={() => setShowFollowers(false)}>
          <div className="share-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>Followers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflow: 'auto' }}>
              {followersList.length === 0 && <div className="muted">No followers</div>}
              {followersList.map((u) => (
                <div key={u.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="avatar-btn" onClick={() => navigate(`/profile/${u.id}`)}>
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
                  <button className="avatar-btn" onClick={() => navigate(`/profile/${u.id}`)}>
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
