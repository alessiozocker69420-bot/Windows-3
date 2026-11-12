/**
 * Virtual Browser (iframe-based with fallback)
 */
const BrowserApp = {
  render(container, winId, options = {}) {
    const startUrl = options.url || 'https://www.google.com/webhp?igu=1';
    container.innerHTML = `
      <div class="browser-app">
        <div class="browser-tabs" id="${winId}_tabs"></div>
        <div class="browser-toolbar">
          <button class="browser-nav-btn" id="${winId}_back" title="Zurück">←</button>
          <button class="browser-nav-btn" id="${winId}_fwd" title="Vorwärts">→</button>
          <button class="browser-nav-btn" id="${winId}_reload" title="Aktualisieren">↻</button>
          <button class="browser-nav-btn" id="${winId}_home" title="Startseite">⌂</button>
          <div class="browser-address">
            <input type="text" id="${winId}_url" placeholder="Suchen oder URL eingeben" value="${startUrl}">
          </div>
          <button class="browser-nav-btn" id="${winId}_go" title="Los">➔</button>
          <button class="browser-nav-btn" id="${winId}_newtab" title="Neuer Tab">+</button>
        </div>
        <div class="browser-content" id="${winId}_content"></div>
      </div>
    `;

    const state = {
      tabs: [{ id: 1, title: 'Neuer Tab', url: startUrl, history: [startUrl], histIndex: 0 }],
      activeTab: 1,
      nextId: 2
    };

    const tabsEl = document.getElementById(winId + '_tabs');
    const contentEl = document.getElementById(winId + '_content');
    const urlInput = document.getElementById(winId + '_url');

    const getActive = () => state.tabs.find(t => t.id === state.activeTab);

    const normalizeUrl = (input) => {
      let u = input.trim();
      if (!u) return 'https://www.google.com/webhp?igu=1';
      if (!/^https?:\/\//i.test(u) && !u.includes(' ') && u.includes('.')) {
        u = 'https://' + u;
      } else if (!/^https?:\/\//i.test(u)) {
        u = 'https://www.google.com/search?q=' + encodeURIComponent(u) + '&igu=1';
      }
      return u;
    };

    const renderTabs = () => {
      tabsEl.innerHTML = state.tabs.map(t => `
        <div class="browser-tab ${t.id === state.activeTab ? 'active' : ''}" data-id="${t.id}">
          <span class="tab-title">${this.escape(t.title)}</span>
          <button class="tab-close" data-id="${t.id}">✕</button>
        </div>
      `).join('');
      tabsEl.querySelectorAll('.browser-tab').forEach(el => {
        el.addEventListener('click', (e) => {
          if (e.target.classList.contains('tab-close')) return;
          state.activeTab = parseInt(el.dataset.id);
          renderTabs();
          loadActive();
        });
      });
      tabsEl.querySelectorAll('.tab-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          if (state.tabs.length === 1) {
            // reset
            state.tabs[0].url = 'https://www.google.com/webhp?igu=1';
            state.tabs[0].title = 'Neuer Tab';
            state.tabs[0].history = [state.tabs[0].url];
            state.tabs[0].histIndex = 0;
          } else {
            state.tabs = state.tabs.filter(t => t.id !== id);
            if (state.activeTab === id) state.activeTab = state.tabs[0].id;
          }
          renderTabs();
          loadActive();
        });
      });
    };

    const loadActive = () => {
      const tab = getActive();
      if (!tab) return;
      urlInput.value = tab.url;
      contentEl.innerHTML = '';

      // Block downloads intentionally
      if (/\/download|downloads?\./i.test(tab.url)) {
        contentEl.innerHTML = `
          <div class="browser-fallback">
            <div style="font-size:48px;">🚫</div>
            <h3>Downloads sind deaktiviert</h3>
            <p>Aus Sicherheitsgründen sind Downloads in diesem virtuellen Browser nicht erlaubt.</p>
          </div>
        `;
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.src = tab.url;
      iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox';
      iframe.referrerPolicy = 'no-referrer';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';

      let loaded = false;
      const timeout = setTimeout(() => {
        if (!loaded) {
          showFallback(tab.url);
        }
      }, 5000);

      iframe.onload = () => {
        loaded = true;
        clearTimeout(timeout);
        try {
          // May fail due to cross-origin
          const title = iframe.contentDocument?.title;
          if (title) {
            tab.title = title.slice(0, 40);
            renderTabs();
          }
        } catch (e) {
          tab.title = new URL(tab.url).hostname || 'Seite';
          renderTabs();
        }
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        showFallback(tab.url);
      };

      contentEl.appendChild(iframe);

      // Save history (simple)
      try {
        let hist = JSON.parse(localStorage.getItem('vpc_browser_history') || '[]');
        hist.unshift({ url: tab.url, time: Date.now() });
        hist = hist.slice(0, 50);
        localStorage.setItem('vpc_browser_history', JSON.stringify(hist));
      } catch (e) {}
    };

    const showFallback = (url) => {
      contentEl.innerHTML = `
        <div class="browser-fallback">
          <div style="font-size:48px;">🌐</div>
          <h3>Seite kann nicht eingebettet werden</h3>
          <p>Viele Websites (z.B. Google, YouTube, Banken) blockieren die Anzeige in iframes aus Sicherheitsgründen (X-Frame-Options / CSP).</p>
          <p style="font-size:12px;opacity:0.7;word-break:break-all;">${this.escape(url)}</p>
          <button id="${winId}_openext">In neuem Browser-Tab öffnen</button>
          <p style="font-size:12px;opacity:0.5;margin-top:12px;">Das ist eine Browser-Sicherheitsbeschränkung und kein Fehler dieses virtuellen PCs.</p>
        </div>
      `;
      document.getElementById(winId + '_openext')?.addEventListener('click', () => {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    };

    const navigate = (input) => {
      const tab = getActive();
      if (!tab) return;
      const url = normalizeUrl(input);
      tab.url = url;
      tab.history = tab.history.slice(0, tab.histIndex + 1);
      tab.history.push(url);
      tab.histIndex = tab.history.length - 1;
      tab.title = 'Laden...';
      renderTabs();
      loadActive();
    };

    document.getElementById(winId + '_go').addEventListener('click', () => navigate(urlInput.value));
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') navigate(urlInput.value);
    });
    document.getElementById(winId + '_back').addEventListener('click', () => {
      const tab = getActive();
      if (tab && tab.histIndex > 0) {
        tab.histIndex--;
        tab.url = tab.history[tab.histIndex];
        loadActive();
      }
    });
    document.getElementById(winId + '_fwd').addEventListener('click', () => {
      const tab = getActive();
      if (tab && tab.histIndex < tab.history.length - 1) {
        tab.histIndex++;
        tab.url = tab.history[tab.histIndex];
        loadActive();
      }
    });
    document.getElementById(winId + '_reload').addEventListener('click', () => loadActive());
    document.getElementById(winId + '_home').addEventListener('click', () => navigate('https://www.google.com/webhp?igu=1'));
    document.getElementById(winId + '_newtab').addEventListener('click', () => {
      const id = state.nextId++;
      state.tabs.push({ id, title: 'Neuer Tab', url: 'https://www.google.com/webhp?igu=1', history: ['https://www.google.com/webhp?igu=1'], histIndex: 0 });
      state.activeTab = id;
      renderTabs();
      loadActive();
    });

    renderTabs();
    loadActive();
  },

  escape(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }
};

window.BrowserApp = BrowserApp;
