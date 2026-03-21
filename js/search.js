// js/search.js — NovaHub Predictive Search Engine

const SearchEngine = (() => {
  const TRENDING_SEARCHES = [
    'ChatGPT', 'Midjourney', 'Dune', 'Atomic Habits', 'Elden Ring',
    'Figma', 'Notion', 'React Tutorial', 'AI tools 2026', 'best sci-fi movies'
  ];

  const TYPE_ICONS = { movie:'🍿', book:'📚', tool:'✨', game:'🎮', video:'🎬', default:'🔍' };
  const TABS = ['All', 'Movies', 'Books', 'AI Tools', 'Games', 'Videos'];
  const TAB_CAT  = { 'All': null, 'Movies': 'movies', 'Books': 'books', 'AI Tools': 'ai-tools', 'Games': 'games', 'Videos': 'videos' };

  let currentTab = 'All';
  let currentQuery = '';

  // Get all items
  function allItems() {
    return (typeof NOVAHUB_DATA !== 'undefined') ? NOVAHUB_DATA.items : [];
  }

  // Score-based search
  function search(query, tab) {
    const q = (query || '').toLowerCase().trim();
    const catFilter = TAB_CAT[tab] || null;
    let items = allItems();
    if (catFilter) items = items.filter(i => i.categoryId === catFilter);
    if (q.length < 1) return items.filter(i => i.trending).slice(0, 24);

    return items
      .map(item => {
        let score = 0;
        const name = (item.name || '').toLowerCase();
        const desc = (item.shortDesc || '').toLowerCase();
        const genre = (item.genre || '').toLowerCase();
        const author = (item.author || '').toLowerCase();
        if (name === q) score += 100;
        else if (name.startsWith(q)) score += 60;
        else if (name.includes(q)) score += 30;
        if (desc.includes(q)) score += 10;
        if (genre.includes(q)) score += 8;
        if (author.includes(q)) score += 8;
        if (item.trending) score += 3;
        return { item, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.item);
  }

  // Autocomplete suggestions (name-starts-with or includes)
  function suggest(query) {
    const q = (query || '').toLowerCase().trim();
    if (q.length < 2) return [];
    return allItems()
      .filter(i => (i.name || '').toLowerCase().includes(q))
      .slice(0, 7)
      .map(i => ({ id: i.id, name: i.name, type: i.type, sub: i.genre || i.shortDesc || '' }));
  }

  // Render filter tabs HTML
  function renderTabs(activeTab) {
    return '<div class="filter-tabs">' +
      TABS.map(t => '<button class="filter-tab' + (t === activeTab ? ' active' : '') + '" onclick="SearchEngine.setTab(\'' + t + '\')">' + t + '</button>').join('') +
    '</div>';
  }

  // Render trending chips
  function renderTrending() {
    return '<div class="trending-chips">' +
      '<span class="trending-label">🔥 Trending:</span>' +
      TRENDING_SEARCHES.map(t =>
        '<button class="trending-chip" onclick="SearchEngine.runSearch(\'' + t.replace(/'/g,"\\'") + '\')">' + t + '</button>'
      ).join('') +
    '</div>';
  }

  // Render results grid
  function renderResults(items) {
    if (!items.length) {
      return '<div class="search-empty">' +
        '<div style="font-size:48px;margin-bottom:16px;">🔍</div>' +
        '<div style="font-size:20px;font-weight:700;margin-bottom:8px;">No results found</div>' +
        '<div style="color:var(--text-secondary);">Try a different keyword or browse our categories.</div>' +
        '<a href="category.html" class="btn-primary" style="margin-top:24px;display:inline-flex;">Browse Categories ➔</a>' +
      '</div>';
    }
    return '<div class="grid-4">' +
      items.map(item => renderResultCard(item)).join('') +
    '</div>';
  }

  function renderResultCard(item) {
    const icon = TYPE_ICONS[item.type] || TYPE_ICONS.default;
    const sub = item.director || item.author || item.developer || item.genre || '';
    const rating = item.rating ? '★ ' + item.rating : '';
    const pricing = item.pricing ? item.pricing : '';
    const href = 'item.html?id=' + encodeURIComponent(item.id);
    const imgHtml = item.image
      ? '<div class="result-card-img" style="background-image:url(\'' + item.image + '\');"></div>'
      : '<div class="result-card-icon">' + icon + '</div>';

    return '<a href="' + href + '" class="result-card">' +
      imgHtml +
      '<div class="result-card-body">' +
        '<div class="result-card-title">' + (item.name || '') + '</div>' +
        (sub ? '<div class="result-card-sub">' + sub + '</div>' : '') +
        '<div class="result-card-meta">' +
          (rating ? '<span class="result-rating">' + rating + '</span>' : '') +
          (pricing ? '<span class="tag ' + (pricing.toLowerCase().includes('free') ? 'tag-free' : 'tag-paid') + '">' + pricing + '</span>' : '') +
        '</div>' +
        '<div class="result-card-desc">' + (item.shortDesc || '').slice(0, 80) + '…</div>' +
      '</div>' +
    '</a>';
  }

  // Initialize search page
  function initPage() {
    const urlParam = new URLSearchParams(window.location.search);
    currentQuery = urlParam.get('q') || '';
    currentTab = 'All';

    const searchInput = document.getElementById('main-search-input');
    if (searchInput) {
      searchInput.value = currentQuery;
      searchInput.addEventListener('input', debounce(() => {
        currentQuery = searchInput.value;
        updateAutocomplete(currentQuery);
        updateResults();
      }, 180));
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          closeAutocomplete();
          updateResults();
        }
        if (e.key === 'Escape') closeAutocomplete();
      });
      document.addEventListener('click', e => {
        if (!e.target.closest('.search-autocomplete-wrap')) closeAutocomplete();
      });
    }

    renderPage();
  }

  function renderPage() {
    const tabsEl   = document.getElementById('search-tabs');
    const trendEl  = document.getElementById('search-trending');
    const resultsEl= document.getElementById('search-results');
    const titleEl  = document.getElementById('search-title');
    const countEl  = document.getElementById('search-count');

    if (tabsEl)   tabsEl.innerHTML   = renderTabs(currentTab);
    if (trendEl)  trendEl.innerHTML  = renderTrending();

    const results = search(currentQuery, currentTab);

    if (titleEl) titleEl.textContent = currentQuery ? '"' + currentQuery + '"' : 'Explore Everything';
    if (countEl) countEl.textContent = results.length + ' result' + (results.length !== 1 ? 's' : '');
    if (resultsEl) resultsEl.innerHTML = renderResults(results);
  }

  function updateResults() {
    const url = new URL(window.location);
    if (currentQuery) url.searchParams.set('q', currentQuery);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    renderPage();
  }

  function setTab(tab) {
    currentTab = tab;
    renderPage();
  }

  function runSearch(query) {
    currentQuery = query;
    const si = document.getElementById('main-search-input');
    if (si) si.value = query;
    closeAutocomplete();
    updateResults();
  }

  function updateAutocomplete(query) {
    const wrap = document.querySelector('.search-autocomplete-wrap');
    if (!wrap) return;
    const existing = wrap.querySelector('.search-dropdown');
    if (existing) existing.remove();
    const suggestions = suggest(query);
    if (!suggestions.length) return;

    const dd = document.createElement('div');
    dd.className = 'search-dropdown';
    dd.innerHTML = suggestions.map(s =>
      '<div class="search-dropdown-item" onclick="SearchEngine.runSearch(\'' + s.name.replace(/'/g,"\\'") + '\')">' +
        '<span class="type-icon">' + (TYPE_ICONS[s.type] || '🔍') + '</span>' +
        '<div><strong>' + s.name + '</strong><br><span>' + s.sub.slice(0, 50) + '…</span></div>' +
      '</div>'
    ).join('');
    wrap.appendChild(dd);
  }

  function closeAutocomplete() {
    const dd = document.querySelector('.search-dropdown');
    if (dd) dd.remove();
  }

  function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  return { initPage, setTab, runSearch, search, suggest };
})();
