import app from "../src/app.js";
import { connectDb } from "../src/db.js";
import { assertEnv, env } from "../src/env.js";

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
  try {
    await ensureBoot();
    return app(req, res);
  } catch (error) {
    console.error("Serverless boot error:", error);
    return res.status(500).json({
      error: "Database or server initialization error",
      details: process.env.NODE_ENV === "production" ? undefined : error.message
    });
  }
}

