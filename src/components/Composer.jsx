import React, { useState } from 'react'

export default function Composer({ onPost }) {
  const [text, setText] = useState('')
  const [imagePreview, setImagePreview] = useState(null)

  function submit() {
    if (!text.trim() && !imagePreview) return

    const rawUser = localStorage.getItem('user')
    const user = rawUser ? JSON.parse(rawUser) : null
    if (!user) {
      alert('Please login to post')
      return
    }

    const post = {
      id: Date.now(),
      authorId: user.id,
      author: user.name,
      authorAvatar: user.avatar || null,
      text: text.trim(),
      date: new Date().toISOString(),
      image: imagePreview || null,
    }

    const existing = JSON.parse(localStorage.getItem('posts') || '[]')
    existing.unshift(post)
    localStorage.setItem('posts', JSON.stringify(existing))

    onPost(post)
    setText('')
    setImagePreview(null)
    // clear file input if present
    const fileEl = document.getElementById('composer-image-input')
    if (fileEl) fileEl.value = ''
  }

  function onFileChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    // Only accept images
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="composer">
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share an update" />
      {imagePreview && (
        <div style={{ marginTop: 8 }}>
          <img src={imagePreview} alt="preview" style={{ maxWidth: '100%', borderRadius: 8, maxHeight: 300, objectFit: 'cover' }} />
        </div>
      )}
      <div className="composer-actions">
        <input id="composer-image-input" type="file" accept="image/*" onChange={onFileChange} />
        <button onClick={submit}>Post</button>
      </div>
    </div>
  )
}
