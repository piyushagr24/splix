import app from "../src/app.js";
import { connectDb } from "../src/db.js";
import { assertEnv, env } from "../src/env.js";

let bootPromise = null;

async function ensureBoot() {
  if (!bootPromise) {
    bootPromise = (async () => {
      assertEnv();
      await connectDb(env.mongodbUri);
    })();
  }

  return bootPromise;
}

export default async function handler(req, res) {
  await ensureBoot();
  return app(req, res);
}
