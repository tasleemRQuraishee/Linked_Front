import axios from 'axios'

const API = axios.create({
  // Use VITE_API_URL when provided, otherwise use relative URLs (current origin).
  // This avoids hardcoding 'localhost' in the app UI/console.
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' }
})

// attach token if present
API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default API
