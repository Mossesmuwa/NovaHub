// js/vibe-engine.js — NovaHub Vibe Discovery Engine
// Dynamic slider / mood selection that triggers category filtering and search queries

const VibeEngine = (() => {

  const VIBES = [
    { id: 'focus', icon: '🧠', name: 'Deep Focus', dbQuery: 'productivity tool', theme: '#30D158' },
    { id: 'chill', icon: '🍵', name: 'Chill & Unwind', dbQuery: 'relaxing game movie', theme: '#5AC8FA' },
    { id: 'learn', icon: '📚', name: 'Mind Expansion', dbQuery: 'book document tool', theme: '#FF9F0A' },
    { id: 'hype', icon: '🔥', name: 'Hype & Energy', dbQuery: 'action trending game', theme: '#FF453A' },
    { id: 'creative', icon: '🎨', name: 'Creative Flow', dbQuery: 'design art tool', theme: '#BF5AF2' }
  ];

  let currentVibeIndex = 0;
  let isSearching = false;

  function _db() { return window.NovaDB && window.NovaDB.client; }

  async function getItemsByVibe(vibeId, limit = 12) {
    const vibeReq = VIBES.find(v => v.id === vibeId) || VIBES[0];
    
    // Use heavy text search approximation on what is available, via our existing Items.js search.
    try {
      if (window.NovaItems && window.NovaItems.search) {
         const results = await window.NovaItems.search(vibeReq.dbQuery, { limit });
         if (results && results.length > 0) return results;
      }
      
      // Fallback: If no NovaItems or no search match, grab trending
      if (window.NovaItems && window.NovaItems.getTrending) {
          return await window.NovaItems.getTrending(limit);
      }
      return [];
    } catch {
      return [];
    }
  }

  function renderVibeUI(containerId, gridId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="vibe-dial-wrapper">
        <div class="vibe-dial">
          ${VIBES.map((v, i) => `
            <button class="vibe-opt ${i === 0 ? 'active' : ''}" data-idx="${i}" data-vid="${v.id}" style="--vt:${v.theme}">
              <span class="vibe-icon">${v.icon}</span>
              <span class="vibe-label">${v.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Attach events
    const opts = container.querySelectorAll('.vibe-opt');
    opts.forEach(opt => {
      opt.addEventListener('click', (e) => {
        opts.forEach(o => o.classList.remove('active'));
        const btn = e.currentTarget;
        btn.classList.add('active');
        
        currentVibeIndex = parseInt(btn.getAttribute('data-idx') || '0', 10);
        executeVibeSearch(gridId);
      });
    });
    
    // Auto execute initial
    if (gridId) executeVibeSearch(gridId);
  }

  async function executeVibeSearch(gridId) {
    if (isSearching) return;
    
    const vibe = VIBES[currentVibeIndex];
    if (window.NovaUI) {
      window.NovaUI.showLoading(gridId, `Dialing into <strong>${vibe.name}</strong>…`);
    }

    isSearching = true;

    // Optional delay to give a fluid UI look
    await new Promise(r => setTimeout(r, 600));

    const results = await getItemsByVibe(vibe.id, 12);
    
    if (window.NovaUI) {
      window.NovaUI.renderGrid(results, gridId, 'grid-4');
    }
    
    // Animate glow color update across document
    document.documentElement.style.setProperty('--vibe-color', vibe.theme);
    const bgGlow = document.getElementById('vibe-bg-glow');
    if (bgGlow) {
      bgGlow.style.background = \`radial-gradient(ellipse 70% 80% at 50% -20%, \${vibe.theme}25 0%, transparent 70%)\`;
    }

    isSearching = false;
  }

  return { getItemsByVibe, renderVibeUI, executeVibeSearch, VIBES };
})();

window.VibeEngine = VibeEngine;
