import { useState } from 'react'

function AuthDrawer({ mode, onClose, onAuthSuccess, onSwitch }) {
  const isOpen = mode !== null
  const isLogin = mode === 'login'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function resetForm() {
    setName('')
    setEmail('')
    setPassword('')
    setError('')
  }

  function handleSwitch() {
    resetForm()
    onSwitch(isLogin ? 'signup' : 'login')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin
        ? '/api/auth/login'
        : '/api/auth/signup'

      const body = isLogin
        ? {
            email,
            password,
          }
        : {
            name,
            email,
            password,
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      resetForm()

      onAuthSuccess(data.user)
      onClose()
    } catch (error) {
      setError(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        className={`drawer-overlay ${isOpen ? 'visible' : ''}`}
        type="button"
        aria-label="Close authentication panel"
        onClick={onClose}
      />

      <aside
        className={`auth-drawer ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
      >
        <button
          className="drawer-close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <span className="drawer-logo">A</span>

        <p className="eyebrow">
          {isLogin ? 'WELCOME BACK' : 'START YOUR JOURNEY'}
        </p>

        <h2>
          {isLogin ? 'Log in to AlgoBoom' : 'Create your account'}
        </h2>

        <p className="drawer-copy">
          {isLogin
            ? 'Continue tracking your DSA growth.'
            : 'Start building a consistent problem-solving habit.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <label>
              Full name
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={8}
              required
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Log in'
                : 'Create account'}
          </button>
        </form>

        <p className="drawer-switch">
          {isLogin ? 'New to AlgoBoom?' : 'Already have an account?'}

          <button type="button" onClick={handleSwitch}>
            {isLogin ? ' Sign up' : ' Log in'}
          </button>
        </p>
      </aside>
    </>
  )
}

export default AuthDrawer