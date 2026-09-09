import { useState } from 'react'

const statuses = ['Solved', 'Attempted', 'Not attempted']

function ProblemSpotlight() {
  const [selectedStatus, setSelectedStatus] = useState('Not attempted')

  return (
    <section className="problems-section reveal" id="problems">
      <div className="section-heading">
        <div>
          <p className="eyebrow">KEEP GOING</p>
          <h2>Practice spotlight</h2>
        </div>
        <span className="static-badge">Sample problem</span>
      </div>

      <article className="problem-card">
        <div className="problem-main">
          <div className="problem-number">01</div>

          <div>
            <div className="problem-title-row">
              <h3>Two Sum</h3>
              <span className="badge easy-badge">Easy</span>
            </div>

            <p>Find two values whose sum equals a target value.</p>
            <span className="topic-tag">Array</span>
          </div>
        </div>

        <div className="status-area">
          <div className="problem-actions">
            {statuses.map((status) => (
              <button
                className={`status-button ${
                  selectedStatus === status ? 'selected' : ''
                }`}
                key={status}
                type="button"
                aria-pressed={selectedStatus === status}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <p className="selected-status">
            Current status: <strong>{selectedStatus}</strong>
          </p>
        </div>
      </article>

      <article className="approach-card">
        <div className="approach-icon">✧</div>

        <div>
          <p className="card-label">ALGOGUIDE</p>
          <h3>Approach helper</h3>
          <p>
            Brute-force and optimal approaches will appear here in a future version.
          </p>
        </div>

        <button className="coming-soon" type="button">Coming soon</button>
      </article>
    </section>
  )
}

export default ProblemSpotlight