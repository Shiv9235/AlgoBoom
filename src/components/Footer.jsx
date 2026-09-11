function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">

        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/logo.png" alt="AlgoBoom" />
          </div>

          <div>
            <h3>AlgoBoom</h3>
            <p>
              A simple DSA practice tracker built to make
              problem solving more consistent.
            </p>
          </div>
        </div>

        <div className="footer-column">
          <p className="footer-heading">PROJECT</p>

          <a href="#home">Home</a>
          <a href="#problems">Problems</a>
          <a href="#resources">Library & Resources</a>
        </div>

        <div className="footer-column">
          <p className="footer-heading">OPEN SOURCE</p>

          <p>
            AlgoBoom is built as an open-source project.
            Anyone can contribute, improve the app,
            fix bugs, or add new ideas.
          </p>

          <a
            className="github-link"
            href="https://github.com/Shiv9235/AlgoBoom"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub ↗
          </a>
        </div>

        <div className="footer-column">
          <p className="footer-heading">BUILT BY</p>

          <p>
            Designed and developed by
          </p>

          <strong className="footer-name">
            Shivraj Upadhyay
          </strong>
        </div>

      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} AlgoBoom
        </span>

        <span>
          Built for learning. Open for contribution.
        </span>
      </div>
    </footer>
  )
}

export default Footer