/**
 * Virtual Windows 11 PC - Core System
 * Pure HTML/CSS/JS, GitHub Pages compatible
 *
 * ZIP-Download-Passwort (absichtlich lesbar im Code): heyduhacker123
 */

const VirtualPC = {
  version: '1.0.0',
  username: 'Alessio',
  hostname: 'VIRTUAL-PC',
  windows: new Map(),
  nextZ: 100,
  focusedWindow: null,
  apps: {},
  installedApps: [],
  settings: {},
  notifications: [],
  desktopIcons: [],
  isTouch: false,
  matrixActive: false,
  matrixAnimId: null,
  startTime: Date.now(),
  volume: 70,

  // Virtual filesystem (in-memory + IndexedDB)
  vfs: {
    currentPath: 'C:\\Users\\Alessio',
    root: {
      name: 'C:',
      type: 'drive',
      children: {
        'Users': {
          name: 'Users', type: 'folder', children: {
            'Alessio': {
              name: 'Alessio', type: 'folder', children: {
                'Desktop': { name: 'Desktop', type: 'folder', children: {} },
                'Documents': { name: 'Documents', type: 'folder', children: {
                  'Willkommen.txt': { name: 'Willkommen.txt', type: 'file', content: 'Willkommen auf dem virtuellen Windows 11 PC!\n\nDieses System speichert Daten lokal im Browser.\n\nViel Spaß beim Erkunden!' },
                  'Notizen.txt': { name: 'Notizen.txt', type: 'file', content: 'Hier können Sie Notizen speichern.' }
                }},
                'Pictures': { name: 'Pictures', type: 'folder', children: {} },
                'Music': { name: 'Music', type: 'folder', children: {} },
                'Videos': { name: 'Videos', type: 'folder', children: {} },
                'Downloads': { name: 'Downloads', type: 'folder', children: {}, restricted: true }
              }
            }
          }
        },
        'Windows': {
          name: 'Windows', type: 'folder', children: {
            'System32': { name: 'System32', type: 'folder', children: {} }
          }
        },
        'Program Files': { name: 'Program Files', type: 'folder', children: {} }
      }
    }
  },

  // Real FS handle (File System Access API)
  realFS: {
    handle: null,
    supported: typeof window.showDirectoryPicker === 'function'
  },

  init() {
    this.detectTouch();
    this.loadSettings();
    this.loadVFS();
    this.registerApps();
    this.setupDesktop();
    this.setupTaskbar();
    this.setupStartMenu();
    this.setupContextMenu();
    this.setupNotifications();
    this.setupClock();
    this.setupKeyboard();
    this.setupTouchGestures();
    this.applyWallpaper();
    this.bootSequence();
    this.registerServiceWorker();
  },

  detectTouch() {
    this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (this.isTouch) document.body.classList.add('touch-device');
  },

  bootSequence() {
    setTimeout(() => {
      const boot = document.getElementById('boot-screen');
      if (boot) {
        boot.classList.add('fade-out');
        setTimeout(() => boot.remove(), 700);
      }
      this.notify('System', 'Willkommen, ' + this.username + '!', '💻');
    }, 1800);
  },

  // ========== Storage ==========
  loadSettings() {
    try {
      const raw = localStorage.getItem('vpc_settings');
      this.settings = raw ? JSON.parse(raw) : {
        wallpaper: 'default',
        theme: 'dark',
        accent: '#0078d4',
        username: 'Alessio',
        clockFormat: '24h',
        language: 'de'
      };
      this.username = this.settings.username || 'Alessio';
    } catch (e) {
      this.settings = { wallpaper: 'default', theme: 'dark' };
    }
  },

  saveSettings() {
    try {
      localStorage.setItem('vpc_settings', JSON.stringify(this.settings));
    } catch (e) {}
  },

  loadVFS() {
    try {
      const raw = localStorage.getItem('vpc_vfs');
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.root) this.vfs.root = data.root;
        if (data && data.currentPath) this.vfs.currentPath = data.currentPath;
      }
    } catch (e) {}
  },

  saveVFS() {
    try {
      localStorage.setItem('vpc_vfs', JSON.stringify({
        root: this.vfs.root,
        currentPath: this.vfs.currentPath
      }));
    } catch (e) {}
  },

  // ========== Apps Registry ==========
  registerApps() {
    // Core apps that are always available
    const core = [
      { id: 'terminal', name: 'Terminal', icon: '⬛', category: 'System', pinned: true },
      { id: 'notes', name: 'Notizen', icon: '📝', category: 'Produktivität', pinned: true },
      { id: 'browser', name: 'Microsoft Edge', icon: '🌐', category: 'Internet', pinned: true },
      { id: 'explorer', name: 'Datei-Explorer', icon: '📁', category: 'System', pinned: true },
      { id: 'calculator', name: 'Rechner', icon: '🔢', category: 'Dienstprogramme', pinned: true },
      { id: 'paint', name: 'Paint', icon: '🎨', category: 'Kreativität', pinned: true },
      { id: 'settings', name: 'Einstellungen', icon: '⚙️', category: 'System', pinned: true },
      { id: 'calendar', name: 'Kalender', icon: '📅', category: 'Produktivität', pinned: false },
      { id: 'clock', name: 'Uhr', icon: '🕐', category: 'Dienstprogramme', pinned: false },
      { id: 'music', name: 'Medienplayer', icon: '🎵', category: 'Medien', pinned: false },
      { id: 'video', name: 'Videoplayer', icon: '🎬', category: 'Medien', pinned: false },
      { id: 'image-viewer', name: 'Fotos', icon: '🖼️', category: 'Medien', pinned: false },
      { id: 'notepad', name: 'Editor', icon: '📄', category: 'Produktivität', pinned: false },
      { id: 'task-manager', name: 'Task-Manager', icon: '📊', category: 'System', pinned: false },
      { id: 'app-store', name: 'Microsoft Store', icon: '🛍️', category: 'System', pinned: true },
      { id: 'system-info', name: 'Systeminfo', icon: 'ℹ️', category: 'System', pinned: false },
      { id: 'recycle-bin', name: 'Papierkorb', icon: '🗑️', category: 'System', pinned: false },
      { id: 'screenshot', name: 'Ausschneiden und skizzieren', icon: '✂️', category: 'Dienstprogramme', pinned: false },
      { id: 'todo', name: 'Aufgaben', icon: '✅', category: 'Produktivität', pinned: false }
    ];

    try {
      const stored = localStorage.getItem('vpc_installed');
      this.installedApps = stored ? JSON.parse(stored) : core.map(a => a.id);
    } catch (e) {
      this.installedApps = core.map(a => a.id);
    }

    this.apps = {};
    core.forEach(app => {
      this.apps[app.id] = { ...app, installed: this.installedApps.includes(app.id) };
    });
  },

  saveInstalled() {
    try {
      localStorage.setItem('vpc_installed', JSON.stringify(this.installedApps));
    } catch (e) {}
  },

  // ========== Desktop ==========
  setupDesktop() {
    const icons = [
      { id: 'recycle-bin', name: 'Papierkorb', icon: '🗑️' },
      { id: 'explorer', name: 'Dieser PC', icon: '💻' },
      { id: 'browser', name: 'Microsoft Edge', icon: '🌐' },
      { id: 'notes', name: 'Notizen', icon: '📝' },
      { id: 'terminal', name: 'Terminal', icon: '⬛' },
      { id: 'settings', name: 'Einstellungen', icon: '⚙️' }
    ];
    this.desktopIcons = icons;
    this.renderDesktopIcons();

    const desktop = document.getElementById('desktop');
    desktop.addEventListener('click', (e) => {
      if (e.target === desktop || e.target.id === 'wallpaper' || e.target.id === 'desktop-icons') {
        this.closeStartMenu();
        this.closeNotificationCenter();
        this.hideContextMenu();
        document.querySelectorAll('.desktop-icon.selected').forEach(el => el.classList.remove('selected'));
      }
    });

    // Prevent default context menu on desktop
    desktop.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.window') || e.target.closest('.start-menu') || e.target.closest('.notification-center')) return;
      e.preventDefault();
      this.showContextMenu(e.clientX, e.clientY);
    });
  },

  renderDesktopIcons() {
    const container = document.getElementById('desktop-icons');
    container.innerHTML = '';
    this.desktopIcons.forEach(icon => {
      const el = document.createElement('div');
      el.className = 'desktop-icon';
      el.dataset.app = icon.id;
      el.innerHTML = `<div class="icon-img">${icon.icon}</div><div class="icon-label">${icon.name}</div>`;
      
      // Mouse
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
      });
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.openApp(icon.id);
      });

      // Touch
      let touchTimer = null;
      let touchMoved = false;
      el.addEventListener('touchstart', (e) => {
        touchMoved = false;
        touchTimer = setTimeout(() => {
          // Long press = context (optional)
        }, 600);
      }, { passive: true });
      el.addEventListener('touchmove', () => { touchMoved = true; clearTimeout(touchTimer); }, { passive: true });
      el.addEventListener('touchend', (e) => {
        clearTimeout(touchTimer);
        if (touchMoved) return;
        // Double tap detection
        const now = Date.now();
        if (el._lastTap && now - el._lastTap < 350) {
          e.preventDefault();
          this.openApp(icon.id);
          el._lastTap = 0;
        } else {
          el._lastTap = now;
          document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
          el.classList.add('selected');
        }
      });

      container.appendChild(el);
    });
  },

  applyWallpaper() {
    const wp = document.getElementById('wallpaper');
    wp.className = 'wallpaper ' + (this.settings.wallpaper || 'default');
  },

  // ========== Window Manager ==========
  openApp(appId, options = {}) {
    if (!this.apps[appId] || !this.apps[appId].installed) {
      this.notify('System', 'App nicht installiert: ' + appId, '⚠️');
      return null;
    }

    // Check if already open (single instance for some apps)
    for (const [id, win] of this.windows) {
      if (win.appId === appId && !options.forceNew) {
        this.focusWindow(id);
        if (win.el.classList.contains('minimized')) {
          win.el.classList.remove('minimized');
          this.updateTaskbar();
        }
        return id;
      }
    }

    const app = this.apps[appId];
    const winId = 'win_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const defaultSize = this.getDefaultSize(appId);

    const winEl = document.createElement('div');
    winEl.className = 'window';
    winEl.id = winId;
    winEl.style.width = defaultSize.w + 'px';
    winEl.style.height = defaultSize.h + 'px';
    winEl.style.left = Math.max(20, (window.innerWidth - defaultSize.w) / 2 + (this.windows.size * 24) % 100) + 'px';
    winEl.style.top = Math.max(20, 40 + (this.windows.size * 28) % 80) + 'px';
    winEl.style.zIndex = ++this.nextZ;

    winEl.innerHTML = `
      <div class="window-titlebar" data-win="${winId}">
        <span class="window-icon">${app.icon}</span>
        <span class="window-title">${app.name}</span>
        <div class="window-controls">
          <button class="window-btn minimize" data-action="minimize" title="Minimieren">─</button>
          <button class="window-btn maximize" data-action="maximize" title="Maximieren">□</button>
          <button class="window-btn close" data-action="close" title="Schließen">✕</button>
        </div>
      </div>
      <div class="window-content" id="${winId}_content"></div>
      <div class="window-resize n" data-dir="n"></div>
      <div class="window-resize s" data-dir="s"></div>
      <div class="window-resize e" data-dir="e"></div>
      <div class="window-resize w" data-dir="w"></div>
      <div class="window-resize ne" data-dir="ne"></div>
      <div class="window-resize nw" data-dir="nw"></div>
      <div class="window-resize se" data-dir="se"></div>
      <div class="window-resize sw" data-dir="sw"></div>
    `;

    document.getElementById('windows-container').appendChild(winEl);

    const win = {
      id: winId,
      appId,
      el: winEl,
      title: app.name,
      icon: app.icon,
      maximized: false,
      minimized: false,
      prevRect: null,
      created: Date.now()
    };
    this.windows.set(winId, win);

    // Titlebar controls
    winEl.querySelectorAll('.window-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'close') this.closeWindow(winId);
        else if (action === 'minimize') this.minimizeWindow(winId);
        else if (action === 'maximize') this.toggleMaximize(winId);
      });
    });

    // Focus on click
    winEl.addEventListener('mousedown', () => this.focusWindow(winId));
    winEl.addEventListener('touchstart', () => this.focusWindow(winId), { passive: true });

    // Drag
    this.makeDraggable(winEl, winId);
    this.makeResizable(winEl, winId);

    // Double click titlebar to maximize
    winEl.querySelector('.window-titlebar').addEventListener('dblclick', () => this.toggleMaximize(winId));

    // Render app content
    const contentEl = document.getElementById(winId + '_content');
    this.renderAppContent(appId, contentEl, winId, options);

    this.focusWindow(winId);
    this.updateTaskbar();
    this.closeStartMenu();

    return winId;
  },

  getDefaultSize(appId) {
    const sizes = {
      calculator: { w: 340, h: 480 },
      clock: { w: 380, h: 420 },
      notes: { w: 700, h: 500 },
      terminal: { w: 680, h: 420 },
      browser: { w: 900, h: 600 },
      paint: { w: 800, h: 560 },
      settings: { w: 800, h: 560 },
      explorer: { w: 780, h: 520 },
      'task-manager': { w: 640, h: 440 },
      'app-store': { w: 820, h: 560 },
      'system-info': { w: 640, h: 480 },
      calendar: { w: 560, h: 520 },
      notepad: { w: 600, h: 440 },
      music: { w: 480, h: 360 },
      video: { w: 720, h: 480 },
      'image-viewer': { w: 700, h: 500 },
      screenshot: { w: 640, h: 480 },
      todo: { w: 480, h: 520 },
      'recycle-bin': { w: 560, h: 400 }
    };
    const s = sizes[appId] || { w: 640, h: 480 };
    // Clamp to viewport
    s.w = Math.min(s.w, window.innerWidth - 20);
    s.h = Math.min(s.h, window.innerHeight - 70);
    return s;
  },

  renderAppContent(appId, container, winId, options) {
    // Delegate to app modules
    const renderers = {
      terminal: () => window.TerminalApp && TerminalApp.render(container, winId),
      notes: () => window.NotesApp && NotesApp.render(container, winId),
      browser: () => window.BrowserApp && BrowserApp.render(container, winId, options),
      explorer: () => window.ExplorerApp && ExplorerApp.render(container, winId),
      calculator: () => window.CalculatorApp && CalculatorApp.render(container, winId),
      paint: () => window.PaintApp && PaintApp.render(container, winId),
      settings: () => window.SettingsApp && SettingsApp.render(container, winId),
      calendar: () => window.CalendarApp && CalendarApp.render(container, winId),
      clock: () => window.ClockApp && ClockApp.render(container, winId),
      music: () => window.MusicApp && MusicApp.render(container, winId),
      video: () => window.VideoApp && VideoApp.render(container, winId),
      'image-viewer': () => window.ImageViewerApp && ImageViewerApp.render(container, winId),
      notepad: () => window.NotepadApp && NotepadApp.render(container, winId),
      'task-manager': () => window.TaskManagerApp && TaskManagerApp.render(container, winId),
      'app-store': () => window.AppStoreApp && AppStoreApp.render(container, winId),
      'system-info': () => window.SystemInfoApp && SystemInfoApp.render(container, winId),
      'recycle-bin': () => window.RecycleBinApp && RecycleBinApp.render(container, winId),
      screenshot: () => window.ScreenshotApp && ScreenshotApp.render(container, winId),
      todo: () => window.TodoApp && TodoApp.render(container, winId)
    };

    if (renderers[appId]) {
      try {
        renderers[appId]();
      } catch (err) {
        container.innerHTML = `<div style="padding:20px;color:#f55;">Fehler beim Laden der App: ${err.message}</div>`;
        console.error(err);
      }
    } else {
      container.innerHTML = `<div style="padding:40px;text-align:center;opacity:0.6;">App "${appId}" ist noch nicht implementiert.</div>`;
    }
  },

  focusWindow(winId) {
    const win = this.windows.get(winId);
    if (!win) return;
    this.nextZ++;
    win.el.style.zIndex = this.nextZ;
    document.querySelectorAll('.window.focused').forEach(w => w.classList.remove('focused'));
    win.el.classList.add('focused');
    this.focusedWindow = winId;
    this.updateTaskbar();
  },

  closeWindow(winId) {
    const win = this.windows.get(winId);
    if (!win) return;
    // Cleanup hooks
    if (win.cleanup) try { win.cleanup(); } catch(e) {}
    win.el.remove();
    this.windows.delete(winId);
    if (this.focusedWindow === winId) this.focusedWindow = null;
    this.updateTaskbar();
  },

  minimizeWindow(winId) {
    const win = this.windows.get(winId);
    if (!win) return;
    win.el.classList.add('minimized');
    win.minimized = true;
    this.updateTaskbar();
  },

  toggleMaximize(winId) {
    const win = this.windows.get(winId);
    if (!win) return;
    if (win.maximized) {
      win.el.classList.remove('maximized');
      if (win.prevRect) {
        win.el.style.left = win.prevRect.left;
        win.el.style.top = win.prevRect.top;
        win.el.style.width = win.prevRect.width;
        win.el.style.height = win.prevRect.height;
      }
      win.maximized = false;
    } else {
      win.prevRect = {
        left: win.el.style.left,
        top: win.el.style.top,
        width: win.el.style.width,
        height: win.el.style.height
      };
      win.el.classList.add('maximized');
      win.maximized = true;
    }
    this.updateTaskbar();
  },

  makeDraggable(el, winId) {
    const titlebar = el.querySelector('.window-titlebar');
    let startX, startY, startLeft, startTop, dragging = false;

    const onStart = (clientX, clientY) => {
      const win = this.windows.get(winId);
      if (!win || win.maximized) return;
      dragging = true;
      startX = clientX;
      startY = clientY;
      startLeft = parseInt(el.style.left) || 0;
      startTop = parseInt(el.style.top) || 0;
      this.focusWindow(winId);
    };

    const onMove = (clientX, clientY) => {
      if (!dragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      el.style.left = Math.max(-el.offsetWidth + 100, Math.min(window.innerWidth - 50, startLeft + dx)) + 'px';
      el.style.top = Math.max(0, Math.min(window.innerHeight - 80, startTop + dy)) + 'px';
    };

    const onEnd = () => { dragging = false; };

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-btn')) return;
      e.preventDefault();
      onStart(e.clientX, e.clientY);
      const move = (ev) => onMove(ev.clientX, ev.clientY);
      const up = () => {
        onEnd();
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });

    // Touch drag
    titlebar.addEventListener('touchstart', (e) => {
      if (e.target.closest('.window-btn')) return;
      const t = e.touches[0];
      onStart(t.clientX, t.clientY);
    }, { passive: true });

    titlebar.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      e.preventDefault();
      const t = e.touches[0];
      onMove(t.clientX, t.clientY);
    }, { passive: false });

    titlebar.addEventListener('touchend', onEnd);
  },

  makeResizable(el, winId) {
    const handles = el.querySelectorAll('.window-resize');
    handles.forEach(handle => {
      let startX, startY, startW, startH, startL, startT, dir, resizing = false;

      const onStart = (clientX, clientY) => {
        const win = this.windows.get(winId);
        if (!win || win.maximized) return;
        resizing = true;
        dir = handle.dataset.dir;
        startX = clientX;
        startY = clientY;
        startW = el.offsetWidth;
        startH = el.offsetHeight;
        startL = parseInt(el.style.left) || 0;
        startT = parseInt(el.style.top) || 0;
        this.focusWindow(winId);
      };

      const onMove = (clientX, clientY) => {
        if (!resizing) return;
        const dx = clientX - startX;
        const dy = clientY - startY;
        let newW = startW, newH = startH, newL = startL, newT = startT;

        if (dir.includes('e')) newW = Math.max(280, startW + dx);
        if (dir.includes('s')) newH = Math.max(180, startH + dy);
        if (dir.includes('w')) {
          newW = Math.max(280, startW - dx);
          newL = startL + (startW - newW);
        }
        if (dir.includes('n')) {
          newH = Math.max(180, startH - dy);
          newT = startT + (startH - newH);
        }

        el.style.width = newW + 'px';
        el.style.height = newH + 'px';
        el.style.left = newL + 'px';
        el.style.top = newT + 'px';
      };

      const onEnd = () => { resizing = false; };

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onStart(e.clientX, e.clientY);
        const move = (ev) => onMove(ev.clientX, ev.clientY);
        const up = () => {
          onEnd();
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', up);
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
      });
    });
  },

  // ========== Taskbar ==========
  setupTaskbar() {
    document.getElementById('start-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleStartMenu();
    });
    document.getElementById('search-btn').addEventListener('click', () => {
      this.openStartMenu();
      setTimeout(() => document.getElementById('start-search')?.focus(), 100);
    });
    document.getElementById('notif-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleNotificationCenter();
    });
    document.getElementById('clock').addEventListener('click', () => this.openApp('clock'));
    document.getElementById('volume-slider')?.addEventListener('input', (e) => {
      this.volume = parseInt(e.target.value);
      document.getElementById('volume-value').textContent = this.volume;
      document.getElementById('volume-icon').textContent = this.volume === 0 ? '🔇' : this.volume < 40 ? '🔉' : '🔊';
    });
  },

  updateTaskbar() {
    const container = document.getElementById('taskbar-apps');
    container.innerHTML = '';
    const seen = new Set();
    for (const [id, win] of this.windows) {
      if (seen.has(win.appId)) continue;
      seen.add(win.appId);
      const btn = document.createElement('button');
      btn.className = 'taskbar-app' + (this.focusedWindow === id && !win.minimized ? ' active' : '') + (win.minimized ? ' minimized' : '');
      btn.title = win.title;
      btn.innerHTML = win.icon;
      btn.addEventListener('click', () => {
        if (win.minimized) {
          win.el.classList.remove('minimized');
          win.minimized = false;
          this.focusWindow(id);
        } else if (this.focusedWindow === id) {
          this.minimizeWindow(id);
        } else {
          this.focusWindow(id);
        }
        this.updateTaskbar();
      });
      container.appendChild(btn);
    }
  },

  // ========== Start Menu ==========
  setupStartMenu() {
    this.renderStartMenu();
    document.getElementById('start-search')?.addEventListener('input', (e) => {
      this.filterStartMenu(e.target.value);
    });
    document.getElementById('power-btn')?.addEventListener('click', () => {
      if (confirm('Virtuellen PC neu starten? (Seite wird neu geladen)')) {
        location.reload();
      }
    });
  },

  renderStartMenu() {
    const pinned = document.getElementById('pinned-apps');
    const all = document.getElementById('all-apps');
    if (!pinned || !all) return;

    pinned.innerHTML = '';
    all.innerHTML = '';

    Object.values(this.apps)
      .filter(a => a.installed && a.pinned)
      .forEach(app => {
        const el = document.createElement('div');
        el.className = 'app-grid-item';
        el.innerHTML = `<div class="app-icon">${app.icon}</div><div class="app-name">${app.name}</div>`;
        el.addEventListener('click', () => this.openApp(app.id));
        pinned.appendChild(el);
      });

    Object.values(this.apps)
      .filter(a => a.installed)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(app => {
        const el = document.createElement('div');
        el.className = 'app-list-item';
        el.dataset.name = app.name.toLowerCase();
        el.innerHTML = `<div class="app-icon">${app.icon}</div><div class="app-name">${app.name}</div>`;
        el.addEventListener('click', () => this.openApp(app.id));
        all.appendChild(el);
      });
  },

  filterStartMenu(query) {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('#all-apps .app-list-item').forEach(el => {
      el.style.display = !q || el.dataset.name.includes(q) ? '' : 'none';
    });
  },

  toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    if (menu.classList.contains('hidden')) {
      this.openStartMenu();
    } else {
      this.closeStartMenu();
    }
  },

  openStartMenu() {
    document.getElementById('start-menu').classList.remove('hidden');
    document.getElementById('start-btn').classList.add('active');
    this.closeNotificationCenter();
    this.hideContextMenu();
    this.renderStartMenu();
  },

  closeStartMenu() {
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('start-btn').classList.remove('active');
    const search = document.getElementById('start-search');
    if (search) search.value = '';
  },

  // ========== Notifications ==========
  setupNotifications() {
    document.getElementById('clear-notifications')?.addEventListener('click', () => {
      this.notifications = [];
      this.renderNotifications();
    });
    document.querySelectorAll('.qs-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('active');
      });
    });
  },

  notify(title, body, icon = '💬') {
    const notif = {
      id: Date.now(),
      title,
      body,
      icon,
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    };
    this.notifications.unshift(notif);
    if (this.notifications.length > 20) this.notifications.pop();
    this.renderNotifications();

    // Temporary toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = title + ': ' + body;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  },

  renderNotifications() {
    const list = document.getElementById('notifications-list');
    if (!list) return;
    if (this.notifications.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;opacity:0.5;">Keine neuen Benachrichtigungen</div>';
      return;
    }
    list.innerHTML = this.notifications.map(n => `
      <div class="notification-item" data-id="${n.id}">
        <div class="notif-icon">${n.icon}</div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-body">${n.body}</div>
          <div class="notif-time">${n.time}</div>
        </div>
        <button class="notif-close" data-id="${n.id}">✕</button>
      </div>
    `).join('');
    list.querySelectorAll('.notif-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this.notifications = this.notifications.filter(n => n.id != btn.dataset.id);
        this.renderNotifications();
      });
    });
  },

  toggleNotificationCenter() {
    const nc = document.getElementById('notification-center');
    if (nc.classList.contains('hidden')) {
      nc.classList.remove('hidden');
      this.closeStartMenu();
      this.renderNotifications();
    } else {
      nc.classList.add('hidden');
    }
  },

  closeNotificationCenter() {
    document.getElementById('notification-center')?.classList.add('hidden');
  },

  // ========== Context Menu ==========
  setupContextMenu() {
    document.getElementById('context-menu')?.addEventListener('click', (e) => {
      const item = e.target.closest('.ctx-item');
      if (!item) return;
      const action = item.dataset.action;
      this.hideContextMenu();
      if (action === 'refresh') {
        this.renderDesktopIcons();
        this.notify('Desktop', 'Aktualisiert', '🔄');
      } else if (action === 'personalize' || action === 'display') {
        this.openApp('settings');
      } else if (action === 'new-folder') {
        this.notify('Desktop', 'Neuer Ordner wird im virtuellen Dateisystem erstellt.', '📁');
        // Could add to VFS Desktop
      }
    });
    document.addEventListener('click', () => this.hideContextMenu());
  },

  showContextMenu(x, y) {
    const menu = document.getElementById('context-menu');
    menu.classList.remove('hidden');
    const rect = menu.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + 200 > window.innerWidth) left = window.innerWidth - 210;
    if (top + 200 > window.innerHeight - 50) top = window.innerHeight - 250;
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  },

  hideContextMenu() {
    document.getElementById('context-menu')?.classList.add('hidden');
  },

  // ========== Clock ==========
  setupClock() {
    const update = () => {
      const now = new Date();
      const timeEl = document.getElementById('clock-time');
      const dateEl = document.getElementById('clock-date');
      if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    };
    update();
    setInterval(update, 1000);
  },

  // ========== Keyboard ==========
  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      // ESC closes menus / matrix
      if (e.key === 'Escape') {
        if (this.matrixActive) {
          this.stopMatrix();
          return;
        }
        this.closeStartMenu();
        this.closeNotificationCenter();
        this.hideContextMenu();
      }
      // Win key simulation (Ctrl+Meta or Alt)
      // Ctrl+Shift+Esc = Task Manager
      if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        this.openApp('task-manager');
      }
    });
  },

  setupTouchGestures() {
    // Prevent pull-to-refresh on some mobile browsers when overscrolling desktop
    document.body.addEventListener('touchmove', (e) => {
      if (e.target === document.getElementById('desktop') || e.target.id === 'wallpaper') {
        // allow
      }
    }, { passive: true });
  },

  // ========== Matrix Mode ==========
  startMatrix(intense = false) {
    if (this.matrixActive) return;
    this.matrixActive = true;
    const canvas = document.getElementById('matrix-canvas');
    canvas.classList.remove('hidden');
    canvas.classList.add('active');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = intense ? 16 : 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1).map(() => Math.random() * -50);
    const speeds = Array(columns).fill(0).map(() => 0.5 + Math.random() * 1.5);

    ctx.fillStyle = intense ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.12)';
    
    const draw = () => {
      if (!this.matrixActive) return;
      ctx.fillStyle = intense ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const brightness = Math.random();
        if (intense) {
          ctx.fillStyle = brightness > 0.95 ? '#fff' : brightness > 0.7 ? '#80ff80' : '#00ff41';
          ctx.shadowColor = '#00ff41';
          ctx.shadowBlur = brightness > 0.8 ? 8 : 2;
        } else {
          ctx.fillStyle = brightness > 0.9 ? '#a0ffa0' : '#00cc33';
          ctx.shadowBlur = 0;
        }
        ctx.font = fontSize + 'px monospace';
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speeds[i];
      }
      this.matrixAnimId = requestAnimationFrame(draw);
    };
    draw();

    // ESC to stop is handled in keyboard
    canvas.addEventListener('click', () => this.stopMatrix(), { once: true });
  },

  stopMatrix() {
    this.matrixActive = false;
    if (this.matrixAnimId) cancelAnimationFrame(this.matrixAnimId);
    const canvas = document.getElementById('matrix-canvas');
    canvas.classList.add('hidden');
    canvas.classList.remove('active');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },

  // ========== VFS Helpers ==========
  resolvePath(path) {
    // Normalize path like C:\Users\Alessio\Documents
    path = path.replace(/\//g, '\\').replace(/\\+/g, '\\');
    if (!path.toUpperCase().startsWith('C:')) {
      // relative
      const base = this.vfs.currentPath;
      if (path === '..') {
        const parts = base.split('\\').filter(Boolean);
        if (parts.length > 1) parts.pop();
        path = parts.join('\\');
        if (!path.endsWith(':') && parts.length === 1) path += '\\';
      } else if (path === '.' || path === '') {
        path = base;
      } else {
        path = base.replace(/\\$/, '') + '\\' + path;
      }
    }
    path = path.replace(/\\+/g, '\\');
    if (path.endsWith('\\') && path.length > 3) path = path.slice(0, -1);
    return path;
  },

  getNode(path) {
    path = this.resolvePath(path);
    const parts = path.split('\\').filter(Boolean);
    let node = this.vfs.root;
    // First part is C:
    for (let i = 1; i < parts.length; i++) {
      if (!node.children || !node.children[parts[i]]) return null;
      node = node.children[parts[i]];
      if (node.restricted) return { restricted: true, name: node.name };
    }
    return node;
  },

  listDir(path) {
    const node = this.getNode(path);
    if (!node) return { error: 'Pfad nicht gefunden.' };
    if (node.restricted) return { error: 'Zugriff verweigert: Downloads-Ordner ist gesperrt.' };
    if (node.type === 'file') return { error: 'Ist eine Datei, kein Ordner.' };
    const items = [];
    if (node.children) {
      for (const key of Object.keys(node.children).sort()) {
        const child = node.children[key];
        if (child.restricted) continue; // never show Downloads
        items.push({
          name: child.name,
          type: child.type,
          size: child.content ? child.content.length : 0
        });
      }
    }
    return { items, path: this.resolvePath(path) };
  },

  // ========== Service Worker ==========
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }
  },

  // Utility toast
  toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => {
  VirtualPC.init();
});

// Expose globally
window.VirtualPC = VirtualPC;
