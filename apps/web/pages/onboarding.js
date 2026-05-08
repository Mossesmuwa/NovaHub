import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

const DEFAULT_ITEMS = [
  { name: 'Dune: Part Two', type: 'movie', genre: 'Sci-Fi', em: '🍿' },
  { name: 'Cursor IDE', type: 'tool', genre: 'AI Dev', em: '✨' },
  { name: 'Atomic Habits', type: 'book', genre: 'Self-Help', em: '📚' },
  { name: 'Elden Ring', type: 'game', genre: 'Action RPG', em: '🎮' },
  { name: 'Supabase', type: 'tool', genre: 'Dev Tool', em: '⚡' },
  { name: 'The Last of Us', type: 'tv', genre: 'Drama', em: '📺' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [cats, setCats] = useState([]);
  const [loved, setLoved] = useState([]);
  const [passed, setPassed] = useState([]);
  const [mood, setMood] = useState(null);
  const [swipeIdx, setSwipeIdx] = useState(0);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [errStep, setErrStep] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      try {
        const { data } = await supabase.from('items').select('name,type,genre').eq('approved', true).limit(8);
        if (data && data.length >= 6) {
          const emap = { movie: '🍿', book: '📚', game: '🎮', tool: '✨', tv: '📺', music: '🎵' };
          setItems(data.slice(0, 6).map(i => ({ name: i.name, type: i.type, genre: i.genre || i.type, em: emap[i.type] || '✦' })));
        }
      } catch {}
    })();
  }, []);

  function goToStep(n) { setStep(n); setErrStep(null); }

  function next(from) {
    if (from === 0 && !cats.length) { setErrStep(0); return; }
    if (from === 2 && !mood) { setErrStep(2); return; }
    goToStep(from + 1);
  }

  function toggleCat(catId) {
    setCats(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
    setErrStep(null);
  }

  function swipe(dir) {
    const item = items[swipeIdx];
    if (!item) return;
    if (dir === 'love') setLoved(prev => [...prev, item.name]);
    else setPassed(prev => [...prev, item.name]);
    const nextIdx = swipeIdx + 1;
    setSwipeIdx(nextIdx);
    if (nextIdx >= items.length) setTimeout(() => goToStep(2), 400);
  }

  function skip() {
    try { localStorage.setItem('nova_onboard_skip', '1'); } catch {}
    window.location.href = '/';
  }

  function finish() {
    try {
      localStorage.setItem('nova_taste', JSON.stringify({ cats, loved, mood, ts: Date.now() }));
      localStorage.setItem('nova_onboard_done', '1');
    } catch {}
  }

  const allCats = [
    { id: 'movies', em: '🍿', name: 'Movies' }, { id: 'tv-shows', em: '📺', name: 'TV Shows' },
    { id: 'books', em: '📚', name: 'Books' }, { id: 'games', em: '🎮', name: 'Games' },
    { id: 'ai-tools', em: '✨', name: 'AI Tools' }, { id: 'security', em: '🔐', name: 'Security' },
    { id: 'music', em: '🎵', name: 'Music' }, { id: 'courses', em: '🧠', name: 'Learning' },
    { id: 'design', em: '🎨', name: 'Design' }, { id: 'science', em: '🔬', name: 'Science' },
    { id: 'productivity', em: '⚡', name: 'Productivity' }, { id: 'finance', em: '📈', name: 'Finance' },
  ];

  if (step === 3) finish();
  const tags = [...cats, ...loved]; if (mood) tags.unshift(mood);

  return (
    <>
      <SEO title="Set Your Taste — NovaHub" description="Tell NovaHub your taste for personalised recommendations." />
      <div className="onboard-wrap">
        <div className="onboard-bg"></div>
        <div className="onboard-card">
          <div className="onboard-step-dots">
            {[0,1,2,3].map(i => <div key={i} className={`step-dot${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}></div>)}
          </div>

          {step === 0 && (
            <div className="onboard-step active">
              <div className="onboard-step-title">What worlds do you explore?</div>
              <div className="onboard-step-sub">Pick everything that interests you. NovaHub fills your feed from these areas.</div>
              <div className="cat-tiles">
                {allCats.map(c => (
                  <div key={c.id} className={`onboard-cat-tile${cats.includes(c.id) ? ' selected' : ''}`} onClick={() => toggleCat(c.id)}>
                    <div className="tile-check">✓</div><span className="tile-em">{c.em}</span><span className="tile-name">{c.name}</span>
                  </div>
                ))}
              </div>
              {errStep === 0 && <div style={{ fontSize: '13px', color: '#FF453A', textAlign: 'center', marginBottom: '12px' }}>Pick at least one category to continue.</div>}
              <div className="onboard-footer"><span className="onboard-skip" onClick={skip}>Skip for now</span><button className="btn-primary" onClick={() => next(0)}>Next →</button></div>
            </div>
          )}

          {step === 1 && (
            <div className="onboard-step active">
              <div className="onboard-step-title">Quick taste check</div>
              <div className="onboard-step-sub">Rate 6 picks — love it or pass. Builds your profile instantly.</div>
              {swipeIdx < items.length && (
                <div className="swipe-area">
                  <div className="swipe-card" style={{ textAlign: 'center', padding: '32px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>{items[swipeIdx].em}</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{items[swipeIdx].name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--t3)' }}>{items[swipeIdx].type} · {items[swipeIdx].genre}</div>
                  </div>
                </div>
              )}
              <div className="swipe-progress">Item {Math.min(swipeIdx + 1, items.length)} of {items.length}</div>
              <div className="swipe-actions">
                <button className="swipe-btn pass" onClick={() => swipe('pass')} title="Not for me">✕</button>
                <button className="swipe-btn love" onClick={() => swipe('love')} title="Love it">♥</button>
              </div>
              <div className="onboard-footer"><span className="onboard-skip" onClick={() => next(1)}>Skip this step</span></div>
            </div>
          )}

          {step === 2 && (
            <div className="onboard-step active">
              <div className="onboard-step-title">What are you here for?</div>
              <div className="onboard-step-sub">Shapes what shows first on your homepage. Change anytime.</div>
              <div className="mood-grid">
                {[
                  { id: 'learn', em: '🧠', name: 'Learn something', desc: 'Courses, books, tutorials, deep dives' },
                  { id: 'entertain', em: '🎬', name: 'Get entertained', desc: 'Movies, games, music, shows' },
                  { id: 'tools', em: '⚡', name: 'Find tools', desc: 'AI tools, apps, dev tools, productivity' },
                  { id: 'explore', em: '🔭', name: 'Just explore', desc: 'Surprise me with something new' },
                ].map(m => (
                  <div key={m.id} className={`mood-card${mood === m.id ? ' active' : ''}`} onClick={() => { setMood(m.id); setErrStep(null); }}>
                    <span className="mood-em">{m.em}</span><div className="mood-name">{m.name}</div><div className="mood-desc">{m.desc}</div>
                  </div>
                ))}
              </div>
              {errStep === 2 && <div style={{ fontSize: '13px', color: '#FF453A', textAlign: 'center', marginBottom: '12px' }}>Pick a mood to continue.</div>}
              <div className="onboard-footer"><span className="onboard-skip" onClick={() => next(2)}>Skip</span><button className="btn-primary" onClick={() => next(2)}>Next →</button></div>
            </div>
          )}

          {step === 3 && (
            <div className="onboard-step active" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✦</div>
              <div className="onboard-step-title" style={{ textAlign: 'center' }}>Your feed is ready</div>
              <div className="onboard-step-sub" style={{ textAlign: 'center' }}>NovaHub now knows your taste. Recommendations are personalised.</div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--rlg)', padding: '18px 20px', margin: '20px 0', textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Your taste profile</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tags.slice(0, 10).map((t, i) => <span key={i} style={{ background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: '99px', padding: '5px 13px', fontSize: '12px', fontWeight: 600, color: 'var(--t2)' }}>{t}</span>)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/account/register" className="btn-primary" style={{ fontSize: '14px' }}>Create Free Account ✦</Link>
                <Link href="/" className="btn-secondary" style={{ fontSize: '14px' }}>Continue Without</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
