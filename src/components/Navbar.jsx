function Navbar({ onLogin, onSignup }) {
  return (
    <nav className="navbar">
      <a className="brand" href="#home" aria-label="AlgoBoom home">
        <span className="brand-mark">A</span>
        <span>AlgoBoom</span>
      </a>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#problems">Problems</a>
        <a href="#resources">Resources</a>
      </div>

      <div className="nav-actions">
        <button className="text-button" type="button" onClick={onLogin}>
          Log in
        </button>

        <button className="signup-button" type="button" onClick={onSignup}>
          Sign up
        </button>
      </div>
    </nav>
  )
}

export default Navbar