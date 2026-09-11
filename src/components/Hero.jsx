import { useState } from 'react'
import Dashboard from './Dashboard.jsx'
import MotivationMessage from './MotivationMessage.jsx'



function Hero({ onSearch }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(event) {
    event.preventDefault()

    const problem = query.trim()

    if (!problem || loading) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to get AI response.'
        )
      }

      onSearch(problem, data.answer)
    } catch (err) {
      console.error('Search error:', err)

      setError(
        err.message || 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="hero reveal" id="home">
      <p className="eyebrow">
        YOUR DSA JOURNEY, VISUALIZED
      </p>

      <h1>
        Turn every problem into <span>progress.</span>
      </h1>

      <p className="hero-copy">
        Track your LeetCode practice, build streaks,
        and learn one pattern at a time.
      </p>
      {/* <MotivationMessage /> */}
      <Dashboard/>

      <form
        className="search-bar"
        onSubmit={handleSearch}
      >
        <span
          className="search-icon"
          aria-hidden="true"
        >
          ⌕
        </span>

        <input
          type="search"
          placeholder="Search a LeetCode problem"
          aria-label="Search a LeetCode problem"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Thinking...' : 'Search'}
        </button>
      </form>

      {loading && (
        <div className="search-message">
          <p>AlgoBoom AI is thinking...</p>
        </div>
      )}

      {error && !loading && (
        <div className="search-message ai-error">
          {error}
        </div>
      )}

      <div className="hero-notes">
        <span>
          <i className="dot green" />
          Build consistency
        </span>

        <span>
          <i className="dot blue" />
          Learn patterns
        </span>

        <span>
          <i className="dot purple" />
          Track growth
        </span>
      </div>
    </section>
  )
}

export default Hero