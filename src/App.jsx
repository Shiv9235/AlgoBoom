import { useEffect, useState } from 'react'

import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import ProblemSpotlight from './components/ProblemSpotlight.jsx'
import Resources from './components/Resources.jsx'
import Footer from './components/Footer.jsx'
import AuthDrawer from './components/AuthDrawer.jsx'
import RecentSearches from './components/RecentSearches.jsx'

function App() {
  const [authMode, setAuthMode] = useState(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [currentProblem, setCurrentProblem] = useState('')
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [historyRefresh, setHistoryRefresh] = useState(0)

  function handleSearch(problem, answer) {
    setCurrentProblem(problem)
    setCurrentAnswer(answer)
    setHistoryRefresh((current) => current + 1)
  }

  async function searchProblem(problem) {
    const cleanProblem = problem.trim()

    if (!cleanProblem) return

    try {
      const response = await fetch('/api/problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          problem: cleanProblem,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to search this problem.'
        )
      }

      setCurrentProblem(cleanProblem)
      setCurrentAnswer(data.answer)
      setHistoryRefresh((current) => current + 1)
    } catch (error) {
      console.error('History search error:', error)
    }
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (!response.ok) {
          setUser(null)
          return
        }

        const data = await response.json()

        if (data.success) {
          setUser(data.user)

          try {
            await fetch('/api/streak', {
              method: 'POST',
              credentials: 'include',
            })
          } catch (error) {
            console.error(
              'Unable to update login streak:',
              error
            )
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error(
          'Authentication check failed:',
          error
        )
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  function closeDrawer() {
    setAuthMode(null)
  }

  async function handleAuthSuccess(authenticatedUser) {
    setUser(authenticatedUser)
    setAuthMode(null)

    try {
      await fetch('/api/streak', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error(
        'Unable to update login streak:',
        error
      )
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        setUser(null)
        setCurrentProblem('')
        setCurrentAnswer('')
        setHistoryRefresh(0)
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (authLoading) {
    return (
      <div className="space-page auth-loading-page">
        <div className="auth-loading">
          <span className="footer-logo">A</span>
          <p>Loading AlgoBoom...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-page">
      <div className="stars stars-one" />
      <div className="stars stars-two" />
      <div className="shooting-star" />

      <main className="app-shell">

        <Navbar
          user={user}
          authLoading={authLoading}
          onLogin={() => setAuthMode('login')}
          onSignup={() => setAuthMode('signup')}
          onLogout={handleLogout}
        />

        {!user ? (
          <section className="login-required">
            <div className="login-required-card">

              <span className="drawer-logo">
                A
              </span>

              <p className="eyebrow">
                MEMBERS ONLY
              </p>

              <h1>
                Your DSA journey
                <span> starts here.</span>
              </h1>

              <p>
                Log in or create an account to search
                problems, get AI explanations, track your
                progress, and build your streak.
              </p>

              <div className="login-required-actions">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                >
                  Create account
                </button>
              </div>

              <small>
                Your progress and search history are saved
                to your account.
              </small>

            </div>
          </section>
        ) : (
          <>
            <Hero onSearch={handleSearch} />

            <ProblemSpotlight
              problem={currentProblem}
              answer={currentAnswer}
            />

            <RecentSearches
              user={user}
              onSearch={searchProblem}
              refreshKey={historyRefresh}
            />

            <Resources />

            <Footer />
          </>
        )}

      </main>

      <AuthDrawer
        mode={authMode}
        onClose={closeDrawer}
        onAuthSuccess={handleAuthSuccess}
        onSwitch={setAuthMode}
      />
    </div>
  )
}

export default App