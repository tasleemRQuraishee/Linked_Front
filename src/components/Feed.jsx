import React, { useEffect, useState, useRef } from 'react'
import Composer from './Composer'
import Post from './Post'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const feedRef = useRef(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('posts') || '[]')
    setPosts(stored)
  }, [])

  // Add a new post and preserve the user's scroll position.
  // We capture the container's scrollHeight and scrollTop before
  // inserting the post, then after the DOM updates we shift
  // scrollTop by the increase in scrollHeight so the same
  // content stays in view.
  function addPostLocal(p) {
    const container = feedRef.current
    if (!container) {
      const newPosts = [p, ...posts]
      setPosts(newPosts)
      localStorage.setItem('posts', JSON.stringify(newPosts))
      return
    }

    const prevScrollHeight = container.scrollHeight
    const prevScrollTop = container.scrollTop

    setPosts((s) => {
      const newPosts = [p, ...s]
      // persist
      localStorage.setItem('posts', JSON.stringify(newPosts))
      return newPosts
    })

    // After browser renders the new post, adjust scroll to keep view stable
    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight
      const delta = newScrollHeight - prevScrollHeight
      container.scrollTop = prevScrollTop + delta
    })
  }

  function deletePost(id) {
    const filtered = posts.filter((x) => (x._id || x.id) !== id)
    setPosts(filtered)
    localStorage.setItem('posts', JSON.stringify(filtered))
  }

  function toggleLike(id) {
    const raw = localStorage.getItem('user')
    const user = raw ? JSON.parse(raw) : null
    if (!user) {
      alert('Please login to like posts')
      return
    }

    setPosts((prev) => {
      const next = prev.map((p) => {
        const pid = p._id || p.id
        if (pid !== id) return p
        // store user.id as the canonical liker identifier
        const likerId = user.id || user.name
        const likes = Array.isArray(p.likes) ? [...p.likes] : []
        const existing = likes.indexOf(likerId)
        if (existing >= 0) {
          likes.splice(existing, 1)
        } else {
          likes.push(likerId)
        }
        return Object.assign({}, p, { likes })
      })
      localStorage.setItem('posts', JSON.stringify(next))
      return next
    })
  }

  function addComment(postId, comment) {
    const rawUser = localStorage.getItem('user')
    const user = rawUser ? JSON.parse(rawUser) : null
    if (!user) {
      alert('Please login to comment')
      return
    }

    const container = feedRef.current
    const prevScrollHeight = container ? container.scrollHeight : 0
    const prevScrollTop = container ? container.scrollTop : 0

    setPosts((prev) => {
      const next = prev.map((p) => {
        const pid = p._id || p.id
        if (pid !== postId) return p
        const comments = Array.isArray(p.comments) ? [...p.comments] : []
        comments.push(comment)
        return Object.assign({}, p, { comments })
      })
      localStorage.setItem('posts', JSON.stringify(next))
      return next
    })

    // keep the user's viewport stable in the feed after adding a comment
    requestAnimationFrame(() => {
      if (!container) return
      const newScrollHeight = container.scrollHeight
      const delta = newScrollHeight - prevScrollHeight
      container.scrollTop = prevScrollTop + delta
    })
  }

  function sharePost(id) {
    setPosts((prev) => {
      const next = prev.map((p) => {
        const pid = p._id || p.id
        if (pid !== id) return p
        const shares = (typeof p.shares === 'number') ? p.shares + 1 : 1
        return Object.assign({}, p, { shares })
      })
      localStorage.setItem('posts', JSON.stringify(next))
      return next
    })
  }

  function editPost(id, updated) {
    setPosts((prev) => {
      const next = prev.map((p) => {
        const pid = p._id || p.id
        if (pid !== id) return p
        return Object.assign({}, p, updated)
      })
      localStorage.setItem('posts', JSON.stringify(next))
      return next
    })
  }

  return (
    <div
      className="feed"
      ref={feedRef}
      style={{ maxHeight: 'calc(90vh)', overflow: 'auto' }}
    >
      <Composer onPost={addPostLocal} />
      {posts.length === 0 ? (
        <div className="placeholder">No posts yet — be the first to post!</div>
      ) : (
        posts.map((p) => (
          <Post
            key={p._id || p.id}
            post={p}
            onDelete={() => deletePost(p._id || p.id)}
            onLike={() => toggleLike(p._id || p.id)}
            onComment={(comment) => addComment(p._id || p.id, comment)}
            onShare={() => sharePost(p._id || p.id)}
            onEdit={(updated) => editPost(p._id || p.id, updated)}
          />
        ))
      )}
    </div>
  )
}
