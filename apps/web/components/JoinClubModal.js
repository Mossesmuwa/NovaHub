import Link from "next/link";

export default function JoinClubModal({
  open,
  onClose,
  message,
  ctaText = "Create Free Account",
  ctaHref = "/account/register",
}) {
  if (!open) return null;
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeStyle} onClick={onClose} aria-label="Close">
          ×
        </button>
        <div style={iconStyle}>✦</div>
        <h2 style={titleStyle}>Join the Club</h2>
        <p style={copyStyle}>
          Sync your favorites across devices with a free account, and go further
          with Nova Pro for unlimited saved items and smarter recommendations.
        </p>
        {message && <p style={messageStyle}>{message}</p>}
        <div style={buttonRowStyle}>
          <Link href={ctaHref} style={primaryButtonStyle}>
            {ctaText}
          </Link>
          <button style={secondaryButtonStyle} onClick={onClose}>
            Maybe later
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
  background: "rgba(4, 10, 24, 0.78)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "520px",
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  padding: "32px",
  boxShadow: "0 40px 120px rgba(0,0,0,0.35)",
  color: "#f8fafc",
  position: "relative",
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
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  background: "#fde047",
  color: "#0f172a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "32px",
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
  color: "#cbd5e1",
  marginBottom: "20px",
};

const messageStyle = {
  margin: 0,
  fontSize: "14px",
  lineHeight: 1.7,
  color: "#f8fafc",
  background: "rgba(255,255,255,0.06)",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.08)",
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
  border: "1px solid rgba(255,255,255,0.12)",
  background: "transparent",
  color: "#f8fafc",
  cursor: "pointer",
};
