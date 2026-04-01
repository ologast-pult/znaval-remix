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
    const siteKey = "6LcDg5ksAAAAALw2m4UgX_WgN24UysR3cl4djG_K";
    const apiKey = process.env.RECAPTCHA_API_KEY;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "gen-lang-client-0953909883";

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    if (!apiKey) {
      console.warn("RECAPTCHA_API_KEY is not set. Skipping real verification for demo.");
      return res.json({ 
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
