import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { turso } from "../../lib/turso.js";

function setAuthCookie(res, token) {
  const isProduction = process.env.VERCEL_ENV === "production";

  res.setHeader(
    "Set-Cookie",
    `algoboom_token=${token}; HttpOnly; Path=/; SameSite=Lax${
      isProduction ? "; Secure" : ""
    }; Max-Age=604800`
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user
    const result = await turso.execute({
      sql: `
        SELECT id, name, email, password_hash
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      args: [cleanEmail],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // Check password
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: Number(user.id) },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
}