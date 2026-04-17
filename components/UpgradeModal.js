import Link from "next/link";
import { setCookie } from "../lib/cookies";

export default function UpgradeModal({
  open,
  onClose,
  message,
  ctaText = "Create Free Account",
  ctaHref = "/account/register",
  persistDismissal = true,
}) {
  if (!open) return null;

  const handleClose = () => {
    if (persistDismissal) {
      setCookie("nova_join_dismissed", "1", 30);
    }
    onClose();
  };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div
        style={cardStyle}
        className="glass-nav"
        onClick={(e) => e.stopPropagation()}
      >
        <button style={closeStyle} onClick={handleClose} aria-label="Close">
          ×
        </button>
        <div style={iconStyle}>✦</div>
        <h2 style={titleStyle}>Join NovaHub</h2>
        <p style={copyStyle}>
          You&apos;re hitting the limit for anonymous/free saved items. Create a
          free account to sync your guest favorites, or upgrade to Nova Pro for
          unlimited saves.
        </p>
        {message && <p style={messageStyle}>{message}</p>}
        <div style={buttonRowStyle}>
          <Link href={ctaHref} style={primaryButtonStyle}>
            {ctaText}
          </Link>
          <button style={secondaryButtonStyle} onClick={handleClose}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  background: "rgba(0, 0, 0, 0.72)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "520px",
  borderRadius: "28px",
  padding: "32px",
  position: "relative",
  boxShadow: "0 40px 120px rgba(0,0,0,0.35)",
  background: "rgba(15, 23, 42, 0.96)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#f8fafc",
};

const closeStyle = {
  position: "absolute",
  top: "16px",
  right: "16px",
  border: "none",
  background: "transparent",
  color: "#f8fafc",
  fontSize: "24px",
  cursor: "pointer",
};

const iconStyle = {
  width: "58px",
  height: "58px",
  borderRadius: "50%",
  background: "#fde047",
  color: "#0f172a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  marginBottom: "22px",
};

const titleStyle = {
  margin: 0,
  fontSize: "28px",
  lineHeight: 1.1,
  fontWeight: 900,
  marginBottom: "14px",
};

const copyStyle = {
  margin: 0,
  fontSize: "15px",
  lineHeight: 1.8,
  color: "#d1d5db",
  marginBottom: "20px",
};

const messageStyle = {
  margin: 0,
  fontSize: "14px",
  lineHeight: 1.7,
  color: "#f8fafc",
  background: "rgba(255,255,255,0.08)",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.12)",
};

const buttonRowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "24px",
};

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 24px",
  borderRadius: "99px",
  background: "#f59e0b",
  color: "#08121f",
  fontWeight: 700,
  textDecoration: "none",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 24px",
  borderRadius: "99px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "transparent",
  color: "#f8fafc",
  cursor: "pointer",
};
