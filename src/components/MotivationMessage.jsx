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
        // The fallback message remains visible if the API is unavailable.
      }
    }

    getMotivation()
  }, [])

  return (
    <div className="motivation">
      <p>“{message.quote}”</p>
      <span>— {message.author}</span>
      <a href="https://zenquotes.io/" target="_blank" rel="noreferrer">
        Quotes by ZenQuotes
      </a>
    </div>
  )
}

export default MotivationMessage