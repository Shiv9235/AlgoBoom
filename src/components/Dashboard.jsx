import { useEffect, useState } from 'react'

function Dashboard() {
  const [stats, setStats] = useState({
    loginStreak: 0,
    problemStreak: 0,
    totalSolved: 0,
  })

  async function loadStats() {
    try {
      const response = await fetch('/api/streak', {
        credentials: 'include',
      })

      if (!response.ok) return

      const data = await response.json()

      if (data.success) {
        setStats({
          loginStreak: data.streak.loginStreak,
          problemStreak: data.streak.problemStreak,
          totalSolved: data.streak.totalSolved,
        })
      }
    } catch (error) {
      console.error('Unable to load streak stats:', error)
    }
  }

  useEffect(() => {
    loadStats()

    function refreshStats() {
      loadStats()
    }

    window.addEventListener('streak-updated', refreshStats)

    return () => {
      window.removeEventListener(
        'streak-updated',
        refreshStats
      )
    }
  }, [])

  return (
    <section className="dashboard-section reveal">
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR STREAKS</p>
          <h2>Keep the momentum going</h2>
        </div>
      </div>

      <div className="main-stats">
        <article className="streak-card stat-card">
          <div className="stat-card-top">
            <div>
              <p className="card-label">DAILY LOGIN</p>

              <h3>
                {stats.loginStreak}
                <span>
                  {stats.loginStreak === 1
                    ? 'day'
                    : 'days'}
                </span>
              </h3>
            </div>

            <span className="streak-icon">🔥</span>
          </div>

          <p className="stat-description">
            Keep showing up every day.
          </p>
        </article>

        <article className="streak-card stat-card problem-streak-card">
          <div className="stat-card-top">
            <div>
              <p className="card-label">DAILY PROBLEM</p>

              <h3>
                {stats.problemStreak}
                <span>
                  {stats.problemStreak === 1
                    ? 'day'
                    : 'days'}
                </span>
              </h3>
            </div>

            <span className="streak-icon problem-icon">
              ⚡
            </span>
          </div>

          <p className="stat-description">
            Submit at least one problem every day.
          </p>
        </article>

        <article className="streak-card stat-card solved-stat-card">
          <div className="stat-card-top">
            <div>
              <p className="card-label">TOTAL PROBLEMS</p>

              <h3>
                {stats.totalSolved}
              </h3>
            </div>

            <span className="streak-icon solved-icon">
              ✓
            </span>
          </div>

          <p className="stat-description">
            Problems you've marked as submitted.
          </p>
        </article>
      </div>
    </section>
  )
}

export default Dashboard