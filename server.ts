import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  // Billing & Prediction simulation API
  app.post("/api/analytics/predict", async (req, res) => {
    // This simulates the ML engine mentioned in requirements
    const { appliances } = req.body;
    
    // Simple logic for simulation: next month is usually 5-10% higher/lower based on seasonal trends
    const currentTotal = appliances.reduce((acc: number, app: any) => {
      return acc + (app.watts * app.hours * app.days * app.quantity) / 1000;
    }, 0);

    const prediction = currentTotal * (1 + (Math.random() * 0.2 - 0.1)); // +/- 10%
    
    res.json({
      predictedKwh: prediction.toFixed(2),
      confidence: 0.85,
      trend: prediction > currentTotal ? "increasing" : "decreasing"
    });
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
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
