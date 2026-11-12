/**
 * Settings App
 */
const SettingsApp = {
  render(container, winId) {
    let section = 'system';

    const sections = {
      system: 'System',
      personalize: 'Personalisierung',
      apps: 'Apps',
      time: 'Zeit & Sprache',
      privacy: 'Datenschutz'
    };

    const render = () => {
      container.innerHTML = `
        <div class="settings-app">
          <div class="settings-nav">
            ${Object.entries(sections).map(([k, v]) => `
              <div class="settings-nav-item ${section === k ? 'active' : ''}" data-sec="${k}">
                <span>${k === 'system' ? '💻' : k === 'personalize' ? '🎨' : k === 'apps' ? '📦' : k === 'time' ? '🕐' : '🔒'}</span>
                <span>${v}</span>
              </div>
            `).join('')}
          </div>
          <div class="settings-content" id="${winId}_content"></div>
        </div>
      `;

      container.querySelectorAll('.settings-nav-item').forEach(el => {
        el.addEventListener('click', () => {
          section = el.dataset.sec;
          render();
        });
      });

      const content = document.getElementById(winId + '_content');
      if (section === 'system') {
        content.innerHTML = `
          <div class="settings-section">
            <h2>System</h2>
            <div class="settings-card">
              <h3>Geräteinformationen</h3>
              <div class="settings-row"><span>Gerätename</span><span>${VirtualPC.hostname}</span></div>
              <div class="settings-row"><span>Benutzer</span><span>${VirtualPC.username}</span></div>
              <div class="settings-row"><span>Version</span><span>Virtual Windows 11 v${VirtualPC.version}</span></div>
              <div class="settings-row"><span>Browser</span><span>${navigator.userAgent.split(' ').slice(-1)[0]}</span></div>
              <div class="settings-row"><span>Bildschirm</span><span>${screen.width} × ${screen.height}</span></div>
              <div class="settings-row"><span>Viewport</span><span>${window.innerWidth} × ${window.innerHeight}</span></div>
              <div class="settings-row"><span>Online</span><span>${navigator.onLine ? 'Ja' : 'Nein'}</span></div>
              <div class="settings-row"><span>Speicher (geschätzt)</span><span>${navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Nicht verfügbar'}</span></div>
            </div>
          </div>
        `;
      } else if (section === 'personalize') {
        content.innerHTML = `
          <div class="settings-section">
            <h2>Personalisierung</h2>
            <div class="settings-card">
              <h3>Hintergrund</h3>
              <div class="settings-row">
                <span>Wallpaper</span>
                <select id="${winId}_wp">
                  <option value="default" ${VirtualPC.settings.wallpaper==='default'?'selected':''}>Standard (Blau)</option>
                  <option value="dark-blue" ${VirtualPC.settings.wallpaper==='dark-blue'?'selected':''}>Dunkelblau</option>
                  <option value="purple" ${VirtualPC.settings.wallpaper==='purple'?'selected':''}>Lila</option>
                  <option value="green" ${VirtualPC.settings.wallpaper==='green'?'selected':''}>Grün</option>
                  <option value="sunset" ${VirtualPC.settings.wallpaper==='sunset'?'selected':''}>Sonnenuntergang</option>
                </select>
              </div>
            </div>
            <div class="settings-card">
              <h3>Benutzername</h3>
              <div class="settings-row">
                <span>Anzeigename</span>
                <input type="text" id="${winId}_user" value="${VirtualPC.username}" style="background:#333;border:1px solid #444;color:#fff;padding:6px 10px;border-radius:4px;width:140px;">
              </div>
            </div>
          </div>
        `;
        document.getElementById(winId + '_wp').addEventListener('change', (e) => {
          VirtualPC.settings.wallpaper = e.target.value;
          VirtualPC.saveSettings();
          VirtualPC.applyWallpaper();
          VirtualPC.notify('Einstellungen', 'Hintergrund geändert', '🎨');
        });
        document.getElementById(winId + '_user').addEventListener('change', (e) => {
          VirtualPC.username = e.target.value || 'Alessio';
          VirtualPC.settings.username = VirtualPC.username;
          VirtualPC.saveSettings();
          const nameEl = document.querySelector('.user-name');
          if (nameEl) nameEl.textContent = VirtualPC.username;
        });
      } else if (section === 'apps') {
        const list = Object.values(VirtualPC.apps).filter(a => a.installed);
        content.innerHTML = `
          <div class="settings-section">
            <h2>Apps</h2>
            <div class="settings-card">
              <h3>Installierte Apps (${list.length})</h3>
              ${list.map(a => `
                <div class="settings-row">
                  <span>${a.icon} ${a.name}</span>
                  <span style="opacity:0.6;font-size:12px;">${a.category}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (section === 'time') {
        content.innerHTML = `
          <div class="settings-section">
            <h2>Zeit & Sprache</h2>
            <div class="settings-card">
              <h3>Aktuelle Werte</h3>
              <div class="settings-row"><span>Uhrzeit</span><span>${new Date().toLocaleTimeString('de-DE')}</span></div>
              <div class="settings-row"><span>Datum</span><span>${new Date().toLocaleDateString('de-DE')}</span></div>
              <div class="settings-row"><span>Zeitzone</span><span>${Intl.DateTimeFormat().resolvedOptions().timeZone}</span></div>
              <div class="settings-row"><span>Sprache</span><span>${navigator.language}</span></div>
            </div>
          </div>
        `;
      } else if (section === 'privacy') {
        content.innerHTML = `
          <div class="settings-section">
            <h2>Datenschutz</h2>
            <div class="settings-card">
              <h3>Lokale Speicherung</h3>
              <div class="settings-row"><span>Notizen</span><span>LocalStorage</span></div>
              <div class="settings-row"><span>Einstellungen</span><span>LocalStorage</span></div>
              <div class="settings-row"><span>Virtuelles FS</span><span>LocalStorage</span></div>
              <div class="settings-row"><span>Browserverlauf</span><span>LocalStorage</span></div>
            </div>
            <div class="settings-card">
              <h3>Berechtigungen</h3>
              <div class="settings-row"><span>File System Access</span><span>${VirtualPC.realFS.supported ? 'Unterstützt' : 'Nicht verfügbar'}</span></div>
              <div class="settings-row"><span>Downloads</span><span>Dauerhaft gesperrt</span></div>
            </div>
            <button class="btn-secondary" id="${winId}_clear" style="margin-top:12px;">Alle virtuellen Daten löschen</button>
          </div>
        `;
        document.getElementById(winId + '_clear')?.addEventListener('click', () => {
          if (confirm('Wirklich alle gespeicherten virtuellen Daten löschen? (Notizen, Einstellungen, VFS...)')) {
            ['vpc_settings','vpc_vfs','vpc_notes','vpc_installed','vpc_browser_history','vpc_calendar','vpc_todos'].forEach(k => localStorage.removeItem(k));
            VirtualPC.notify('Einstellungen', 'Daten gelöscht. Seite wird neu geladen.', '🗑️');
            setTimeout(() => location.reload(), 1000);
          }
        });
      }
    };

    render();
  }
};

window.SettingsApp = SettingsApp;
