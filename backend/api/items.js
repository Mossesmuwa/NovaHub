const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Fallback to empty strings if ENV is not set yet
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null;

// GET /api/items?category=xxx&limit=10
router.get('/', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Database connection not configured' });
  }

  const limit = parseInt(req.query.limit) || 20;
  const category = req.query.category;
  const trending = req.query.trending === 'true';

  try {
    let query = supabase.from('items').select('*').eq('approved', true);
    
    if (category && category !== 'all') {
      query = query.eq('type', category);
    }
    
    if (trending) {
      query = query.eq('trending', true);
    }
    
    const { data, error } = await query.limit(limit).order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, items: data });
  } catch (err) {
    console.error('[Items API Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/items/:slug
router.get('/:slug', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'DB missing' });
  
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('slug', req.params.slug)
      .single();
      
    if (error) throw error;
    res.json({ success: true, item: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
