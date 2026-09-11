export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const isProduction = process.env.VERCEL_ENV === "production";

  res.setHeader(
    "Set-Cookie",
    `algoboom_token=; HttpOnly; Path=/; SameSite=Lax${
      isProduction ? "; Secure" : ""
    }; Max-Age=0`
  );

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}