import jwt from "jsonwebtoken";
import { turso } from "../../lib/turso.js";

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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await turso.execute({
      sql: `
        SELECT id, name, email
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      args: [Number(decoded.userId)],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
}