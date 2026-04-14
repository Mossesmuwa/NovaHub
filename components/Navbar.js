import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase, getCurrentUser, getUserProfile } from '../lib/supabase';
import { logout } from '../lib/auth';

export default function Navbar({ activePage }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (u) {
        setUser(u);
        const profile = await getUserProfile(u.id);
        setUserName((profile && profile.display_name) || u.email.split('@')[0]);
      }
    })();
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      router.push(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : '';

  return (
    <nav className={`glass-nav${scrolled ? ' scrolled' : ''}`} id="main-nav">
      <div className="container nav-content">
        <Link href="/" className="logo">
          <img src="/assets/novahub_logo.svg" alt="NovaHub" className="logo-img" />
        </Link>
        <div className="nav-links">
          <div className="search-wrap">
            <div className="search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" id="global-search" placeholder="Search everything…" autoComplete="off" onKeyDown={handleSearch} />
            </div>
          </div>
          <Link href="/" className={`nav-link${activePage === 'home' ? ' active' : ''}`}>Home</Link>
          <Link href="/category" className={`nav-link${activePage === 'browse' ? ' active' : ''}`}>Browse</Link>
          <Link href="/discover" className={`nav-link${activePage === 'discover' ? ' active' : ''}`}>Discover</Link>
          <Link href="/blog" className={`nav-link${activePage === 'blog' ? ' active' : ''}`}>Blog</Link>
          <Link href="/weekly" className={`nav-link${activePage === 'weekly' ? ' active' : ''}`}>Weekly</Link>
        </div>
        <div className="nav-right">
          <div className="nav-auth-actions" id="nav-auth-actions">
            {user ? (
              <>
                <Link href="/account/dashboard" className="nav-user-btn" title="Dashboard">
                  <div className="nav-avatar">{initial}</div>
                  <span className="nav-username">{userName}</span>
                </Link>
                <button className="icon-btn" onClick={handleLogout} title="Sign out">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link href="/account/login" className="btn-ghost" style={{ fontSize: '13px', padding: '7px 14px' }}>Sign in</Link>
                <Link href="/account/register" className="btn-primary" style={{ fontSize: '13px', padding: '7px 16px' }}>Sign up</Link>
              </>
            )}
          </div>
          <button className="icon-btn" id="theme-btn" aria-label="Toggle theme" style={{ marginLeft: '4px' }}>
            <span id="theme-icon"></span>
          </button>
          <button className="mobile-btn" id="mobile-btn" aria-label="Open menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`} id="mobile-menu">
        <div className="mobile-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="mobile-search-input" placeholder="Search NovaHub…" autoComplete="off" onKeyDown={handleSearch} />
        </div>
        <Link href="/" className={`nav-link${activePage === 'home' ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Home</Link>
        <Link href="/category" className={`nav-link${activePage === 'browse' ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Browse</Link>
        <Link href="/discover" className={`nav-link${activePage === 'discover' ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Discover</Link>
        <Link href="/blog" className={`nav-link${activePage === 'blog' ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Blog</Link>
        <Link href="/weekly" className={`nav-link${activePage === 'weekly' ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>Weekly</Link>
        {!user && (
          <>
            <Link href="/account/login" className="nav-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
            <Link href="/account/register" className="nav-link" style={{ color: 'var(--gold)' }} onClick={() => setMobileOpen(false)}>Create Account</Link>
          </>
        )}
      </div>
    </nav>
  );
}
