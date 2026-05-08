// pages/index.js - Admin root - redirect to dashboard
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminRoot() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
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
        <h1>Redirecting to Dashboard...</h1>
        <p>
          If you are not redirected automatically, click{" "}
          <a href="/dashboard" style={{ color: "#C9A84C" }}>
            here
          </a>
          .
        </p>
      </div>
    </div>
  );
}
