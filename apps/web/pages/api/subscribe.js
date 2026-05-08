// pages/api/subscribe.js
// Subscribes an email to the NovaHub newsletter via Beehiiv API.
// Set BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in Vercel env vars.
// Get them at: https://app.beehiiv.com → Settings → API

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !pubId) {
    // Graceful fallback — log and return success so UX isn't broken during setup
    console.warn(
      "[subscribe] BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID not set — logging subscription only",
    );
    console.log("[subscribe] Would have subscribed:", email);
    return res.status(200).json({ success: true });
  }

  try {
    const beehiivRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: "novahub_site",
          utm_medium: "organic",
        }),
      },
    );

    if (!beehiivRes.ok) {
      const err = await beehiivRes.json().catch(() => ({}));
      // 409 = already subscribed — treat as success
      if (beehiivRes.status === 409) {
        return res
          .status(200)
          .json({ success: true, message: "Already subscribed" });
      }
      console.error("[subscribe] Beehiiv error:", err);
      return res
        .status(500)
        .json({ error: "Subscription failed. Please try again." });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[subscribe]", err.message);
    return res.status(500).json({ error: "Network error. Please try again." });
  }
}
