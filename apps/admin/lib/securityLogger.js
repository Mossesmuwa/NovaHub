// lib/securityLogger.js
// NovaHub — Security Event Logging
// Centralized logging for security-related events

const SECURITY_EVENTS = {
  AUTH_FAILURE: "auth_failure",
  RATE_LIMIT_VIOLATION: "rate_limit_violation",
  CSP_VIOLATION: "csp_violation",
  SUSPICIOUS_ACTIVITY: "suspicious_activity",
  API_ABUSE: "api_abuse",
  ENV_VALIDATION_ERROR: "env_validation_error",
};

class SecurityLogger {
  log(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      level: "warn",
      ...details,
      // Sanitize sensitive data
      ip: this.sanitizeIP(details.ip),
      userAgent: this.sanitizeUserAgent(details.userAgent),
    };

    // In production, you might want to:
    // - Send to security monitoring service
    // - Store in separate security log database
    // - Trigger alerts for critical events

    console.warn(`[SECURITY:${event.toUpperCase()}]`, logEntry);

    // For critical events, you could add alerting here
    if (this.isCriticalEvent(event)) {
      this.alertCriticalEvent(logEntry);
    }
  }

  sanitizeIP(ip) {
    if (!ip || ip === "unknown") return "unknown";
    // In production, you might want to hash or partially obscure IPs
    // For GDPR compliance, consider IP anonymization
    return ip;
  }

  sanitizeUserAgent(userAgent) {
    if (!userAgent) return "unknown";
    // Truncate very long user agents
    return userAgent.length > 200
      ? userAgent.substring(0, 200) + "..."
      : userAgent;
  }

  isCriticalEvent(event) {
    return ["auth_failure", "api_abuse", "env_validation_error"].includes(
      event,
    );
  }

  alertCriticalEvent(logEntry) {
    // In production, integrate with alerting system
    console.error(`[CRITICAL SECURITY EVENT] ${logEntry.event}:`, logEntry);
  }

  // Specific logging methods
  logAuthFailure(details) {
    this.log(SECURITY_EVENTS.AUTH_FAILURE, {
      ...details,
      reason: details.reason || "unknown",
    });
  }

  logRateLimitViolation(details) {
    this.log(SECURITY_EVENTS.RATE_LIMIT_VIOLATION, {
      ...details,
      violations: details.violations || 1,
      blockedFor: details.blockedFor,
    });
  }

  logCSPViolation(details) {
    this.log(SECURITY_EVENTS.CSP_VIOLATION, {
      ...details,
      violation: details.violation,
    });
  }

  logSuspiciousActivity(details) {
    this.log(SECURITY_EVENTS.SUSPICIOUS_ACTIVITY, {
      ...details,
      activity: details.activity,
    });
  }

  logAPIAbuse(details) {
    this.log(SECURITY_EVENTS.API_ABUSE, {
      ...details,
      endpoint: details.endpoint,
      method: details.method,
    });
  }
}

// Global security logger instance
const securityLogger = new SecurityLogger();

export { securityLogger, SECURITY_EVENTS };
export default securityLogger;
