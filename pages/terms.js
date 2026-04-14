import Layout from '../components/Layout';
import SEO from '../components/SEO';

export default function TermsPage() {
  return (
    <Layout>
      <SEO title="Terms of Service — NovaHub" description="NovaHub Terms of Service" />
      <div className="container" style={{ paddingTop: 'calc(var(--nav) + 40px)' }}>
        <div className="static-page-hero">
          <h1 className="static-page-title">Terms of Service</h1>
          <p className="static-page-sub">Read our terms and conditions for using NovaHub.</p>
        </div>
        <div className="content-box">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using NovaHub, you agree to comply with these terms of service. If you do not agree, please do not use our platform.</p>
          <h2>2. User Accounts</h2>
          <p>You may need to register an account to access certain features (like saving favorites across devices and leaving comments). You are responsible for keeping your account credentials secure. Any activity occurring under your account is your responsibility.</p>
          <h2>3. Content curation and accuracy</h2>
          <p>We leverage AI alongside human curation to build out the database and draft weekly digests. While we strive to present accurate and high-quality links (tools, movies, games), we cannot guarantee the complete accuracy or continued availability of third-party platforms linked from NovaHub.</p>
          <h2>4. Acceptable Use</h2>
          <p>You agree not to use the platform in ways that could damage, disable, overburden, or impair the service. Abusive behavior in comments, use of bots for scraping our curated database, or attempting to compromise the security of the application is strictly prohibited.</p>
          <h2>5. Disclaimer of Warranties</h2>
          <p>NovaHub is provided &quot;as is&quot;. We make no warranties regarding the uptime or continuity of the specific services, APIs or datasets you interact with through this site.</p>
          <p style={{ marginTop: '40px', fontSize: '13px', color: 'var(--gold)', fontWeight: 600 }}>Last updated: April 2026</p>
        </div>
      </div>
    </Layout>
  );
}
