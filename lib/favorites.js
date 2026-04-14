import { supabase, getCurrentUser } from './supabase';
import { checkAnonLimit, getOrCreateAnonSession } from './auth';

function _anonId() {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('nova_anon_id'); } catch { return null; }
}

export async function addFavorite(itemId) {
  if (!supabase) return { success: false, error: 'Not ready.' };
  const user = await getCurrentUser();
  if (user) {
    try {
      const { error } = await supabase.from('favorites').insert({ item_id: itemId, user_id: user.id });
      if (error) {
        if (error.code === '23505') return { success: false, error: 'Already saved.' };
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  }
  const limitCheck = await checkAnonLimit('favorites');
  if (!limitCheck.allowed) return limitCheck;
  const session = await getOrCreateAnonSession();
  if (!session) return { success: false, error: 'Could not create session.' };
  try {
    const { error } = await supabase.from('favorites').insert({ item_id: itemId, anon_id: session.id });
    if (error) {
      if (error.code === '23505') return { success: false, error: 'Already saved.' };
      return { success: false, error: error.message };
    }
    supabase.from('anon_sessions').update({ favorites_count: (session.favorites_count || 0) + 1 })
      .eq('id', session.id).then(() => {}).catch(() => {});
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
}

export async function removeFavorite(itemId) {
  if (!supabase) return { success: false, error: 'Not ready.' };
  const user = await getCurrentUser();
  try {
    if (user) {
      await supabase.from('favorites').delete().eq('item_id', itemId).eq('user_id', user.id);
      return { success: true };
    }
    const anonId = _anonId();
    if (!anonId) return { success: false, error: 'No session.' };
    await supabase.from('favorites').delete().eq('item_id', itemId).eq('anon_id', anonId);
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
}

export async function isFavorited(itemId) {
  if (!supabase || !itemId) return false;
  const user = await getCurrentUser();
  try {
    if (user) {
      const { data } = await supabase.from('favorites').select('id').eq('item_id', itemId).eq('user_id', user.id).single();
      return !!data;
    }
    const id = _anonId();
    if (!id) return false;
    const { data } = await supabase.from('favorites').select('id').eq('item_id', itemId).eq('anon_id', id).single();
    return !!data;
  } catch { return false; }
}

export async function getAllFavorites() {
  if (!supabase) return [];
  const user = await getCurrentUser();
  try {
    if (user) {
      const { data } = await supabase.from('favorites').select('*, items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
      return (data || []).map(f => f.items).filter(Boolean);
    }
    const id = _anonId();
    if (!id) return [];
    const { data } = await supabase.from('favorites').select('*, items(*)').eq('anon_id', id).order('created_at', { ascending: false });
    return (data || []).map(f => f.items).filter(Boolean);
  } catch { return []; }
}
