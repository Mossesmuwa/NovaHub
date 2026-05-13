// ======================================================
// FILE: apps/admin/pages/account/login.js
// PURPOSE:
// Redirect admin users to centralized web login.
// ======================================================

import { useEffect } from "react";

export default function AdminLoginRedirect() {
  useEffect(() => {
    const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL;
    const adminAppUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

    if (!webAppUrl || !adminAppUrl) {
      console.error("Missing NEXT_PUBLIC_WEB_APP_URL or NEXT_PUBLIC_ADMIN_URL");
      return;
    }

    const returnTo = encodeURIComponent(`${adminAppUrl}/dashboard`);

    window.location.replace(`${webAppUrl}/account/login?returnTo=${returnTo}`);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#09090C",
        color: "#F2F2F7",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Redirecting...</h1>
        <p>Please wait while we redirect you securely to login.</p>
      </div>
    </div>
  );
}
