const CalendarApp = {
  events: [],
  key: 'vpc_calendar',

  load() {
    try { this.events = JSON.parse(localStorage.getItem(this.key) || '[]'); } catch(e) { this.events = []; }
  },
  save() {
    try { localStorage.setItem(this.key, JSON.stringify(this.events)); } catch(e) {}
  },

  render(container, winId) {
    this.load();
    let viewDate = new Date();

    const render = () => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startPad = (firstDay.getDay() + 6) % 7; // Monday first
      const days = [];
      for (let i = 0; i < startPad; i++) {
        const d = new Date(year, month, -startPad + i + 1);
        days.push({ date: d, other: true });
      }
      for (let d = 1; d <= lastDay.getDate(); d++) {
        days.push({ date: new Date(year, month, d), other: false });
      }
      while (days.length % 7 !== 0) {
        const d = new Date(year, month + 1, days.length - startPad - lastDay.getDate() + 1);
        days.push({ date: d, other: true });
      }

      const today = new Date();
      const monthName = viewDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

      const dayEvents = (d) => this.events.filter(e => {
        const ed = new Date(e.date);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth() && ed.getDate() === d.getDate();
      });

      container.innerHTML = `
        <div class="calendar-app">
          <div class="cal-header">
            <button class="cal-nav-btn" id="${winId}_prev">‹</button>
            <h2>${monthName}</h2>
            <button class="cal-nav-btn" id="${winId}_next">›</button>
          </div>
          <div class="cal-grid">
            ${['Mo','Di','Mi','Do','Fr','Sa','So'].map(d => `<div class="cal-day-name">${d}</div>`).join('')}
            ${days.map(d => {
              const isToday = !d.other && d.date.toDateString() === today.toDateString();
              const has = dayEvents(d.date).length > 0;
              return `<div class="cal-day ${d.other?'other-month':''} ${isToday?'today':''} ${has?'has-event':''}" data-date="${d.date.toISOString()}">${d.date.getDate()}</div>`;
            }).join('')}
          </div>
          <div class="cal-events" id="${winId}_events"></div>
          <button class="cal-add-btn" id="${winId}_add">+ Termin hinzufügen</button>
        </div>
      `;

      document.getElementById(winId + '_prev').addEventListener('click', () => {
        viewDate.setMonth(viewDate.getMonth() - 1);
        render();
      });
      document.getElementById(winId + '_next').addEventListener('click', () => {
        viewDate.setMonth(viewDate.getMonth() + 1);
        render();
      });

      const showEvents = (dateStr) => {
        const d = new Date(dateStr);
        const list = dayEvents(d);
        const el = document.getElementById(winId + '_events');
        el.innerHTML = `<h3 style="font-size:14px;margin-bottom:8px;">${d.toLocaleDateString('de-DE')}</h3>` +
          (list.length === 0 ? '<div style="opacity:0.5;font-size:13px;">Keine Termine</div>' :
          list.map(e => `
            <div class="cal-event">
              <div class="cal-event-info">
                <h4>${e.title}</h4>
                <span>${e.time || ''} ${e.note || ''}</span>
              </div>
              <button class="btn-secondary" data-id="${e.id}" style="padding:4px 8px;font-size:12px;">Löschen</button>
            </div>
          `).join(''));
        el.querySelectorAll('button[data-id]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.events = this.events.filter(e => e.id !== btn.dataset.id);
            this.save();
            render();
          });
        });
      };

      container.querySelectorAll('.cal-day:not(.other-month)').forEach(el => {
        el.addEventListener('click', () => showEvents(el.dataset.date));
      });

      document.getElementById(winId + '_add').addEventListener('click', () => {
        const title = prompt('Termintitel:');
        if (!title) return;
        const dateStr = prompt('Datum (JJJJ-MM-TT):', new Date().toISOString().slice(0, 10));
        if (!dateStr) return;
        this.events.push({
          id: 'e_' + Date.now(),
          title,
          date: dateStr,
          time: '',
          note: ''
        });
        this.save();
        render();
        VirtualPC.notify('Kalender', 'Termin gespeichert', '📅');
      });
    };

    render();
  }
};
window.CalendarApp = CalendarApp;
