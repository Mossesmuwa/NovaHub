// pages/account/delete.js
// Permanently deletes a user account and all associated data.
// Requires: SUPABASE_SERVICE_ROLE_KEY (to delete from auth.users)
// Called from dashboard settings → danger zone

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  // ── Verify session ────────────────────────────────────────────────────────
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

  const admin = getAdminClient();

  try {
    // ── 1. Get profile for Stripe customer ID ────────────────────────────────
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id, is_pro")
      .eq("id", user.id)
      .single();

    // ── 2. Cancel Stripe subscription if active ───────────────────────────────
    if (profile?.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2024-06-20",
        });
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
        console.log("[account/delete] Stripe subscription cancelled");
      } catch (stripeErr) {
        // Non-fatal — log and continue with deletion
        console.warn(
          "[account/delete] Stripe cancel failed:",
          stripeErr.message,
        );
      }
    }

    // ── 3. Delete user data (cascade handles most via FK constraints) ─────────
    // Explicit deletes for tables without CASCADE
    await admin.from("comment_likes").delete().eq("user_id", user.id);
    await admin.from("ratings").delete().eq("user_id", user.id);
    await admin.from("history").delete().eq("user_id", user.id);

    // ── 4. Delete from auth.users (cascades to profiles via trigger) ──────────
    const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);
    if (deleteErr) {
      console.error(
        "[account/delete] auth.admin.deleteUser failed:",
        deleteErr.message,
      );
      return res
        .status(500)
        .json({ error: "Failed to delete account. Contact support." });
    }

    console.log(`[account/delete] User ${user.id} deleted successfully`);
    return res
      .status(200)
      .json({ success: true, message: "Account permanently deleted." });
  } catch (err) {
    console.error("[account/delete]", err.message);
    return res.status(500).json({ error: err.message });
  }
}
