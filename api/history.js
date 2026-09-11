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

export default async function handler(req, res) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  try {
    // GET → return the user's latest 10 searches
    if (req.method === "GET") {
      const result = await turso.execute({
        sql: `
          SELECT id, problem, created_at
          FROM search_history
          WHERE user_id = ?
          ORDER BY created_at DESC, id DESC
          LIMIT 10
        `,
        args: [userId],
      });

      return res.status(200).json({
        success: true,
        history: result.rows,
      });
    }

    // DELETE → delete one search belonging to this user
    if (req.method === "DELETE") {
      const historyId = Number(req.query.id);

      if (!historyId) {
        return res.status(400).json({
          success: false,
          message: "History ID is required",
        });
      }

      const result = await turso.execute({
        sql: `
          DELETE FROM search_history
          WHERE id = ?
          AND user_id = ?
        `,
        args: [historyId, userId],
      });

      if (Number(result.rowsAffected) === 0) {
        return res.status(404).json({
          success: false,
          message: "Search history item not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Search deleted successfully",
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("History error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}