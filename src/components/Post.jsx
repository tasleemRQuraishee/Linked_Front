import React from 'react'
import ShareModal from './ShareModal'
import ProfilePopup from './ProfilePopup'

export default function Post({ post, onDelete, onLike, onComment, onEdit }) {
  const raw = localStorage.getItem('user')
  const user = raw ? JSON.parse(raw) : null
  const canDelete = user && (user.name === post.author || user.id === post.authorId || user.id === post.authorId)
  const canEdit = canDelete
  const postId = post._id || post.id
  const likes = Array.isArray(post.likes) ? post.likes : []
  const likeCount = likes.length
  const liked = user && likes.indexOf(user.id || user.name) >= 0
  const comments = Array.isArray(post.comments) ? post.comments : []
  const [showComment, setShowComment] = React.useState(false)
  const [commentText, setCommentText] = React.useState('')
  const [showAllComments, setShowAllComments] = React.useState(false)
  const commentBoxRef = React.useRef(null)
  const [showShare, setShowShare] = React.useState(false)
  const [showProfilePopup, setShowProfilePopup] = React.useState(false)
  const [showLikes, setShowLikes] = React.useState(false)
  const [likeUsers, setLikeUsers] = React.useState([])
  const [profileToShow, setProfileToShow] = React.useState(null)
  const [editing, setEditing] = React.useState(false)
  const [editText, setEditText] = React.useState(post.text || '')
  const [editImage, setEditImage] = React.useState(post.image || null)
  const editFileRef = React.useRef(null)

  // close comment box when clicking outside or pressing Escape
  React.useEffect(() => {
    function onDocClick(e) {
      if (!showComment) return
      const el = commentBoxRef.current
      if (!el) return
      if (!el.contains(e.target)) {
        setShowComment(false)
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setShowComment(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [showComment])

  function handleDelete() {
    // Remove the post immediately (no confirm)
    if (!onDelete) return
    onDelete()
  }

  function startEdit() {
    setEditText(post.text || '')
    setEditImage(post.image || null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setEditText(post.text || '')
    setEditImage(post.image || null)
    if (editFileRef.current) editFileRef.current.value = ''
  }

  function onEditFileChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setEditImage(reader.result)
    reader.readAsDataURL(file)
  }

  function saveEdit() {
    const updated = { text: editText, image: editImage, editedAt: new Date().toISOString() }
    if (!onEdit) return
    onEdit(updated)
    setEditing(false)
  }

  return (
    <>
    <article className="post">
      <div className="post-header">
          <div className="post-avatar" style={{ cursor: 'pointer' }} onClick={() => { setProfileToShow({ id: post.authorId, name: post.author, avatar: post.authorAvatar }); setShowProfilePopup(true) }}>
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt={`${post.author} avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            (post.author ? post.author[0] : 'U')
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div className="post-author">{post.author}</div>
          <div className="muted small">{new Date(post.date).toLocaleString()}</div>
        </div>
        {canDelete && (
          <div>
            <button className="delete-btn" onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>
      {!editing ? (
        <>
          <div className="post-body">{post.text}</div>
          {post.image && (
            <div style={{ marginTop: 12 }}>
              <img
                src={post.image}
                alt={post.text ? post.text.substring(0, 80) : `Image by ${post.author}`}
                style={{ width: '100%', borderRadius: 8, maxHeight: 500, objectFit: 'cover' }}
                onClick={() => window.open(post.image, '_blank')}
              />
            </div>
          )}
        </>
      ) : (
        <div className="post-edit">
          <textarea value={editText} onChange={(e) => setEditText(e.target.value)} style={{ width: '100%', minHeight: 100 }} />
          <div style={{ marginTop: 8 }}>
            {editImage && <img src={editImage} alt="edit preview" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, objectFit: 'cover' }} />}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input ref={editFileRef} type="file" accept="image/*" onChange={onEditFileChange} />
            <button className="primary" onClick={saveEdit}>Save</button>
            <button className="ghost" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}
  <div className="post-actions muted">
        <button className={`post-action ${liked ? 'liked' : ''}`} aria-pressed={liked} aria-label="Like" onClick={() => {
          if (!onLike) return
          onLike(postId)
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path d="M12 21s-7.3-4.95-9.2-7.06C1.14 11.91 2 7.5 5.4 5.6 7.36 4.52 9.6 5 11 6.56 12.4 5 14.64 4.52 16.6 5.6c3.41 1.9 4.27 6.31 2.6 8.34C19.3 16.05 12 21 12 21z"/>
          </svg>
            <span>Like</span>
        </button>

          {likeCount > 0 && (
            <button className="post-action" aria-label="View likes" onClick={() => {
              // build list of user profiles who liked this post
              const users = JSON.parse(localStorage.getItem('users') || '[]')
              const likers = (Array.isArray(post.likes) ? post.likes : []).map((id) => users.find((u) => String(u.id) === String(id))).filter(Boolean)
              setLikeUsers(likers)
              setShowLikes(true)
            }}>{`· ${likeCount}`}</button>
          )}

  <button className="post-action post-action--comment" aria-label="Comment" onClick={() => setShowComment((s) => !s)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path d="M21 6.5A2.5 2.5 0 0 0 18.5 4h-13A2.5 2.5 0 0 0 3 6.5v7A2.5 2.5 0 0 0 5.5 16H7v3l3-3h8.5A2.5 2.5 0 0 0 21 13.5v-7z"/>
          </svg>
          <span>Comment{comments.length > 0 ? ` · ${comments.length}` : ''}</span>
        </button>

        <button className="post-action" aria-label="Share" onClick={() => {
          // optimistic increment handled by Feed via onShare
          if (onShare) onShare(postId)
          setShowShare(true)
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path d="M18 8a3 3 0 1 0-2.83-4H9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6.17A3 3 0 1 0 18 8zM6 10V6h5v4H6z" />
          </svg>
          <span>Share{(post.shares && post.shares > 0) ? ` · ${post.shares}` : ''}</span>
        </button>
        {canEdit && (
          <button className="post-action" aria-label="Edit" onClick={startEdit}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            <span>Edit</span>
          </button>
        )}
      </div>
      {showComment && (
        <div className="comment-box">
          <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." />
          <div style={{ textAlign: 'right', marginTop: 6 }}>
            <button className="primary" onClick={() => {
              if (!commentText.trim()) return
              if (!onComment) return
              const comment = {
                id: Date.now() + Math.floor(Math.random()*1000),
                author: user ? user.name : 'Guest',
                authorId: user ? (user.id || user.name) : null,
                authorAvatar: user ? (user.avatar || null) : null,
                text: commentText.trim(),
                date: new Date().toISOString()
              }
              onComment(comment)
              setCommentText('')
              setShowComment(false)
            }}>Comment</button>
          </div>
        </div>
      )}

      {comments.length > 0 && (
        <div className="comments-list">
          {!showAllComments ? (
            // show only the most recent comment when collapsed
            (() => {
              const c = comments[comments.length - 1]
              return (
                <div className="comment" key={c.id}>
                  <div className="comment-left">
                    {c.authorAvatar ? (
                      <button className="avatar-btn" onClick={() => { setProfileToShow({ id: c.authorId, name: c.author, avatar: c.authorAvatar }); setShowProfilePopup(true) }} title={c.author}>
                        <img src={c.authorAvatar} alt={`${c.author} avatar`} className="comment-avatar" />
                      </button>
                      ) : (
                      <button className="avatar-btn" onClick={() => { setProfileToShow({ id: c.authorId, name: c.author, avatar: null }); setShowProfilePopup(true) }} title={c.author}>
                        <div className="comment-avatar placeholder">{c.author ? c.author[0] : 'U'}</div>
                      </button>
                    )}
                  </div>
                  <div className="comment-body">
                    <div className="comment-author">{c.author}</div>
                    <div className="comment-text">{c.text}</div>
                    <div className="muted small">{new Date(c.date).toLocaleString()}</div>
                  </div>
                </div>
              )
            })()
          ) : (
            comments.map((c) => (
              <div className="comment" key={c.id}>
                <div className="comment-left">
                  {c.authorAvatar ? (
                    <button className="avatar-btn" onClick={() => { setProfileToShow({ id: c.authorId, name: c.author, avatar: c.authorAvatar }); setShowProfilePopup(true) }} title={c.author}>
                      <img src={c.authorAvatar} alt={`${c.author} avatar`} className="comment-avatar" />
                    </button>
                  ) : (
                    <button className="avatar-btn" onClick={() => { setProfileToShow({ id: c.authorId, name: c.author, avatar: null }); setShowProfilePopup(true) }} title={c.author}>
                      <div className="comment-avatar placeholder">{c.author ? c.author[0] : 'U'}</div>
                    </button>
                  )}
                </div>
                <div className="comment-body">
                  <div className="comment-author">{c.author}</div>
                  <div className="comment-text">{c.text}</div>
                  <div className="muted small">{new Date(c.date).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}

          {comments.length > 1 && (
            <div>
              <button className="show-comments-link" onClick={() => setShowAllComments((s) => !s)}>
                {showAllComments ? 'Hide comments' : `Show all ${comments.length} comments`}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  {showShare && <ShareModal post={post} visible={showShare} onClose={() => setShowShare(false)} />}
  {showProfilePopup && <ProfilePopup profile={profileToShow} visible={showProfilePopup} onClose={() => setShowProfilePopup(false)} />}
  {showLikes && (
    <div className="share-modal-backdrop" onMouseDown={() => setShowLikes(false)}>
      <div className="share-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>Liked by</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflow: 'auto' }}>
          {likeUsers.length === 0 && <div className="muted">No users found</div>}
          {likeUsers.map((u) => (
            <div key={u.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="avatar-btn" onClick={() => { setProfileToShow({ id: u.id, name: u.name, avatar: u.avatar }); setShowProfilePopup(true); setShowLikes(false) }}>
                {u.avatar ? <img src={u.avatar} alt={u.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: 6, background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.name ? u.name[0] : 'U'}</div>}
              </button>
              <div style={{ flex: 1 }}>{u.name}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <button className="primary" onClick={() => setShowLikes(false)}>Close</button>
        </div>
      </div>
    </div>
  )}
    </>
  )
}
