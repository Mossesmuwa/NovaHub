// lib/rateLimit.js
// NovaHub — Enhanced Rate Limiting
// Provides configurable rate limiting with progressive delays and different strategies

import { securityLogger } from "./securityLogger.js";

class RateLimiter {
  constructor() {
    this.requests = new Map(); // IP -> { count, resetTime, violations }
    this.blocked = new Map(); // IP -> blockUntil
  }

  // Progressive delay based on violation count
  getDelay(violations) {
    if (violations === 0) return 0;
    if (violations === 1) return 1000; // 1 second
    if (violations === 2) return 5000; // 5 seconds
    if (violations === 3) return 30000; // 30 seconds
    return 300000; // 5 minutes for repeated violations
  }

  // Check if IP is currently blocked
  isBlocked(ip) {
    const blockEntry = this.blocked.get(ip);
    if (!blockEntry) return false;

    if (Date.now() > blockEntry) {
      this.blocked.delete(ip);
      return false;
    }

    return true;
  }

  // Check rate limit for an IP
  checkLimit(ip, options = {}) {
    const {
      windowMs = 60000, // 1 minute
      maxRequests = 20,
      progressiveDelay = true,
    } = options;

    if (this.isBlocked(ip)) {
      return {
        allowed: false,
        reason: "IP temporarily blocked due to repeated violations",
        retryAfter: Math.ceil((this.blocked.get(ip) - Date.now()) / 1000),
      };
    }

    const now = Date.now();
    const entry = this.requests.get(ip) || {
      count: 0,
      resetTime: now + windowMs,
      violations: 0,
    };

    // Reset counter if window has passed
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + windowMs;
      entry.violations = Math.max(0, entry.violations - 1); // Reduce violations over time
    }

    if (entry.count >= maxRequests) {
      entry.violations++;

      // Block IP for progressive delay
      const delay = progressiveDelay
        ? this.getDelay(entry.violations)
        : windowMs;
      this.blocked.set(ip, now + delay);

      // Log security event
      securityLogger.logRateLimitViolation({
        ip,
        violations: entry.violations,
        blockedFor: delay,
      });

      return {
        allowed: false,
        reason: `Rate limit exceeded. ${entry.violations > 1 ? "Progressive delay applied." : ""}`,
        retryAfter: Math.ceil(delay / 1000),
        violations: entry.violations,
      };
    }

    entry.count++;
    this.requests.set(ip, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();

    // Clean up expired request counters
    for (const [ip, entry] of this.requests.entries()) {
      if (now > entry.resetTime + 60000) {
        // Keep for 1 extra minute
        this.requests.delete(ip);
      }
    }

    // Clean up expired blocks
    for (const [ip, blockTime] of this.blocked.entries()) {
      if (now > blockTime) {
        this.blocked.delete(ip);
      }
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Clean up every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

// Export middleware function
export function createRateLimit(options = {}) {
  return (req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";

    const result = rateLimiter.checkLimit(ip, options);

    if (!result.allowed) {
      res.setHeader("Retry-After", result.retryAfter);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000));

      return res.status(429).json({
        success: false,
        error: result.reason,
        retryAfter: result.retryAfter,
      });
    }

    // Add rate limit headers
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000));

    next();
  };
}

// Export for direct usage
export { rateLimiter };
