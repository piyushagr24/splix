import app from "../src/app.js";
import { connectDb } from "../src/db.js";
import { assertEnv, env, isOriginAllowed } from "../src/env.js";

let bootPromise = null;

async function ensureBoot() {
  if (!bootPromise) {
    bootPromise = (async () => {
      assertEnv();
      await connectDb(env.mongodbUri);
    })().catch((err) => {
      bootPromise = null;
      throw err;
    });
  }

  return bootPromise;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    await ensureBoot();
    return app(req, res);
  } catch (error) {
    console.error("Serverless boot error:", error);
    return res.status(500).json({
      error: "Database or server initialization error",
      details: error.message || String(error)
    });
  }
}


