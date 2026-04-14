// components/NovaScore.js
// NovaHub — NovaScore Badge (Pro feature)
// Shows a personalised match percentage on any item card or detail page.
// Free users see the standard star rating instead.
//
// Usage on a card:
//   import NovaScore from '../components/NovaScore';
//   <NovaScore item={item} />
//
// Usage on item detail page (with breakdown):
//   <NovaScore item={item} showBreakdown />
//
// Usage with pre-calculated score (avoids recalculation):
//   <NovaScore item={item} score={novaScore} />

import { useEffect, useState } from 'react';
import { usePro }              from '../hooks/usePro';
import { calcNovaScore, getTasteFromStorage } from '../lib/nova-score';

// ─── Colour based on score value ──────────────────────────────────────────────
function scoreColor(value) {
  if (value >= 80) return 'var(--gold)';           // gold — great match
  if (value >= 60) return '#4CAF82';               // green — good match
  if (value >= 40) return 'var(--t2)';             // muted — partial
  return 'var(--t3)';                              // dim — low match
}

// ─── Ring SVG ─────────────────────────────────────────────────────────────────
// A small circular progress ring showing the score visually.
function ScoreRing({ value, size = 36 }) {
  const r          = (size / 2) - 3;
  const circumference = 2 * Math.PI * r;
  const progress   = (value / 100) * circumference;
  const color      = scoreColor(value);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="var(--border)" strokeWidth="2.5"
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
        strokeDashoffset="0"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.6s var(--spring)' }}
      />
      {/* Label */}
      <text
        x={size / 2} y={size / 2 + 4}
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill={color}
        fontFamily="var(--font)"
      >
        {value}
      </text>
    </svg>
  );
}

// ─── Breakdown bar ────────────────────────────────────────────────────────────
function BreakdownRow({ label, value }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t2)', marginBottom: 2 }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width:  `${value}%`,
          background: scoreColor(value),
          borderRadius: 2,
          transition: 'width 0.5s var(--spring)',
        }} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NovaScore({ item, score: scoreProp, showBreakdown = false, size = 36 }) {
  const { isPro, loading } = usePro();
  const [score, setScore]  = useState(scoreProp || null);

  useEffect(() => {
    // Don't calculate until we know pro status
    if (loading || !isPro) return;
    if (scoreProp) { setScore(scoreProp); return; }

    const taste = getTasteFromStorage();
    if (!taste) return;

    const calculated = calcNovaScore(item, taste);
    setScore(calculated);
  }, [item, loading, isPro, scoreProp]);

  // Still loading auth
  if (loading) return null;

  // Free users — show the plain rating badge instead
  if (!isPro) {
    const rating = parseFloat(item?.rating);
    if (!rating) return null;
    return (
      <span className="nova-score-free" title="Upgrade to Pro for your personal match score">
        ★ {rating.toFixed(1)}
      </span>
    );
  }

  // Pro user but no taste profile set
  if (!score) {
    return (
      <span
        className="nova-score-empty"
        title="Complete your taste profile to see your match score"
        style={{ fontSize: 11, color: 'var(--t3)' }}
      >
        — Match
      </span>
    );
  }

  return (
    <div className="nova-score" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <ScoreRing value={score.value} size={size} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: scoreColor(score.value), lineHeight: 1.2 }}>
          {score.value}% match
        </div>
        <div style={{ fontSize: 10, color: 'var(--t3)' }}>
          {score.label}
        </div>
      </div>

      {showBreakdown && score.breakdown && (
        <div className="nova-score-breakdown" style={{
          marginTop: 12,
          padding: '12px 14px',
          background: 'var(--bg3)',
          borderRadius: 'var(--rsm)',
          border: '1px solid var(--border)',
          minWidth: 200,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t1)', marginBottom: 10 }}>
            ✦ Why this score?
          </div>
          <BreakdownRow label="Category fit"   value={score.breakdown.category} />
          <BreakdownRow label="Tag overlap"     value={score.breakdown.tags}     />
          <BreakdownRow label="Taste history"   value={score.breakdown.loved}    />
          <BreakdownRow label="Mood match"      value={score.breakdown.mood}     />
          <BreakdownRow label="Item quality"    value={score.breakdown.quality}  />
        </div>
      )}
    </div>
  );
}

// ─── Compact inline version for card grids ────────────────────────────────────
// Usage: <NovaScorePill item={item} />
export function NovaScorePill({ item, score: scoreProp }) {
  const { isPro, loading } = usePro();
  const [score, setScore]  = useState(scoreProp || null);

  useEffect(() => {
    if (loading || !isPro || scoreProp) return;
    const taste = getTasteFromStorage();
    if (!taste) return;
    setScore(calcNovaScore(item, taste));
  }, [item, loading, isPro, scoreProp]);

  if (loading || !isPro || !score) return null;

  return (
    <span className="nova-score-pill" style={{
      display:      'inline-block',
      padding:      '2px 7px',
      borderRadius: 20,
      fontSize:     10,
      fontWeight:   600,
      background:   'var(--gold-glow)',
      color:        scoreColor(score.value),
      border:       `1px solid ${scoreColor(score.value)}33`,
    }}>
      {score.value}% match
    </span>
  );
}
