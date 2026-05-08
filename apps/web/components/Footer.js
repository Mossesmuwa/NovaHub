import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img src="/assets/novahub_logo.svg" alt="NovaHub" className="logo-icon" /> NovaHub
            </div>
            <p className="footer-tagline">Your AI-powered discovery platform for everything worth your time. Updated daily.</p>
            <div className="footer-social">
              <a href="https://github.com/Mossesmuwa" target="_blank" rel="noopener" title="GitHub">⌥</a>
              <a href="https://www.instagram.com/mosses.muwa/" target="_blank" rel="noopener" title="Instagram">◈</a>
              <a href="#" title="Twitter / X">𝕏</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Discover</h4>
            <div className="footer-links">
              <Link href="/category?cat=movies">Movies &amp; TV</Link>
              <Link href="/category?cat=books">Books</Link>
              <Link href="/category?cat=ai-tools">AI Tools</Link>
              <Link href="/category?cat=games">Games</Link>
              <Link href="/category?cat=security">Cyber Security</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <div className="footer-links">
              <Link href="/discover">Vibe Discover</Link>
              <Link href="/weekly">The Weekly</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/search">Explore</Link>
              <Link href="/account/register">Create Account</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <div className="footer-links">
              <a href="https://github.com/Mossesmuwa" target="_blank" rel="noopener">GitHub</a>
              <a href="https://mossesmuwa.github.io" target="_blank" rel="noopener">Portfolio</a>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>NovaHub © 2026 — Built by Mosses Muwa</span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Discover Everything ✦</span>
        </div>
      </div>
    </footer>
  );
}
