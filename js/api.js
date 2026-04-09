/**
 * NovaHub API Client
 * Replaces direct frontend Supabase queries with calls to our Node.js backend.
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000/api'
  : '/api'; // For Vercel/Prod deployment

export const NovaAPI = {
  
  /**
   * Fetch items with optional category filtering and limit
   */
  async getItems(options = {}) {
    const { category = 'all', limit = 20, trending = false } = options;
    try {
      const url = new URL(`${API_BASE}/items`);
      if (category) url.searchParams.append('category', category);
      if (limit) url.searchParams.append('limit', limit);
      if (trending) url.searchParams.append('trending', 'true');
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      return data.success ? data.items : [];
    } catch (err) {
      console.error('[NovaAPI] getItems error:', err);
      return [];
    }
  },

  /**
   * Fetch specific item by slug
   */
  async getItemBySlug(slug) {
    try {
      const res = await fetch(`${API_BASE}/items/${slug}`);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      return data.success ? data.item : null;
    } catch (err) {
      console.error('[NovaAPI] getItemBySlug error:', err);
      return null;
    }
  },

  /**
   * Ping Claude AI for Vibe recommendations or AI Search
   */
  async getAIRecommendations(payload) {
    try {
      const res = await fetch(`${API_BASE}/ai-recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('[NovaAPI] getAIRecommendations error:', err);
      return { success: false, error: err.message };
    }
  }
};

window.NovaAPI = NovaAPI;
