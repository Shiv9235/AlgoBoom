import { useEffect, useState } from 'react'

const fallbackMessage = {
  quote: 'Small steps every day become big results.',
  author: 'AlgoBoom',
}

function MotivationMessage() {
  const [message, setMessage] = useState(fallbackMessage)

  useEffect(() => {
    async function getMotivation() {
      try {
        const response = await fetch('/quote-api/api/random')

        if (!response.ok) {
          throw new Error('Quote request failed')
        }

        const data = await response.json()

        if (data[0]?.q && data[0]?.a) {
          setMessage({
            quote: data[0].q,
            author: data[0].a,
          })
        }
      } catch {
        // Keep fallback message.
      }
    }

    getMotivation()
  }, [])

  return (
    <section className="motivation-section reveal" aria-label="Daily motivation">
      <p className="motivation-label">TODAY'S MOTIVATION</p>

      <blockquote>
        “{message.quote}”
      </blockquote>

      <p className="motivation-author">
        — {message.author}
      </p>

      <a
        href="https://zenquotes.io/"
        target="_blank"
        rel="noreferrer"
        className="motivation-source"
      >
      </a>
    </section>
  )
}

export default MotivationMessage