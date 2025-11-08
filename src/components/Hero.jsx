import React from 'react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to Linked<span className="logo-blue">In</span></h1>
        <p className="hero-sub">A simple professional network — make connections, share updates, and grow your career.</p>
        <div className="hero-actions">
          <a href="/signup" target="_blank" rel="noopener noreferrer" className="primary">Join now</a>
          <a href="/login" target="_blank" rel="noopener noreferrer" className="ghost-link">Sign in</a>
        </div>
      </div>
    </section>
  )
}
