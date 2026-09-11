import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const statuses = ['Submitted', 'Not submitted']

function ProblemSpotlight({ problem, answer }) {
  const [selectedStatus, setSelectedStatus] =
    useState('Not submitted')

  const [savingStatus, setSavingStatus] =
    useState(false)

  const [statusMessage, setStatusMessage] =
    useState('')

  useEffect(() => {
    if (!problem) {
      setSelectedStatus('Not submitted')
      setStatusMessage('')
      return
    }

    async function loadStatus() {
      try {
        const response = await fetch(
          `/api/problem-status?problem=${encodeURIComponent(problem)}`
        )

        if (!response.ok) return

        const data = await response.json()

        if (data.status === 'submitted') {
          setSelectedStatus('Submitted')
        } else {
          setSelectedStatus('Not submitted')
        }
      } catch (error) {
        console.error(
          'Unable to load problem status:',
          error
        )
      }
    }

    loadStatus()
    setStatusMessage('')
  }, [problem])

  async function handleStatusChange(status) {
    if (!problem || savingStatus) return

    setSelectedStatus(status)
    setSavingStatus(true)
    setStatusMessage('')

    try {
      const response = await fetch(
        '/api/problem-status',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            problem,
            status:
              status === 'Submitted'
                ? 'submitted'
                : 'not_submitted',
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to update status.'
        )
      }

      if (
        status === 'Submitted' &&
        data.problemStreak !== undefined
      ) {
        setStatusMessage(
          `Problem streak: ${data.problemStreak} day${
            data.problemStreak === 1 ? '' : 's'
          }`
        )
      }
    } catch (error) {
      console.error(
        'Status update error:',
        error
      )

      setStatusMessage(
        error.message ||
          'Unable to update status.'
      )
    } finally {
      setSavingStatus(false)
    }
  }

  /*
    No problem has been searched yet.
  */

  if (!problem) {
    return (
      <section
        className="problems-section reveal"
        id="problems"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              KEEP GOING
            </p>

            <h2>
              Practice spotlight
            </h2>
          </div>
        </div>

        <article className="problem-card empty-problem-card">
          <div>
            <p className="card-label">
              READY WHEN YOU ARE
            </p>

            <h3>
              Search for a problem to begin
            </h3>

            <p>
              Your searched problem will
              appear here with its difficulty,
              topic, submission status, and
              AI explanation.
            </p>
          </div>
        </article>
      </section>
    )
  }

  return (
    <section
      className="problems-section reveal"
      id="problems"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            KEEP GOING
          </p>

          <h2>
            Practice spotlight
          </h2>
        </div>

        <span className="static-badge">
          Current problem
        </span>
      </div>

      {/* Problem summary */}

      <article className="problem-card">
        <div className="problem-main">
          <div className="problem-number">
            01
          </div>

          <div>
            <div className="problem-title-row">
              <h3>{problem}</h3>

              <span className="badge easy-badge">
                AI
              </span>
            </div>

            <p>
              This is the problem you most
              recently searched for. Use the
              AI explanation below to understand
              the approach.
            </p>

            <span className="topic-tag">
              DSA
            </span>
          </div>
        </div>

        {/* Submission status */}

        <div className="status-area">
          <div className="problem-actions">
            {statuses.map((status) => (
              <button
                className={`status-button ${
                  selectedStatus === status
                    ? 'selected'
                    : ''
                }`}
                key={status}
                type="button"
                aria-pressed={
                  selectedStatus === status
                }
                disabled={savingStatus}
                onClick={() =>
                  handleStatusChange(status)
                }
              >
                {status}
              </button>
            ))}
          </div>

          <p className="selected-status">
            Status:{' '}
            <strong>
              {savingStatus
                ? 'Saving...'
                : selectedStatus}
            </strong>
          </p>

          {statusMessage && (
            <p className="selected-status">
              {statusMessage}
            </p>
          )}
        </div>
      </article>

      {/* AI explanation */}

      {answer && (
        <article className="ai-result reveal">
          <div className="ai-result-header">
            <div>
              <p className="ai-result-label">
                ALGOBOOM AI
              </p>

              <h2>
                How to solve it
              </h2>
            </div>

            <span className="ai-result-status">
              AI EXPLANATION
            </span>
          </div>

          <div className="ai-answer">
            <div className="ai-answer-content ai-scroll-card">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h3 className="ai-heading">
                      {children}
                    </h3>
                  ),

                  h2: ({ children }) => (
                    <h3 className="ai-heading">
                      {children}
                    </h3>
                  ),

                  h3: ({ children }) => (
                    <h4 className="ai-subheading">
                      {children}
                    </h4>
                  ),

                  p: ({ children }) => (
                    <p className="ai-paragraph">
                      {children}
                    </p>
                  ),

                  ul: ({ children }) => (
                    <ul className="ai-list">
                      {children}
                    </ul>
                  ),

                  ol: ({ children }) => (
                    <ol className="ai-list">
                      {children}
                    </ol>
                  ),

                  li: ({ children }) => (
                    <li>{children}</li>
                  ),

                  strong: ({ children }) => (
                    <strong className="ai-strong">
                      {children}
                    </strong>
                  ),

                  code({
                    inline,
                    className,
                    children,
                    ...props
                  }) {
                    const match =
                      /language-(\w+)/.exec(
                        className || ''
                      )

                    if (!inline && match) {
                      return (
                        <div className="ai-code-wrapper">
                          <div className="ai-code-header">
                            <span>
                              {match[1].toUpperCase()}
                            </span>

                            <span>
                              ALGOBOOM
                            </span>
                          </div>

                          <pre className="ai-code">
                            <code {...props}>
                              {String(
                                children
                              ).replace(
                                /\n$/,
                                ''
                              )}
                            </code>
                          </pre>
                        </div>
                      )
                    }

                    return (
                      <code
                        className="ai-inline-code"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },

                  blockquote: ({
                    children,
                  }) => (
                    <blockquote className="ai-quote">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {answer}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      )}
    </section>
  )
}

export default ProblemSpotlight