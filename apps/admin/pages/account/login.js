// pages/account/login.js - Admin app login redirect
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to web app login with return URL pointing back to admin
    const returnUrl = encodeURIComponent("http://localhost:3002/dashboard");
    window.location.href = `http://localhost:3000/account/login?returnTo=${returnUrl}`;
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#09090C",
        color: "#F2F2F7",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Redirecting to Login...</h1>
        <p>
          Please log in via the web app. Redirecting to{" "}
          <a
            href="http://localhost:3000/account/login"
            style={{ color: "#C9A84C" }}
          >
            web login
          </a>
          .
        </p>
      </div>
    </div>
  );
}
