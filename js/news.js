// js/news.js — NovaHub AI News Feed

const News = (() => {
  // Type icon map
  const tagColors = {
    'AI':          { bg:'rgba(0,102,204,0.1)',  color:'#0066CC' },
    'Science':     { bg:'rgba(5,150,105,0.1)',  color:'#059669' },
    'Tech':        { bg:'rgba(124,58,237,0.1)', color:'#7C3AED' },
    'Business':    { bg:'rgba(217,119,6,0.1)',  color:'#D97706' },
    'Gaming':      { bg:'rgba(239,68,68,0.1)',  color:'#EF4444' },
    'Books':       { bg:'rgba(79,70,229,0.1)',  color:'#4F46E5' },
    'Design':      { bg:'rgba(236,72,153,0.1)', color:'#EC4899' },
    'Productivity':{ bg:'rgba(20,184,166,0.1)', color:'#14B8A6' },
  };

  // Format date
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Render a single news card
  function renderCard(item) {
    const tc = tagColors[item.tag] || tagColors['Tech'];
    return '<a href="' + (item.url || '#') + '" target="_blank" rel="noopener" class="news-card">' +
      '<div class="news-card-inner">' +
        (item.image ? '<div class="news-card-img" style="background-image:url(\'' + item.image + '\');"></div>' : '') +
        '<div class="news-card-body">' +
          '<span class="news-tag" style="background:' + tc.bg + ';color:' + tc.color + ';">' + item.tag + '</span>' +
          '<div class="news-card-title">' + item.title + '</div>' +
          '<div class="news-card-summary">' + item.summary + '</div>' +
          '<div class="news-card-meta">' +
            '<span>' + (item.source || 'NovaHub') + '</span>' +
            '<span>' + formatDate(item.date) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</a>';
  }

  // Render featured (large) news card
  function renderFeatured(item) {
    const tc = tagColors[item.tag] || tagColors['Tech'];
    return '<a href="' + (item.url || '#') + '" target="_blank" rel="noopener" class="news-card news-card-featured">' +
      '<div class="news-card-inner">' +
        (item.image ? '<div class="news-card-img-featured" style="background-image:url(\'' + item.image + '\');"></div>' : '') +
        '<div class="news-card-body">' +
          '<span class="news-tag" style="background:' + tc.bg + ';color:' + tc.color + ';">' + item.tag + '</span>' +
          '<div class="news-card-title" style="font-size:20px;">' + item.title + '</div>' +
          '<div class="news-card-summary">' + item.summary + '</div>' +
          '<div class="news-card-meta">' +
            '<span>' + (item.source || 'NovaHub') + '</span>' +
            '<span>' + formatDate(item.date) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</a>';
  }

  // Render the full news grid into a container
  function render(containerId, opts) {
    const container = document.getElementById(containerId);
    if (!container || typeof NOVAHUB_DATA === 'undefined') return;
    const items = NOVAHUB_DATA.newsItems || [];
    const limit = (opts && opts.limit) ? opts.limit : items.length;
    const showFeatured = opts && opts.featured;
    const display = items.slice(0, limit);
    if (!display.length) {
      container.innerHTML = '<p style="color:var(--text-secondary);">No news available.</p>';
      return;
    }
    if (showFeatured && display.length > 1) {
      container.innerHTML =
        '<div class="news-grid-featured">' +
          renderFeatured(display[0]) +
          '<div class="news-grid-side">' + display.slice(1).map(renderCard).join('') + '</div>' +
        '</div>';
    } else {
      container.innerHTML = '<div class="news-grid">' + display.map(renderCard).join('') + '</div>';
    }
  }

  // Render a horizontal carousel of news items
  function renderCarousel(containerId) {
    const container = document.getElementById(containerId);
    if (!container || typeof NOVAHUB_DATA === 'undefined') return;
    const items = NOVAHUB_DATA.newsItems || [];
    container.innerHTML = '<div class="carousel-wrapper"><div class="carousel-track">' +
      items.map(i => '<div class="carousel-item-wide" style="flex-shrink:0;">' + renderCard(i) + '</div>').join('') +
    '</div></div>';
  }

  // Filter by tag
  function filterByTag(tag) {
    const items = (typeof NOVAHUB_DATA !== 'undefined' && NOVAHUB_DATA.newsItems) ? NOVAHUB_DATA.newsItems : [];
    return tag === 'All' ? items : items.filter(i => i.tag === tag);
  }

  return { render, renderCarousel, renderCard, filterByTag };
})();
