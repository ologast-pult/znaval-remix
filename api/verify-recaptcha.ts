import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, action } = req.body;
  const siteKey = "6LcH6xMtAAAAABD8J8v3JBCiSnIwSQ3A5D0I-XYq";
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || "6LcH6xMtAAAAAK6AYMmsUItIe6-5apxnqLQBHhhH";
  const apiKey = process.env.RECAPTCHA_API_KEY;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "gen-lang-client-0953909883";

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  // Try standard verification first if we have a secret key starting with 6L
  if (secretKey && secretKey.startsWith("6L")) {
    try {
      console.log("Verifying token with standard reCAPTCHA siteverify (Vercel)...");
      const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`
      });
      const data = await response.json();
      console.log("Standard reCAPTCHA Verification Result on Vercel:", data);
      return res.status(200).json(data);
    } catch (error) {
      console.error("Standard reCAPTCHA verification failed on Vercel:", error);
      // Fall through to enterprise or mock
    }
  }

  if (!apiKey) {
    console.warn("Neither RECAPTCHA_SECRET_KEY nor RECAPTCHA_API_KEY is set. Skipping real verification.");
    return res.status(200).json({ 
      success: true,
      score: 0.9,
      riskAnalysis: { score: 0.9 }, 
      tokenProperties: { valid: true, action } 
    });
  }

  try {
    console.log("Verifying token with reCAPTCHA Enterprise Assessment API (Vercel)...");
    // reCAPTCHA Enterprise Assessment API
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: {
          token: token,
          expectedAction: action,
          siteKey: siteKey,
        },
      }),
    });

    const data = await response.json();
    console.log("reCAPTCHA Assessment Result on Vercel:", data);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error verifying reCAPTCHA on Vercel:", error);
    return res.status(500).json({ error: "Internal server error during verification" });
  }
}
