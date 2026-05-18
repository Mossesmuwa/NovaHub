// packages/shared/index.js
// Barrel export for all shared utilities, types, and helpers

// Export shared types
export * from "./types/index.js";

// Export shared library functions
export * from "./lib/auth.js";
export * from "./lib/checkAuth.js";
export * from "./lib/comments.js";
export * from "./lib/cookies.js";
export * from "./lib/email.js";
export * from "./lib/env.js";
export * from "./lib/favorites.js";
export * from "./lib/helpers.js";
export * from "./lib/items.js";
export * from "./lib/nova-pulse.js";
export * from "./lib/nova-score.js";
export * from "./lib/rateLimit.js";
export * from "./lib/search.js";
export * from "./lib/securityLogger.js";
export * from "./lib/stripe.js";
export * from "./lib/supabase.js";
export * from "./lib/supabaseAdmin.js";
export * from "./lib/supabaseClient.js";
export * from "./lib/SupabaseContext.js";
export * from "./lib/syncService.js";
export * from "./lib/validation.js";

// Export shared hooks
export * from "./hooks/usePro.js";
