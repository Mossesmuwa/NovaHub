// pages/terms.js
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { StaticPage } from './privacy';

const SECTIONS = [
  {
    title: 'Acceptance of terms',
    icon: '◈',
    body: 'By accessing and using NovaHub, you agree to comply with these terms. If you do not agree with any part, please do not use the platform.',
  },
  {
    title: 'User accounts',
    icon: '◉',
    body: "You may need an account to access certain features like saving items across devices and leaving comments. You're responsible for keeping your credentials secure. Any activity under your account is your responsibility.",
  },
  {
    title: 'Content and accuracy',
    icon: '◫',
    body: "We use AI alongside human curation to build our database and weekly digest. While we strive for accuracy, we cannot guarantee the continued availability of third-party platforms linked from NovaHub. Content is provided for informational purposes.",
  },
  {
    title: 'Acceptable use',
    icon: '◎',
    content: [
      { text: 'Do not use bots to scrape our curated database.' },
      { text: 'Do not attempt to compromise the security of the application.' },
      { text: 'Do not engage in abusive behavior in comments.' },
      { text: 'Do not misrepresent yourself or your affiliation with any entity.' },
    ],
  },
  {
    title: 'Pro subscription',
    icon: '◐',
    body: "Nova Pro is billed monthly via Stripe. You can cancel anytime — your Pro access continues until the end of the billing period. We don't offer refunds for partial months, but we're flexible if something goes wrong.",
  },
  {
    title: 'Disclaimer',
    icon: '✦',
    body: 'NovaHub is provided "as is." We make no warranties regarding uptime or the continued availability of specific APIs or datasets. We are not liable for any indirect, incidental, or consequential damages.',
  },
];

export default function TermsPage() {
  return (
    <Layout>
      <SEO title="Terms of Service — NovaHub" />
      <StaticPage
        badge="Legal"
        title="Terms of Service"
        subtitle="Read our terms and conditions for using NovaHub."
        sections={SECTIONS}
        date="April 2026"
        other={{ label: 'Privacy Policy', href: '/privacy' }}
      />
    </Layout>
  );
}
