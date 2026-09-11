function Navbar({
  user,
  authLoading,
  onLogin,
  onSignup,
  onLogout,
}) {
  return (
    <nav className="navbar">
      <a className="brand" href="#home" aria-label="AlgoBoom home">
        <div class="footer-logo">
          <img src="/logo.png" alt="AlgoBoom" />
        </div>
        <span>AlgoBoom</span>
      </a>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#problems">Problems</a>
        <a href="#resources">Resources</a>
      </div>

      <div className="nav-actions">
        {authLoading ? null : user ? (
          <>
            <span className="user-greeting">
              Hi, {user.name}
            </span>

            <button
              className="text-button"
              type="button"
              onClick={onLogout}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <button
              className="text-button"
              type="button"
              onClick={onLogin}
            >
              Log in
            </button>

            <button
              className="signup-button"
              type="button"
              onClick={onSignup}
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar