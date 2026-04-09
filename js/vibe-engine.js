/**
 * NovaHub Vibe Engine
 * Maps physical slider UI to backend AI prompt parameters.
 */

document.addEventListener('DOMContentLoaded', () => {
  const mood = document.getElementById('dial-mood');
  const energy = document.getElementById('dial-energy');
  const focus = document.getElementById('dial-focus');
  if (!mood) return; // Not on discover page

  const vibeState = {
    mood: 50,
    energy: 25,
    focus: 80
  };

  function updateVibeText() {
    const moodVal = document.getElementById('val-mood');
    const energyVal = document.getElementById('val-energy');
    const focusVal = document.getElementById('val-focus');

    if (vibeState.mood < 33) moodVal.textContent = 'Dark/Serious';
    else if (vibeState.mood < 66) moodVal.textContent = 'Neutral';
    else moodVal.textContent = 'Light/Fun';

    if (vibeState.energy < 33) energyVal.textContent = 'Chill';
    else if (vibeState.energy < 66) energyVal.textContent = 'Balanced';
    else energyVal.textContent = 'High Energy';

    if (vibeState.focus < 33) focusVal.textContent = 'Deep Work Tools';
    else if (vibeState.focus < 66) focusVal.textContent = 'Mixed Discovery';
    else focusVal.textContent = 'Pure Entertainment';
  }

  function handleInput(e, key) {
    vibeState[key] = parseInt(e.target.value);
    updateVibeText();
  }

  mood.addEventListener('input', e => handleInput(e, 'mood'));
  energy.addEventListener('input', e => handleInput(e, 'energy'));
  focus.addEventListener('input', e => handleInput(e, 'focus'));

  window.fetchVibe = async function() {
    const resultsBlock = document.getElementById('vibe-results');
    if (!resultsBlock) return;
    
    resultsBlock.classList.add('loading');
    
    try {
      // Use the newly created API
      const result = await window.NovaAPI.getAIRecommendations(vibeState);
      
      if (!result || !result.success) {
        resultsBlock.innerHTML = '<div style="color:var(--t3);padding:24px;">Failed to fetch vibes. Is the backend running?</div>';
        return;
      }

      // Render the AI recommendations visually
      resultsBlock.innerHTML = result.recommendations.map(r => {
        return `
          <div class="card reveal" style="border: 1px solid var(--gold-glow); box-shadow: 0 8px 32px var(--gold-glow2);">
            <div class="card-title" style="color:var(--gold); font-size:18px;">${r.name}</div>
            <div style="font-size:10px;text-transform:uppercase;color:var(--t3);margin-bottom:8px;">${r.type}</div>
            <p class="card-desc" style="color:var(--t1)">${r.why || ''}</p>
            <div class="card-actions">
              <a href="search.html?q=${encodeURIComponent(r.name)}" class="btn-primary" style="font-size:12px;padding:7px 14px">Explore →</a>
            </div>
          </div>
        `;
      }).join('');
      
    } catch (err) {
      console.error(err);
      resultsBlock.innerHTML = '<div style="color:var(--t3);padding:24px;">An error occurred connecting to the Vibe Engine.</div>';
    } finally {
      resultsBlock.classList.remove('loading');
    }
  };

  // Check URL parameters for direct vibe links
  const urlParams = new URLSearchParams(window.location.search);
  const vibeArg = urlParams.get('vibe');
  if (vibeArg) {
    if (vibeArg === 'mind-bending') { mood.value=10; energy.value=80; focus.value=90; }
    if (vibeArg === 'chill') { mood.value=70; energy.value=10; focus.value=100; }
    if (vibeArg === 'productive') { mood.value=50; energy.value=60; focus.value=10; }
    
    // trigger state updates
    mood.dispatchEvent(new Event('input'));
    energy.dispatchEvent(new Event('input'));
    focus.dispatchEvent(new Event('input'));
    
    // Auto fetch
    window.fetchVibe();
  } else {
    // Basic initial fetch
    window.fetchVibe();
  }
});
