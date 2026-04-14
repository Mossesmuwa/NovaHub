import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Link from 'next/link';

export default function Custom404() {
  return (
    <Layout>
      <SEO title="404 — NovaHub" description="Page not found on NovaHub." />
      <div className="not-found-wrapper">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Lost in Space</h1>
        <p className="not-found-desc">We couldn&apos;t track down the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.</p>
        <div className="not-found-actions">
          <Link href="/" className="btn-primary">Return Home ✦</Link>
          <Link href="/search" className="btn-ghost">Search Hub</Link>
        </div>
      </div>
    </Layout>
  );
}
