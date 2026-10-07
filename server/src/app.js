import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import cronRoutes from "./cron.js";
import { env, isOriginAllowed } from "./env.js";
import groupsRoutes from "./groups.js";
import sessionRoutes from "./session.js";

const app = express();

// Trust reverse proxies (Vercel, Railway, Koyeb, Cloudflare) for accurate client IP resolution
app.set("trust proxy", 1);

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
};

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = dbStates[mongoose.connection.readyState] || "unknown";
  res.json({
    ok: true,
    status: "healthy",
    db: dbState,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use("/api", sessionRoutes);
app.use("/api", groupsRoutes);
app.use("/api", cronRoutes);

app.use((_, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _, res, __) => {
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;

