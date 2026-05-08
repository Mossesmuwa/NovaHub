// pages/contact.js
import { useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

const TOPICS = [
  { value: 'general',  label: 'General Inquiry', icon: '💬' },
  { value: 'request',  label: 'Suggest a tool or item', icon: '✦' },
  { value: 'support',  label: 'Technical Support', icon: '⚙' },
  { value: 'business', label: 'Business & Partnerships', icon: '◈' },
  { value: 'listing',  label: 'Featured Listing (B2B)', icon: '🚀' },
];

const FAQS = [
  { q: 'How do I get my tool listed on NovaHub?', a: 'Use the "Suggest a tool or item" topic above or check our B2B Featured Listing option for premium placement.' },
  { q: 'Is NovaHub free to use?', a: 'Yes — browsing, searching, and saving up to 10 items is free. Pro ($6/mo) unlocks unlimited saves, the full Vibe Dial, and personalised AI picks.' },
  { q: 'How often is content updated?', a: 'Movies and TV update nightly from TMDB. Tools update daily from Product Hunt. Our AI Weekly Digest publishes every Sunday.' },
];

export default function ContactPage() {
  const [form,   setForm]   = useState({ name: '', email: '', topic: '', message: '' });
  const [state,  setState]  = useState('idle'); // idle | loading | done | error
  const [errMsg, setErrMsg] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  function update(key, val) { setForm(p => ({ ...p, [key]: val })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.topic || !form.message) {
      setErrMsg('Please fill in all fields.'); return;
    }
    setState('loading'); setErrMsg('');
    try {
      // Send via Resend through a simple API route
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setState('done');
      } else {
        const d = await res.json().catch(() => ({}));
        setErrMsg(d.error || 'Something went wrong. Try again or email us directly.');
        setState('error');
      }
    } catch {
      setErrMsg('Network error. Please try again.');
      setState('error');
    }
  }

  return (
    <Layout>
      <SEO title="Contact — NovaHub" description="Get in touch with the NovaHub team." />

      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        .faq-item { border-bottom:1px solid var(--border); overflow:hidden; }
        .faq-item:last-child { border-bottom:none; }
        .contact-input { width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--rsm);padding:12px 14px;color:var(--t1);font-size:15px;font-family:var(--font);outline:none;transition:border-color var(--ease);box-sizing:border-box; }
        .contact-input:focus { border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-glow); }
        .contact-input::placeholder { color:var(--t3); }
        select.contact-input { cursor:pointer; }
        textarea.contact-input { resize:vertical;min-height:120px;line-height:1.6; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ padding: 'calc(var(--nav) + 48px) 0 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ paddingBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)', borderRadius: 99, padding: '5px 14px', fontSize: 11, fontWeight: 800, color: 'var(--gold)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 20 }}>
            ◈ Get in Touch
          </div>
          <h1 style={{ fontSize: 'clamp(28px,6vw,48px)', fontWeight: 900, letterSpacing: '-.04em', marginBottom: 10 }}>Contact Us</h1>
          <p style={{ fontSize: 16, color: 'var(--t2)', maxWidth: 480, lineHeight: 1.6 }}>
            Questions, suggestions, partnerships, or just want to say hi — we read every message.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 40 }}>

            {/* ── FORM ── */}
            <div>
              {state === 'done' ? (
                <div style={{ textAlign: 'center', padding: '48px 32px', background: 'var(--bg2)', border: '1px solid rgba(48,209,88,.2)', borderRadius: 'var(--rlg)' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Message sent!</h2>
                  <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 24 }}>
                    We&apos;ll get back to you within 24 hours. In the meantime, feel free to explore NovaHub.
                  </p>
                  <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => { setState('idle'); setForm({ name:'',email:'',topic:'',message:'' }); }}>
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Full name</label>
                      <input className="contact-input" type="text" placeholder="Your name" value={form.name} onChange={e => update('name', e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Email</label>
                      <input className="contact-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Topic</label>
                    <select className="contact-input" value={form.topic} onChange={e => update('topic', e.target.value)} required>
                      <option value="" disabled>Select a topic…</option>
                      {TOPICS.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Message</label>
                    <textarea className="contact-input" placeholder="How can we help?" value={form.message} onChange={e => update('message', e.target.value)} required />
                  </div>

                  {errMsg && (
                    <div style={{ padding: '10px 14px', background: 'rgba(255,69,58,.08)', border: '1px solid rgba(255,69,58,.2)', borderRadius: 'var(--rsm)', fontSize: 13, color: '#FF453A' }}>
                      {errMsg}
                    </div>
                  )}

                  <button className="btn-primary" type="submit" disabled={state === 'loading'} style={{ fontSize: 14, padding: '14px', justifyContent: 'center' }}>
                    {state === 'loading'
                      ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(9,9,12,.3)', borderTopColor: '#09090C', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Sending…</>
                      : 'Send Message ✦'
                    }
                  </button>
                </form>
              )}
            </div>

            {/* ── INFO + FAQ ── */}
            <div>
              {/* Quick contact pills */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '20px', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Other ways to reach us</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { icon: '📸', label: 'Instagram', val: '@mosses.muwa', href: 'https://www.instagram.com/mosses.muwa/' },
                    { icon: '💻', label: 'GitHub',    val: 'Mossesmuwa',   href: 'https://github.com/Mossesmuwa' },
                  ].map(l => (
                    <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--rsm)', textDecoration: 'none', color: 'var(--t1)', transition: 'var(--ease)' }}
                    >
                      <span style={{ fontSize: 16 }}>{l.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>{l.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{l.val}</div>
                      </div>
                      <span style={{ marginLeft: 'auto', color: 'var(--t3)', fontSize: 12 }}>→</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '20px' }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Quick answers</div>
                {FAQS.map((faq, i) => (
                  <div className="faq-item" key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: '12px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontFamily: 'var(--font)' }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', flex: 1 }}>{faq.q}</span>
                      <span style={{ fontSize: 14, color: 'var(--t3)', flexShrink: 0, transition: 'transform .2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                    </button>
                    {openFaq === i && (
                      <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.65, paddingBottom: 12 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
