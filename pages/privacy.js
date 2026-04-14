import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <Layout>
      <SEO title="Privacy Policy — NovaHub" description="NovaHub Privacy Policy" />
      <div className="container" style={{ paddingTop: 'calc(var(--nav) + 40px)' }}>
        <div className="static-page-hero">
          <h1 className="static-page-title">Privacy Policy</h1>
          <p className="static-page-sub">Understand how we collect, use, and protect your personal information.</p>
        </div>
        <div className="content-box">
          <h2>1. Information We Collect</h2>
          <p>When you use NovaHub, we may collect the following types of information:</p>
          <ul>
            <li><strong>Account Information:</strong> When you register an account, we collect your name, email address, and profile picture.</li>
            <li><strong>Usage Data:</strong> We automatically collect information about how you interact with our platform, including browser type, IP address, and pages visited.</li>
            <li><strong>Anonymous Sessions:</strong> Features that allow you to favorite or comment as an unregistered user utilize temporary anonymous IDs stored locally on your device.</li>
          </ul>
          <h2>2. How We Use Your Data</h2>
          <p>The information we collect is used to:</p>
          <ul>
            <li>Provide, maintain, and improve our services to you.</li>
            <li>Personalize the content you see on NovaHub.</li>
            <li>Understand and analyze how you use our services to develop new features.</li>
            <li>Communicate with you for customer support and platform updates.</li>
          </ul>
          <h2>3. Authentication and Security</h2>
          <p>Our backend and user authentication are powered by Supabase. We utilize industry-standard security practices such as strong encryption to ensure that your data is safe and protected against unauthorized access. We do not store your passwords locally; authentication is managed securely via JSON Web Tokens.</p>
          <h2>4. Cookies and Local Storage</h2>
          <p>We use cookies and local storage to help us keep you logged in, persist your site preferences (such as dark mode), and remember your history. You can adjust your browser settings to decline these files, but doing so may limit your experience on the website.</p>
          <h2>5. Changes to This Policy</h2>
          <p>We may update our Privacy Policy periodically to reflect any changes in our practices or legal obligations. When we do, we will post the new Privacy Policy on this page and revise the &quot;Last updated&quot; date below.</p>
          <p style={{ marginTop: '40px', fontSize: '13px', color: 'var(--gold)', fontWeight: 600 }}>Last updated: April 2026</p>
        </div>
      </div>
    </Layout>
  );
}
