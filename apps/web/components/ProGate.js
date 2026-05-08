// components/ProGate.js
// NovaHub — Pro Feature Gate
// Wrap any pro-only UI element with this component.
// Free users see an upgrade prompt instead of the feature.
//
// Usage:
//   // Block entirely
//   <ProGate feature="vibeDialUnlimited">
//     <VibeDial />
//   </ProGate>
//
//   // Show degraded version for free users
//   <ProGate feature="novaScore" fallback={<span>—</span>}>
//     <NovaScore value={94} />
//   </ProGate>
//
//   // Inline soft gate (shows content but with upgrade nudge overlay)
//   <ProGate feature="tasteHistory" soft>
//     <TasteGraph />
//   </ProGate>

import { useRouter } from 'next/router';
import { usePro, FEATURES } from '../hooks/usePro';

export default function ProGate({ feature, children, fallback = null, soft = false }) {
  const { isPro, can, loading } = usePro();
  const router = useRouter();

  // While checking auth/pro status — render nothing to avoid flash
  if (loading) return null;

  // User has access — render normally
  if (can(feature)) return children;

  // Soft gate — show content but blur it with an upgrade overlay
  if (soft) {
    return (
      <div className="pro-gate-soft" style={{ position: 'relative' }}>
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>
        <ProUpgradeOverlay feature={feature} onUpgrade={() => router.push('/pro')} />
      </div>
    );
  }

  // Hard gate — show fallback or the full upgrade card
  if (fallback !== null) return fallback;

  return <ProUpgradeCard feature={feature} onUpgrade={() => router.push('/pro')} />;
}

// ─── Full upgrade card (hard gate) ───────────────────────────────────────────
function ProUpgradeCard({ feature, onUpgrade }) {
  const info = FEATURES[feature] || {};

  return (
    <div className="pro-gate-card">
      <div className="pro-gate-icon">✦</div>
      <p className="pro-gate-label">Pro feature</p>
      <p className="pro-gate-desc">{info.label || 'This feature requires NovaHub Pro.'}</p>
      <button className="btn-primary" onClick={onUpgrade}>
        Unlock with Pro — $6/mo
      </button>
      <p className="pro-gate-note">Cancel anytime · Instant access</p>
    </div>
  );
}

// ─── Overlay for soft gate ────────────────────────────────────────────────────
function ProUpgradeOverlay({ feature, onUpgrade }) {
  const info = FEATURES[feature] || {};

  return (
    <div className="pro-gate-overlay">
      <div className="pro-gate-overlay-inner">
        <span className="pro-gate-icon">✦</span>
        <p>{info.label || 'Pro feature'}</p>
        <button className="btn-primary btn-sm" onClick={onUpgrade}>
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}

// ─── Inline pro badge (use in nav or profile) ─────────────────────────────────
export function ProBadge() {
  return <span className="pro-badge">✦ Pro</span>;
}

// ─── Higher-order component version ───────────────────────────────────────────
// Usage: export default withProGate(MyComponent, 'vibeDialUnlimited');
export function withProGate(Component, feature, options = {}) {
  return function ProGatedComponent(props) {
    return (
      <ProGate feature={feature} {...options}>
        <Component {...props} />
      </ProGate>
    );
  };
}
