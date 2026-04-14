import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase, getCurrentUser, getUserProfile } from '../../lib/supabase';
import * as Auth from '../../lib/auth';
import * as Favorites from '../../lib/favorites';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('favorites');
  const [favs, setFavs] = useState([]);
  const [lists, setLists] = useState([]);
  const [sName, setSName] = useState('');
  const [sBio, setSBio] = useState('');
  const [sWeb, setSWeb] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [pw, setPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) { router.replace('/account/login?return=/account/dashboard'); return; }
      setUser(u);
      const p = await getUserProfile(u.id);
      setProfile(p);
      if (p) { setSName(p.display_name || ''); setSBio(p.bio || ''); setSWeb(p.website || ''); }
      const items = await Favorites.getAllFavorites();
      setFavs(items);
      if (supabase) {
        const { data } = await supabase.from('lists').select('*').eq('user_id', u.id).order('created_at', { ascending: false });
        setLists(data || []);
      }
      setLoading(false);
    })();
  }, []);

  const name = (profile?.display_name) || (user?.email?.split('@')[0]) || 'User';
  const initial = name.charAt(0).toUpperCase();

  async function removeSaved(itemId) {
    await Favorites.removeFavorite(itemId);
    setFavs(prev => prev.filter(i => i.id !== itemId));
  }

  async function createList() {
    const n = prompt('Name your new list:');
    if (!n || !n.trim() || !supabase || !user) return;
    await supabase.from('lists').insert({ user_id: user.id, name: n.trim() });
    const { data } = await supabase.from('lists').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setLists(data || []);
  }

  async function saveProfile() {
    if (!supabase || !user) return;
    const { error } = await supabase.from('profiles').update({
      display_name: sName, bio: sBio, website: sWeb, updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    setProfileMsg(error ? 'Error saving. Try again.' : '✦ Saved!');
    setTimeout(() => setProfileMsg(''), 3000);
  }

  async function changePassword() {
    if (pw.length < 8) { setPwMsg('Password must be at least 8 characters.'); return; }
    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwMsg(error ? error.message : '✦ Password updated!');
    if (!error) setPw('');
    setTimeout(() => setPwMsg(''), 3000);
  }

  function renderSaved(item) {
    const href = `/item/${encodeURIComponent(item.slug)}`;
    const isPoster = ['movie','book','game'].includes(item.type);
    if (isPoster) {
      return (
        <div style={{ position: 'relative' }} key={item.id}>
          <Link href={href} className="card-poster"><div className="bg-zoom" style={{ backgroundImage: `url('${item.image || ''}')` }}></div><div className="card-poster-content"><div className="card-poster-title">{item.name}</div>{item.rating && <div className="card-poster-rating">★ {item.rating}</div>}</div></Link>
          <button className="remove-btn" onClick={() => removeSaved(item.id)} title="Remove">✕</button>
        </div>
      );
    }
    return (
      <div className="card" key={item.id} onClick={() => router.push(href)} style={{ cursor: 'pointer' }}>
        <div className="card-icon">{(item.name || '?').charAt(0)}</div>
        <div className="card-title">{item.name}</div>
        <p className="card-desc">{item.short_desc || ''}</p>
      </div>
    );
  }

  if (loading) return <Layout><SEO title="Dashboard — NovaHub" /><div style={{ textAlign: 'center', padding: '120px', color: 'var(--t3)' }}>Loading your dashboard…</div></Layout>;

  return (
    <Layout>
      <SEO title="Dashboard — NovaHub" />
      <div className="dash-header"><div className="dash-bg"></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="avatar-lg">{initial}</div>
          <div className="dash-name">{name}</div>
          <div className="dash-email">{user?.email}</div>
          <div className="dash-stats">
            <div className="dash-stat"><span className="dash-stat-num">{favs.length}</span><div className="dash-stat-label">Saved</div></div>
            <div className="dash-stat"><span className="dash-stat-num">{lists.length}</span><div className="dash-stat-label">Lists</div></div>
            <div className="dash-stat"><span className="dash-stat-num">{user?.created_at ? new Date(user.created_at).getFullYear() : '—'}</span><div className="dash-stat-label">Joined</div></div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div className="dash-tabs">
            <button className={`dash-tab${tab === 'favorites' ? ' active' : ''}`} onClick={() => setTab('favorites')}>♥ Saved</button>
            <button className={`dash-tab${tab === 'lists' ? ' active' : ''}`} onClick={() => setTab('lists')}>📋 Lists</button>
            <button className={`dash-tab${tab === 'settings' ? ' active' : ''}`} onClick={() => setTab('settings')}>⚙ Settings</button>
          </div>
          {tab === 'favorites' && (
            <div style={{ minHeight: '200px' }}>
              {!favs.length ? (
                <div className="empty-state"><span className="empty-icon">♡</span><h3>No saved items yet</h3><p>Browse NovaHub and save things you love.</p><Link href="/" className="btn-primary">Discover Now</Link></div>
              ) : (
                <div className={favs.some(i => ['movie','book','game'].includes(i.type)) ? 'grid-4' : 'grid-3'}>{favs.map(renderSaved)}</div>
              )}
            </div>
          )}
          {tab === 'lists' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>My Lists</h3>
                <button className="btn-primary" style={{ fontSize: '13px', padding: '9px 18px' }} onClick={createList}>+ New List</button>
              </div>
              {!lists.length ? (
                <div className="empty-state"><span className="empty-icon">📋</span><h3>No lists yet</h3><p>Create curated lists to share with others.</p><button className="btn-primary" onClick={createList}>Create First List</button></div>
              ) : (
                <div className="grid-3">{lists.map(l => (
                  <div className="card" key={l.id}><div className="card-icon">📋</div><div className="card-title">{l.name}</div><p className="card-desc">{l.description || 'No description'} · {l.item_count || 0} items</p><div style={{ marginTop: '10px' }}><span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', background: 'var(--surf)', border: '1px solid var(--border)', color: 'var(--t3)' }}>{l.is_public ? '🌍 Public' : '🔒 Private'}</span></div></div>
                ))}</div>
              )}
            </div>
          )}
          {tab === 'settings' && (
            <div>
              <div className="settings-card"><h3>Profile</h3>
                <div className="form-group"><label className="form-label">Display Name</label><input className="form-input" type="text" value={sName} onChange={e => setSName(e.target.value)} placeholder="Your name" /></div>
                <div className="form-group"><label className="form-label">Bio</label><input className="form-input" type="text" value={sBio} onChange={e => setSBio(e.target.value)} placeholder="Tell people about yourself" /></div>
                <div className="form-group"><label className="form-label">Website</label><input className="form-input" type="url" value={sWeb} onChange={e => setSWeb(e.target.value)} placeholder="https://yoursite.com" /></div>
                <button className="btn-primary" style={{ fontSize: '13px', padding: '10px 20px', width: 'auto', display: 'inline-flex' }} onClick={saveProfile}>Save Changes</button>
                {profileMsg && <div className="form-msg" style={{ display: 'block', marginTop: '10px', color: profileMsg.includes('Error') ? '#FF453A' : '#30D158' }}>{profileMsg}</div>}
              </div>
              <div className="settings-card"><h3>Change Password</h3>
                <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 8 characters" /></div>
                <button className="btn-primary" style={{ fontSize: '13px', padding: '10px 20px', width: 'auto', display: 'inline-flex' }} onClick={changePassword}>Update Password</button>
                {pwMsg && <div className="form-msg" style={{ display: 'block', marginTop: '10px', color: pwMsg.includes('✦') ? '#30D158' : '#FF453A' }}>{pwMsg}</div>}
              </div>
              <div className="danger-zone"><h3>Danger Zone</h3><p>Signing out will end your session on this device.</p><button className="btn-danger" onClick={() => { Auth.logout(); router.push('/'); }}>Sign Out of NovaHub</button></div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
