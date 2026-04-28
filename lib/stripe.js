// lib/stripe.js
// NovaHub — Stripe helpers (server-side only)
// Never import this in client-side code — it exposes the secret key

import Stripe from "stripe";

let _stripe = null;

export function getStripe() {
  if (_stripe) return _stripe;
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY not set in env vars");
  }
  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });
  return _stripe;
}

// ── Price IDs — set these in Vercel env vars ──────────────────────────────────
// Create products in Stripe dashboard, copy the price IDs here
export const PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "", // e.g. price_xxxxx
};

// ── Plans ─────────────────────────────────────────────────────────────────────
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "Browse everything",
      "10 saves",
      "Basic AI recommendations",
      "General weekly digest",
    ],
  },
  pro: {
    name: "Nova Pro",
    price: 6,
    interval: "month",
    features: [
      "Unlimited saves",
      "Unlimited Vibe Dial",
      "NovaScore on every item",
      "Personalised weekly digest",
      "Public shareable lists",
      "Taste evolution history",
      "Data export",
      "Early access to features",
      "Pro badge on profile",
    ],
  },
};
