const ImageViewerApp = {
  render(container, winId, options = {}) {
    container.innerHTML = `
      <div class="media-app">
        <div class="media-placeholder" id="${winId}_ph">
          <div class="icon">🖼️</div>
          <p>Bild auswählen</p>
        </div>
        <input type="file" id="${winId}_file" accept="image/*" style="display:none">
        <button class="media-btn" id="${winId}_pick">Bild öffnen</button>
        <img id="${winId}_img" class="image-viewer-img" style="display:none;">
        <div id="${winId}_ctrls" style="display:none;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
          <button class="media-btn" id="${winId}_zoomout">−</button>
          <button class="media-btn" id="${winId}_zoomin">+</button>
          <button class="media-btn" id="${winId}_rot">↻ Drehen</button>
          <button class="media-btn" id="${winId}_fit">Einpassen</button>
        </div>
        <div id="${winId}_info" style="font-size:12px;opacity:0.6;"></div>
      </div>
    `;
    const img = document.getElementById(winId + '_img');
    let scale = 1, rot = 0;

    const apply = () => {
      img.style.transform = `scale(${scale}) rotate(${rot}deg)`;
    };

    const show = (src, name) => {
      img.src = src;
      img.style.display = 'block';
      document.getElementById(winId + '_ph').style.display = 'none';
      document.getElementById(winId + '_ctrls').style.display = 'flex';
      document.getElementById(winId + '_info').textContent = name || '';
      scale = 1; rot = 0; apply();
    };

    if (options.src) show(options.src, options.filename);

    document.getElementById(winId + '_pick').addEventListener('click', () => {
      document.getElementById(winId + '_file').click();
    });
    document.getElementById(winId + '_file').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) show(URL.createObjectURL(f), f.name);
    });
    document.getElementById(winId + '_zoomin').addEventListener('click', () => { scale = Math.min(5, scale + 0.25); apply(); });
    document.getElementById(winId + '_zoomout').addEventListener('click', () => { scale = Math.max(0.25, scale - 0.25); apply(); });
    document.getElementById(winId + '_rot').addEventListener('click', () => { rot = (rot + 90) % 360; apply(); });
    document.getElementById(winId + '_fit').addEventListener('click', () => { scale = 1; rot = 0; apply(); });
  }
};
window.ImageViewerApp = ImageViewerApp;
