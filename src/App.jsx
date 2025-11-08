import './App.css'
import './linkedin.css'
import NavBar from './components/NavBar'
import Feed from './components/Feed'
import ProfileCard from './components/ProfileCard'
import RightCol from './components/RightCol'
import Hero from './components/Hero'

function App() {
  const raw = localStorage.getItem('user')
  const user = raw ? JSON.parse(raw) : null

  return (
    <div id="app-root">
      <NavBar />
      {!user ? (
        <Hero />
      ) : (
        <main className="layout">
          <aside className="left-col">
            <ProfileCard />
          </aside>
          <section className="center-col">
            <Feed />
          </section>
          <aside className="right-col">
            <RightCol />
          </aside>
        </main>
      )}
    </div>
  )
}

export default App
