import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./env.js";
import groupsRoutes from "./groups.js";
import sessionRoutes from "./session.js";

const app = express();
const corsOptions = {
  origin: env.corsOrigin,
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
  res.json({ ok: true });
});

app.use("/api", sessionRoutes);
app.use("/api", groupsRoutes);

app.use((_, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
