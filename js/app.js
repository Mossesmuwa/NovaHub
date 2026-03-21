// js/app.js — NovaHub Application Router, Renderer & Interaction Engine

const appRoot = document.getElementById('app-root');

// =====================================================================
// ROUTER
// =====================================================================
function getPath() { return window.location.hash.substring(1) || '/'; }

const router = () => {
  const path = getPath();
  // Page transition: fade out then in
  appRoot.style.opacity = '0';
  appRoot.style.transform = 'translateY(12px)';
  setTimeout(() => {
    appRoot.innerHTML = '';
    appRoot.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)';
    appRoot.style.opacity = '1';
    appRoot.style.transform = 'translateY(0)';

    const routes = {
      '/':           renderHome,
      '/categories': renderCategoriesWrapper,
      '/blog':       renderBlogList,
    };

    if (routes[path]) {
      appRoot.innerHTML = routes[path]();
    } else if (path.startsWith('/category/')) {
      appRoot.innerHTML = renderCategoryDetail(path.split('/')[2]);
    } else if (path.startsWith('/item/')) {
      appRoot.innerHTML = renderItemDetail(path.split('/')[2]);
    } else if (path.startsWith('/search')) {
      const q = decodeURIComponent((path.split('?q=')[1] || ''));
      appRoot.innerHTML = renderSearch(q);
      const si = document.getElementById('global-search');
      if (si) si.value = q;
    } else if (path.startsWith('/blog/')) {
      appRoot.innerHTML = renderBlogPost(path.split('/')[2]);
    } else {
      appRoot.innerHTML = "<div class='page-header'><h1 class='title-xl'>404</h1><p class='subtitle'>This page doesn't exist.</p><a href='#/' class='btn-primary'>Back Home</a></div>";
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    initPageScripts(path);
    updateNavActive(path);
    initScrollReveal();
    initCardInteractions();
    rippleAllButtons();
  }, 120);
};

window.addEventListener('hashchange', router);
document.addEventListener('DOMContentLoaded', () => {
  initGlobalNav();
  router();
});

// =====================================================================
// HOME PAGE
// =====================================================================
function renderHome() {
  const trending  = NOVAHUB_DATA.items.filter(i => i.trending).slice(0, 14);
  const picks     = NOVAHUB_DATA.items.filter(i => i.dailyPick).slice(0, 6);
  const movies    = NOVAHUB_DATA.items.filter(i => i.categoryId === 'movies').slice(0, 6);
  const books     = NOVAHUB_DATA.items.filter(i => i.categoryId === 'books').slice(0, 6);
  const games     = NOVAHUB_DATA.items.filter(i => i.categoryId === 'games').slice(0, 6);
  const videos    = NOVAHUB_DATA.items.filter(i => i.categoryId === 'videos').slice(0, 8);
  const aiTools   = NOVAHUB_DATA.items.filter(i => i.categoryId === 'ai-tools').slice(0, 6);
  const latestBlog= NOVAHUB_DATA.blogPosts.slice(0, 2);
  const heroCats  = NOVAHUB_DATA.categories.map(c =>
    "<a href='#/category/" + c.id + "' class='hero-cat-btn'>" + c.icon + " " + c.name + "</a>"
  ).join('');
  const trendingCarousel = trending.map(i => {
    const isPoster = ['movie','book','game'].includes(i.type);
    const cls = isPoster ? 'carousel-item-poster' : 'carousel-item-card';
    return "<div class='" + cls + " reveal-scale'>" + renderCard(i) + "</div>";
  }).join('');

  return "" +
    "<div class='container'>" +
      "<div class='hero-banner reveal'>" +
        "<h1>Discover Everything<br>You Need</h1>" +
        "<p>Movies, Books, AI Tools, Games, Videos — your personalized global discovery hub.</p>" +
        "<div class='hero-cats'>" + heroCats + "</div>" +
      "</div>" +
    "</div>" +

    "<div class='container section'>" +
      "<div class='section-header reveal'><div class='section-title'>🔥 Trending Now</div><a href='#/categories' class='btn-secondary' style='font-size:13px;padding:8px 16px;'>Browse all ➔</a></div>" +
      "<div class='carousel-wrapper'><div class='carousel-track stagger'>" + trendingCarousel + "</div></div>" +
    "</div>" +

    "<div class='container section'>" +
      "<div class='picks-banner reveal'>" +
        "<span class='picks-banner-icon'>⭐</span>" +
        "<div><div style='font-weight:800;font-size:17px;'>Daily Picks</div><div style='color:var(--text-secondary);font-size:14px;margin-top:2px;'>Hand-curated by our editors — refreshed every day.</div></div>" +
      "</div>" +
      "<div class='grid-4 stagger'>" + picks.map(i => "<div class='reveal-scale'>" + renderCard(i) + "</div>").join('') + "</div>" +
    "</div>" +

    buildSection('movies',  '🍿 Movies & TV',      movies,  'grid-4') +
    buildSection('books',   '📚 Books',             books,   'grid-4') +
    "<div class='container section reveal'>" + renderAIWidget() + "</div>" +
    buildSection('ai-tools','✨ AI Tools',           aiTools, 'grid-3') +
    buildSection('games',   '🎮 Trending Games',    games,   'grid-4') +

    "<div class='container section'>" +
      "<div class='section-header reveal'><div class='section-title'>🎬 Videos & Tutorials</div><a href='#/category/videos' class='btn-secondary' style='font-size:13px;padding:8px 16px;'>See all ➔</a></div>" +
      "<div class='carousel-wrapper'><div class='carousel-track'>" +
        videos.map(i => "<div class='carousel-item-wide reveal-scale'>" + renderCard(i) + "</div>").join('') +
      "</div></div>" +
    "</div>" +

    "<div class='container section'>" +
      "<div class='section-header reveal'><div class='section-title'>📝 Latest Insights</div><a href='blog.html' class='btn-secondary' style='font-size:13px;padding:8px 16px;'>See all ➔</a></div>" +
      "<div class='grid-2'>" + latestBlog.map(p => "<div class='reveal'>" + renderBlogSummaryCard(p) + "</div>").join('') + "</div>" +
    "</div>" +

    "<div class='container section'>" +
      "<div class='section-header reveal'><div class='section-title'>📰 Tech &amp; AI News</div><span style='font-size:13px;color:var(--text-secondary);'>Updated Daily</span></div>" +
      "<div id='home-news-grid'></div>" +
    "</div>";
}

function buildSection(catId, title, items, grid) {
  return "<div class='container section'>" +
    "<div class='section-header reveal'><div class='section-title'>" + title + "</div><a href='category.html?cat=" + catId + "' class='btn-secondary' style='font-size:13px;padding:8px 16px;'>See all ➔</a></div>" +
    "<div class='" + grid + " stagger'>" + items.map(i => "<div class='reveal-scale'>" + renderCard(i) + "</div>").join('') + "</div>" +
    "</div>";
}

// =====================================================================
// CARD RENDERERS
// =====================================================================
function renderCard(item) {
  switch (item.type) {
    case 'movie': case 'book': case 'game': return renderPosterCard(item);
    case 'video':  return renderVideoCard(item);
    default:       return renderToolCard(item);
  }
}

function renderPosterCard(item) {
  const badge = item.trending ? "<span class='badge badge-trending'>🔥 Hot</span>"
              : item.dailyPick ? "<span class='badge badge-pick'>⭐ Pick</span>" : '';
  const rating = item.rating ? "<div class='card-poster-rating'>★ " + item.rating + "</div>" : '';
  const sub = item.director || item.author || item.developer || item.genre || '';
  const actionBtn = item.watchLink || item.buyLink || item.playLink
    ? "<a href='" + (item.watchLink || item.buyLink || item.playLink) + "' target='_blank' class='btn-primary btn-" + (item.watchLink ? 'watch' : item.buyLink ? 'buy' : 'play') + "' style='font-size:12px;padding:6px 14px;' onclick='event.stopPropagation()'>" +
        (item.watchLink ? '▶ Watch' : item.buyLink ? '🛒 Buy' : '🎮 Play') + "</a>"
    : '';

  return "<a href='item.html?id=" + encodeURIComponent(item.id) + "' class='card-poster' style='background-image:url(\"" + (item.image || '') + "\");display:block;'>" +
    "<div class='bg-zoom' style='background-image:url(\"" + (item.image || '') + "\");'></div>" +
    badge +
    "<div class='card-poster-actions'>" + actionBtn + "</div>" +
    "<div class='card-poster-content'>" +
      "<div class='card-poster-title'>" + (item.name || '') + "</div>" +
      (sub ? "<div class='card-poster-sub'>" + sub + "</div>" : '') +
      rating +
    "</div>" +
  "</a>";
}

function renderVideoCard(item) {
  return "<a href='item.html?id=" + encodeURIComponent(item.id) + "' class='card-video' style='display:block;text-decoration:none;'>" +
    "<div class='card-video-thumb' style='background-image:url(\"" + (item.image || '') + "\");'></div>" +
    "<div class='card-video-body'>" +
      "<div class='card-video-title'>" + (item.name || '') + "</div>" +
      "<div class='card-video-meta'>" + (item.platform || '') + " · " + (item.category || '') + "</div>" +
    "</div>" +
  "</a>";
}

function renderToolCard(item) {
  const pc = item.pricing && item.pricing.toLowerCase().includes('free') ? 'tag-free' : 'tag-paid';
  const href = 'item.html?id=' + encodeURIComponent(item.id);
  return "<div class='card' onclick=\"window.location.href='" + href + "'\">" +
    "<div class='card-header'>" +
      "<div class='card-icon'>" + (item.name ? item.name.charAt(0) : '?') + "</div>" +
      "<div><div class='card-title'>" + (item.name || '') + "</div><span class='tag " + pc + "'>" + (item.pricing || 'Free') + "</span></div>" +
    "</div>" +
    "<p class='card-desc'>" + (item.shortDesc || '') + "</p>" +
    "<div class='card-actions'>" +
      "<a href='" + href + "' class='btn-secondary' style='font-size:13px;padding:8px 16px;' onclick='event.stopPropagation()'>Details</a>" +
      "<a href='" + (item.affiliateLink || '#') + "' target='_blank' class='btn-primary' style='font-size:13px;padding:8px 16px;' onclick='event.stopPropagation()'>Get ➔</a>" +
    "</div>" +
  "</div>";
}

function renderBlogSummaryCard(p) {
  return "<a href='post.html?id=" + p.id + "' class='blog-card' style='display:flex;text-decoration:none;'>" +
    "<div class='blog-card-img' style='background-image:url(\"" + p.image + "\");'></div>" +
    "<div class='blog-card-body'>" +
      "<div class='blog-card-cat'>" + p.category + "</div>" +
      "<div class='blog-card-title'>" + p.title + "</div>" +
      "<div class='blog-card-excerpt'>" + p.excerpt + "</div>" +
      "<div class='blog-card-date'>By " + p.author + " · " + p.date + "</div>" +
    "</div>" +
  "</a>";
}

// =====================================================================
// SEARCH
// =====================================================================
function renderSearch(query) {
  const q = (query || '').toLowerCase().trim();
  const results = q.length < 2
    ? NOVAHUB_DATA.items.filter(i => i.trending).slice(0, 24)
    : NOVAHUB_DATA.items.filter(i =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.shortDesc || '').toLowerCase().includes(q) ||
        (i.genre || '').toLowerCase().includes(q) ||
        (i.author || '').toLowerCase().includes(q)
      );

  return "<div class='page-header'>" +
    "<h1 class='title-xl'>" + (q ? "\"" + query + "\"" : "Explore") + "</h1>" +
    "<p class='subtitle'>" + results.length + " result" + (results.length !== 1 ? 's' : '') + " found.</p>" +
  "</div>" +
  "<div class='container' style='padding-bottom:80px;'>" +
    (results.length === 0 ? "<p style='text-align:center;color:var(--text-secondary);padding:80px 0;font-size:20px;'>No results for \"" + query + "\"</p>" : '') +
    "<div class='grid-4 stagger'>" + results.map(i => "<div class='reveal-scale'>" + renderCard(i) + "</div>").join('') + "</div>" +
  "</div>";
}

// =====================================================================
// CATEGORIES
// =====================================================================
function renderCategoriesWrapper() {
  return "<div class='page-header'><h1 class='title-xl'>All Categories</h1><p class='subtitle'>Browse the full NovaHub collection.</p></div>" +
    "<div class='container' style='padding-bottom:80px;'>" +
    "<div class='grid-3 stagger'>" +
    NOVAHUB_DATA.categories.map(c => {
      const count = NOVAHUB_DATA.items.filter(i => i.categoryId === c.id).length;
      return "<a href='#/category/" + c.id + "' class='card reveal-scale' style='text-align:center;align-items:center;padding:40px 24px;text-decoration:none;'>" +
        "<div style='font-size:52px;margin-bottom:16px;animation:floatY 4s ease-in-out infinite;'>" + c.icon + "</div>" +
        "<div class='card-title' style='font-size:20px;margin-bottom:8px;'>" + c.name + "</div>" +
        "<div class='card-desc' style='margin-bottom:0;'>" + c.desc + "</div>" +
        "<div style='margin-top:14px;font-weight:700;color:var(--accent-blue);font-size:14px;'>" + count + " items</div>" +
      "</a>";
    }).join('') +
    "</div></div>";
}

function renderCategoryDetail(catId) {
  const cat = NOVAHUB_DATA.categories.find(c => c.id === catId);
  if (!cat) return "<div class='page-header container'><h1 class='title-xl'>404</h1></div>";
  const items = NOVAHUB_DATA.items.filter(i => i.categoryId === catId);
  const grid = ['movies','books','games'].includes(catId) ? 'grid-4' : catId === 'videos' ? 'grid-3' : 'grid-3';
  return "<div class='page-header'>" +
    "<div style='font-size:64px;margin-bottom:20px;animation:floatY 3s ease-in-out infinite;'>" + cat.icon + "</div>" +
    "<h1 class='title-xl'>" + cat.name + "</h1>" +
    "<p class='subtitle'>" + items.length + " hand-picked items, globally curated.</p>" +
  "</div>" +
  "<div class='container' style='padding-bottom:80px;'>" +
    "<div class='" + grid + " stagger'>" + items.map(i => "<div class='reveal-scale'>" + renderCard(i) + "</div>").join('') + "</div>" +
  "</div>";
}

// =====================================================================
// ITEM DETAIL
// =====================================================================
function renderItemDetail(itemId) {
  const item = NOVAHUB_DATA.items.find(x => x.id === itemId);
  if (!item) return "<div class='page-header container'><h1 class='title-xl'>Item Not Found</h1></div>";

  const related = NOVAHUB_DATA.items.filter(x => x.categoryId === item.categoryId && x.id !== item.id).slice(0, 4).map(i => "<div class='reveal-scale'>" + renderCard(i) + "</div>").join('');

  let embedHtml = '';
  if ((item.type === 'movie' || item.type === 'video') && (item.trailerUrl || item.embedId)) {
    const src = item.trailerUrl || 'https://www.youtube.com/embed/' + item.embedId;
    embedHtml = "<iframe width='100%' height='460' src='" + src + "' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='border-radius:16px;display:block;'></iframe>";
  } else if (item.type === 'game' && (item.trailerUrl || item.embedId)) {
    const src = item.trailerUrl || 'https://www.youtube.com/embed/' + item.embedId;
    embedHtml = "<iframe width='100%' height='460' src='" + src + "' frameborder='0' allowfullscreen style='border-radius:16px;display:block;'></iframe>";
  } else if (item.type === 'book' && item.embedId) {
    embedHtml = Embeds.renderGoogleBook(item.embedId);
  } else if (item.embedId) {
    if (item.embedId === 'timer')    embedHtml = Embeds.renderTimer();
    else if (item.embedId === 'markdown') embedHtml = Embeds.renderMarkdown();
    else if (item.embedId === 'sandbox')  embedHtml = Embeds.renderSandbox();
    else if (item.embedId === 'text-ai')  embedHtml = Embeds.renderTextAI();
    else if (item.embedId === 'image-ai') embedHtml = Embeds.renderImageAI();
  }

  const mainBtn = { movie: "<a href='" + (item.watchLink||'#') + "' target='_blank' class='btn-primary btn-watch' style='font-size:16px;padding:14px 32px;'>▶ Watch Now</a>",
    book: "<a href='" + (item.buyLink||'#') + "' target='_blank' class='btn-primary btn-buy' style='font-size:16px;padding:14px 32px;'>🛒 Buy Book</a>",
    game: "<a href='" + (item.playLink||'#') + "' target='_blank' class='btn-primary btn-play' style='font-size:16px;padding:14px 32px;'>🎮 Play Now</a>",
  };

  const metaRow = [
    item.genre && "<span>🎭 " + item.genre + "</span>",
    item.year && "<span>📅 " + item.year + "</span>",
    item.director && "<span>🎬 " + item.director + "</span>",
    item.author && "<span>✍ " + item.author + "</span>",
    item.developer && "<span>🕹 " + item.developer + "</span>",
    item.platforms && "<span>📱 " + item.platforms + "</span>",
    item.rating && "<span>★ " + item.rating + "</span>",
    item.pricing && "<span class='tag " + (item.pricing.toLowerCase().includes('free') ? 'tag-free' : 'tag-paid') + "'>" + item.pricing + "</span>",
  ].filter(Boolean).join('');

  const prosCons = (item.pros && item.pros.length) ? (
    "<div class='grid-3 reveal' style='gap:32px;margin-top:64px;'>" +
    "<div><h3 style='font-size:18px;font-weight:700;margin-bottom:14px;'>✅ Pros</h3><ul style='color:var(--text-secondary);padding-left:20px;line-height:2;'>" + item.pros.map(p => "<li>" + p + "</li>").join('') + "</ul></div>" +
    "<div><h3 style='font-size:18px;font-weight:700;margin-bottom:14px;'>❌ Cons</h3><ul style='color:var(--text-secondary);padding-left:20px;line-height:2;'>" + (item.cons||[]).map(c => "<li>" + c + "</li>").join('') + "</ul></div>" +
    "<div><h3 style='font-size:18px;font-weight:700;margin-bottom:14px;'>🎯 Best For</h3><p style='color:var(--text-secondary);line-height:1.7;'>" + (item.bestFor||'') + "</p></div>" +
    "</div>"
  ) : '';

  return "<div class='detail-header container reveal'>" +
    (item.image ? "<img src='" + item.image + "' alt='" + item.name + "' class='detail-cover' loading='lazy'>" : "<div style='font-size:64px;text-align:center;margin-bottom:32px;'>" + (item.name||'').charAt(0) + "</div>") +
    "<h1 class='title-xl'>" + (item.name||'') + "</h1>" +
    (metaRow ? "<div class='detail-meta-row'>" + metaRow + "</div>" : '') +
    "<p class='subtitle' style='font-size:18px;max-width:820px;'>" + (item.fullDesc||item.shortDesc||item.summary||'') + "</p>" +
    "<div class='detail-actions'>" + (mainBtn[item.type] || "<a href='" + (item.affiliateLink||'#') + "' target='_blank' class='btn-primary' style='font-size:16px;padding:14px 32px;'>Use Full Version ➔</a>") +
    "<a href='#/category/" + item.categoryId + "' class='btn-secondary' style='font-size:16px;padding:14px 32px;'>Browse Category ➔</a></div>" +
  "</div>" +
  "<div class='container' style='padding-bottom:80px;'>" +
    (embedHtml ? "<div class='embed-container reveal'><div class='embed-label'>Live Interactive Preview</div>" + embedHtml + "</div>" : '') +
    prosCons +
    (related ? "<div style='margin-top:80px;'><div class='section-title reveal' style='margin-bottom:24px;'>More Like This</div><div class='grid-4 stagger'>" + related + "</div></div>" : '') +
  "</div>";
}

// =====================================================================
// BLOG
// =====================================================================
function renderBlogList() {
  const posts = NOVAHUB_DATA.blogPosts.map(p =>
    "<div class='reveal'>" +
    "<a href='#/blog/" + p.id + "' class='blog-card' style='display:flex;text-decoration:none;'>" +
      "<div class='blog-card-img' style='background-image:url(\"" + p.image + "\");width:260px;flex-shrink:0;min-height:190px;'></div>" +
      "<div class='blog-card-body'>" +
        "<div class='blog-card-cat'>" + p.category + "</div>" +
        "<div class='blog-card-title'>" + p.title + "</div>" +
        "<div class='blog-card-excerpt'>" + p.excerpt + "</div>" +
        "<div class='blog-card-date'>By " + p.author + " · " + p.date + "</div>" +
      "</div>" +
    "</a></div>"
  ).join('');

  return "<div class='page-header'><h1 class='title-xl'>NovaHub Insights</h1><p class='subtitle'>Guides, reviews, and the best of the internet — curated by our editors.</p></div>" +
    "<div class='container' style='padding-bottom:80px;'><div style='display:flex;flex-direction:column;gap:24px;max-width:900px;margin:0 auto;'>" + posts + "</div></div>";
}

function renderBlogPost(id) {
  const post = NOVAHUB_DATA.blogPosts.find(p => p.id === id);
  if (!post) return "<div class='page-header container'><h1 class='title-xl'>Post Not Found</h1><a href='#/blog' class='btn-primary'>Back to Blog</a></div>";
  return "<div style='max-width:760px;margin:0 auto;padding:128px 24px 80px;'>" +
    "<div style='font-size:13px;color:var(--accent-blue);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;'>" + post.category + "</div>" +
    "<h1 style='font-size:40px;font-weight:800;letter-spacing:-0.02em;line-height:1.15;margin-bottom:20px;'>" + post.title + "</h1>" +
    "<div style='color:var(--text-secondary);font-size:14px;margin-bottom:32px;'>By " + post.author + " · " + post.date + "</div>" +
    "<img src='" + post.image + "' alt='" + post.title + "' style='width:100%;border-radius:16px;margin-bottom:40px;box-shadow:var(--shadow-md);' loading='lazy'>" +
    "<p style='font-size:18px;line-height:1.8;color:var(--text-secondary);'>" + post.excerpt + "</p>" +
    "<p style='font-size:18px;line-height:1.8;color:var(--text-secondary);margin-top:24px;'>Full article content is coming soon. In the meantime, explore our curated content below.</p>" +
    "<div style='margin-top:48px;display:flex;gap:12px;'><a href='#/blog' class='btn-secondary'>← All Articles</a><a href='#/' class='btn-primary'>Explore NovaHub ➔</a></div>" +
  "</div>";
}

// =====================================================================
// AI WIDGET
// =====================================================================
function renderAIWidget() {
  return "<div class='ai-widget'>" +
    "<h3>✨ AI Recommendations</h3>" +
    "<p style='color:var(--text-secondary);font-size:15px;'>Tell us what you're in the mood for — we'll find it instantly.</p>" +
    "<div class='ai-widget-input'>" +
      "<input type='text' id='ai-rec-input' placeholder='e.g. \"mind-bending sci-fi\" or \"best productivity app...\"' onkeypress=\"if(event.key==='Enter')window.getAIRecommendation()\">" +
      "<button class='btn-primary' onclick='window.getAIRecommendation()'>Ask ✨</button>" +
    "</div>" +
    "<div class='ai-widget-result' id='ai-rec-result'>Your recommendations will appear here.</div>" +
  "</div>";
}

// =====================================================================
// GLOBAL INTERACTION LAYER
// =====================================================================
function initGlobalNav() {
  // Navbar shrink on scroll
  const nav = document.querySelector('.glass-nav');
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Live search suggestions
  const searchInput = document.getElementById('global-search');
  const searchWrap  = document.querySelector('.search-wrap');
  if (searchInput && searchWrap) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      const existing = searchWrap.querySelector('.search-dropdown');
      if (existing) existing.remove();
      if (q.length < 2) return;

      const hits = NOVAHUB_DATA.items.filter(i =>
        (i.name || '').toLowerCase().startsWith(q) ||
        (i.name || '').toLowerCase().includes(q)
      ).slice(0, 6);

      if (!hits.length) return;

      const icons = { movie:'🍿', book:'📚', tool:'✨', game:'🎮', video:'🎬' };
      const dd = document.createElement('div');
      dd.className = 'search-dropdown';
      dd.innerHTML = hits.map(i =>
        "<div class='search-dropdown-item' data-id='" + i.id + "'>" +
          "<span class='type-icon'>" + (icons[i.type] || '🔍') + "</span>" +
          "<div><strong>" + i.name + "</strong><br><span>" + i.shortDesc.slice(0, 55) + "…</span></div>" +
        "</div>"
      ).join('');
      dd.querySelectorAll('.search-dropdown-item').forEach(el => {
        el.addEventListener('click', () => {
          window.location.hash = '#/item/' + el.dataset.id;
          dd.remove();
          searchInput.value = '';
        });
      });
      searchWrap.appendChild(dd);
    });

    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.hash = '#/search?q=' + encodeURIComponent(searchInput.value.trim());
        const dd = searchWrap.querySelector('.search-dropdown');
        if (dd) dd.remove();
      }
    });

    document.addEventListener('click', e => {
      if (!searchWrap.contains(e.target)) {
        const dd = searchWrap.querySelector('.search-dropdown');
        if (dd) dd.remove();
      }
    });

    const searchBtn = document.querySelector('.search-box button');
    if (searchBtn) searchBtn.addEventListener('click', () => {
      const q = searchInput.value.trim();
      if (q) window.location.hash = '#/search?q=' + encodeURIComponent(q);
    });
  }
}

// Scroll Reveal via IntersectionObserver
function initScrollReveal() {
  const els = appRoot.querySelectorAll('.reveal, .reveal-left, .reveal-scale');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
}

// Mouse-tracking glow on cards
function initCardInteractions() {
  appRoot.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', x);
      card.style.setProperty('--my', y);
    });
  });
}

// Ripple click effect
function rippleAllButtons() {
  appRoot.querySelectorAll('.btn-primary, .btn-secondary, .btn-watch, .btn-buy, .btn-play').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = "width:" + size + "px;height:" + size + "px;left:" + (e.clientX - rect.left - size/2) + "px;top:" + (e.clientY - rect.top - size/2) + "px;";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// Active nav link
function updateNavActive(path) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href === '#' + path || (path === '/' && href === '#/'));
  });
}

// Page script dispatcher
function initPageScripts(path) {
  window.getAIRecommendation = () => {
    const inp = document.getElementById('ai-rec-input');
    const res = document.getElementById('ai-rec-result');
    if (!inp || !res || !inp.value.trim()) return;
    const q = inp.value.trim().toLowerCase();
    res.innerHTML = "<span style='color:var(--text-secondary);'>✨ Searching for the best match...</span>";
    setTimeout(() => {
      const keywords = q.split(' ').filter(w => w.length > 2);
      const matches = NOVAHUB_DATA.items.filter(i =>
        keywords.some(kw =>
          (i.name||'').toLowerCase().includes(kw) ||
          (i.shortDesc||'').toLowerCase().includes(kw) ||
          (i.genre||'').toLowerCase().includes(kw) ||
          (i.categoryId||'').includes(kw)
        )
      ).slice(0, 4);
      const picks = matches.length ? matches : NOVAHUB_DATA.items.filter(i => i.trending).slice(0, 4);
      const label = matches.length ? "We found <strong>" + matches.length + " match" + (matches.length>1?'es':'') + "</strong> for you:" : "No exact match. You might love these trending picks:";
      res.innerHTML = label + "<div style='display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;'>" +
        picks.map(m => "<a href='#/item/" + m.id + "' style='padding:7px 14px;background:var(--surface-hover);border-radius:100px;font-weight:600;font-size:14px;color:var(--accent-blue);transition:background 0.15s;display:inline-block;'>→ " + m.name + "</a>").join('') +
        "</div>";
      rippleAllButtons();
    }, 850);
  };

  // Render news on home page
  if (path === '/') {
    if (typeof News !== 'undefined') {
      const newsEl = document.getElementById('home-news-grid');
      if (newsEl) {
        News.render('home-news-grid', { limit: 7, featured: true });
        // Trigger reveal on news cards after render
        setTimeout(initScrollReveal, 100);
      }
    }
  }

  if (path.startsWith('/item/')) {
    const id = path.split('/')[2];
    const item = NOVAHUB_DATA.items.find(x => x.id === id);
    if (item && item.embedId && ['timer','markdown','sandbox','text-ai','image-ai'].includes(item.embedId)) {
      setTimeout(() => Embeds.initScripts(item.embedId), 150);
    }
  }
}
