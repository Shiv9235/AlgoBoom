import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    const { problem } = req.body

    if (!problem || typeof problem !== 'string') {
      return res.status(400).json({
        error: 'Please provide a problem name.',
      })
    }

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

      input: `Explain this DSA problem: ${problem}`,
    })

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