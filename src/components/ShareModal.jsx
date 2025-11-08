import React from 'react'

export default function ShareModal({ post, visible, onClose }) {
  if (!visible) return null

  const text = `${post.author}: ${post.text || ''}`
  const origin = window.location.origin
  const path = window.location.pathname
  const link = `${origin}${path}#post-${post._id || post.id}`

  function copyToClipboard(value, notify = true) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).then(() => {
        if (notify) alert('Copied to clipboard')
      }).catch(() => { if (notify) alert('Copy failed') })
    } else {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy'); if (notify) alert('Copied to clipboard') } catch (e) { if (notify) alert('Copy failed') }
      document.body.removeChild(ta)
    }
  }

  async function tryNativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Post by ${post.author}`, text, url: link })
        return
      }
      alert('Native share not available on this browser')
    } catch (e) {
      console.error(e)
      alert('Share canceled or failed')
    }
  }

  function openWindow(url) {
    window.open(url, '_blank', 'noopener')
  }

  const whatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + link)}`
  const telegram = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`
  const reddit = `https://www.reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(text)}`
  const mailto = `mailto:?subject=${encodeURIComponent('Shared post by ' + post.author)}&body=${encodeURIComponent(text + '\n' + link)}`

  return (
    <div className="share-modal-backdrop" onMouseDown={onClose}>
      <div className="share-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>Share post</h3>
        <div className="share-actions">
          <button className="primary" onClick={async () => { await tryNativeShare(); onClose() }}>Native Share</button>
          <button onClick={() => { copyToClipboard(text); onClose() }}>Copy text</button>
          <button onClick={() => { copyToClipboard(link); onClose() }}>Copy link</button>
          <button onClick={() => { openWindow(whatsapp); onClose() }}>WhatsApp</button>
          <button onClick={() => { openWindow(telegram); onClose() }}>Telegram</button>
          <button onClick={() => { openWindow(twitter); onClose() }}>Twitter</button>
          <button onClick={() => { openWindow(facebook); onClose() }}>Facebook</button>
          <button onClick={() => { openWindow(linkedIn); onClose() }}>LinkedIn</button>
          <button onClick={() => { openWindow(reddit); onClose() }}>Reddit</button>
          <button onClick={() => { window.location.href = mailto; onClose() }}>Email</button>
        </div>
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <button className="primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
