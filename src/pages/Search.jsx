import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function Search() {
  const q = useQuery().get('q') || ''
  const navigate = useNavigate()

  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const posts = JSON.parse(localStorage.getItem('posts') || '[]')

  const term = (q || '').toLowerCase()

  const userResults = users.filter((u) => u.name && u.name.toLowerCase().includes(term))
  const postResults = posts.filter((p) => (p.text || '').toLowerCase().includes(term))

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ padding: '6px 10px' }}>← Back</button>
        <h2 style={{ margin: 0 }}>Search results for "{q}"</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <div>
          <h3>People</h3>
          {userResults.length === 0 && <div className="muted">No people found</div>}
          {userResults.map((u) => (
            <div key={u.id} style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden' }}>
                {u.avatar ? <img src={u.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#111827' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate(`/profile/${u.id}`)}>{u.name}</div>
                <div className="muted small">{(Array.isArray(u.followers) ? u.followers.length : 0)} followers · {(Array.isArray(u.following) ? u.following.length : 0)} following</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3>Posts</h3>
          {postResults.length === 0 && <div className="muted">No posts found</div>}
          {postResults.map((p) => (
            <div key={p.id} style={{ padding: 12, borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden' }}>
                  {p.authorAvatar ? <img src={p.authorAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#111827' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{p.author}</div>
                  <div style={{ marginTop: 6 }}>{p.text}</div>
                  <div style={{ marginTop: 8 }}>
                    <button className="btn-openpost" onClick={() => navigate(`/post/${p.id}`)}>Open post</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
