export function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const CATEGORIES = [
  { id: 'movies', name: 'Movies & TV', icon: '🍿', desc: 'Blockbusters, indie films, and must-watch series.' },
  { id: 'books', name: 'Books', icon: '📚', desc: 'Bestsellers, classics, and essential reads.' },
  { id: 'ai-tools', name: 'AI Tools', icon: '✨', desc: 'The best AI tools for writing, coding, design, and more.' },
  { id: 'games', name: 'Games', icon: '🎮', desc: 'Console hits, indie gems, and free-to-play picks.' },
  { id: 'security', name: 'Cyber Security', icon: '🔐', desc: 'Tools, courses, and resources for security professionals.' },
  { id: 'videos', name: 'Videos', icon: '🎬', desc: 'Top channels, tutorials, and documentaries.' },
  { id: 'productivity', name: 'Productivity', icon: '⚡', desc: 'Apps and tools to get more done every day.' },
  { id: 'music', name: 'Music', icon: '🎵', desc: 'Artists, albums, and playlists worth your ears.' },
  { id: 'courses', name: 'Courses', icon: '🧠', desc: 'Online courses and learning platforms.' },
  { id: 'design', name: 'Design', icon: '🎨', desc: 'Design tools and inspiration.' },
  { id: 'science', name: 'Science', icon: '🔬', desc: 'Scientific discoveries and resources.' },
  { id: 'finance', name: 'Finance', icon: '📈', desc: 'Financial tools and investment resources.' },
  { id: 'news', name: 'News', icon: '📰', desc: 'News sources and journalism.' },
];

export function getCategoryInfo(catId) {
  return CATEGORIES.find(c => c.id === catId) || { id: catId, name: catId, icon: '📦', desc: '' };
}
