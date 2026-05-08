// pages/api/stripe/portal.js
// Opens the Stripe Customer Portal for managing/cancelling Pro subscription.
// Called from dashboard settings tab.

import { getStripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

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

  const admin = supabaseAdmin;
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return res
      .status(400)
      .json({ error: "No Stripe customer found for this account" });
  }

  try {
    const stripe = getStripe();
    const origin =
      req.headers.origin ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://novahub.app";

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/account/dashboard`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("[stripe/portal]", err.message);
    return res.status(500).json({ error: err.message });
  }
}
