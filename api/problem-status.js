import jwt from "jsonwebtoken";
import { turso } from "../lib/turso.js";

function getToken(req) {
  const cookieHeader = req.headers.cookie || "";

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, ...valueParts] = cookie.trim().split("=");

    if (key) {
      acc[key] = valueParts.join("=");
    }

    return acc;
  }, {});

  return cookies.algoboom_token || null;
}

function getUserId(req) {
  const token = getToken(req);

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return Number(decoded.userId);
  } catch {
    return null;
  }
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday(today) {
  const date = new Date(`${today}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() - 1);

  return date.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  try {
    // GET current status of a problem
    if (req.method === "GET") {
      const problem = String(req.query.problem || "").trim();

      if (!problem) {
        return res.status(400).json({
          success: false,
          message: "Problem name is required",
        });
      }

      const result = await turso.execute({
        sql: `
          SELECT status, submitted_at
          FROM problem_progress
          WHERE user_id = ?
          AND problem = ?
          LIMIT 1
        `,
        args: [userId, problem],
      });

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          status: "not_submitted",
          submittedAt: null,
        });
      }

      const row = result.rows[0];

      return res.status(200).json({
        success: true,
        status: row.status,
        submittedAt: row.submitted_at,
      });
    }

    // POST update problem status
    if (req.method === "POST") {
      const { problem, status } = req.body || {};

      const cleanProblem = String(problem || "").trim();

      if (!cleanProblem) {
        return res.status(400).json({
          success: false,
          message: "Problem name is required",
        });
      }

      if (!["submitted", "not_submitted"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid problem status",
        });
      }

      const today = getToday();

      // Check whether this problem already exists
      const existingProblem = await turso.execute({
        sql: `
          SELECT id, status
          FROM problem_progress
          WHERE user_id = ?
          AND problem = ?
          LIMIT 1
        `,
        args: [userId, cleanProblem],
      });

      // -----------------------------------------
      // NOT SUBMITTED
      // -----------------------------------------

      if (status === "not_submitted") {
        if (existingProblem.rows.length > 0) {
          await turso.execute({
            sql: `
              UPDATE problem_progress
              SET
                status = 'not_submitted',
                updated_at = CURRENT_TIMESTAMP
              WHERE user_id = ?
              AND problem = ?
            `,
            args: [userId, cleanProblem],
          });
        } else {
          await turso.execute({
            sql: `
              INSERT INTO problem_progress (
                user_id,
                problem,
                status
              )
              VALUES (?, ?, 'not_submitted')
            `,
            args: [userId, cleanProblem],
          });
        }

        return res.status(200).json({
          success: true,
          status: "not_submitted",
          problemStreak: await getProblemStreak(userId),
        });
      }

      // -----------------------------------------
      // SUBMITTED
      // -----------------------------------------

      if (existingProblem.rows.length > 0) {
        await turso.execute({
          sql: `
            UPDATE problem_progress
            SET
              status = 'submitted',
              submitted_at = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
            AND problem = ?
          `,
          args: [today, userId, cleanProblem],
        });
      } else {
        await turso.execute({
          sql: `
            INSERT INTO problem_progress (
              user_id,
              problem,
              status,
              submitted_at
            )
            VALUES (?, ?, 'submitted', ?)
          `,
          args: [userId, cleanProblem, today],
        });
      }

      // Get existing streak
      const streakResult = await turso.execute({
        sql: `
          SELECT problem_streak, last_problem_date
          FROM user_streaks
          WHERE user_id = ?
          LIMIT 1
        `,
        args: [userId],
      });

      let problemStreak = 1;

      if (streakResult.rows.length === 0) {
        // User has no streak record yet
        await turso.execute({
          sql: `
            INSERT INTO user_streaks (
              user_id,
              login_streak,
              problem_streak,
              last_problem_date
            )
            VALUES (?, ?, ?, ?)
          `,
          args: [userId, 0, 1, today],
        });
      } else {
        const row = streakResult.rows[0];

        const currentStreak = Number(row.problem_streak);
        const lastProblemDate = row.last_problem_date;

        // Already earned today's problem streak
        if (lastProblemDate === today) {
          problemStreak = currentStreak;
        }

        // Continued from yesterday
        else if (lastProblemDate === getYesterday(today)) {
          problemStreak = currentStreak + 1;

          await turso.execute({
            sql: `
              UPDATE user_streaks
              SET
                problem_streak = ?,
                last_problem_date = ?
              WHERE user_id = ?
            `,
            args: [problemStreak, today, userId],
          });
        }

        // Streak was broken
        else {
          problemStreak = 1;

          await turso.execute({
            sql: `
              UPDATE user_streaks
              SET
                problem_streak = ?,
                last_problem_date = ?
              WHERE user_id = ?
            `,
            args: [problemStreak, today, userId],
          });
        }
      }

      return res.status(200).json({
        success: true,
        status: "submitted",
        problemStreak,
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Problem status error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

async function getProblemStreak(userId) {
  const result = await turso.execute({
    sql: `
      SELECT problem_streak
      FROM user_streaks
      WHERE user_id = ?
      LIMIT 1
    `,
    args: [userId],
  });

  if (result.rows.length === 0) {
    return 0;
  }

  return Number(result.rows[0].problem_streak);
}