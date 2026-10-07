import express from "express";
import { runGroupCleanup } from "./cleanupInactiveGroups.js";
import { env } from "./env.js";

const router = express.Router();

/**
 * Serverless cron endpoint (e.g., triggered by Vercel Cron).
 * Protected by CRON_SECRET if configured.
 */
router.all("/cron/cleanup", async (req, res) => {
  // If CRON_SECRET is configured, require Authorization header
  if (env.cronSecret) {
    const authHeader = req.headers.authorization;
    const expected = `Bearer ${env.cronSecret}`;
    if (!authHeader || authHeader !== expected) {
      return res.status(401).json({ error: "Unauthorized cron invocation" });
    }
  }

  try {
    const result = await runGroupCleanup({ isDryRun: false });
    return res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error) {
    console.error("Cron group cleanup failed:", error);
    return res.status(500).json({
      error: "Cleanup execution failed",
      message: error.message
    });
  }
});

export default router;
