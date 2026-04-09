/**
 * NovaHub AI Chat Interface
 * Intercepts search inputs in index.html to dynamically load AI recommendations.
 */

window.aiSearch = async function() {
  const input = document.getElementById('ai-input');
  const resultContainer = document.getElementById('ai-result');
  const gridContainer = document.getElementById('ai-recs-grid');
  
  if (!input || !resultContainer || !gridContainer) return;
  const query = input.value.trim();
  if (!query) return;

  // Show loading state
  resultContainer.classList.remove('hidden');
  resultContainer.innerHTML = '<span style="color:var(--gold);">✦ Analyzing the universe for your request...</span>';
  gridContainer.innerHTML = ''; // Clear old results

  try {
    const res = await window.NovaAPI.getAIRecommendations({ query });

    if (!res || !res.success) {
      resultContainer.innerHTML = '<span style="color:#FF453A;">Connection to AI failed. Try regular search instead.</span>';
      return;
    }

    resultContainer.innerHTML = `<span style="color:var(--t2);">✦ We found <strong>${res.recommendations.length}</strong> items curated perfectly for "${query}":</span>`;

    gridContainer.innerHTML = res.recommendations.map(r => `
      <div class="ai-rec-card reveal" style="border:1px solid var(--border2);background:var(--bg3);">
        <div class="ai-rec-name" style="font-size:16px;color:var(--t1);margin-bottom:4px;">${r.name}</div>
        <div class="ai-rec-why" style="color:var(--t2);font-size:12px;margin-bottom:12px;line-height:1.4;">${r.why || ''}</div>
        <a href="search.html?q=${encodeURIComponent(r.name)}" class="btn-ghost" style="font-size:11px;padding:4px 10px;">View Item →</a>
      </div>
    `).join('');

    // Trigger reveal animations manually
    setTimeout(() => {
      document.querySelectorAll('.ai-rec-card.reveal').forEach((el, index) => {
        el.style.transitionDelay = (index * 0.1) + 's';
        el.classList.add('visible');
      });
    }, 50);

  } catch (err) {
    console.error(err);
    resultContainer.innerHTML = '<span style="color:#FF453A;">An error occurred reaching the AI engine.</span>';
  }
};

// Press Enter to trigger
document.addEventListener('DOMContentLoaded', () => {
  const aiInput = document.getElementById('ai-input');
  if (aiInput) {
    aiInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') window.aiSearch();
    });
  }
});
