import Layout from '../components/Layout';
import SEO from '../components/SEO';

export default function ContactPage() {
  return (
    <Layout>
      <SEO title="Contact Us — NovaHub" description="Get in touch with NovaHub." />
      <div className="container" style={{ paddingTop: 'calc(var(--nav) + 40px)' }}>
        <div className="static-page-hero">
          <h1 className="static-page-title">Contact Us</h1>
          <p className="static-page-sub">Have a question or wanting to request a new tool be added? Get in touch below.</p>
        </div>
        <div className="contact-wrap">
          <form onSubmit={e => { e.preventDefault(); alert('Message Sent! We will get back to you shortly.'); }}>
            <div className="input-grp">
              <label className="input-label">Full Name</label>
              <input type="text" className="input-field" placeholder="John Doe" required />
            </div>
            <div className="input-grp">
              <label className="input-label">Email Address</label>
              <input type="email" className="input-field" placeholder="email@example.com" required />
            </div>
            <div className="input-grp">
              <label className="input-label">Topic</label>
              <select className="input-field" required defaultValue="">
                <option value="" disabled>Select a topic...</option>
                <option value="general">General Inquiry</option>
                <option value="request">Suggest a tool or item</option>
                <option value="support">Technical Support</option>
                <option value="business">Business / Partnerships</option>
              </select>
            </div>
            <div className="input-grp">
              <label className="input-label">Message</label>
              <textarea className="input-field" placeholder="How can we help?" required></textarea>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>Send Message</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
