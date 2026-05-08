// lib/env.js
// NovaHub — Environment Variable Validation
// Validates required environment variables on application startup

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANTHROPIC_API_KEY",
  "GEMINI_API_KEY",
  "CRON_SECRET",
  "INTERNAL_API_SECRET",
];

const OPTIONAL_ENV_VARS = [
  "ANTHROPIC_ACCESS_TOKEN", // Alternative to ANTHROPIC_API_KEY
];

function validateEnvironment() {
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check for alternative API keys
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_ACCESS_TOKEN) {
    missing.push("ANTHROPIC_API_KEY or ANTHROPIC_ACCESS_TOKEN");
  }

  // Check for security issues
  if (process.env.NODE_ENV === "production") {
    // In production, warn about any NEXT_PUBLIC vars that might contain secrets
    const publicSecrets = REQUIRED_ENV_VARS.filter(
      (v) =>
        (v.startsWith("NEXT_PUBLIC_") && v.includes("KEY")) ||
        v.includes("SECRET"),
    );

    if (publicSecrets.length > 0) {
      warnings.push(
        `NEXT_PUBLIC_ variables should not contain secrets: ${publicSecrets.join(", ")}`,
      );
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  if (warnings.length > 0) {
    console.warn("[ENV WARNING]", warnings.join("; "));
  }

  console.log(
    "[ENV VALIDATION] All required environment variables are present",
  );
}

function getEnvCredential(primary, fallback) {
  return process.env[primary] || process.env[fallback];
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

// Validate on module load
if (typeof window === "undefined") {
  // Only run on server
  validateEnvironment();
}

export { validateEnvironment, getEnvCredential, isProduction, isDevelopment };
