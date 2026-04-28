// pages/api/stripe/checkout.js
// Creates a Stripe Checkout session for Nova Pro subscription.
// Called from pages/pro/index.js

import { getStripe, PRICES } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // ── Verify user session ────────────────────────────────────────────────────
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    },
  );

  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();
  if (error || !user) return res.status(401).json({ error: "Invalid session" });

  // ── Check if already Pro ──────────────────────────────────────────────────
  const admin = supabaseAdmin;
  const { data: profile } = await admin
    .from("profiles")
    .select("is_pro, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profile?.is_pro) {
    return res.status(400).json({ error: "Already a Pro subscriber" });
  }

  if (!PRICES.pro_monthly) {
    return res
      .status(500)
      .json({ error: "STRIPE_PRICE_PRO_MONTHLY not set in env vars" });
  }

  try {
    const stripe = getStripe();

    // Reuse existing Stripe customer if we have one
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      // Save customer ID to profile
      await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const origin =
      req.headers.origin ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://novahub.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PRICES.pro_monthly, quantity: 1 }],
      success_url: `${origin}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pro`,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err.message);
    return res.status(500).json({ error: err.message });
  }
}
