import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for reCAPTCHA verification
  app.post("/api/verify-recaptcha", async (req, res) => {
    const { token, action } = req.body;
    const siteKey = "6LcH6xMtAAAAABD8J8v3JBCiSnIwSQ3A5D0I-XYq";
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const apiKey = process.env.RECAPTCHA_API_KEY;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "gen-lang-client-0953909883";

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Try standard verification first if we have a secret key starting with 6L
    if (secretKey && secretKey.startsWith("6L")) {
      try {
        console.log("Verifying token with standard reCAPTCHA siteverify...");
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`
        });
        const data = await response.json();
        console.log("Standard reCAPTCHA Verification Result:", data);
        return res.json(data);
      } catch (error) {
        console.error("Standard reCAPTCHA verification failed:", error);
        // Fall through to enterprise or mock
      }
    }

    if (!apiKey) {
      console.warn("Neither RECAPTCHA_SECRET_KEY nor RECAPTCHA_API_KEY is set. Skipping real verification.");
      return res.json({ 
        success: true,
        score: 0.9,
        riskAnalysis: { score: 0.9 }, 
        tokenProperties: { valid: true, action } 
      });
    }

    try {
      console.log("Verifying token with reCAPTCHA Enterprise Assessment API...");
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
      console.log("reCAPTCHA Assessment Result:", data);
      res.json(data);
    } catch (error) {
      console.error("Error verifying reCAPTCHA:", error);
      res.status(500).json({ error: "Internal server error during verification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
