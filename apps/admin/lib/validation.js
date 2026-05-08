// lib/validation.js
// NovaHub — Input Validation Utilities
// Provides comprehensive input validation and sanitization

import { securityLogger } from "./securityLogger.js";

// Common validation patterns
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  safeText: /^[a-zA-Z0-9\s.,!?'"-]+$/,
};

const BLOCKED_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
];

// Validation rules
const RULES = {
  email: (value) => PATTERNS.email.test(value),
  slug: (value) => PATTERNS.slug.test(value) && value.length <= 100,
  name: (value) =>
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= 100 &&
    PATTERNS.alphanumeric.test(value),
  description: (value) =>
    typeof value === "string" &&
    value.length <= 2000 &&
    !containsBlockedPatterns(value),
  comment: (value) =>
    typeof value === "string" &&
    value.length >= 3 &&
    value.length <= 1200 &&
    !containsBlockedPatterns(value),
  query: (value) =>
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= 300 &&
    !containsBlockedPatterns(value),
};

function containsBlockedPatterns(text) {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(text));
}

function sanitizeString(value, maxLength = 1000) {
  if (typeof value !== "string") return "";
  return value.trim().substring(0, maxLength);
}

function validateField(value, rule, fieldName) {
  if (!RULES[rule]) {
    throw new Error(`Unknown validation rule: ${rule}`);
  }

  const isValid = RULES[rule](value);

  if (!isValid) {
    securityLogger.logSuspiciousActivity({
      activity: "validation_failure",
      field: fieldName,
      rule,
      value: sanitizeString(value, 100), // Log truncated value for debugging
    });
  }

  return isValid;
}

function validateObject(obj, schema) {
  const errors = [];
  const sanitized = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = obj[field];

    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value !== undefined && value !== null && value !== "") {
      // Apply validation rules
      if (rules.validate) {
        if (Array.isArray(rules.validate)) {
          for (const rule of rules.validate) {
            if (!validateField(value, rule, field)) {
              errors.push(`${field} failed ${rule} validation`);
              break;
            }
          }
        } else {
          if (!validateField(value, rules.validate, field)) {
            errors.push(`${field} failed validation`);
          }
        }
      }

      // Sanitize value
      if (rules.sanitize) {
        sanitized[field] = rules.sanitize(value);
      } else {
        sanitized[field] = value;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

// Middleware for API validation
export function validateRequest(schema) {
  return (req, res, next) => {
    const { isValid, errors, sanitized } = validateObject(
      req.body || {},
      schema,
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    // Replace req.body with sanitized data
    req.body = sanitized;
    next();
  };
}

// Export utilities
export { validateField, validateObject, sanitizeString, PATTERNS, RULES };
