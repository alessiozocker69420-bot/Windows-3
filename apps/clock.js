const ClockApp = {
  render(container, winId) {
    let mode = 'digital';
    let swRunning = false, swStart = 0, swElapsed = 0, swInterval = null;
    let timerRemaining = 0, timerInterval = null;

    const render = () => {
      container.innerHTML = `
        <div class="clock-app">
          <div class="clock-tabs">
            <button class="clock-tab ${mode==='digital'?'active':''}" data-m="digital">Digital</button>
            <button class="clock-tab ${mode==='analog'?'active':''}" data-m="analog">Analog</button>
            <button class="clock-tab ${mode==='stopwatch'?'active':''}" data-m="stopwatch">Stoppuhr</button>
            <button class="clock-tab ${mode==='timer'?'active':''}" data-m="timer">Timer</button>
          </div>
          <div id="${winId}_body"></div>
        </div>
      `;
      container.querySelectorAll('.clock-tab').forEach(btn => {
        btn.addEventListener('click', () => { mode = btn.dataset.m; render(); });
      });
      const body = document.getElementById(winId + '_body');

      if (mode === 'digital') {
        body.innerHTML = `<div class="digital-clock" id="${winId}_dig">00:00:00</div>`;
        const update = () => {
          const el = document.getElementById(winId + '_dig');
          if (el) el.textContent = new Date().toLocaleTimeString('de-DE');
        };
        update();
        const id = setInterval(update, 1000);
        const win = VirtualPC.windows.get(winId);
        if (win) { const prev = win.cleanup; win.cleanup = () => { clearInterval(id); if (prev) prev(); }; }
      } else if (mode === 'analog') {
        body.innerHTML = `
          <div class="analog-clock" id="${winId}_ana">
            <div class="analog-hand hour" id="${winId}_h"></div>
            <div class="analog-hand minute" id="${winId}_m"></div>
            <div class="analog-hand second" id="${winId}_s"></div>
          </div>
        `;
        const update = () => {
          const now = new Date();
          const h = document.getElementById(winId + '_h');
          const m = document.getElementById(winId + '_m');
          const s = document.getElementById(winId + '_s');
          if (!h) return;
          const sec = now.getSeconds() + now.getMilliseconds()/1000;
          const min = now.getMinutes() + sec/60;
          const hour = (now.getHours() % 12) + min/60;
          h.style.transform = `rotate(${hour * 30}deg)`;
          m.style.transform = `rotate(${min * 6}deg)`;
          s.style.transform = `rotate(${sec * 6}deg)`;
        };
        update();
        const id = setInterval(update, 50);
        const win = VirtualPC.windows.get(winId);
        if (win) { const prev = win.cleanup; win.cleanup = () => { clearInterval(id); if (prev) prev(); }; }
      } else if (mode === 'stopwatch') {
        body.innerHTML = `
          <div class="stopwatch-display" id="${winId}_sw">00:00.00</div>
          <div class="clock-controls">
            <button class="clock-btn" id="${winId}_swstart">${swRunning ? 'Stopp' : 'Start'}</button>
            <button class="clock-btn secondary" id="${winId}_swreset">Reset</button>
          </div>
        `;
        const format = (ms) => {
          const m = Math.floor(ms / 60000);
          const s = Math.floor((ms % 60000) / 1000);
          const cs = Math.floor((ms % 1000) / 10);
          return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + '.' + String(cs).padStart(2,'0');
        };
        const el = document.getElementById(winId + '_sw');
        if (swRunning) {
          swInterval = setInterval(() => {
            el.textContent = format(swElapsed + (Date.now() - swStart));
          }, 30);
        } else {
          el.textContent = format(swElapsed);
        }
        document.getElementById(winId + '_swstart').addEventListener('click', () => {
          if (swRunning) {
            swElapsed += Date.now() - swStart;
            swRunning = false;
            clearInterval(swInterval);
          } else {
            swStart = Date.now();
            swRunning = true;
          }
          render();
        });
        document.getElementById(winId + '_swreset').addEventListener('click', () => {
          swRunning = false; swElapsed = 0; clearInterval(swInterval); render();
        });
      } else if (mode === 'timer') {
        body.innerHTML = `
          <div class="timer-display" id="${winId}_tm">${formatTime(timerRemaining || 0)}</div>
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <button class="clock-btn secondary" data-sec="60">1 Min</button>
            <button class="clock-btn secondary" data-sec="300">5 Min</button>
            <button class="clock-btn secondary" data-sec="600">10 Min</button>
          </div>
          <div class="clock-controls">
            <button class="clock-btn" id="${winId}_tmstart">${timerInterval ? 'Stopp' : 'Start'}</button>
            <button class="clock-btn secondary" id="${winId}_tmreset">Reset</button>
          </div>
        `;
        function formatTime(sec) {
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
        }
        body.querySelectorAll('[data-sec]').forEach(btn => {
          btn.addEventListener('click', () => {
            timerRemaining = parseInt(btn.dataset.sec);
            if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
            render();
          });
        });
        document.getElementById(winId + '_tmstart').addEventListener('click', () => {
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            render();
          } else if (timerRemaining > 0) {
            timerInterval = setInterval(() => {
              timerRemaining--;
              const el = document.getElementById(winId + '_tm');
              if (el) el.textContent = formatTime(timerRemaining);
              if (timerRemaining <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                VirtualPC.notify('Timer', 'Zeit abgelaufen!', '⏰');
                render();
              }
            }, 1000);
            render();
          }
        });
        document.getElementById(winId + '_tmreset').addEventListener('click', () => {
          clearInterval(timerInterval); timerInterval = null; timerRemaining = 0; render();
        });
      }
    };
    render();
  }
};
window.ClockApp = ClockApp;
