import rateLimit from "express-rate-limit";

/**
 * Safely extracts the real client IP from incoming request headers,
 * handling Vercel, Cloudflare, Railway, and reverse proxy forwarding.
 */
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers["x-real-ip"] || req.ip || req.socket?.remoteAddress || "127.0.0.1";
}

function createLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIp(req),
    handler: (req, res, _, options) => {
      res.status(options.statusCode).json({
        error: message,
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
  });
}

/**
 * Strict limiter for PIN validation to protect against brute-force attacks.
 * 8 attempts per minute.
 */
export const authLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 8,
  message: "Too many PIN attempts. Please wait 1 minute before trying again."
});

/**
 * Limiter for write mutations (creating groups, expenses, settlements, participants).
 * 60 requests per minute per IP.
 */
export const mutationLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many write requests. Please slow down and try again shortly."
});

/**
 * Generous limiter for read snapshots and polling.
 * 1500 requests per 15 minutes per IP.
 */
export const snapshotLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  message: "Too many snapshot requests. Please try again shortly."
});

/**
 * Compute-heavy limiter for receipt PDF generation.
 * 40 requests per 15 minutes per IP.
 */
export const pdfLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: "Too many PDF export requests. Please try again in a few minutes."
});
