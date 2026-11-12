const TaskManagerApp = {
  render(container, winId) {
    const update = () => {
      const rows = [];
      for (const [id, win] of VirtualPC.windows) {
        const runtime = Math.round((Date.now() - win.created) / 1000);
        rows.push({
          id,
          name: win.title,
          icon: win.icon,
          status: win.minimized ? 'Minimiert' : (VirtualPC.focusedWindow === id ? 'Aktiv' : 'Im Hintergrund'),
          runtime: runtime + 's'
        });
      }
      container.innerHTML = `
        <div class="taskmgr-app">
          <h2>Task-Manager</h2>
          <p style="font-size:12px;opacity:0.6;margin-bottom:12px;">Virtuelle Prozesse dieser Sitzung. Keine echten Systemprozesse.</p>
          <table class="taskmgr-table">
            <thead><tr><th>App</th><th>Status</th><th>Laufzeit</th><th></th></tr></thead>
            <tbody>
              ${rows.length === 0 ? '<tr><td colspan="4" style="text-align:center;opacity:0.5;">Keine geöffneten Apps</td></tr>' :
                rows.map(r => `
                  <tr>
                    <td>${r.icon} ${r.name}</td>
                    <td>${r.status}</td>
                    <td>${r.runtime}</td>
                    <td><button class="taskmgr-end-btn" data-id="${r.id}">Beenden</button></td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
          <div style="margin-top:20px;font-size:13px;opacity:0.7;">
            <div>Geöffnete Fenster: ${VirtualPC.windows.size}</div>
            <div>Sitzungsdauer: ${Math.round((Date.now() - VirtualPC.startTime)/1000)}s</div>
            <div>Browser: ${navigator.userAgent.split(' ').pop()}</div>
          </div>
        </div>
      `;
      container.querySelectorAll('.taskmgr-end-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          VirtualPC.closeWindow(btn.dataset.id);
          update();
        });
      });
    };
    update();
    const interval = setInterval(update, 2000);
    const win = VirtualPC.windows.get(winId);
    if (win) win.cleanup = () => clearInterval(interval);
  }
};
window.TaskManagerApp = TaskManagerApp;
