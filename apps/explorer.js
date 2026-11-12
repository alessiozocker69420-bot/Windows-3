/**
 * File Explorer - Virtual FS + optional real FS Access
 */
const ExplorerApp = {
  render(container, winId) {
    let currentPath = VirtualPC.vfs.currentPath;
    let history = [currentPath];
    let histIndex = 0;
    let viewMode = 'icons'; // icons | list

    container.innerHTML = `
      <div class="explorer-app">
        <div class="explorer-toolbar">
          <button class="explorer-nav-btn" id="${winId}_back" title="Zurück">←</button>
          <button class="explorer-nav-btn" id="${winId}_fwd" title="Vorwärts">→</button>
          <button class="explorer-nav-btn" id="${winId}_up" title="Nach oben">↑</button>
          <input type="text" class="explorer-address" id="${winId}_addr" value="${currentPath}" readonly>
          <button class="explorer-nav-btn" id="${winId}_refresh" title="Aktualisieren">↻</button>
          <button class="explorer-nav-btn" id="${winId}_view" title="Ansicht">▦</button>
          <button class="explorer-nav-btn" id="${winId}_real" title="Echten Ordner öffnen (File System Access API)">📂</button>
        </div>
        <div class="explorer-content" id="${winId}_content"></div>
        <div class="explorer-status" id="${winId}_status"></div>
      </div>
    `;

    const contentEl = document.getElementById(winId + '_content');
    const addrEl = document.getElementById(winId + '_addr');
    const statusEl = document.getElementById(winId + '_status');

    const navigate = (path, addHist = true) => {
      path = VirtualPC.resolvePath(path);
      const result = VirtualPC.listDir(path);
      if (result.error) {
        statusEl.textContent = result.error;
        VirtualPC.notify('Explorer', result.error, '⚠️');
        return;
      }
      currentPath = result.path;
      if (addHist) {
        history = history.slice(0, histIndex + 1);
        history.push(currentPath);
        histIndex = history.length - 1;
      }
      addrEl.value = currentPath;
      renderItems(result.items);
      statusEl.textContent = result.items.length + ' Element(e) | Virtuelles Dateisystem';
    };

    const renderItems = (items) => {
      contentEl.className = 'explorer-content' + (viewMode === 'list' ? ' explorer-list-view' : '');
      if (items.length === 0) {
        contentEl.innerHTML = '<div class="explorer-empty">Dieser Ordner ist leer.</div>';
        return;
      }
      contentEl.innerHTML = items.map(item => {
        const icon = item.type === 'folder' || item.type === 'drive' ? '📁' : 
                     item.name.match(/\.(txt|md|log)$/i) ? '📄' :
                     item.name.match(/\.(png|jpg|jpeg|gif|webp)$/i) ? '🖼️' :
                     item.name.match(/\.(mp3|wav|ogg)$/i) ? '🎵' :
                     item.name.match(/\.(mp4|webm)$/i) ? '🎬' : '📄';
        return `
          <div class="explorer-item" data-name="${item.name}" data-type="${item.type}">
            <div class="item-icon">${icon}</div>
            <div class="item-name">${item.name}</div>
          </div>
        `;
      }).join('');

      contentEl.querySelectorAll('.explorer-item').forEach(el => {
        const openItem = () => {
          const name = el.dataset.name;
          const type = el.dataset.type;
          if (type === 'folder' || type === 'drive') {
            navigate(currentPath.replace(/\\$/, '') + '\\' + name);
          } else {
            // Open text files in notepad / type
            const full = currentPath.replace(/\\$/, '') + '\\' + name;
            const node = VirtualPC.getNode(full);
            if (node && node.type === 'file') {
              if (name.match(/\.(txt|md|log|js|css|html|json)$/i) || !name.includes('.')) {
                VirtualPC.openApp('notepad', { forceNew: true, content: node.content, filename: name });
              } else {
                VirtualPC.notify('Explorer', 'Dateityp wird in dieser Demo nicht direkt geöffnet.', 'ℹ️');
              }
            }
          }
        };

        el.addEventListener('dblclick', openItem);
        let lastTap = 0;
        el.addEventListener('touchend', (e) => {
          const now = Date.now();
          if (now - lastTap < 350) {
            e.preventDefault();
            openItem();
          }
          lastTap = now;
        });

        el.addEventListener('click', () => {
          contentEl.querySelectorAll('.explorer-item.selected').forEach(i => i.classList.remove('selected'));
          el.classList.add('selected');
        });
      });
    };

    document.getElementById(winId + '_back').addEventListener('click', () => {
      if (histIndex > 0) {
        histIndex--;
        navigate(history[histIndex], false);
      }
    });
    document.getElementById(winId + '_fwd').addEventListener('click', () => {
      if (histIndex < history.length - 1) {
        histIndex++;
        navigate(history[histIndex], false);
      }
    });
    document.getElementById(winId + '_up').addEventListener('click', () => {
      navigate(currentPath + '\\..');
    });
    document.getElementById(winId + '_refresh').addEventListener('click', () => navigate(currentPath, false));
    document.getElementById(winId + '_view').addEventListener('click', () => {
      viewMode = viewMode === 'icons' ? 'list' : 'icons';
      navigate(currentPath, false);
    });

    // Real File System Access
    document.getElementById(winId + '_real').addEventListener('click', async () => {
      if (!VirtualPC.realFS.supported) {
        VirtualPC.notify('Explorer', 'File System Access API wird von diesem Browser/Gerät nicht unterstützt (häufig auf iOS/Android).', '⚠️');
        statusEl.textContent = 'File System Access API nicht verfügbar.';
        return;
      }
      try {
        const handle = await window.showDirectoryPicker({ mode: 'read' });
        // Check if name is Downloads
        if (handle.name && /download/i.test(handle.name)) {
          VirtualPC.notify('Explorer', 'Der Downloads-Ordner ist gesperrt und darf nicht geöffnet werden.', '🚫');
          return;
        }
        VirtualPC.realFS.handle = handle;
        await this.renderRealDir(handle, contentEl, statusEl, winId);
      } catch (err) {
        if (err.name !== 'AbortError') {
          VirtualPC.notify('Explorer', 'Ordnerauswahl fehlgeschlagen: ' + err.message, '⚠️');
        }
      }
    });

    navigate(currentPath, false);
  },

  async renderRealDir(dirHandle, contentEl, statusEl, winId) {
    contentEl.innerHTML = '';
    const items = [];
    try {
      for await (const [name, handle] of dirHandle.entries()) {
        if (/download/i.test(name)) continue; // skip downloads
        items.push({ name, kind: handle.kind, handle });
      }
    } catch (e) {
      contentEl.innerHTML = `<div class="explorer-error">Fehler beim Lesen: ${e.message}</div>`;
      return;
    }
    items.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    statusEl.textContent = items.length + ' Element(e) | Echter Ordner: ' + dirHandle.name + ' (nur Lesen)';

    if (items.length === 0) {
      contentEl.innerHTML = '<div class="explorer-empty">Ordner ist leer oder alle Einträge gefiltert.</div>';
      return;
    }

    contentEl.innerHTML = items.map(item => {
      const icon = item.kind === 'directory' ? '📁' : '📄';
      return `
        <div class="explorer-item" data-name="${item.name}" data-kind="${item.kind}">
          <div class="item-icon">${icon}</div>
          <div class="item-name">${item.name}</div>
        </div>
      `;
    }).join('');

    // Note: deeper navigation into real FS would require storing handles;
    // for simplicity we list one level and allow reading text files.
    contentEl.querySelectorAll('.explorer-item').forEach((el, idx) => {
      el.addEventListener('dblclick', async () => {
        const item = items[idx];
        if (item.kind === 'file') {
          try {
            const file = await item.handle.getFile();
            if (file.size > 500000) {
              VirtualPC.notify('Explorer', 'Datei zu groß zum Anzeigen (>500KB).', '⚠️');
              return;
            }
            if (file.type.startsWith('text/') || /\.(txt|md|json|js|css|html|log|xml)$/i.test(file.name)) {
              const text = await file.text();
              VirtualPC.openApp('notepad', { forceNew: true, content: text, filename: file.name });
            } else if (file.type.startsWith('image/')) {
              const url = URL.createObjectURL(file);
              VirtualPC.openApp('image-viewer', { forceNew: true, src: url, filename: file.name });
            } else {
              VirtualPC.notify('Explorer', 'Dateityp "' + (file.type || 'unbekannt') + '" wird nicht direkt unterstützt.', 'ℹ️');
            }
          } catch (e) {
            VirtualPC.notify('Explorer', 'Kann Datei nicht lesen: ' + e.message, '⚠️');
          }
        } else {
          VirtualPC.notify('Explorer', 'Unterordner-Navigation in echten Ordnern: Bitte erneut "Echten Ordner öffnen" verwenden und den Unterordner wählen.', 'ℹ️');
        }
      });
    });
  }
};

window.ExplorerApp = ExplorerApp;
