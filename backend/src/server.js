import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pool from "./db/connection.js";
import checkRoutes from "./routes/checkRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";

const app = express();

// Hosting services sit behind a proxy
app.set("trust proxy", 1);

// Only these websites may call the API (comma-separated in the settings)
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM medicines");
    res.json({ status: "ok", medicines: result.rows[0].count });
  } catch (err) {
    console.error("Database error:", err.code, err.message, err.errors ?? "");
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

app.use("/api/check", checkRoutes);
app.use("/api/hospitals", hospitalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});