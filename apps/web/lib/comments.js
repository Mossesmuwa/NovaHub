import { supabase, getCurrentUser, getUserProfile } from './supabase';

const BLOCKED = ['spam', 'casino', 'porn', 'xxx', 'scam', 'phishing', 'free money', 'click here'];

function _moderate(text) {
  if (!text || text.trim().length < 3) return { ok: false, reason: 'Comment is too short.' };
  if (text.trim().length > 1200) return { ok: false, reason: 'Comment is too long (max 1200 chars).' };
  const lower = text.toLowerCase();
  for (const word of BLOCKED) {
    if (lower.includes(word)) return { ok: false, reason: 'Comment contains inappropriate content.' };
  }
  return { ok: true };
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
  if (!user) return { success: false, error: 'Please log in to post comments.' };

  try {
    const profile = await getUserProfile(user.id);
    const authorName = (profile && profile.display_name) || user.email.split('@')[0];
    const { data, error } = await supabase.from('comments').insert({
      item_id: itemId, user_id: user.id, author_name: authorName, content: text.trim(),
    }).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, comment: data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function getComments(itemId) {
  // Public — no auth required
  if (!supabase || !itemId) return [];
  try {
    const { data } = await supabase.from('comments').select('*')
      .eq('item_id', itemId).eq('is_flagged', false).order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

export async function toggleCommentLike(commentId) {
  if (!supabase) return { liked: false };
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Please log in to like comments.' };
  try {
    const { error } = await supabase.from('comment_likes').insert({
      comment_id: commentId, user_id: user.id,
    });
    if (error && error.code === '23505') {
      await supabase.from('comment_likes').delete()
        .eq('comment_id', commentId).eq('user_id', user.id);
      return { liked: false };
    }
    return { liked: true };
  } catch {
    return { liked: false };
  }
}
