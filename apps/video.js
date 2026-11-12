const VideoApp = {
  render(container, winId) {
    container.innerHTML = `
      <div class="media-app">
        <div class="media-placeholder" id="${winId}_ph">
          <div class="icon">🎬</div>
          <p>Wählen Sie eine Videodatei</p>
          <p style="font-size:12px;opacity:0.6;">MP4, WebM, OGG</p>
        </div>
        <input type="file" id="${winId}_file" accept="video/*" style="display:none">
        <button class="media-btn" id="${winId}_pick">Video auswählen</button>
        <video id="${winId}_vid" controls style="display:none;max-width:100%;max-height:60vh;border-radius:8px;"></video>
        <div style="margin-top:8px;display:none;" id="${winId}_extra">
          <label style="font-size:12px;">Geschwindigkeit: </label>
          <select id="${winId}_speed">
            <option value="0.5">0.5x</option>
            <option value="1" selected>1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>
    `;
    const video = document.getElementById(winId + '_vid');
    const fileInput = document.getElementById(winId + '_file');
    document.getElementById(winId + '_pick').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      video.src = URL.createObjectURL(file);
      video.style.display = 'block';
      document.getElementById(winId + '_ph').style.display = 'none';
      document.getElementById(winId + '_extra').style.display = 'block';
      video.play().catch(() => {});
    });
    document.getElementById(winId + '_speed').addEventListener('change', (e) => {
      video.playbackRate = parseFloat(e.target.value);
    });
    const win = VirtualPC.windows.get(winId);
    if (win) win.cleanup = () => { video.pause(); video.src = ''; };
  }
};
window.VideoApp = VideoApp;
