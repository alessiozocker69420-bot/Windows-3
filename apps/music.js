const MusicApp = {
  render(container, winId) {
    container.innerHTML = `
      <div class="media-app">
        <div class="media-placeholder">
          <div class="icon">🎵</div>
          <p>Wählen Sie eine Audiodatei von Ihrem Gerät</p>
          <p style="font-size:12px;opacity:0.6;margin-top:8px;">Unterstützt: MP3, WAV, OGG, M4A</p>
        </div>
        <input type="file" id="${winId}_file" accept="audio/*" style="display:none">
        <button class="media-btn" id="${winId}_pick">Datei auswählen</button>
        <audio id="${winId}_audio" style="display:none"></audio>
        <div id="${winId}_controls" style="display:none;width:100%;max-width:480px;">
          <div style="text-align:center;margin-bottom:12px;font-size:14px;" id="${winId}_title">—</div>
          <div class="media-player-controls">
            <button id="${winId}_play" class="play">▶</button>
            <div class="media-progress" id="${winId}_prog"><div class="media-progress-bar" id="${winId}_bar"></div></div>
            <div class="media-time" id="${winId}_time">0:00 / 0:00</div>
          </div>
          <div style="margin-top:12px;display:flex;align-items:center;gap:8px;justify-content:center;">
            <span>🔊</span>
            <input type="range" id="${winId}_vol" min="0" max="1" step="0.05" value="0.7" style="width:120px;">
          </div>
        </div>
      </div>
    `;

    const audio = document.getElementById(winId + '_audio');
    const fileInput = document.getElementById(winId + '_file');

    document.getElementById(winId + '_pick').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      audio.src = url;
      document.getElementById(winId + '_title').textContent = file.name;
      document.getElementById(winId + '_controls').style.display = 'block';
      audio.play().catch(() => {});
      document.getElementById(winId + '_play').textContent = '⏸';
    });

    document.getElementById(winId + '_play').addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        document.getElementById(winId + '_play').textContent = '⏸';
      } else {
        audio.pause();
        document.getElementById(winId + '_play').textContent = '▶';
      }
    });

    document.getElementById(winId + '_vol').addEventListener('input', (e) => {
      audio.volume = parseFloat(e.target.value);
    });

    audio.addEventListener('timeupdate', () => {
      const bar = document.getElementById(winId + '_bar');
      const time = document.getElementById(winId + '_time');
      if (!audio.duration) return;
      bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
      const fmt = (s) => Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0');
      time.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
    });

    document.getElementById(winId + '_prog').addEventListener('click', (e) => {
      if (!audio.duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    const win = VirtualPC.windows.get(winId);
    if (win) win.cleanup = () => { audio.pause(); audio.src = ''; };
  }
};
window.MusicApp = MusicApp;
