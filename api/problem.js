import OpenAI from 'openai'
import jwt from 'jsonwebtoken'
import { turso } from '../lib/turso.js'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Get JWT token from cookie
function getToken(req) {
  const cookieHeader = req.headers.cookie || ''

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, ...valueParts] = cookie.trim().split('=')

    if (key) {
      acc[key] = valueParts.join('=')
    }

    return acc
  }, {})

  return cookies.algoboom_token || null
}

// Get logged-in user's ID
function getUserId(req) {
  const token = getToken(req)

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    return Number(decoded.userId)
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    const { problem } = req.body || {}

    if (!problem || typeof problem !== 'string') {
      return res.status(400).json({
        error: 'Please provide a problem name.',
      })
    }

    const cleanProblem = problem.trim()

    if (!cleanProblem) {
      return res.status(400).json({
        error: 'Please provide a problem name.',
      })
    }

    // Get AI explanation
    const response = await client.responses.create({
      model: 'gpt-5.6-luna',

      instructions: `
You are AlgoBoom AI, a friendly DSA mentor.

The user will give you the name of a coding or DSA problem.

Explain the problem in a beginner-friendly but technically accurate way.

Cover these sections:

1. Problem name
2. Difficulty
3. Topics
4. Problem explanation
5. Example
6. Important observations
7. How to think about the problem
8. Brute-force approach
9. Optimal approach
10. Time complexity
11. Space complexity
12. Common mistakes
13. C++ solution

Important rules:

- Teach the user how to think about the problem.
- Keep explanations clear and practical.
- Do not unnecessarily make the explanation complicated.
- Do not invent constraints or examples when you are uncertain.
- If the problem name is ambiguous, say that it is ambiguous.
- Give a correct C++ solution.
`,

      input: `Explain this DSA problem: ${cleanProblem}`,
    })

    // Save search history only for logged-in users
    const userId = getUserId(req)

    if (userId) {
      try {
        // Add the new search
        await turso.execute({
          sql: `
            INSERT INTO search_history (user_id, problem)
            VALUES (?, ?)
          `,
          args: [userId, cleanProblem],
        })

        // Keep only the latest 10 searches
        await turso.execute({
          sql: `
            DELETE FROM search_history
            WHERE user_id = ?
            AND id NOT IN (
              SELECT id
              FROM search_history
              WHERE user_id = ?
              ORDER BY created_at DESC, id DESC
              LIMIT 10
            )
          `,
          args: [userId, userId],
        })
      } catch (historyError) {
        // History failure should NOT break the AI response
        console.error('History save error:', historyError)
      }
    }

    return res.status(200).json({
      answer: response.output_text,
    })
  } catch (error) {
    console.error('AlgoBoom AI error:', error)

    return res.status(500).json({
      error: 'Unable to get an AI response right now.',
    })
  }
}