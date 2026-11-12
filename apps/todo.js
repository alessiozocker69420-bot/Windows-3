const TodoApp = {
  todos: [],
  key: 'vpc_todos',

  load() {
    try { this.todos = JSON.parse(localStorage.getItem(this.key) || '[]'); } catch(e) { this.todos = []; }
  },
  save() {
    try { localStorage.setItem(this.key, JSON.stringify(this.todos)); } catch(e) {}
  },

  render(container, winId) {
    this.load();
    const render = () => {
      container.innerHTML = `
        <div class="todo-app">
          <div class="todo-header">
            <input type="text" id="${winId}_input" placeholder="Neue Aufgabe...">
            <button id="${winId}_add">Hinzufügen</button>
          </div>
          <div class="todo-list" id="${winId}_list">
            ${this.todos.length === 0 ? '<div style="text-align:center;padding:40px;opacity:0.5;">Keine Aufgaben</div>' :
              this.todos.map(t => `
                <div class="todo-item ${t.done ? 'done' : ''}">
                  <input type="checkbox" data-id="${t.id}" ${t.done ? 'checked' : ''}>
                  <span class="todo-text">${this.esc(t.text)}</span>
                  <span class="todo-priority ${t.priority || ''}">${t.priority === 'high' ? 'Hoch' : t.priority === 'medium' ? 'Mittel' : ''}</span>
                  <button class="todo-delete" data-id="${t.id}">✕</button>
                </div>
              `).join('')}
          </div>
        </div>
      `;

      document.getElementById(winId + '_add').addEventListener('click', () => {
        const input = document.getElementById(winId + '_input');
        const text = input.value.trim();
        if (!text) return;
        this.todos.unshift({ id: 't_' + Date.now(), text, done: false, priority: 'normal', created: Date.now() });
        this.save();
        input.value = '';
        render();
      });
      document.getElementById(winId + '_input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById(winId + '_add').click();
      });

      container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          const t = this.todos.find(x => x.id === cb.dataset.id);
          if (t) { t.done = cb.checked; this.save(); render(); }
        });
      });
      container.querySelectorAll('.todo-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          this.todos = this.todos.filter(x => x.id !== btn.dataset.id);
          this.save();
          render();
        });
      });
    };
    render();
  },

  esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
};
window.TodoApp = TodoApp;
