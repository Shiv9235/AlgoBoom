import { useEffect, useState } from 'react'

function RecentSearches({ user, onSearch, refreshKey }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchingId, setSearchingId] = useState(null)

  useEffect(() => {
    if (!user) {
      setHistory([])
      return
    }

    async function loadHistory() {
      setLoading(true)

      try {
        const response = await fetch('/api/history', {
          credentials: 'include',
        })

        if (!response.ok) {
          setHistory([])
          return
        }

        const data = await response.json()

        if (data.success) {
          setHistory(data.history || [])
        }
      } catch (error) {
        console.error(
          'Unable to load search history:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user, refreshKey])

  async function handleHistorySearch(problem, id) {
    if (searchingId !== null) return

    setSearchingId(id)

    try {
      await onSearch(problem)
    } finally {
      setSearchingId(null)
    }
  }

  async function deleteHistory(event, id) {
    event.stopPropagation()

    try {
      const response = await fetch(
        `/api/history?id=${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (!response.ok) return

      setHistory((current) =>
        current.filter(
          (item) =>
            Number(item.id) !== Number(id)
        )
      )
    } catch (error) {
      console.error(
        'Unable to delete history:',
        error
      )
    }
  }

  if (!user) {
    return null
  }

  return (
    <section className="history-section reveal">
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR ACTIVITY</p>
          <h2>Recent searches</h2>
        </div>

        <span className="static-badge">
          {history.length} saved
        </span>
      </div>

      {loading ? (
        <div className="history-empty">
          Loading your searches...
        </div>
      ) : history.length === 0 ? (
        <div className="history-empty">
          Search for a problem and it will appear here.
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div
              className="history-item"
              key={item.id}
              onClick={() =>
                handleHistorySearch(
                  item.problem,
                  item.id
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleHistorySearch(
                    item.problem,
                    item.id
                  )
                }
              }}
            >
              <div className="history-item-main">
                <span className="history-icon">
                  ⌕
                </span>

                <div>
                  <strong>
                    {item.problem}
                  </strong>

                  <small>
                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}
                  </small>
                </div>
              </div>

              <button
                className="history-delete"
                type="button"
                disabled={
                  searchingId !== null
                }
                onClick={(event) =>
                  deleteHistory(
                    event,
                    item.id
                  )
                }
                aria-label={`Delete ${item.problem} from history`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default RecentSearches