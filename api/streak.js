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
    // GET = return current stats
    if (req.method === "GET") {
      const result = await turso.execute({
        sql: `
          SELECT
            login_streak,
            problem_streak,
            last_login_date,
            last_problem_date
          FROM user_streaks
          WHERE user_id = ?
          LIMIT 1
        `,
        args: [userId],
      });

      // Count submitted problems
      const solvedResult = await turso.execute({
        sql: `
          SELECT COUNT(*) AS total_solved
          FROM problem_progress
          WHERE user_id = ?
          AND status = 'submitted'
        `,
        args: [userId],
      });

      const totalSolved = Number(
        solvedResult.rows[0]?.total_solved || 0
      );

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          streak: {
            loginStreak: 0,
            problemStreak: 0,
            totalSolved,
            lastLoginDate: null,
            lastProblemDate: null,
          },
        });
      }

      const row = result.rows[0];

      return res.status(200).json({
        success: true,
        streak: {
          loginStreak: Number(row.login_streak),
          problemStreak: Number(row.problem_streak),
          totalSolved,
          lastLoginDate: row.last_login_date,
          lastProblemDate: row.last_problem_date,
        },
      });
    }

    // POST = record today's login
    if (req.method === "POST") {
      const today = getToday();
      const yesterday = getYesterday(today);

      const result = await turso.execute({
        sql: `
          SELECT login_streak, last_login_date
          FROM user_streaks
          WHERE user_id = ?
          LIMIT 1
        `,
        args: [userId],
      });

      let loginStreak = 1;

      if (result.rows.length > 0) {
        const row = result.rows[0];

        const currentStreak = Number(row.login_streak);
        const lastLoginDate = row.last_login_date;

        // Already counted today
        if (lastLoginDate === today) {
          loginStreak = currentStreak;
        }

        // Continued from yesterday
        else if (lastLoginDate === yesterday) {
          loginStreak = currentStreak + 1;
        }

        // Streak was broken
        else {
          loginStreak = 1;
        }

        await turso.execute({
          sql: `
            UPDATE user_streaks
            SET
              login_streak = ?,
              last_login_date = ?
            WHERE user_id = ?
          `,
          args: [loginStreak, today, userId],
        });
      } else {
        await turso.execute({
          sql: `
            INSERT INTO user_streaks (
              user_id,
              login_streak,
              problem_streak,
              last_login_date
            )
            VALUES (?, ?, ?, ?)
          `,
          args: [userId, 1, 0, today],
        });
      }

      return res.status(200).json({
        success: true,
        loginStreak,
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Streak error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}