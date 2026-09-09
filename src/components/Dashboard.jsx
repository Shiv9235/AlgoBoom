import MotivationMessage from './MotivationMessage.jsx'
function Dashboard() {
  return (
    <section className="dashboard-section reveal">
      <div className="section-heading">
        <div>
          <p className="eyebrow">DASHBOARD</p>
          <h2>Your momentum</h2>
        </div>
        <button className="view-button" type="button">
          View details <span>→</span>
        </button>
      </div>

      <div className="main-stats">
        <article className="streak-card">
          <div className="card-top">
            <div>
              <p className="card-label">CURRENT STREAK</p>
              <h3>7 <span>days</span></h3>
            </div>
            <span className="streak-icon">✦</span>
          </div>

          <div className="mini-chart">
            <span className="bar short" />
            <span className="bar medium" />
            <span className="bar tall" />
            <span className="bar medium" />
            <span className="bar tallest" />
            <span className="bar high" />
            <span className="bar active" />
          </div>

          <MotivationMessage />
        </article>

        <article className="solved-card">
          <div>
            <p className="card-label">PROBLEMS SOLVED</p>
            <h3>70</h3>
            <p className="solved-copy">12 solved this month</p>
          </div>

          <div className="progress-circle">
            <svg viewBox="0 0 120 120" aria-label="70 percent goal progress">
              <circle className="circle-track" cx="60" cy="60" r="48" />
              <circle className="circle-value" cx="60" cy="60" r="48" />
            </svg>
            <span>70%</span>
          </div>
        </article>
      </div>

      <div className="difficulty-grid">
        <article className="difficulty-card easy-card">
          <span className="difficulty-dot" />
          <p>Easy</p>
          <strong>32</strong>
          <small>Problems solved</small>
        </article>

        <article className="difficulty-card medium-card">
          <span className="difficulty-dot" />
          <p>Medium</p>
          <strong>29</strong>
          <small>Problems solved</small>
        </article>

        <article className="difficulty-card hard-card">
          <span className="difficulty-dot" />
          <p>Hard</p>
          <strong>9</strong>
          <small>Problems solved</small>
        </article>
      </div>
    </section>
  )
}

export default Dashboard