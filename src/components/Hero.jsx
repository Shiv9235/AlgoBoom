import { useState } from 'react'

function Hero() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(event) {
    event.preventDefault()

    const problem = query.trim()

    if (!problem) {
      return
    }

    setLoading(true)
    setError('')
    setAnswer('')

    try {
      const response = await fetch('/api/problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to get AI response.')
      }

      setAnswer(data.answer)
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="hero reveal" id="home">

        <p className="eyebrow">
          YOUR DSA JOURNEY, VISUALIZED
        </p>

        <h1>
          Turn every problem into <span>progress.</span>
        </h1>

        <p className="hero-copy">
          Track your LeetCode practice, build streaks, and learn one pattern at a time.
        </p>

        <form className="search-bar" onSubmit={handleSearch}>

          <span className="search-icon" aria-hidden="true">
            ⌕
          </span>

          <input
            type="search"
            placeholder="Search a LeetCode problem"
            aria-label="Search a LeetCode problem"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Thinking...' : 'Search'}
          </button>

        </form>

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


      {/* AI RESULT */}

      {loading && (
        <section className="ai-result reveal">

          <div className="ai-result-header">
            <div>
              <p className="ai-result-label">ALGOBOOM AI</p>
              <h2>Thinking about {query}...</h2>
            </div>
          </div>

          <div className="ai-answer loading-answer">
            <p>Analyzing the problem...</p>
            <p>Building the best explanation and approach for you.</p>
          </div>

        </section>
      )}


      {error && !loading && (
        <section className="ai-result reveal">

          <div className="ai-result-header">
            <div>
              <p className="ai-result-label">ALGOBOOM AI</p>
              <h2>Something went wrong</h2>
            </div>
          </div>

          <div className="ai-answer ai-error">
            {error}
          </div>

        </section>
      )}


      {answer && !loading && !error && (
        <section className="ai-result reveal">

          <div className="ai-result-header">

            <div>
              <p className="ai-result-label">
                ALGOBOOM AI
              </p>

              <h2>
                {query}
              </h2>
            </div>

            <span className="ai-result-status">
              AI EXPLANATION
            </span>

          </div>


          <div className="ai-answer">

            <div className="ai-answer-content">
              {answer}
            </div>

          </div>

        </section>
      )}
    </>
  )
}

export default Hero