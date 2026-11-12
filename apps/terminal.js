/**
 * Windows Terminal / CMD emulator
 */
const TerminalApp = {
  histories: {},
  colors: {},

  render(container, winId) {
    const colorClass = this.colors[winId] || 'color-a';
    container.innerHTML = `
      <div class="terminal-app ${colorClass}" id="${winId}_term">
        <div class="terminal-output" id="${winId}_out"></div>
        <div class="terminal-input-line">
          <span class="terminal-prompt" id="${winId}_prompt">C:\\Users\\Alessio&gt;</span>
          <input type="text" class="terminal-input" id="${winId}_input" autocomplete="off" spellcheck="false" autocapitalize="off">
        </div>
      </div>
    `;

    const out = document.getElementById(winId + '_out');
    const input = document.getElementById(winId + '_input');
    const prompt = document.getElementById(winId + '_prompt');
    const term = document.getElementById(winId + '_term');

    this.histories[winId] = this.histories[winId] || [];
    let histIndex = -1;

    const print = (text, cls = '') => {
      const line = document.createElement('div');
      if (cls) line.className = cls;
      line.textContent = text;
      out.appendChild(line);
      out.scrollTop = out.scrollHeight;
    };

    const printHTML = (html) => {
      const line = document.createElement('div');
      line.innerHTML = html;
      out.appendChild(line);
      out.scrollTop = out.scrollHeight;
    };

    // Welcome
    print('Microsoft Windows [Version 10.0.22631.Virtual]');
    print('(c) Virtual Microsoft Corporation. Alle Rechte vorbehalten.');
    print('');
    print('Geben Sie "help" ein, um verfügbare Befehle anzuzeigen.');
    print('');

    const updatePrompt = () => {
      const p = VirtualPC.vfs.currentPath;
      prompt.textContent = p + '>';
    };
    updatePrompt();

    const runCommand = async (raw) => {
      const line = raw.trim();
      if (!line) return;

      this.histories[winId].push(line);
      histIndex = this.histories[winId].length;
      print(VirtualPC.vfs.currentPath + '>' + line);

      const parts = line.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
      const cmd = (parts[0] || '').toLowerCase().replace(/"/g, '');
      const args = parts.slice(1).map(a => a.replace(/^"|"$/g, ''));

      // Secret Matrix command
      if (cmd === '01hacker01') {
        const intense = (this.colors[winId] === 'color-a' || !this.colors[winId]);
        print('>>> MATRIX MODE ACTIVATED <<<');
        print('Drücken Sie ESC oder geben Sie "stopmatrix" ein, um zu beenden.');
        VirtualPC.startMatrix(intense);
        return;
      }
      if (cmd === 'stopmatrix') {
        VirtualPC.stopMatrix();
        print('Matrix-Modus beendet.');
        return;
      }

      switch (cmd) {
        case 'help':
          print('Verfügbare Befehle:');
          print('');
          print('  help          - Diese Hilfe anzeigen');
          print('  dir [/s]      - Dateien und Ordner auflisten');
          print('  cd [pfad]     - Verzeichnis wechseln');
          print('  cd ..         - Eine Ebene höher');
          print('  cls           - Bildschirm löschen');
          print('  color [a|c|f] - Schriftfarbe ändern (a=grün, c=rot, f=weiß)');
          print('  echo [text]   - Text ausgeben');
          print('  ver           - Windows-Version anzeigen');
          print('  date          - Datum anzeigen');
          print('  time          - Uhrzeit anzeigen');
          print('  tree          - Ordnerstruktur anzeigen');
          print('  mkdir [name]  - Ordner erstellen');
          print('  type [datei]  - Textdatei anzeigen');
          print('  whoami        - Aktuellen Benutzer anzeigen');
          print('  hostname      - Gerätenamen anzeigen');
          print('  systeminfo    - Systeminformationen');
          print('  ipconfig      - Netzwerkinformationen');
          print('  ping [host]   - Verbindung testen (eingeschränkt)');
          print('  exit          - Terminal schließen');
          print('');
          print('Hinweis: Der Downloads-Ordner ist aus Sicherheitsgründen gesperrt.');
          break;

        case 'cls':
        case 'clear':
          out.innerHTML = '';
          break;

        case 'ver':
          print('Microsoft Windows [Version 10.0.22631.VirtualPC]');
          print('Virtual Windows 11 PC v' + VirtualPC.version);
          break;

        case 'date':
          print('Aktuelles Datum: ' + new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
          break;

        case 'time':
          print('Aktuelle Uhrzeit: ' + new Date().toLocaleTimeString('de-DE'));
          break;

        case 'whoami':
          print(VirtualPC.hostname + '\\' + VirtualPC.username);
          break;

        case 'hostname':
          print(VirtualPC.hostname);
          break;

        case 'echo':
          print(args.join(' ') || '');
          break;

        case 'color':
          const c = (args[0] || 'a').toLowerCase();
          term.classList.remove('color-a', 'color-c', 'color-f');
          if (c === 'a' || c === '0a') {
            term.classList.add('color-a');
            this.colors[winId] = 'color-a';
            print('Schriftfarbe: Grün');
          } else if (c === 'c' || c === '0c') {
            term.classList.add('color-c');
            this.colors[winId] = 'color-c';
            print('Schriftfarbe: Rot');
          } else if (c === 'f' || c === '0f') {
            term.classList.add('color-f');
            this.colors[winId] = 'color-f';
            print('Schriftfarbe: Weiß');
          } else {
            print('Ungültige Farbe. Verwenden Sie: color a | color c | color f');
          }
          break;

        case 'cd':
          if (!args[0]) {
            print(VirtualPC.vfs.currentPath);
          } else {
            const target = VirtualPC.resolvePath(args[0]);
            const node = VirtualPC.getNode(target);
            if (!node) {
              print('Das System kann den angegebenen Pfad nicht finden.');
            } else if (node.restricted) {
              print('Zugriff verweigert.');
            } else if (node.type === 'file') {
              print('Das Verzeichnis ist ungültig.');
            } else {
              VirtualPC.vfs.currentPath = target;
              VirtualPC.saveVFS();
              updatePrompt();
            }
          }
          break;

        case 'dir':
          {
            const recursive = args.includes('/s') || args.includes('/S');
            let path = VirtualPC.vfs.currentPath;
            const pathArg = args.find(a => !a.startsWith('/'));
            if (pathArg) path = VirtualPC.resolvePath(pathArg);

            if (recursive) {
              this.printTree(path, print, true);
            } else {
              const result = VirtualPC.listDir(path);
              if (result.error) {
                print(result.error);
              } else {
                print(' Verzeichnis von ' + result.path);
                print('');
                let files = 0, dirs = 0;
                result.items.forEach(item => {
                  if (item.type === 'folder' || item.type === 'drive') {
                    print(item.name.padEnd(30) + '<DIR>');
                    dirs++;
                  } else {
                    print(item.name.padEnd(30) + (item.size + ' Bytes').padStart(12));
                    files++;
                  }
                });
                print('');
                print(`               ${files} Datei(en)`);
                print(`               ${dirs} Verzeichnis(se)`);
              }
            }
          }
          break;

        case 'tree':
          {
            const path = args[0] ? VirtualPC.resolvePath(args[0]) : VirtualPC.vfs.currentPath;
            this.printTree(path, print, false);
          }
          break;

        case 'mkdir':
        case 'md':
          if (!args[0]) {
            print('Syntaxfehler.');
          } else {
            const parent = VirtualPC.getNode(VirtualPC.vfs.currentPath);
            if (!parent || parent.restricted) {
              print('Zugriff verweigert.');
            } else if (parent.children[args[0]]) {
              print('Ein Unterverzeichnis oder eine Datei mit dem Namen ' + args[0] + ' existiert bereits.');
            } else {
              parent.children[args[0]] = { name: args[0], type: 'folder', children: {} };
              VirtualPC.saveVFS();
              print('Ordner erstellt: ' + args[0]);
            }
          }
          break;

        case 'type':
          if (!args[0]) {
            print('Syntaxfehler.');
          } else {
            const full = VirtualPC.resolvePath(args[0]);
            const node = VirtualPC.getNode(full);
            if (!node) {
              print('Die Datei wurde nicht gefunden.');
            } else if (node.restricted) {
              print('Zugriff verweigert.');
            } else if (node.type !== 'file') {
              print('Zugriff verweigert – ist ein Verzeichnis.');
            } else {
              print(node.content || '');
            }
          }
          break;

        case 'systeminfo':
          print('Hostname:                 ' + VirtualPC.hostname);
          print('Betriebssystemname:       Microsoft Windows 11 Virtual');
          print('Betriebssystemversion:    10.0.22631 VirtualPC ' + VirtualPC.version);
          print('Systemhersteller:         Virtual Hardware');
          print('Systemmodell:             Browser-PC');
          print('Prozessortyp:             ' + (navigator.hardwareConcurrency || '?') + ' logische Prozessoren');
          print('Installiertes RAM:        Browser-verwaltet');
          print('Benutzername:             ' + VirtualPC.username);
          print('Browser:                  ' + this.getBrowserName());
          print('Bildschirmauflösung:      ' + screen.width + ' x ' + screen.height);
          print('Sprache:                  ' + navigator.language);
          print('Online:                   ' + (navigator.onLine ? 'Ja' : 'Nein'));
          break;

        case 'ipconfig':
          print('Windows-IP-Konfiguration');
          print('');
          print('Ethernet-Adapter Virtual:');
          print('');
          print('   Verbindungsspezifisches DNS-Suffix: ');
          print('   IPv4-Adresse . . . . . . . . . . : (Browser-Sandbox)');
          print('   Subnetzmaske . . . . . . . . . . : 255.255.255.0');
          print('   Standardgateway . . . . . . . . .: ');
          print('');
          print('Hinweis: Echte Netzwerkdetails sind aus Sicherheitsgründen');
          print('im Browser nicht verfügbar. Status: ' + (navigator.onLine ? 'Online' : 'Offline'));
          break;

        case 'ping':
          if (!args[0]) {
            print('Verwendung: ping [Hostname oder IP]');
          } else {
            print('Ping wird an ' + args[0] + ' mit 32 Bytes Daten ausgeführt:');
            print('');
            // Real ping is not possible from browser without server.
            // We can try fetch with no-cors as a weak connectivity check.
            print('Browser-Umgebung: Echtes ICMP-Ping ist nicht möglich.');
            print('Versuche HTTP-Erreichbarkeit...');
            try {
              const controller = new AbortController();
              const t = setTimeout(() => controller.abort(), 3000);
              const start = performance.now();
              await fetch('https://' + args[0].replace(/^https?:\/\//, ''), {
                mode: 'no-cors',
                signal: controller.signal
              });
              clearTimeout(t);
              const ms = Math.round(performance.now() - start);
              print('Antwort von ' + args[0] + ': Zeit=' + ms + 'ms (HTTP no-cors)');
              print('Antwort von ' + args[0] + ': Zeit=' + (ms + 5) + 'ms');
              print('Antwort von ' + args[0] + ': Zeit=' + (ms + 2) + 'ms');
              print('');
              print('Ping-Statistik für ' + args[0] + ':');
              print('    Pakete: Gesendet = 3, Empfangen = 3, Verloren = 0 (0% Verlust)');
            } catch (err) {
              print('Zeitüberschreitung der Anforderung.');
              print('Zeitüberschreitung der Anforderung.');
              print('');
              print('Ping-Statistik: Pakete verloren oder Host nicht erreichbar.');
              print('(Hinweis: Viele Hosts blockieren Cross-Origin-Anfragen)');
            }
          }
          break;

        case 'exit':
          VirtualPC.closeWindow(winId);
          return;

        default:
          if (cmd) {
            print('"' + cmd + '" ist kein interner oder externer Befehl,');
            print('kein lauffähiges Programm oder eine Batchdatei.');
          }
      }
      print('');
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        runCommand(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.histories[winId].length === 0) return;
        histIndex = Math.max(0, histIndex - 1);
        input.value = this.histories[winId][histIndex] || '';
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        histIndex = Math.min(this.histories[winId].length, histIndex + 1);
        input.value = this.histories[winId][histIndex] || '';
      }
    });

    // Focus input when clicking terminal
    term.addEventListener('click', () => input.focus());
    setTimeout(() => input.focus(), 100);

    // Store cleanup
    const win = VirtualPC.windows.get(winId);
    if (win) {
      win.cleanup = () => {
        delete this.histories[winId];
        delete this.colors[winId];
      };
    }
  },

  printTree(path, print, showFiles) {
    const node = VirtualPC.getNode(path);
    if (!node) {
      print('Pfad nicht gefunden.');
      return;
    }
    if (node.restricted) {
      print('Zugriff verweigert.');
      return;
    }
    print(path);
    const walk = (n, prefix) => {
      if (!n.children) return;
      const keys = Object.keys(n.children).filter(k => !n.children[k].restricted).sort();
      keys.forEach((key, idx) => {
        const child = n.children[key];
        const isLast = idx === keys.length - 1;
        const branch = isLast ? '└── ' : '├── ';
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        if (child.type === 'folder' || child.type === 'drive') {
          print(prefix + branch + child.name);
          walk(child, nextPrefix);
        } else if (showFiles) {
          print(prefix + branch + child.name);
        }
      });
    };
    walk(node, '');
  },

  getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Microsoft Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unbekannt';
  }
};

window.TerminalApp = TerminalApp;
