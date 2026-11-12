const ScreenshotApp = {
  render(container, winId) {
    container.innerHTML = `
      <div class="screenshot-app">
        <h2 style="margin-bottom:8px;">Screenshot</h2>
        <p style="font-size:13px;opacity:0.6;margin-bottom:16px;">Erfasst den virtuellen Desktop (ohne Browser-Chrome).</p>
        <button class="media-btn" id="${winId}_capture">Screenshot erstellen</button>
        <canvas id="${winId}_canvas" class="screenshot-preview" style="display:none;margin-top:16px;"></canvas>
        <div class="screenshot-actions" id="${winId}_actions" style="display:none;margin-top:12px;">
          <button class="media-btn" id="${winId}_copy">In Zwischenablage</button>
          <button class="media-btn" id="${winId}_open">In neuem Tab öffnen</button>
        </div>
      </div>
    `;

    document.getElementById(winId + '_capture').addEventListener('click', async () => {
      try {
        // Use html2canvas-like approach with foreignObject or just capture via canvas draw of DOM is complex.
        // Simple approach: use the Screen Capture API if available, else notify limitation.
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          VirtualPC.notify('Screenshot', 'Bitte wählen Sie diesen Tab / dieses Fenster im Dialog.', '✂️');
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const video = document.createElement('video');
          video.srcObject = stream;
          await video.play();
          const canvas = document.getElementById(winId + '_canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          canvas.style.display = 'block';
          document.getElementById(winId + '_actions').style.display = 'flex';
          stream.getTracks().forEach(t => t.stop());
        } else {
          // Fallback: draw a simple representation
          const canvas = document.getElementById(winId + '_canvas');
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight - 48;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#1a2a3a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#fff';
          ctx.font = '20px sans-serif';
          ctx.fillText('Screenshot-API nicht verfügbar.', 40, 80);
          ctx.font = '14px sans-serif';
          ctx.fillText('Ihr Browser unterstützt getDisplayMedia nicht oder die Berechtigung wurde verweigert.', 40, 120);
          ctx.fillText('Auf Desktop-Chrome/Edge funktioniert die Bildschirmaufnahme in der Regel.', 40, 150);
          canvas.style.display = 'block';
          document.getElementById(winId + '_actions').style.display = 'flex';
        }
      } catch (e) {
        VirtualPC.notify('Screenshot', 'Abgebrochen oder nicht unterstützt: ' + e.message, '⚠️');
      }
    });

    document.getElementById(winId + '_copy').addEventListener('click', async () => {
      const canvas = document.getElementById(winId + '_canvas');
      try {
        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        VirtualPC.notify('Screenshot', 'In Zwischenablage kopiert', '📋');
      } catch (e) {
        VirtualPC.notify('Screenshot', 'Kopieren fehlgeschlagen: ' + e.message, '⚠️');
      }
    });

    document.getElementById(winId + '_open').addEventListener('click', () => {
      const canvas = document.getElementById(winId + '_canvas');
      const w = window.open('');
      if (w) {
        w.document.write('<img src="' + canvas.toDataURL() + '" style="max-width:100%">');
      }
    });
  }
};
window.ScreenshotApp = ScreenshotApp;
