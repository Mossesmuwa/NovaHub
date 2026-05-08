// pages/api/stripe/webhook.js
// Handles Stripe webhook events.
// Set STRIPE_WEBHOOK_SECRET in Vercel env vars.
// In Stripe dashboard: Developers → Webhooks → Add endpoint
//   URL: https://yoursite.vercel.app/api/stripe/webhook
//   Events: customer.subscription.created, updated, deleted

import { buffer } from "micro";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Disable body parsing — Stripe needs the raw body to verify signature
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!secret || !stripeKey) {
    console.error(
      "[webhook] Missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY",
    );
    return res.status(500).end();
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  const raw = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const admin = supabaseAdmin;

  async function setProStatus(userId, isPro, expiresAt = null) {
    const { error } = await admin
      .from("profiles")
      .update({
        is_pro: isPro,
        pro_expires_at: expiresAt,
      })
      .eq("id", userId);
    if (error) console.error("[webhook] Profile update failed:", error.message);
  }

  async function getUserId(sub) {
    return sub.metadata?.supabase_user_id || null;
  }

  try {
    switch (event.type) {
      // ── Subscription activated ──────────────────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const userId = await getUserId(sub);
        if (!userId) {
          console.warn(
            "[webhook] No supabase_user_id in subscription metadata",
          );
          break;
        }

        const isActive = ["active", "trialing"].includes(sub.status);
        const expiresAt =
          isActive && sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null;

        await setProStatus(userId, isActive, expiresAt);

        // Also store stripe_subscription_id on profile for portal access
        await admin
          .from("profiles")
          .update({ stripe_subscription_id: sub.id })
          .eq("id", userId);

        console.log(
          `[webhook] User ${userId} Pro status: ${isActive}, expires: ${expiresAt}`,
        );
        break;
      }

      // ── Subscription cancelled ──────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = await getUserId(sub);
        if (!userId) break;

        await setProStatus(userId, false, null);
        console.log(`[webhook] User ${userId} Pro cancelled`);
        break;
      }

      // ── Payment failed ──────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const userId = await getUserId(sub);
        if (userId) {
          console.warn(`[webhook] Payment failed for user ${userId}`);
          // Don't revoke Pro immediately — Stripe retries automatically
          // Revocation happens when subscription.deleted fires
        }
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[webhook] Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
