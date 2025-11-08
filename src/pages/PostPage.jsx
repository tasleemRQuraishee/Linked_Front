import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Post from '../components/Post'

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const containerRef = React.useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')
    const found = posts.find((p) => String(p.id) === String(id))
    setPost(found || null)
  }, [id])

  function updateLocal(updated) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')
    const idx = posts.findIndex((p) => String(p.id) === String(id))
    if (idx >= 0) {
      posts[idx] = Object.assign({}, posts[idx], updated)
      localStorage.setItem('posts', JSON.stringify(posts))
      setPost(posts[idx])
    }
  }

  // handle comment additions from the Post component
  function handleComment(comment) {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')
    const idx = posts.findIndex((p) => String(p.id) === String(id))
    if (idx >= 0) {
      posts[idx].comments = Array.isArray(posts[idx].comments) ? posts[idx].comments.concat(comment) : [comment]
      localStorage.setItem('posts', JSON.stringify(posts))
      setPost(posts[idx])
    }
  }

  if (!post) return <div style={{ padding: 20 }}>Post not found</div>

  return (
    <div ref={containerRef} style={{ padding: 20, maxWidth: 800, margin: '0 auto', maxHeight: 'calc(90vh)', overflow: 'auto' }}>
      <div style={{ marginBottom: 12 }}><button onClick={() => navigate(-1)} style={{ padding: '6px 10px' }}>← Back</button></div>
      <Post post={post} onEdit={(u) => updateLocal(u)} onLike={(id) => {
        // toggle like locally
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        const posts = JSON.parse(localStorage.getItem('posts') || '[]')
        const idx = posts.findIndex((p) => String(p.id) === String(id))
        if (idx >= 0 && user) {
          posts[idx].likes = posts[idx].likes || []
          const likerId = user.id || user.name
          const i = posts[idx].likes.indexOf(likerId)
          if (i >= 0) posts[idx].likes.splice(i, 1)
          else posts[idx].likes.push(likerId)
          localStorage.setItem('posts', JSON.stringify(posts))
          setPost(posts[idx])
        }
      }} onComment={(c) => handleComment(c)} />
    </div>
  )
}
