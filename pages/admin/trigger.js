// pages/admin/trigger.js
// Admin panel for manually triggering ingestion.
// Only accessible if is_admin = true on your profile in Supabase.
// To set yourself as admin: UPDATE profiles SET is_admin = TRUE WHERE id = 'YOUR-UUID';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '../../lib/SupabaseContext';
import SEO from '../../components/SEO';

const PROVIDERS = [
  { key: 'tmdb',        label: 'TMDB',         icon: '🎬', desc: 'Trending movies + TV shows', env: 'TMDB_BEARER_TOKEN' },
  { key: 'producthunt', label: 'Product Hunt',  icon: '🚀', desc: 'Trending tools + products',  env: 'PRODUCTHUNT_DEVELOPER_TOKEN' },
];

export default function AdminTrigger() {
  const router             = useRouter();
  const { user, profile, loading, supabase } = useSupabase();
  const [results, setResults] = useState({});
  const [running, setRunning] = useState({});
  const [itemCount, setItemCount] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/account/login');
      else if (!profile?.is_admin) router.replace('/');
    }
  }, [user, profile, loading]);

  useEffect(() => {
    if (!profile?.is_admin) return;
    supabase.from('items').select('*', { count: 'exact', head: true }).then(({ count }) => setItemCount(count));
  }, [profile]);

  async function trigger(providerKey) {
    setRunning(p => ({ ...p, [providerKey]: true }));
    setResults(p => ({ ...p, [providerKey]: null }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/trigger', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ provider: providerKey }),
      });
      const data = await res.json();
      setResults(p => ({ ...p, [providerKey]: data }));

      // Refresh item count
      const { count } = await supabase.from('items').select('*', { count: 'exact', head: true });
      setItemCount(count);
    } catch (e) {
      setResults(p => ({ ...p, [providerKey]: { error: e.message } }));
    }

    setRunning(p => ({ ...p, [providerKey]: false }));
  }

  async function triggerAll() {
    for (const p of PROVIDERS) await trigger(p.key);
  }

  if (loading || !profile?.is_admin) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #333', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const anyRunning = Object.values(running).some(Boolean);

  return (
    <>
      <SEO title="Admin — NovaHub" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        body { background: #09090C; color: #F2F2F7; font-family: Inter, system-ui, sans-serif; margin: 0; }
        .btn { padding: 10px 20px; border-radius: 99px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; font-family: inherit; transition: all .2s; }
        .btn-gold { background: linear-gradient(140deg, #E8C97A, #C9A84C, #9B7520); color: #09090C; }
        .btn-gold:hover { opacity: .9; transform: translateY(-1px); }
        .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,.15); color: #AEAEB2; }
        .btn-ghost:hover { border-color: #C9A84C; color: #C9A84C; }
        .btn:disabled { opacity: .5; cursor: not-allowed; transform: none !important; }
        .card { background: #18181F; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 24px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <a href="/" style={{ fontSize: 13, color: '#636366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            ← Back to NovaHub
          </a>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, marginBottom: 4 }}>Admin Panel</h1>
              <p style={{ fontSize: 13, color: '#636366', margin: 0 }}>Manually trigger content ingestion</p>
            </div>
            <button className="btn btn-gold" onClick={triggerAll} disabled={anyRunning}>
              {anyRunning ? '⟳ Running…' : '▶ Run All'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Items in DB', value: itemCount ?? '…' },
            { label: 'Providers',   value: PROVIDERS.length },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, padding: '16px 20px', background: '#111116', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#C9A84C' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#636366', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Provider cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PROVIDERS.map(p => {
            const res    = results[p.key];
            const active = running[p.key];
            const ok     = res?.success;
            const err    = res?.error || res?.result?.errors?.[0];

            return (
              <div className="card" key={p.key}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                    <span style={{ fontSize: 28, lineHeight: 1 }}>{p.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{p.label}</span>
                        {active && <span className="status-dot" style={{ background: '#C9A84C', animation: 'pulse 1s infinite' }} />}
                        {!active && ok  && <span className="status-dot" style={{ background: '#30D158' }} />}
                        {!active && err && <span className="status-dot" style={{ background: '#FF453A' }} />}
                      </div>
                      <div style={{ fontSize: 12, color: '#636366' }}>{p.desc}</div>
                      <div style={{ fontSize: 11, color: '#3A3A3C', marginTop: 2, fontFamily: 'monospace' }}>env: {p.env}</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost"
                    onClick={() => trigger(p.key)}
                    disabled={active}
                    style={{ flexShrink: 0 }}
                  >
                    {active
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, border: '1.5px solid #636366', borderTopColor: '#C9A84C', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Running</span>
                      : '▶ Run'
                    }
                  </button>
                </div>

                {/* Result */}
                {res && (
                  <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: ok ? 'rgba(48,209,88,.08)' : 'rgba(255,69,58,.08)', border: `1px solid ${ok ? 'rgba(48,209,88,.2)' : 'rgba(255,69,58,.2)'}` }}>
                    {ok ? (
                      <div style={{ fontSize: 13, color: '#30D158', fontWeight: 600 }}>
                        ✓ Success — {
                          res.result?.movies != null
                            ? `${res.result.movies} movies, ${res.result.tv} TV shows`
                            : res.result?.count != null
                            ? `${res.result.count} items`
                            : 'Done'
                        } upserted
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: '#FF453A' }}>✗ {err || 'Unknown error'}</div>
                    )}
                    {res.result?.errors?.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#FF9F0A' }}>
                        Warnings: {res.result.errors.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 32, padding: '16px 20px', background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 12, fontSize: 12, color: '#636366', lineHeight: 1.7 }}>
          <strong style={{ color: '#C9A84C' }}>Crons run automatically:</strong> TMDB at 2am · PH at 5am · Pulse at 1am (all UTC).<br />
          Use this panel to seed the DB immediately without waiting. Items upsert by slug — safe to run multiple times.
        </div>

      </div>
    </>
  );
}
