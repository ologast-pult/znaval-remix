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
  const siteKey = "6Lf-4hItAAAAAGN1eNxXOJSaAhKSftCrE41Q0oy8";
  const apiKey = process.env.RECAPTCHA_API_KEY;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "gen-lang-client-0953909883";

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  if (!apiKey) {
    console.warn("RECAPTCHA_API_KEY is not set. Skipping real verification for demo.");
    return res.status(200).json({ 
      riskAnalysis: { score: 0.9 }, 
      tokenProperties: { valid: true, action } 
    });
  }

  try {
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
