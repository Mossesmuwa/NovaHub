// pages/api/pulse.js
// NovaHub — Nova Pulse Cron Endpoint
// Delegates to lib/nova-pulse.js which calculates trending scores.
// Runs every 6 hours via Vercel Cron (see vercel.json).

import { runNovaPulse } from "../../lib/nova-pulse.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await runNovaPulse();
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
