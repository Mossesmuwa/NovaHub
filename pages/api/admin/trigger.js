// pages/api/admin/trigger.js
// Manually fires ingestion — only accessible to admin users.
// Called from pages/admin/trigger.js UI.

import { createClient } from '@supabase/supabase-js';
import { TMDBProvider }        from '../../../lib/ingest/TMDBProvider';
import { ProductHuntProvider } from '../../../lib/ingest/ProductHuntProvider';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const PROVIDERS = {
  tmdb:        () => new TMDBProvider({ limit: 20 }).sync(),
  producthunt: () => new ProductHuntProvider({ limit: 20 }).sync(),
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Verify caller is an authenticated admin
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return res.status(401).json({ error: 'Invalid session' });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return res.status(403).json({ error: 'Admin only' });

  const { provider } = req.body || {};
  if (!provider) {
    // Run all providers
    const results = {};
    for (const [key, fn] of Object.entries(PROVIDERS)) {
      try { results[key] = await fn(); }
      catch (e) { results[key] = { error: e.message }; }
    }
    return res.status(200).json({ success: true, results });
  }

  if (!PROVIDERS[provider]) {
    return res.status(400).json({ error: `Unknown provider: ${provider}. Use: ${Object.keys(PROVIDERS).join(', ')}` });
  }

  try {
    const result = await PROVIDERS[provider]();
    return res.status(200).json({ success: true, provider, result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
