const AppStoreApp = {
  render(container, winId) {
    const allApps = Object.values(VirtualPC.apps);
    let filter = '';

    const render = () => {
      const list = allApps.filter(a => !filter || a.name.toLowerCase().includes(filter) || a.category.toLowerCase().includes(filter));
      container.innerHTML = `
        <div class="store-app">
          <div class="store-header">
            <h2>Microsoft Store (Virtual)</h2>
            <input type="text" class="store-search" id="${winId}_search" placeholder="Apps suchen..." value="${filter}">
          </div>
          <div class="store-grid">
            ${list.map(app => `
              <div class="store-card">
                <div class="store-icon">${app.icon}</div>
                <h3>${app.name}</h3>
                <p>${app.category}</p>
                <button class="${app.installed ? 'installed' : ''}" data-id="${app.id}">
                  ${app.installed ? 'Installiert' : 'Installieren'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      document.getElementById(winId + '_search').addEventListener('input', (e) => {
        filter = e.target.value;
        render();
      });
      container.querySelectorAll('.store-card button').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const app = VirtualPC.apps[id];
          if (!app) return;
          if (app.installed) {
            // Uninstall (except core ones we keep)
            if (['terminal','explorer','settings','app-store'].includes(id)) {
              VirtualPC.notify('Store', 'System-Apps können nicht deinstalliert werden.', 'ℹ️');
              return;
            }
            app.installed = false;
            VirtualPC.installedApps = VirtualPC.installedApps.filter(x => x !== id);
            VirtualPC.saveInstalled();
            VirtualPC.renderStartMenu();
            VirtualPC.notify('Store', app.name + ' deinstalliert', '📦');
          } else {
            app.installed = true;
            if (!VirtualPC.installedApps.includes(id)) VirtualPC.installedApps.push(id);
            VirtualPC.saveInstalled();
            VirtualPC.renderStartMenu();
            VirtualPC.notify('Store', app.name + ' installiert', '✅');
          }
          render();
        });
      });
    };
    render();
  }
};
window.AppStoreApp = AppStoreApp;
