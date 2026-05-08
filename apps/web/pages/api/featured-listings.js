// pages/api/featured-listings.js
// NovaHub — B2B Featured Listings API
//
// GET  /api/featured-listings?category=ai-tools   → active listings for a category
// POST /api/featured-listings                      → create a new listing inquiry
//
// Listing plans (set in Vercel env as LISTING_PLANS JSON or use defaults below):
//   Starter   $99/mo  — "Nova Pick" badge in one category
//   Growth    $249/mo — "Nova Pick" + featured in weekly digest
//   Pro       $499/mo — Everything + homepage feature slot
//
// Flow:
//   1. Company submits via POST → row created in featured_listings (status: inquiry)
//   2. You review in admin panel, approve → status: approved
//   3. Stripe payment link sent manually (or via Stripe integration later)
//   4. On payment → status: active, starts_at / ends_at set
//   5. GET endpoint returns only active listings

import { getSupabase } from "../../lib/supabaseClient";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

// ─── Listing plans ────────────────────────────────────────────────────────────
const PLANS = {
  starter: {
    name: "Starter",
    price_usd: 99,
    features: ["Nova Pick badge", "Category placement"],
  },
  growth: {
    name: "Growth",
    price_usd: 249,
    features: [
      "Nova Pick badge",
      "Category placement",
      "Weekly digest mention",
    ],
  },
  pro: {
    name: "Pro",
    price_usd: 499,
    features: [
      "Nova Pick badge",
      "Category placement",
      "Weekly digest",
      "Homepage slot",
    ],
  },
};

// ─── Input sanitiser ──────────────────────────────────────────────────────────
function sanitise(str, max = 200) {
  if (typeof str !== "string") return "";
  return str.replace(/[<>]/g, "").trim().slice(0, max);
}

// ─── GET: active listings (for frontend consumption) ─────────────────────────
async function handleGet(req, res) {
  const supabase = getSupabase();
  const { category, limit = "6" } = req.query;

  let q = supabase
    .from("featured_listings")
    .select(
      `
      id, plan, badge_text, category_target,
      starts_at, ends_at,
      items (
        id, slug, name, type, category, short_desc, image, rating, pricing, tags, affiliate_link
      )
    `,
    )
    .eq("status", "active")
    .lte("starts_at", new Date().toISOString())
    .gte("ends_at", new Date().toISOString())
    .order("plan", { ascending: false }) // pro listings first
    .limit(Math.min(parseInt(limit) || 6, 20));

  if (category) q = q.eq("category_target", category);

  const { data, error } = await q;
  if (error)
    return res.status(500).json({ success: false, error: error.message });

  return res.status(200).json({
    success: true,
    listings: (data || []).map((l) => ({
      id: l.id,
      plan: l.plan,
      badge: l.badge_text || "Nova Pick",
      item: l.items,
      ends_at: l.ends_at,
    })),
  });
}

// ─── POST: submit a listing inquiry ──────────────────────────────────────────
async function handlePost(req, res) {
  const {
    company_name,
    contact_email,
    contact_name,
    plan,
    category_target,
    item_url,
    message,
  } = req.body || {};

  // Validate required fields
  if (!company_name || !contact_email || !plan) {
    return res.status(400).json({
      success: false,
      error: "company_name, contact_email, and plan are required",
    });
  }

  if (!PLANS[plan]) {
    return res.status(400).json({
      success: false,
      error: `Invalid plan. Use: ${Object.keys(PLANS).join(" | ")}`,
    });
  }

  // Email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid email address" });
  }

  const inquiry = {
    company_name: sanitise(company_name),
    contact_email: sanitise(contact_email, 254),
    contact_name: sanitise(contact_name || ""),
    plan: plan,
    category_target: sanitise(category_target || ""),
    item_url: sanitise(item_url || ""),
    message: sanitise(message || "", 1000),
    status: "inquiry",
    badge_text: "Nova Pick",
    // starts_at / ends_at set when you activate after payment
  };

  const { data, error } = await supabaseAdmin
    .from("featured_listings")
    .insert(inquiry)
    .select("id")
    .single();

  if (error) {
    console.error("[featured-listings POST]", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Failed to submit inquiry" });
  }

  // TODO: Send confirmation email via Resend
  // await sendListingInquiryEmail({ ...inquiry, id: data.id });

  return res.status(201).json({
    success: true,
    id: data.id,
    plan: PLANS[plan],
    message: "We'll review your inquiry and be in touch within 24 hours.",
  });
}

// ─── GET: plan info (for pricing page) ───────────────────────────────────────
async function handlePlans(res) {
  return res.status(200).json({ success: true, plans: PLANS });
}

// ─── Router ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method === "GET") {
    if (req.query.plans === "1") return handlePlans(res);
    return handleGet(req, res);
  }
  if (req.method === "POST") return handlePost(req, res);
  return res.status(405).json({ success: false, error: "Method not allowed" });
}
