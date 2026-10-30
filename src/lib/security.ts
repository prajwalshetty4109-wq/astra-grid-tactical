import type { NextApiRequest, NextApiResponse } from "next";

/** Token bucket entry tracking request count and last reset timestamp. */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/** In-memory per-IP rate limit store (cleared on serverless cold start). */
const rateLimitStore = new Map<string, RateLimitEntry>();

/** Maximum requests per window per IP address. */
const RATE_LIMIT_MAX = 60;

/** Rate limit window duration in milliseconds (60 seconds). */
const RATE_LIMIT_WINDOW_MS = 60_000;

/** Maximum allowed request body size in bytes (6 MB). */
const MAX_PAYLOAD_BYTES = 6 * 1024 * 1024;

/**
 * Strips HTML, script tags, style blocks, and malicious markup from a string to prevent XSS.
 * Removes both the script tags and their inner contents, plus all other HTML angle-bracket tags.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

/**
 * Recursively sanitizes all string values in an object or array.
 * Returns a deep-cloned structure with HTML tags stripped from every string leaf.
 */
export function deepSanitize<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeInput(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepSanitize(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      sanitized[key] = deepSanitize(val);
    }
    return sanitized as T;
  }
  return value;
}

/**
 * Extracts the client IP address from the request headers or socket.
 * Handles Vercel's `x-forwarded-for` proxy header and direct connections.
 */
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

/**
 * Checks whether the client IP has exceeded the per-window rate limit.
 * Returns `true` if the request should be rejected (429 Too Many Requests).
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

/** Options for configuring the API security guard middleware. */
export interface SecurityGuardOptions {
  /** Allowed HTTP methods for this endpoint (e.g. ["GET"] or ["POST"]). */
  allowedMethods: string[];
  /** Maximum payload size in bytes. Defaults to 6 MB. */
  maxPayloadBytes?: number;
  /** Whether to skip rate limiting for this endpoint. Defaults to false. */
  skipRateLimit?: boolean;
}

/**
 * Validates HTTP method, enforces rate limiting, and checks payload size.
 * Returns `true` if the request was rejected (response already sent).
 * Returns `false` if the request passed all checks and should proceed.
 *
 * @example
 * ```ts
 * export default async function handler(req, res) {
 *   if (applySecurityGuard(req, res, { allowedMethods: ["POST"] })) return;
 *   // ... handler logic
 * }
 * ```
 */
export function applySecurityGuard(
  req: NextApiRequest,
  res: NextApiResponse,
  options: SecurityGuardOptions
): boolean {
  // 1. HTTP Method validation
  if (!options.allowedMethods.includes(req.method || "")) {
    res.setHeader("Allow", options.allowedMethods.join(", "));
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Permitted: ${options.allowedMethods.join(", ")}`,
    });
    return true;
  }

  // 2. Rate limiting
  if (!options.skipRateLimit) {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      res.status(429).json({
        success: false,
        error: "Too many requests. Please retry after 60 seconds.",
      });
      return true;
    }
  }

  // 3. Payload size guard (for POST/PUT/PATCH)
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);
    const limit = options.maxPayloadBytes ?? MAX_PAYLOAD_BYTES;
    if (contentLength > limit) {
      res.status(413).json({
        success: false,
        error: `Payload too large. Maximum allowed: ${Math.round(limit / 1024)}KB`,
      });
      return true;
    }
  }

  return false;
}
