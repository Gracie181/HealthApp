import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pool from "./db/connection.js";
import checkRoutes from "./routes/checkRoutes.js";

const app = express();

app.use(cors());
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
    console.error(err.message);
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

app.use("/api/check", checkRoutes);

// TODO: app.use("/api/hospitals", hospitalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});