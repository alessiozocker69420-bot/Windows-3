const SystemInfoApp = {
  render(container, winId) {
    const info = [
      { label: 'Betriebssystem', value: 'Virtual Windows 11 (Browser)' },
      { label: 'Version', value: VirtualPC.version },
      { label: 'Hostname', value: VirtualPC.hostname },
      { label: 'Benutzer', value: VirtualPC.username },
      { label: 'Browser', value: navigator.userAgent },
      { label: 'Plattform', value: navigator.platform },
      { label: 'Sprache', value: navigator.language },
      { label: 'Online', value: navigator.onLine ? 'Ja' : 'Nein' },
      { label: 'Bildschirm', value: screen.width + ' × ' + screen.height },
      { label: 'Farbtiefe', value: screen.colorDepth + ' bit' },
      { label: 'Viewport', value: window.innerWidth + ' × ' + window.innerHeight },
      { label: 'Device Pixel Ratio', value: window.devicePixelRatio },
      { label: 'Touch-Punkte', value: navigator.maxTouchPoints || 0 },
      { label: 'CPU-Kerne (logisch)', value: navigator.hardwareConcurrency || 'n/a' },
      { label: 'Gerätespeicher', value: navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Nicht verfügbar' },
      { label: 'Cookies aktiviert', value: navigator.cookieEnabled ? 'Ja' : 'Nein' },
      { label: 'Zeitzone', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
      { label: 'File System Access API', value: typeof window.showDirectoryPicker === 'function' ? 'Ja' : 'Nein' },
      { label: 'Service Worker', value: 'serviceWorker' in navigator ? 'Ja' : 'Nein' },
      { label: 'Sitzungsstart', value: new Date(VirtualPC.startTime).toLocaleString('de-DE') }
    ];
    container.innerHTML = `
      <div class="sysinfo-app">
        <h2>Systeminformationen</h2>
        <p style="font-size:13px;opacity:0.6;margin-bottom:16px;">Nur tatsächlich vom Browser bereitgestellte Werte. Keine erfundenen Hardware-Daten.</p>
        <div class="sysinfo-grid">
          ${info.map(i => `
            <div class="sysinfo-card">
              <h3>${i.label}</h3>
              <div class="value">${i.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
};
window.SystemInfoApp = SystemInfoApp;
