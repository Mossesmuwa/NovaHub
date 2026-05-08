// lib/email.js
// NovaHub — Transactional email via Resend
// Set RESEND_API_KEY in Vercel env vars.
// Configure Supabase to use custom SMTP:
//   Supabase → Settings → Auth → SMTP Settings
//   Host: smtp.resend.com, Port: 465, User: resend, Pass: <RESEND_API_KEY>

const FROM = "NovaHub <hello@novahub.app>"; // change to your verified domain

async function send({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", to);
    return { success: false, error: "RESEND_API_KEY not set" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[email] Resend error:", err);
    return { success: false, error: err.message || "Send failed" };
  }

  return { success: true };
}

// ── Email templates ───────────────────────────────────────────────────────────
const BASE_STYLE = `
  font-family: Inter, -apple-system, sans-serif;
  background: #09090C; color: #F2F2F7;
  max-width: 560px; margin: 0 auto; padding: 40px 24px;
`;

export async function sendWelcomeEmail(email, displayName) {
  return send({
    to: email,
    subject: "Welcome to NovaHub ✦",
    html: `
      <div style="${BASE_STYLE}">
        <div style="font-size:28px;font-weight:900;letter-spacing:-.04em;margin-bottom:8px;">
          NovaHub
        </div>
        <div style="width:40px;height:3px;background:#C9A84C;border-radius:99px;margin-bottom:32px;"></div>
        <h1 style="font-size:22px;font-weight:800;margin-bottom:12px;">
          Welcome, ${displayName || "Explorer"} ✦
        </h1>
        <p style="font-size:15px;color:#AEAEB2;line-height:1.7;margin-bottom:24px;">
          You've joined NovaHub — the discovery OS for the internet.
          Movies, books, AI tools, games, and niche resources you won't find anywhere else.
        </p>
        <p style="font-size:15px;color:#AEAEB2;line-height:1.7;margin-bottom:32px;">
          Start by taking the taste quiz so we can personalise your feed, or jump straight into discovering.
        </p>
        <a href="https://novahub.app/onboarding"
           style="display:inline-block;padding:12px 24px;background:linear-gradient(140deg,#E8C97A,#C9A84C,#9B7520);color:#09090C;font-weight:700;font-size:14px;border-radius:99px;text-decoration:none;">
          Take the Taste Quiz →
        </a>
        <p style="font-size:12px;color:#3A3A3C;margin-top:40px;">
          NovaHub · novahub.app<br>
          <a href="https://novahub.app/unsubscribe" style="color:#3A3A3C;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}

export async function sendProConfirmationEmail(email, displayName) {
  return send({
    to: email,
    subject: "You are now Nova Pro ✦",
    html: `
      <div style="${BASE_STYLE}">
        <div style="font-size:28px;font-weight:900;letter-spacing:-.04em;margin-bottom:8px;">NovaHub</div>
        <div style="width:40px;height:3px;background:#C9A84C;border-radius:99px;margin-bottom:32px;"></div>
        <h1 style="font-size:22px;font-weight:800;margin-bottom:12px;">
          You are Nova Pro ✦
        </h1>
        <p style="font-size:15px;color:#AEAEB2;line-height:1.7;margin-bottom:24px;">
          Welcome to the next level, ${displayName || "Explorer"}. Your Pro features are now active.
        </p>
        <ul style="font-size:14px;color:#AEAEB2;line-height:2;padding-left:20px;margin-bottom:32px;">
          <li>Unlimited saves across all categories</li>
          <li>NovaScore on every item — your personal match percentage</li>
          <li>Personalised weekly digest</li>
          <li>Unlimited Vibe Dial uses</li>
          <li>Public shareable lists</li>
        </ul>
        <a href="https://novahub.app/account/dashboard"
           style="display:inline-block;padding:12px 24px;background:linear-gradient(140deg,#E8C97A,#C9A84C,#9B7520);color:#09090C;font-weight:700;font-size:14px;border-radius:99px;text-decoration:none;">
          Go to Dashboard →
        </a>
        <p style="font-size:12px;color:#3A3A3C;margin-top:40px;">
          Manage your subscription at <a href="https://novahub.app/account/dashboard" style="color:#636366;">novahub.app/account/dashboard</a>
        </p>
      </div>
    `,
  });
}
