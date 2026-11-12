const RecycleBinApp = {
  items: [],
  key: 'vpc_recycle',

  load() {
    try { this.items = JSON.parse(localStorage.getItem(this.key) || '[]'); } catch(e) { this.items = []; }
  },
  save() {
    try { localStorage.setItem(this.key, JSON.stringify(this.items)); } catch(e) {}
  },

  render(container, winId) {
    this.load();
    const render = () => {
      container.innerHTML = `
        <div class="recycle-app">
          <h2 style="margin-bottom:16px;">Papierkorb</h2>
          ${this.items.length === 0 ? `
            <div class="recycle-empty">
              <div style="font-size:48px;margin-bottom:12px;">🗑️</div>
              <p>Der Papierkorb ist leer.</p>
              <p style="font-size:12px;margin-top:8px;">Virtuelle Dateien, die gelöscht werden, erscheinen hier.</p>
            </div>
          ` : `
            <div style="margin-bottom:12px;">
              <button class="btn-secondary" id="${winId}_empty">Papierkorb leeren</button>
            </div>
            ${this.items.map(item => `
              <div class="recycle-item">
                <span style="font-size:24px;">${item.icon || '📄'}</span>
                <div>
                  <div style="font-weight:600;">${item.name}</div>
                  <div style="font-size:11px;opacity:0.5;">${new Date(item.deleted).toLocaleString('de-DE')}</div>
                </div>
                <div class="recycle-actions">
                  <button class="restore" data-id="${item.id}">Wiederherstellen</button>
                  <button data-id="${item.id}" class="del">Endgültig</button>
                </div>
              </div>
            `).join('')}
          `}
        </div>
      `;
      document.getElementById(winId + '_empty')?.addEventListener('click', () => {
        if (confirm('Papierkorb wirklich leeren?')) {
          this.items = [];
          this.save();
          render();
        }
      });
      container.querySelectorAll('.restore').forEach(btn => {
        btn.addEventListener('click', () => {
          // Simple restore: just remove from recycle (full restore to VFS would need path)
          this.items = this.items.filter(i => i.id !== btn.dataset.id);
          this.save();
          VirtualPC.notify('Papierkorb', 'Element wiederhergestellt (aus Papierkorb entfernt)', '♻️');
          render();
        });
      });
      container.querySelectorAll('.del').forEach(btn => {
        btn.addEventListener('click', () => {
          this.items = this.items.filter(i => i.id !== btn.dataset.id);
          this.save();
          render();
        });
      });
    };
    render();
  }
};
window.RecycleBinApp = RecycleBinApp;
