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
    const { name, email, password } = req.body || {};

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check whether email already exists
    const existingUser = await turso.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [cleanEmail],
    });

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await turso.execute({
      sql: `
        INSERT INTO users (name, email, password_hash)
        VALUES (?, ?, ?)
      `,
      args: [cleanName, cleanEmail, passwordHash],
    });

    const userId = Number(result.lastInsertRowid);

    // Create login token
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: userId,
        name: cleanName,
        email: cleanEmail,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating your account",
    });
  }
}