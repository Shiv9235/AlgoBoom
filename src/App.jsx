import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Dashboard from './components/Dashboard.jsx'
import ProblemSpotlight from './components/ProblemSpotlight.jsx'
import Resources from './components/Resources.jsx'
import Footer from './components/Footer.jsx'
import AuthDrawer from './components/AuthDrawer.jsx'

function App() {
  const [authMode, setAuthMode] = useState(null)

  function closeDrawer() {
    setAuthMode(null)
  }

  return (
    <div className="space-page">
      <div className="stars stars-one" />
      <div className="stars stars-two" />
      <div className="shooting-star" />

      <main className="app-shell">
        <Navbar
          onLogin={() => setAuthMode('login')}
          onSignup={() => setAuthMode('signup')}
        />

        <Hero />
        <Dashboard />
        <ProblemSpotlight />
        <Resources />
        <Footer />
      </main>

      <AuthDrawer mode={authMode} onClose={closeDrawer} />
    </div>
  )
}

export default App