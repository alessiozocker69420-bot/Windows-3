const NotepadApp = {
  render(container, winId, options = {}) {
    container.innerHTML = `
      <div class="notepad-app">
        <div class="notepad-toolbar">
          <button class="notepad-btn" id="${winId}_new">Neu</button>
          <button class="notepad-btn" id="${winId}_save">Speichern</button>
          <button class="notepad-btn" id="${winId}_find">Suchen</button>
          <span style="flex:1"></span>
          <span id="${winId}_fname" style="font-size:12px;opacity:0.6;padding:0 8px;">${options.filename || 'Unbenannt.txt'}</span>
        </div>
        <textarea class="notepad-textarea" id="${winId}_ta" spellcheck="false">${options.content || ''}</textarea>
      </div>
    `;
    const ta = document.getElementById(winId + '_ta');
    document.getElementById(winId + '_new').addEventListener('click', () => {
      if (ta.value && !confirm('Aktuellen Text verwerfen?')) return;
      ta.value = '';
      document.getElementById(winId + '_fname').textContent = 'Unbenannt.txt';
    });
    document.getElementById(winId + '_save').addEventListener('click', () => {
      // Save into virtual FS Documents
      const name = prompt('Dateiname:', document.getElementById(winId + '_fname').textContent || 'Notiz.txt');
      if (!name) return;
      const docs = VirtualPC.getNode('C:\\Users\\Alessio\\Documents');
      if (docs && docs.children) {
        docs.children[name] = { name, type: 'file', content: ta.value };
        VirtualPC.saveVFS();
        document.getElementById(winId + '_fname').textContent = name;
        VirtualPC.notify('Editor', 'Gespeichert in Documents\\' + name, '💾');
      }
    });
    document.getElementById(winId + '_find').addEventListener('click', () => {
      const q = prompt('Suchen nach:');
      if (!q) return;
      const idx = ta.value.indexOf(q);
      if (idx >= 0) {
        ta.focus();
        ta.setSelectionRange(idx, idx + q.length);
      } else {
        VirtualPC.notify('Editor', 'Nicht gefunden', 'ℹ️');
      }
    });
  }
};
window.NotepadApp = NotepadApp;
