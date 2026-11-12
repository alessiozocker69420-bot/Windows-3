/**
 * Paint App - Canvas based drawing
 */
const PaintApp = {
  render(container, winId) {
    container.innerHTML = `
      <div class="paint-app">
        <div class="paint-toolbar">
          <button class="paint-tool-btn active" data-tool="brush" title="Pinsel">🖌️</button>
          <button class="paint-tool-btn" data-tool="eraser" title="Radierer">🧽</button>
          <button class="paint-tool-btn" data-tool="line" title="Linie">／</button>
          <button class="paint-tool-btn" data-tool="rect" title="Rechteck">▭</button>
          <button class="paint-tool-btn" data-tool="circle" title="Kreis">○</button>
          <input type="color" class="paint-color" id="${winId}_color" value="#000000" title="Farbe">
          <label style="font-size:12px;opacity:0.7;">Größe</label>
          <input type="range" class="paint-size" id="${winId}_size" min="1" max="40" value="4">
          <button class="paint-tool-btn" id="${winId}_undo" title="Rückgängig">↩</button>
          <button class="paint-tool-btn" id="${winId}_redo" title="Wiederholen">↪</button>
          <button class="paint-tool-btn" id="${winId}_clear" title="Löschen">🗑️</button>
          <button class="paint-tool-btn" id="${winId}_save" title="Speichern">💾</button>
        </div>
        <div class="paint-canvas-wrap">
          <canvas id="${winId}_canvas" width="800" height="500"></canvas>
        </div>
      </div>
    `;

    const canvas = document.getElementById(winId + '_canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let tool = 'brush';
    let drawing = false;
    let startX, startY;
    let snapshot = null;
    const history = [];
    let histIndex = -1;

    const saveState = () => {
      histIndex++;
      history.length = histIndex;
      history.push(canvas.toDataURL());
      if (history.length > 30) {
        history.shift();
        histIndex--;
      }
    };
    saveState();

    const restore = (dataUrl) => {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    };

    container.querySelectorAll('[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tool = btn.dataset.tool;
      });
    });

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      drawing = true;
      const pos = getPos(e);
      startX = pos.x;
      startY = pos.y;
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (tool === 'brush' || tool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    };

    const draw = (e) => {
      if (!drawing) return;
      e.preventDefault();
      const pos = getPos(e);
      const color = document.getElementById(winId + '_color').value;
      const size = parseInt(document.getElementById(winId + '_size').value);

      if (tool === 'brush' || tool === 'eraser') {
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = size;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else {
        ctx.putImageData(snapshot, 0, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.beginPath();
        if (tool === 'line') {
          ctx.moveTo(startX, startY);
          ctx.lineTo(pos.x, pos.y);
        } else if (tool === 'rect') {
          ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY);
        } else if (tool === 'circle') {
          const r = Math.sqrt((pos.x - startX) ** 2 + (pos.y - startY) ** 2);
          ctx.arc(startX, startY, r, 0, Math.PI * 2);
        }
        ctx.stroke();
      }
    };

    const endDraw = () => {
      if (!drawing) return;
      drawing = false;
      saveState();
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', endDraw);

    document.getElementById(winId + '_undo').addEventListener('click', () => {
      if (histIndex > 0) {
        histIndex--;
        restore(history[histIndex]);
      }
    });
    document.getElementById(winId + '_redo').addEventListener('click', () => {
      if (histIndex < history.length - 1) {
        histIndex++;
        restore(history[histIndex]);
      }
    });
    document.getElementById(winId + '_clear').addEventListener('click', () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
    });
    document.getElementById(winId + '_save').addEventListener('click', () => {
      try {
        const link = document.createElement('a');
        link.download = 'paint_' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        // Note: this triggers a download which user requested to avoid.
        // Instead offer copy or just notify that export via File System would be better.
        // For compatibility we use a data URL open approach where possible.
        const w = window.open('');
        if (w) {
          w.document.write('<img src="' + link.href + '" style="max-width:100%">');
          w.document.title = 'Paint Export';
        } else {
          VirtualPC.notify('Paint', 'Bild exportiert (neues Fenster). Speichern Sie es manuell.', '🎨');
        }
      } catch (e) {
        VirtualPC.notify('Paint', 'Export fehlgeschlagen: ' + e.message, '⚠️');
      }
    });
  }
};

window.PaintApp = PaintApp;
