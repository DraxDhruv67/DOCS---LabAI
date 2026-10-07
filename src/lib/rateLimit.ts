type RateLimitRecord = { count: number; expiresAt: number };

const rateLimits = new Map<string, RateLimitRecord>();

// Clean up expired records every minute to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimits.entries()) {
      if (now > record.expiresAt) {
        rateLimits.delete(key);
      }
    }
  }, 60000).unref?.(); // Use unref if available (Node.js) so it doesn't block the event loop
}

/**
 * In-memory rate limiter for API routes.
 * 
 * @param identifier A unique string identifying the user or IP (e.g., 'login_192.168.1.1')
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns Object indicating if the request is successful and how many requests are remaining
 */
export function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = rateLimits.get(identifier);

  if (!record) {
    rateLimits.set(identifier, { count: 1, expiresAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (now > record.expiresAt) {
    // Window expired, reset counter
    rateLimits.set(identifier, { count: 1, expiresAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return { success: false, remaining: 0 };
  }

  // Increment counter
  record.count += 1;
  return { success: true, remaining: limit - record.count };
}
