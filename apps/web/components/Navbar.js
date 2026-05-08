// components/Navbar.js
// Reads auth state from SupabaseContext — instant, no async, no flash.

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSupabase } from '../lib/SupabaseContext';
import { logout } from '../lib/auth';

export default function Navbar({ activePage }) {
  const router                        = useRouter();
  const { user, profile, loading }    = useSupabase();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef                       = useRef(null);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || '';
  const initial     = displayName ? displayName.charAt(0).toUpperCase() : '?';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [router.pathname]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      router.push(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    setDropOpen(false);
    await logout();
    window.location.href = '/';
  };

  // Auth section — three states: loading (skeleton), user, guest
  function AuthSection() {
    if (loading) {
      return (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--border2)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      );
    }

    if (user) {
      return (
        <div style={{ position: 'relative' }} ref={dropRef}>
          <button
            onClick={() => setDropOpen(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: dropOpen ? 'var(--surf2)' : 'var(--surf)',
              border: '1px solid var(--border2)',
              borderRadius: 99, padding: '4px 12px 4px 4px',
              cursor: 'pointer', transition: 'var(--ease)',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--gold-grad)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#09090C',
              flexShrink: 0,
            }}>
              {initial}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ color: 'var(--t3)', transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'var(--ease)', flexShrink: 0 }}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--bg2)', border: '1px solid var(--border2)',
              borderRadius: 'var(--r)', padding: '6px', minWidth: 200,
              boxShadow: '0 20px 60px rgba(0,0,0,.4)',
              zIndex: 999, animation: 'fadeInDown .15s ease',
            }}>
              {/* User info header */}
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{displayName}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{user.email}</div>
              </div>

              <DropItem href="/account/dashboard" icon="◈" label="Dashboard" onClick={() => setDropOpen(false)} />
              <DropItem href="/account/favorites" icon="♥" label="Saved Items" onClick={() => setDropOpen(false)} />
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 'var(--rsm)', border: 'none',
                  background: 'none', cursor: 'pointer', fontSize: 13,
                  color: '#FF453A', fontFamily: 'var(--font)', transition: 'var(--ease)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize: 14 }}>→</span> Sign out
              </button>
            </div>
          )}
        </div>
      );
    }

    // Guest
    return (
      <>
        <Link href="/account/login" className="btn-ghost" style={{ fontSize: 13, padding: '7px 14px' }}>Sign in</Link>
        <Link href="/account/register" className="btn-primary" style={{ fontSize: 13, padding: '7px 16px' }}>Sign up</Link>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      <nav className={`glass-nav${scrolled ? ' scrolled' : ''}`} id="main-nav">
        <div className="container nav-content">
          <Link href="/" className="logo">
            <img src="/assets/novahub_logo.svg" alt="NovaHub" className="logo-img" />
          </Link>

          <div className="nav-links">
            <div className="search-wrap">
              <div className="search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Search everything…" autoComplete="off" onKeyDown={handleSearch} />
              </div>
            </div>
            <Link href="/"         className={`nav-link${activePage === 'home'     ? ' active' : ''}`}>Home</Link>
            <Link href="/category" className={`nav-link${activePage === 'browse'   ? ' active' : ''}`}>Browse</Link>
            <Link href="/discover" className={`nav-link${activePage === 'discover' ? ' active' : ''}`}>Discover</Link>
            <Link href="/trending" className={`nav-link${activePage === 'trending' ? ' active' : ''}`}>Trending</Link>
            <Link href="/weekly"   className={`nav-link${activePage === 'weekly'   ? ' active' : ''}`}>Weekly</Link>
          </div>

          <div className="nav-right">
            <div className="nav-auth-actions">
              <AuthSection />
            </div>
            <button className="icon-btn" id="theme-btn" aria-label="Toggle theme" style={{ marginLeft: 4 }}>
              <span id="theme-icon" />
            </button>
            <button
              className="mobile-btn" aria-label="Open menu"
              aria-expanded={mobileOpen} onClick={() => setMobileOpen(p => !p)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
          <div className="mobile-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search NovaHub…" autoComplete="off" onKeyDown={handleSearch} />
          </div>
          {[
            { href: '/',         label: 'Home',      page: 'home' },
            { href: '/category', label: 'Browse',    page: 'browse' },
            { href: '/discover', label: 'Discover',  page: 'discover' },
            { href: '/trending', label: 'Trending',  page: 'trending' },
            { href: '/weekly',   label: 'Weekly',    page: 'weekly' },
          ].map(({ href, label, page }) => (
            <Link key={page} href={href} className={`nav-link${activePage === page ? ' active' : ''}`}>
              {label}
            </Link>
          ))}
          {!loading && !user && (
            <>
              <Link href="/account/login"    className="nav-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/account/register" className="nav-link" style={{ color: 'var(--gold)' }} onClick={() => setMobileOpen(false)}>Create Account</Link>
            </>
          )}
          {!loading && user && (
            <>
              <Link href="/account/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button className="nav-link" style={{ background: 'none', border: 'none', color: '#FF453A', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', fontSize: 15, padding: '12px 20px', width: '100%' }} onClick={handleLogout}>
                Sign out
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

function DropItem({ href, icon, label, onClick }) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 'var(--rsm)',
      fontSize: 13, color: 'var(--t1)', fontWeight: 500,
      textDecoration: 'none', transition: 'var(--ease)',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--surf2)'}
    onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <span style={{ fontSize: 14, color: 'var(--gold)' }}>{icon}</span>
      {label}
    </Link>
  );
}
