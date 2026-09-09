function AuthDrawer({ mode, onClose }) {
  const isOpen = mode !== null
  const isLogin = mode === 'login'

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
        <button className="drawer-close" type="button" onClick={onClose}>
          ×
        </button>

        <span className="drawer-logo">A</span>

        <p className="eyebrow">
          {isLogin ? 'WELCOME BACK' : 'START YOUR JOURNEY'}
        </p>

        <h2>{isLogin ? 'Log in to AlgoBoom' : 'Create your account'}</h2>

        <p className="drawer-copy">
          {isLogin
            ? 'Continue tracking your LeetCode growth.'
            : 'Start building a consistent problem-solving habit.'}
        </p>

        <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
          {!isLogin && (
            <label>
              Full name
              <input type="text" placeholder="Your name" />
            </label>
          )}

          <label>
            Email address
            <input type="email" placeholder="you@example.com" />
          </label>

          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>

          <button className="auth-submit" type="submit">
            {isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="drawer-switch">
          {isLogin ? 'New to AlgoBoom?' : 'Already have an account?'}
          <button
            type="button"
            onClick={() => window.alert('This will switch after backend setup.')}
          >
            {isLogin ? ' Sign up' : ' Log in'}
          </button>
        </p>
      </aside>
    </>
  )
}

export default AuthDrawer