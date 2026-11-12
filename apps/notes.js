/**
 * Notes App - IndexedDB / LocalStorage
 */
const NotesApp = {
  notes: [],
  currentId: null,
  storageKey: 'vpc_notes',

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.notes = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.notes = [];
    }
  },

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
    } catch (e) {}
  },

  render(container, winId) {
    this.load();
    container.innerHTML = `
      <div class="notes-app">
        <div class="notes-sidebar">
          <div class="notes-sidebar-header">
            <button id="${winId}_new">+ Neu</button>
          </div>
          <div class="notes-search">
            <input type="text" id="${winId}_search" placeholder="Notizen durchsuchen...">
          </div>
          <div class="notes-list" id="${winId}_list"></div>
        </div>
        <div class="notes-editor" id="${winId}_editor">
          <div class="notes-empty">Wählen Sie eine Notiz oder erstellen Sie eine neue.</div>
        </div>
      </div>
    `;

    const listEl = document.getElementById(winId + '_list');
    const editorEl = document.getElementById(winId + '_editor');
    const searchEl = document.getElementById(winId + '_search');

    const renderList = (filter = '') => {
      const q = filter.toLowerCase();
      const filtered = this.notes.filter(n =>
        !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      ).sort((a, b) => b.updated - a.updated);

      if (filtered.length === 0) {
        listEl.innerHTML = '<div style="padding:16px;opacity:0.5;font-size:13px;text-align:center;">Keine Notizen</div>';
        return;
      }
      listEl.innerHTML = filtered.map(n => `
        <div class="note-item ${n.id === this.currentId ? 'active' : ''}" data-id="${n.id}">
          <div class="note-title">${this.escape(n.title) || 'Ohne Titel'}</div>
          <div class="note-preview">${this.escape(n.content.slice(0, 60))}</div>
          <div class="note-date">${new Date(n.updated).toLocaleString('de-DE')}</div>
        </div>
      `).join('');

      listEl.querySelectorAll('.note-item').forEach(el => {
        el.addEventListener('click', () => {
          this.currentId = el.dataset.id;
          renderList(searchEl.value);
          renderEditor();
        });
      });
    };

    const renderEditor = () => {
      const note = this.notes.find(n => n.id === this.currentId);
      if (!note) {
        editorEl.innerHTML = '<div class="notes-empty">Wählen Sie eine Notiz oder erstellen Sie eine neue.</div>';
        return;
      }
      editorEl.innerHTML = `
        <input type="text" class="title" id="${winId}_title" value="${this.escape(note.title)}" placeholder="Titel">
        <textarea id="${winId}_content" placeholder="Schreiben Sie hier...">${this.escape(note.content)}</textarea>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button class="btn-secondary" id="${winId}_delete" style="font-size:12px;padding:6px 12px;">Löschen</button>
        </div>
      `;

      const titleInput = document.getElementById(winId + '_title');
      const contentInput = document.getElementById(winId + '_content');

      const autoSave = () => {
        note.title = titleInput.value;
        note.content = contentInput.value;
        note.updated = Date.now();
        this.save();
        renderList(searchEl.value);
      };

      titleInput.addEventListener('input', autoSave);
      contentInput.addEventListener('input', autoSave);

      document.getElementById(winId + '_delete').addEventListener('click', () => {
        if (confirm('Notiz wirklich löschen?')) {
          this.notes = this.notes.filter(n => n.id !== note.id);
          this.currentId = null;
          this.save();
          renderList(searchEl.value);
          renderEditor();
        }
      });
    };

    document.getElementById(winId + '_new').addEventListener('click', () => {
      const note = {
        id: 'n_' + Date.now(),
        title: 'Neue Notiz',
        content: '',
        created: Date.now(),
        updated: Date.now()
      };
      this.notes.unshift(note);
      this.currentId = note.id;
      this.save();
      renderList(searchEl.value);
      renderEditor();
      setTimeout(() => document.getElementById(winId + '_title')?.focus(), 50);
    });

    searchEl.addEventListener('input', () => renderList(searchEl.value));

    renderList();
    if (this.notes.length > 0) {
      this.currentId = this.notes.sort((a,b) => b.updated - a.updated)[0].id;
      renderList();
      renderEditor();
    }
  },

  escape(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }
};

window.NotesApp = NotesApp;
