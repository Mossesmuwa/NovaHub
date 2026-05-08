// pages/account/dashboard.js
import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSupabase } from '../../lib/SupabaseContext';
import * as Auth from '../../lib/auth';
import * as Favorites from '../../lib/favorites';

// ─── Nova Rank system ────────────────────────────────────────────────────────
const RANKS = [
  { min: 50, rank: 'Nova Master',   icon: '✦', color: '#C9A84C', desc: 'Elite discoverer' },
  { min: 20, rank: 'Archivist',     icon: '◈', color: '#7F77DD', desc: 'Serious collector' },
  { min: 10, rank: 'Curator',       icon: '◉', color: '#1D9E75', desc: 'Building taste' },
  { min: 3,  rank: 'Explorer',      icon: '◎', color: '#3B8BD4', desc: 'Finding your vibe' },
  { min: 0,  rank: 'Newcomer',      icon: '○', color: '#636366', desc: 'Just getting started' },
];
function getNovaRank(n) { return RANKS.find(r => n >= r.min) || RANKS[RANKS.length - 1]; }

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ value, duration = 700 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0, raf;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      setN(Math.round(p * value));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{n}</>;
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'saved',    icon: '♥',  label: 'Saved' },
  { key: 'lists',    icon: '◫',  label: 'Lists' },
  { key: 'taste',    icon: '✦',  label: 'Taste DNA' },
  { key: 'settings', icon: '⊙', label: 'Settings' },
];

export default function Dashboard() {
  const router               = useRouter();
  const { user, profile, supabase, setProfile } = useSupabase();
  const [tab,     setTab]    = useState('saved');
  const [favs,    setFavs]   = useState([]);
  const [lists,   setLists]  = useState([]);
  const [taste,   setTaste]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [sName,   setSName]  = useState('');
  const [sBio,    setSBio]   = useState('');
  const [sWeb,    setSWeb]   = useState('');
  const [pMsg,    setPMsg]   = useState('');
  const [pw,      setPw]     = useState('');
  const [pwMsg,   setPwMsg]  = useState('');
  const tabsRef              = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) router.replace('/account/login?return=/account/dashboard');
  }, [user, loading]);

  // Load data
  useEffect(() => {
    if (!user) return;
    setSName(profile?.display_name || '');
    setSBio(profile?.bio || '');
    setSWeb(profile?.website || '');

    const loadData = async () => {
      const [items, { data: ls }] = await Promise.all([
        Favorites.getAllFavorites(),
        supabase.from('lists').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setFavs(items || []);
      setLists(ls || []);

      try { setTaste(JSON.parse(localStorage.getItem('nova_taste') || 'null')); } catch {}
      setLoading(false);
    };
    loadData();
  }, [user, profile]);

  // Tab indicator
  useEffect(() => {
    const el = tabsRef.current?.querySelector(`[data-tab="${tab}"]`);
    if (!el || !tabsRef.current) return;
    const pr = tabsRef.current.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setIndicator({ left: er.left - pr.left, width: er.width });
  }, [tab]);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const initial     = displayName.charAt(0).toUpperCase();
  const rank        = getNovaRank(favs.length);
  const daysMember  = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at)) / 86400000)
    : 0;

  async function saveProfile() {
    const { error } = await supabase.from('profiles').update({
      display_name: sName, bio: sBio, website: sWeb, updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    if (!error) setProfile({ ...profile, display_name: sName, bio: sBio, website: sWeb });
    setPMsg(error ? 'Error saving.' : '✦ Saved!');
    setTimeout(() => setPMsg(''), 3000);
  }

  async function changePassword() {
    if (pw.length < 8) { setPwMsg('Min 8 characters.'); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwMsg(error ? error.message : '✦ Password updated!');
    if (!error) setPw('');
    setTimeout(() => setPwMsg(''), 3000);
  }

  async function createList() {
    const n = prompt('Name your list:');
    if (!n?.trim()) return;
    await supabase.from('lists').insert({ user_id: user.id, name: n.trim() });
    const { data } = await supabase.from('lists').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setLists(data || []);
  }

  async function removeSaved(itemId) {
    await Favorites.removeFavorite(itemId);
    setFavs(p => p.filter(i => i.id !== itemId));
  }

  if (!user || loading) return (
    <Layout>
      <SEO title="Dashboard — NovaHub" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 36, height: 36, border: '2.5px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: 'var(--t3)', fontSize: 14 }}>Loading your space…</span>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <SEO title={`${displayName} — NovaHub`} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.4)} 50%{box-shadow:0 0 0 8px rgba(201,168,76,0)} }
        .dash-tab-btn { background:none; border:none; cursor:pointer; padding:10px 18px; font-size:14px; font-weight:600; color:var(--t3); font-family:var(--font); display:flex;align-items:center;gap:7px; transition:color .2s; white-space:nowrap; position:relative;z-index:1; }
        .dash-tab-btn.active { color:var(--t1); }
        .dash-tab-btn:hover { color:var(--t2); }
        .setting-row { display:flex;flex-direction:column;gap:6px;margin-bottom:20px; }
        .setting-label { font-size:12px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.06em; }
        .setting-input { background:var(--bg3);border:1px solid var(--border2);border-radius:var(--rsm);padding:12px 14px;color:var(--t1);font-size:15px;font-family:var(--font);outline:none;transition:border-color .2s;width:100%;box-sizing:border-box; }
        .setting-input:focus { border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-glow); }
        .taste-bar { height:6px;border-radius:99px;background:var(--border);overflow:hidden;flex:1; }
        .taste-fill { height:100%;border-radius:99px;background:var(--gold-grad);transition:width 1.2s cubic-bezier(.22,1,.36,1); }
        .fav-card-wrap { position:relative; }
        .fav-remove { position:absolute;top:8px;right:8px;z-index:2;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,.6);border:none;color:#fff;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:.2s; }
        .fav-card-wrap:hover .fav-remove { opacity:1; }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 50%, var(--bg2) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 0 0', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'var(--gold-glow)', filter: 'blur(60px)', animation: 'float 6s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: -40, right: '15%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(127,119,221,.08)', filter: 'blur(50px)', animation: 'float 8s ease-in-out infinite 2s' }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--gold-grad)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 900, color: '#09090C', flexShrink: 0,
              animation: 'ringPulse 3s ease-in-out infinite',
            }}>
              {initial}
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{ fontSize: 'clamp(20px,4vw,30px)', fontWeight: 900, letterSpacing: '-.03em', margin: 0 }}>
                  {displayName}
                </h1>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 99,
                  background: `${rank.color}18`, border: `1px solid ${rank.color}40`,
                  fontSize: 11, fontWeight: 800, color: rank.color,
                }}>
                  {rank.icon} {rank.rank}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--t3)' }}>{user.email}</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>
                Member for <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{daysMember}</span> days
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 0 }}>
            {[
              { value: favs.length,  label: 'Saved',         icon: '♥' },
              { value: lists.length, label: 'Lists',          icon: '◫' },
              { value: daysMember,   label: 'Days exploring', icon: '◎' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 14, color: 'var(--gold)' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
                    <Counter value={s.value} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div ref={tabsRef} style={{ display: 'flex', position: 'relative', marginTop: 8 }}>
            <div style={{
              position: 'absolute', bottom: 0, height: 2,
              background: 'var(--gold-grad)', borderRadius: 2,
              left: indicator.left, width: indicator.width,
              transition: 'left .25s cubic-bezier(.22,1,.36,1), width .25s cubic-bezier(.22,1,.36,1)',
            }} />
            {TABS.map(t => (
              <button
                key={t.key} data-tab={t.key}
                className={`dash-tab-btn${tab === t.key ? ' active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                <span style={{ fontSize: 12 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: '32px 0 80px' }}>
        <div className="container">

          {/* ── SAVED ── */}
          {tab === 'saved' && (
            <div>
              {favs.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">♡</span>
                  <h3>Nothing saved yet</h3>
                  <p>Tap the heart on anything you discover and it'll live here.</p>
                  <Link href="/" className="btn-primary">Start Discovering</Link>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <p style={{ fontSize: 13, color: 'var(--t3)' }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{favs.length}</span> saved item{favs.length !== 1 ? 's' : ''}
                      {favs.length >= 10 && <span style={{ color: '#7F77DD', marginLeft: 8 }}>· {rank.rank} tier</span>}
                    </p>
                    <Link href="/account/favorites" style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>
                      View all →
                    </Link>
                  </div>
                  <div className={favs.some(i => ['movie','book','game','tv'].includes(i.type)) ? 'grid-4' : 'grid-3'}>
                    {favs.slice(0, 12).map(item => (
                      <FavCard key={item.id} item={item} onRemove={removeSaved} router={router} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── LISTS ── */}
          {tab === 'lists' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>My Lists</h2>
                  <p style={{ fontSize: 13, color: 'var(--t3)' }}>Curate and share your discoveries</p>
                </div>
                <button className="btn-primary" style={{ fontSize: 13, padding: '9px 18px', width: 'auto' }} onClick={createList}>
                  + New List
                </button>
              </div>
              {lists.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">◫</span>
                  <h3>No lists yet</h3>
                  <p>Group your discoveries into shareable collections.</p>
                  <button className="btn-primary" onClick={createList}>Create First List</button>
                </div>
              ) : (
                <div className="grid-3">
                  {lists.map(l => (
                    <div className="card" key={l.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ fontSize: 22, lineHeight: 1 }}>◫</div>
                        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, background: 'var(--surf)', border: '1px solid var(--border)', color: 'var(--t3)' }}>
                          {l.is_public ? '🌍 Public' : '🔒 Private'}
                        </span>
                      </div>
                      <div className="card-title">{l.name}</div>
                      <p className="card-desc">{l.description || 'No description'} · {l.item_count || 0} items</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TASTE DNA ── */}
          {tab === 'taste' && (
            <div style={{ maxWidth: 640 }}>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 99, background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)', fontSize: 11, fontWeight: 800, color: 'var(--gold)', marginBottom: 12 }}>
                  ✦ Your Taste Profile
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-.03em', marginBottom: 6 }}>Taste DNA</h2>
                <p style={{ fontSize: 14, color: 'var(--t3)' }}>Built from your onboarding quiz and saves.</p>
              </div>

              {!taste ? (
                <div className="empty-state">
                  <span className="empty-icon">✦</span>
                  <h3>No taste profile yet</h3>
                  <p>Complete the onboarding quiz to generate your Taste DNA.</p>
                  <Link href="/onboarding" className="btn-primary">Take the Quiz</Link>
                </div>
              ) : (
                <>
                  {/* Categories */}
                  {taste.cats?.length > 0 && (
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>
                        Your Categories
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {taste.cats.map((cat, i) => (
                          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 12, color: 'var(--t2)', minWidth: 110, fontWeight: 600 }}>{cat}</span>
                            <div className="taste-bar">
                              <div className="taste-fill" style={{ width: `${100 - i * 12}%` }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, minWidth: 32, textAlign: 'right' }}>
                              {100 - i * 12}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mood */}
                  {taste.mood && (
                    <div style={{ marginBottom: 28, padding: '16px 20px', background: 'var(--bg3)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                        Current Mode
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>
                        {taste.mood === 'learn'     && 'Learn & Grow'}
                        {taste.mood === 'entertain' && 'Entertain Me'}
                        {taste.mood === 'tools'     && 'Find Tools'}
                        {taste.mood === 'explore'   && 'Just Exploring'}
                        {!['learn','entertain','tools','explore'].includes(taste.mood) && taste.mood}
                      </div>
                    </div>
                  )}

                  {/* Loved items */}
                  {taste.loved?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
                        Things You Loved
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {taste.loved.map(item => (
                          <span key={item} style={{
                            padding: '5px 12px', borderRadius: 99,
                            background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)',
                            fontSize: 12, fontWeight: 600, color: 'var(--gold)',
                          }}>
                            ♥ {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 24 }}>
                    <Link href="/onboarding" style={{ fontSize: 13, color: 'var(--t3)', textDecoration: 'none' }}>
                      ↺ Retake taste quiz
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && (
            <div style={{ maxWidth: 560 }}>

              {/* Profile section */}
              <div style={{ marginBottom: 24, padding: '24px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--rlg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gold-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#09090C' }}>
                    {initial}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{displayName}</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>{rank.icon} {rank.rank} · {daysMember} days</div>
                  </div>
                </div>

                <div className="setting-row">
                  <label className="setting-label">Display Name</label>
                  <input className="setting-input" type="text" value={sName} onChange={e => setSName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="setting-row">
                  <label className="setting-label">Bio</label>
                  <input className="setting-input" type="text" value={sBio} onChange={e => setSBio(e.target.value)} placeholder="Tell people about yourself" />
                </div>
                <div className="setting-row">
                  <label className="setting-label">Website</label>
                  <input className="setting-input" type="url" value={sWeb} onChange={e => setSWeb(e.target.value)} placeholder="https://yoursite.com" />
                </div>
                <button className="btn-primary" style={{ fontSize: 13, padding: '10px 22px', width: 'auto', display: 'inline-flex' }} onClick={saveProfile}>
                  Save Profile
                </button>
                {pMsg && <div style={{ marginTop: 10, fontSize: 13, color: pMsg.includes('Error') ? '#FF453A' : '#30D158' }}>{pMsg}</div>}
              </div>

              {/* Password section */}
              <div style={{ marginBottom: 24, padding: '24px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--rlg)' }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Change Password</div>
                <div className="setting-row">
                  <label className="setting-label">New Password</label>
                  <input className="setting-input" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 8 characters" />
                </div>
                <button className="btn-primary" style={{ fontSize: 13, padding: '10px 22px', width: 'auto', display: 'inline-flex' }} onClick={changePassword}>
                  Update Password
                </button>
                {pwMsg && <div style={{ marginTop: 10, fontSize: 13, color: pwMsg.includes('✦') ? '#30D158' : '#FF453A' }}>{pwMsg}</div>}
              </div>

              {/* Danger zone */}
              <div style={{ padding: '24px', background: 'rgba(255,69,58,.05)', border: '1px solid rgba(255,69,58,.15)', borderRadius: 'var(--rlg)' }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, color: '#FF453A' }}>Danger Zone</div>
                <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 16 }}>Sign out ends your session on this device.</p>
                <button
                  style={{ padding: '10px 20px', borderRadius: 99, border: '1px solid rgba(255,69,58,.3)', background: 'transparent', color: '#FF453A', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'var(--ease)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,69,58,.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  onClick={async () => { await Auth.logout(); router.push('/'); }}
                >
                  Sign Out
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}

function FavCard({ item, onRemove, router }) {
  const href     = `/item/${encodeURIComponent(item.slug || item.id)}`;
  const isPoster = ['movie','book','game','tv'].includes(item.type);
  const isFree   = (item.pricing || '').toLowerCase().includes('free');

  if (isPoster) {
    return (
      <div className="fav-card-wrap">
        <Link href={href} className="card-poster">
          <div className="bg-zoom" style={{ backgroundImage: `url('${item.image || ''}')` }} />
          <div className="card-poster-content">
            <div className="card-poster-title">{item.name}</div>
            {item.rating && <div className="card-poster-rating">★ {item.rating}</div>}
          </div>
        </Link>
        <button className="fav-remove" onClick={() => onRemove(item.id)}>✕</button>
      </div>
    );
  }

  return (
    <div className="fav-card-wrap card" style={{ cursor: 'pointer' }} onClick={() => router.push(href)}>
      <button className="fav-remove" onClick={e => { e.stopPropagation(); onRemove(item.id); }}>✕</button>
      <div className="card-icon">{(item.name || '?').charAt(0)}</div>
      <div className="card-title">{item.name}</div>
      {item.pricing && <span className={isFree ? 'tag-free' : 'tag-paid'} style={{ display: 'inline-block', marginBottom: 8 }}>{item.pricing}</span>}
      <p className="card-desc">{item.short_desc || ''}</p>
    </div>
  );
}
