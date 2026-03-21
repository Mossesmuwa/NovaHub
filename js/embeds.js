// js/components/embeds.js
const Embeds = {
  renderTimer() {
    return "<div class='embed-timer' style='text-align: center; font-family: monospace;'>" +
      "<h2 style='font-size: 64px; margin-bottom: 32px; font-weight: 700; color: var(--text-primary);' id='timer-display'>25:00</h2>" +
      "<div style='display: flex; gap: 16px; justify-content: center;'>" +
        "<button class='btn-primary' onclick='window.startTimer()'>Start Focus</button>" +
        "<button class='btn-secondary' onclick='window.stopTimer()'>Pause</button>" +
        "<button class='btn-secondary' onclick='window.resetTimer()'>Reset</button>" +
      "</div>" +
    "</div>";
  },
  
  renderMarkdown() {
    return "<div style='display: flex; gap: 24px; height: 360px; flex-wrap: wrap;'>" +
      "<textarea id='md-input' style='flex: 1; min-width: 300px; padding: 20px; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); background: var(--surface-hover); color: var(--text-primary); font-family: monospace; font-size: 15px; resize: none; outline: none; transition: border-color var(--transition-fast);' placeholder='# Fast notes...\\n\\nType your markdown here to see it live.' onfocus=\"this.style.borderColor='var(--accent-blue)'\" onblur=\"this.style.borderColor='var(--border-color)'\"></textarea>" +
      "<div id='md-preview' style='flex: 1; min-width: 300px; padding: 20px; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); background: var(--surface-color); overflow-y: auto; text-align: left;'>" +
        "<h1>Fast notes...</h1>" +
        "<p>Type your markdown here to see it live.</p>" +
      "</div>" +
    "</div>";
  },
  
  renderSandbox() {
    return "<div style='display: flex; flex-direction: column; gap: 16px; height: 400px;'>" +
      "<textarea id='sb-html' style='height: 180px; padding: 16px; font-family: monospace; font-size: 14px; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); background: var(--surface-hover); color: var(--text-primary); resize: none; outline: none; transition: border-color var(--transition-fast);' placeholder=\"<!-- Write HTML to render live -->\\n<h1 style='color: #0066CC'>Hello Interactive Web!</h1>\" onfocus=\"this.style.borderColor='var(--accent-blue)'\" onblur=\"this.style.borderColor='var(--border-color)'\"></textarea>" +
      "<iframe id='sb-preview' style='flex: 1; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); background: white; width: 100%;'></iframe>" +
    "</div>";
  },

  renderTextAI() {
    return "<div class='embed-ai-chat' style='display: flex; flex-direction: column; height: 400px; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); background: var(--surface-color); overflow: hidden;'>" +
      "<div style='background: var(--surface-hover); padding: 12px 16px; font-weight: 600; border-bottom: 1px solid var(--border-color); font-size: 14px; color: var(--text-secondary);'>AI Assistant (Interactive Demo)</div>" +
      "<div id='chat-history' style='flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; scroll-behavior: smooth;'>" +
        "<div style='align-self: flex-start; background: var(--surface-hover); padding: 12px 16px; border-radius: 16px; border-bottom-left-radius: 4px; max-width: 80%; line-height: 1.5;'>Hello! I am your AI assistant. Send me a message and I'll generate a response!</div>" +
      "</div>" +
      "<div style='padding: 16px; border-top: 1px solid var(--border-color); display: flex; gap: 12px;'>" +
        "<input type='text' id='chat-input' placeholder='Ask AI something...' style='flex: 1; padding: 12px 16px; border-radius: 24px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-primary); outline: none; transition: border-color var(--transition-fast);' onfocus=\"this.style.borderColor='var(--accent-blue)'\" onblur=\"this.style.borderColor='var(--border-color)'\" onkeypress=\"if(event.key==='Enter') window.sendChat()\">" +
        "<button class='btn-primary' style='padding: 12px 24px;' onclick='window.sendChat()'>Send</button>" +
      "</div>" +
    "</div>";
  },

  renderImageAI() {
    return "<div class='embed-image-gen' style='display: flex; flex-direction: column; align-items: center; gap: 24px;'>" +
      "<div style='display: flex; width: 100%; gap: 12px;'>" +
        "<input type='text' id='img-prompt' placeholder='Describe a landscape, animal, or concept...' style='flex: 1; padding: 14px 20px; border-radius: 24px; border: 1px solid var(--border-color); background: var(--surface-hover); color: var(--text-primary); outline: none; transition: border-color var(--transition-fast);' onfocus=\"this.style.borderColor='var(--accent-blue)'\" onblur=\"this.style.borderColor='var(--border-color)'\" onkeypress=\"if(event.key==='Enter') window.generateImage()\">" +
        "<button class='btn-primary' style='padding: 14px 28px;' onclick='window.generateImage()'>Generate</button>" +
      "</div>" +
      "<div id='img-result' style='width: 100%; height: 350px; background: var(--surface-hover); border-radius: var(--border-radius-lg); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border-color); position: relative;'>" +
        "<span id='img-placeholder-text' style='color: var(--text-secondary); font-weight: 500;'>Image will appear here</span>" +
        "<div id='img-loader' class='hidden' style='position: absolute; width: 40px; height: 40px; border: 4px solid var(--border-color); border-top-color: var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite;'></div>" +
      "</div>" +
      "<style>@keyframes spin { to { transform: rotate(360deg); } }</style>" +
    "</div>";
  },

  renderYoutube(videoId) {
    if(!videoId) return "<div style='padding:40px; text-align:center;'>No video available</div>";
    return "<iframe width='100%' height='450' src='https://www.youtube.com/embed/" + videoId + "' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='border-radius: var(--border-radius-lg);'></iframe>";
  },

  renderGoogleBook(isbn) {
    if(!isbn) return "<div style='padding:40px; text-align:center;'>Preview not available</div>";
    // Using a generic books embedding approach or placeholder
    return "<iframe frameborder='0' scrolling='no' style='border:0px' src='https://books.google.com/books?id=" + isbn + "&lpg=PP1&pg=PP1&output=embed' width='100%' height='500'></iframe>";
  },
  
  initScripts(type) {
    if (type === 'timer') {
      window.timerInterval = window.timerInterval || null;
      window.timeLeft = window.timeLeft || 25 * 60;
      const display = document.getElementById('timer-display');
      const update = () => {
        const m = Math.floor(window.timeLeft / 60).toString().padStart(2, '0');
        const s = (window.timeLeft % 60).toString().padStart(2, '0');
        if (display) display.textContent = m + ':' + s;
      };
      update();
      window.startTimer = () => { if(!window.timerInterval) window.timerInterval = setInterval(() => { if(window.timeLeft > 0) window.timeLeft--; update(); }, 1000); };
      window.stopTimer = () => { clearInterval(window.timerInterval); window.timerInterval = null; };
      window.resetTimer = () => { clearInterval(window.timerInterval); window.timerInterval = null; window.timeLeft = 25 * 60; update(); };
    }
    
    if (type === 'markdown') {
      const input = document.getElementById('md-input');
      const preview = document.getElementById('md-preview');
      if (input && preview) {
        input.addEventListener('input', (e) => {
          let html = e.target.value
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
            .replace(/\*(.*?)\*/gim, '<i>$1</i>')
            .replace(/\n/gim, '<br />');
          preview.innerHTML = html;
        });
      }
    }
    
    if (type === 'sandbox') {
      const htmlInput = document.getElementById('sb-html');
      const preview = document.getElementById('sb-preview');
      if (htmlInput && preview) {
        const render = () => {
          const doc = preview.contentDocument || preview.contentWindow.document;
          doc.open(); doc.write(htmlInput.value); doc.close();
        };
        htmlInput.addEventListener('input', render);
        htmlInput.value = htmlInput.placeholder.split('\\n')[1] || '';
        render();
      }
    }

    if (type === 'text-ai') {
      const input = document.getElementById('chat-input');
      const history = document.getElementById('chat-history');
      window.sendChat = () => {
        if(!input || !history || !input.value.trim()) return;
        const msg = input.value.trim();
        input.value = '';
        
        history.innerHTML += "<div style='align-self: flex-end; background: var(--accent-blue); color: white; padding: 12px 16px; border-radius: 16px; border-bottom-right-radius: 4px; max-width: 80%; line-height: 1.5; animation: fadeIn 0.3s ease-out;'>" + msg + "</div>";
        history.scrollTop = history.scrollHeight;

        const id = 'loader-' + Date.now();
        history.innerHTML += "<div id='" + id + "' style='align-self: flex-start; background: var(--surface-hover); padding: 12px 16px; border-radius: 16px; border-bottom-left-radius: 4px; color: var(--text-secondary); animation: fadeIn 0.3s ease-out;'>Thinking...</div>";
        history.scrollTop = history.scrollHeight;

        setTimeout(() => {
          const loader = document.getElementById(id);
          if (loader) {
            const responses = [
              "That's a very interesting point! As an AI, I completely agree.",
              "I can help you with that. The key is to break it down into smaller steps.",
              "Based on my knowledge, the best approach is to focus on clean structure and Apple-style minimalism.",
              "I'm a simulated demo, but if I were fully connected, I'd give you a brilliant answer right now!"
            ];
            loader.textContent = responses[Math.floor(Math.random() * responses.length)];
            loader.style.color = 'var(--text-primary)';
          }
          history.scrollTop = history.scrollHeight;
        }, 1500);
      }
    }

    if (type === 'image-ai') {
      const input = document.getElementById('img-prompt');
      const resultBox = document.getElementById('img-result');
      const placeholderText = document.getElementById('img-placeholder-text');
      const loader = document.getElementById('img-loader');
      
      window.generateImage = () => {
        if(!input || !resultBox || !input.value.trim()) return;
        const prompt = input.value.trim();
        
        resultBox.style.backgroundImage = 'none';
        if(placeholderText) placeholderText.classList.add('hidden');
        if(loader) loader.classList.remove('hidden');

        setTimeout(() => {
          if(loader) loader.classList.add('hidden');
          const keyword = encodeURIComponent(prompt.split(' ')[0]);
          resultBox.style.backgroundImage = "url('https://source.unsplash.com/600x400/?" + keyword + ",art')";
          resultBox.style.backgroundSize = 'cover';
          resultBox.style.backgroundPosition = 'center';
          resultBox.innerHTML += "<div style='position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;'>Demo Render</div>";
        }, 2000);
      }
    }
  }
};
