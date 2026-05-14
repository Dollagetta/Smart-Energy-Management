import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();


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

    // Manual fallback for SPA routes in development
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import("fs");
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
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
