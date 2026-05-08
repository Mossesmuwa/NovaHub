import { useState, useEffect } from 'react';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as Auth from '../../lib/auth';
import { getCurrentUser } from '../../lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { getCurrentUser().then(u => { if (u) router.replace('/account/dashboard'); }); }, []);

  async function doRegister(e) {
    if (e) e.preventDefault();
    setErr(''); setOk('');
    if (!name) { setErr('Please enter your name.'); return; }
    if (!email) { setErr('Please enter your email.'); return; }
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const result = await Auth.register(email, password, name);
    setLoading(false);
    if (!result.success) { setErr(result.error); return; }
    setOk('✦ Account created! Check your email to verify it, then sign in →');
  }

  return (
    <>
      <SEO title="Create Account — NovaHub" />
      <div className="top-bar">
        <Link href="/"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg> NovaHub</Link>
        <button className="icon-btn" id="theme-btn"><span id="theme-icon"></span></button>
      </div>
      <div className="page-wrap">
        <div className="page-bg"></div>
        <div className="auth-card">
          <div className="auth-logo"><img src="/assets/novahub_logo.svg" alt="NovaHub" style={{ height: '28px', width: 'auto', display: 'block' }} /></div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Free forever. No credit card.</p>
          <div className="perks">
            <div className="perk"><span className="perk-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></span><strong>Unlimited Saves</strong>Save as many items as you want</div>
            <div className="perk"><span className="perk-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span><strong>AI Recs</strong>Personalised to your taste</div>
            <div className="perk"><span className="perk-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m0 0H3m16 0h2a2 2 0 0 1 2 2v4m0 0v6a2 2 0 0 1-2 2h-4m-6 0H5a2 2 0 0 1-2-2v-6m0 0H3m14 0h2"/></svg></span><strong>Lists</strong>Create and share lists</div>
            <div className="perk"><span className="perk-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64M3.51 15A9 9 0 0 0 18.36 18.36"/></svg></span><strong>Sync</strong>Any device, anytime</div>
          </div>
          <button className="btn-oauth" onClick={() => Auth.loginWithGoogle()}><svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Sign up with Google</button>
          <button className="btn-oauth" onClick={() => Auth.loginWithGithub()}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>Sign up with GitHub</button>
          <button className="btn-oauth" onClick={() => Auth.loginWithApple()}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 13.5c-.91 0-1.82.55-2.25 1.45.88.5 1.45 1.45 1.45 2.55 0 1.64-1.34 2.95-3 2.95s-3-1.31-3-2.95c0-1.1.57-2.05 1.45-2.55-.43-.9-1.34-1.45-2.25-1.45-1.64 0-3 1.34-3 3 0 .64.2 1.23.54 1.75-.3.45-.48.99-.48 1.55 0 1.64 1.34 3 3 3 1.1 0 2.05-.57 2.55-1.45.45.3.99.45 1.55.45 1.64 0 3-1.34 3-3 0-.56-.18-1.1-.48-1.55.34-.52.54-1.11.54-1.75 0-1.66-1.34-3-3-3zm-3 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>Sign up with Apple</button>
          <div className="divider-row"><span>or create with email</span></div>
          {err && <div className="form-err show">{err}</div>}
          {ok && <div className="form-ok show">{ok}</div>}
          <form onSubmit={doRegister}>
            <div className="form-group"><label className="form-label" htmlFor="name">Your name</label><input className="form-input" type="text" id="name" placeholder="Mosses" autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="form-group"><label className="form-label" htmlFor="email">Email address</label><input className="form-input" type="email" id="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="form-group"><label className="form-label" htmlFor="password">Password</label><input className="form-input" type="password" id="password" placeholder="At least 8 characters" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create Free Account'}</button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--t3)', marginTop: '14px', lineHeight: 1.5 }}>By signing up you agree to our <Link href="/privacy" style={{ color: 'var(--gold)' }}>Privacy Policy</Link> and <Link href="/terms" style={{ color: 'var(--gold)' }}>Terms</Link>.</p>
          <div className="auth-footer">Already have an account? <Link href="/account/login">Sign in</Link></div>
        </div>
      </div>
    </>
  );
}
