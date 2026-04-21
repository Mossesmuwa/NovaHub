// pages/api/security/csp-report.js
// NovaHub — CSP Violation Reporting Endpoint
// Logs Content Security Policy violations for security monitoring

import { securityLogger } from "../../../lib/securityLogger";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const violation = req.body;

    // Log the violation using security logger
    securityLogger.logCSPViolation({
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
      violation: violation,
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[CSP REPORT ERROR]", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
