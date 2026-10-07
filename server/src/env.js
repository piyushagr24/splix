import "dotenv/config";

const rawCors = process.env.CORS_ORIGIN || "http://localhost:5173";
const parsedOrigins = rawCors
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT || 4000),
  mongodbUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: rawCors,
  allowedOrigins: parsedOrigins,
  cleanupInactiveDays: Number(process.env.CLEANUP_INACTIVE_DAYS || 45),
  mongoMaxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
  cronSecret: process.env.CRON_SECRET || ""
};

export function isOriginAllowed(origin) {
  if (!origin) return true; // Allow same-origin / non-browser requests (curl, server-to-server, health checks)
  if (env.allowedOrigins.includes("*") || env.allowedOrigins.includes(origin)) {
    return true;
  }
  // Allow localhost on any port for development
  if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
    return true;
  }
  // Allow Vercel preview and production deployments for splix
  if (/^https:\/\/splix(-[a-z0-9_-]+)?\.vercel\.app$/i.test(origin)) {
    return true;
  }
  return false;
}

export function assertEnv() {
  const missing = [];
  if (!env.mongodbUri) missing.push("MONGODB_URI");
  if (!env.jwtSecret) missing.push("JWT_SECRET");
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

