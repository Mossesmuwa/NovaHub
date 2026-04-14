import { supabase, getCurrentUser, getUserProfile } from './supabase';
import { checkAnonLimit, getOrCreateAnonSession } from './auth';

const BLOCKED = ['spam','casino','porn','xxx','scam','phishing','free money','click here'];

function _moderate(text) {
  if (!text || text.trim().length < 3) return { ok: false, reason: 'Comment is too short.' };
  if (text.trim().length > 1200) return { ok: false, reason: 'Comment is too long (max 1200 chars).' };
  const lower = text.toLowerCase();
  for (const word of BLOCKED) {
    if (lower.includes(word)) return { ok: false, reason: 'Comment contains inappropriate content.' };
  }
  return { ok: true };
}

function _randomName() {
  const adj = ['Quick','Bold','Bright','Sharp','Clever','Calm','Brave','Witty','Swift','Keen'];
  const noun = ['Fox','Owl','Panda','Eagle','Wolf','Bear','Lynx','Hawk','Deer','Raven'];
  return adj[Math.floor(Math.random() * adj.length)] + noun[Math.floor(Math.random() * noun.length)] + (Math.floor(Math.random() * 99) + 1);
}

export function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  if (h < 24) return h + 'h ago';
  if (d < 30) return d + 'd ago';
  return new Date(ts).toLocaleDateString();
}

export async function postComment(itemId, text) {
  if (!supabase) return { success: false, error: 'Not ready.' };
  const check = _moderate(text);
  if (!check.ok) return { success: false, error: check.reason };
  const user = await getCurrentUser();

  if (!user) {
    const limitCheck = await checkAnonLimit('comments');
    if (!limitCheck.allowed) return { success: false, error: limitCheck.reason, showUpgrade: true };
    const session = await getOrCreateAnonSession();
    if (!session) return { success: false, error: 'Could not create session.' };
    try {
      const { data, error } = await supabase.from('comments').insert({
        item_id: itemId, anon_id: session.id, author_name: _randomName(), content: text.trim(),
      }).select().single();
      if (error) return { success: false, error: error.message };
      const today = new Date().toISOString().split('T')[0];
      const isToday = session.last_comment_date === today;
      supabase.from('anon_sessions').update({
        comments_today: isToday ? (session.comments_today || 0) + 1 : 1,
        last_comment_date: today,
      }).eq('id', session.id).then(() => {}).catch(() => {});
      return { success: true, comment: data };
    } catch (e) { return { success: false, error: e.message }; }
  }

  try {
    const profile = await getUserProfile(user.id);
    const authorName = (profile && profile.display_name) || user.email.split('@')[0];
    const { data, error } = await supabase.from('comments').insert({
      item_id: itemId, user_id: user.id, author_name: authorName, content: text.trim(),
    }).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, comment: data };
  } catch (e) { return { success: false, error: e.message }; }
}

export async function getComments(itemId) {
  if (!supabase || !itemId) return [];
  try {
    const { data } = await supabase.from('comments').select('*')
      .eq('item_id', itemId).eq('is_flagged', false).order('created_at', { ascending: false });
    return data || [];
  } catch { return []; }
}

export async function toggleCommentLike(commentId) {
  if (!supabase) return;
  const user = await getCurrentUser();
  let anonId = null;
  if (typeof window !== 'undefined') {
    try { anonId = localStorage.getItem('nova_anon_id'); } catch {}
  }
  if (!user && !anonId) {
    const s = await getOrCreateAnonSession();
    if (s) anonId = s.id;
  }
  const record = user ? { comment_id: commentId, user_id: user.id } : { comment_id: commentId, anon_id: anonId };
  try {
    const { error } = await supabase.from('comment_likes').insert(record);
    if (error && error.code === '23505') {
      if (user) await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id);
      else if (anonId) await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('anon_id', anonId);
      return { liked: false };
    }
    return { liked: true };
  } catch { return { liked: false }; }
}
