# Virtual Windows 11 PC

Ein möglichst realistischer **virtueller Windows-11-Desktop** als reine Website.  
Läuft auf **GitHub Pages**, auf Desktop-Browsern und auf Tablets (Android / iPad) mit Touch-Unterstützung.

**Keine Fake-Apps.** Nur Funktionen, die im Browser wirklich funktionieren.

---

## ZIP-Passwort

Die ZIP-Datei ist passwortgeschützt.

**Passwort:** `heyduhacker123`

(Steht absichtlich lesbar im Code und in dieser README.)

---

## Schnellstart (GitHub Pages)

1. Diese ZIP herunterladen und mit dem Passwort oben entpacken.
2. Auf GitHub ein neues Repository erstellen (z. B. `virtual-windows-pc`).
3. Alle Dateien und Ordner aus dem entpackten `VirtualPC`-Ordner in das Repository hochladen (Root des Repos = Inhalt von `VirtualPC/`).
4. Repository → **Settings** → **Pages**.
5. Source: **Deploy from a branch** → Branch `main` (oder `master`) → Ordner `/ (root)` → Save.
6. Nach 1–2 Minuten den angezeigten Link öffnen (z. B. `https://DEIN-USERNAME.github.io/virtual-windows-pc/`).

### Lokales Testen

Einfach `index.html` in einem modernen Browser öffnen **oder** einen lokalen Server starten:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Dann `http://localhost:8080` öffnen.

---

## Implementierte & getestete Apps

| App | Funktion | Status |
|-----|----------|--------|
| Desktop + Taskleiste + Startmenü | Fensterverwaltung, Icons, Uhr, Tray | ✅ Funktioniert |
| Terminal (CMD) | help, dir, cd, cls, color, echo, ver, date, time, tree, mkdir, type, whoami, hostname, systeminfo, ipconfig, ping, History, Farben | ✅ Funktioniert |
| Matrix-Modus | Geheimer Befehl `01hacker01`, ESC / `stopmatrix` | ✅ Funktioniert |
| Notizen | Erstellen, Bearbeiten, Löschen, Suche, Auto-Save (LocalStorage) | ✅ Funktioniert |
| Browser | Adressleiste, Tabs, Navigation, Google-Suche, iframe + Fallback „In neuem Tab öffnen“ | ✅ Funktioniert |
| Datei-Explorer | Virtuelles FS, Navigation, echte Ordner via File System Access API (wo unterstützt), Downloads gesperrt | ✅ Funktioniert |
| Rechner | +, −, ×, ÷, Klammern, √, Potenzen, %, Tastatur | ✅ Funktioniert |
| Paint | Pinsel, Radierer, Linie, Rechteck, Kreis, Farbe, Größe, Undo/Redo, Export | ✅ Funktioniert |
| Einstellungen | Systeminfo, Wallpaper, Benutzername, Apps, Datenschutz, Daten löschen | ✅ Funktioniert |
| Kalender | Monatsansicht, Termine speichern/löschen | ✅ Funktioniert |
| Uhr | Digital, Analog, Stoppuhr, Timer | ✅ Funktioniert |
| Musikplayer | Eigene Audiodateien abspielen | ✅ Funktioniert |
| Videoplayer | Eigene Videos, Geschwindigkeit | ✅ Funktioniert |
| Fotos / Bildbetrachter | Öffnen, Zoom, Drehen | ✅ Funktioniert |
| Editor (Notepad) | Text bearbeiten, in virtuelles FS speichern | ✅ Funktioniert |
| Task-Manager | Geöffnete virtuelle Apps, Beenden | ✅ Funktioniert |
| Microsoft Store (Virtual) | Installieren / Deinstallieren der vorhandenen Apps | ✅ Funktioniert |
| Systeminfo | Nur echte Browser-Werte | ✅ Funktioniert |
| Papierkorb | Virtuelle gelöschte Elemente | ✅ Funktioniert |
| Screenshot | Screen Capture API (wo verfügbar) | ✅ Funktioniert |
| Aufgaben | To-Dos mit Checkbox, Speicherung | ✅ Funktioniert |

---

## Wichtige Regeln (eingehalten)

- **Downloads-Ordner** ist dauerhaft gesperrt (Terminal + Explorer).
- Keine Download-Funktionen im virtuellen Browser.
- Keine erfundenen Hardware-Werte.
- File System Access API nur wenn der Browser/OS sie anbietet (viele Android/iOS-Browser nicht).
- Wenn etwas nicht geht → ehrliche Meldung, kein Fake.

### Geheimer Matrix-Befehl

Im Terminal eingeben:

```
01hacker01
```

Beenden: **ESC** oder `stopmatrix`.

---

## Touch-Unterstützung (iPad / Android-Tablets)

- Doppeltippen öffnet Apps/Ordner.
- Einfaches Tippen wählt aus.
- Fenster per Finger verschieben (Titlebar).
- Größere Buttons in der Titlebar.
- Responsive Layout.

---

## Technik

- Reines **HTML / CSS / JavaScript**
- Keine externen CDNs, kein Backend
- LocalStorage für Notizen, Einstellungen, VFS, Kalender, Todos
- Optional: Service Worker (Offline), Web App Manifest (PWA)
- Relative Pfade → GitHub Pages kompatibel

---

## Projektstruktur

```
VirtualPC/
├── index.html
├── style.css
├── script.js
├── manifest.json
├── service-worker.js
├── README.md
├── assets/
│   └── icons/favicon.svg
├── styles/
│   ├── desktop.css
│   ├── windows.css
│   └── apps.css
└── apps/
    ├── terminal.js
    ├── notes.js
    ├── browser.js
    ├── explorer.js
    ├── calculator.js
    ├── paint.js
    ├── settings.js
    ├── calendar.js
    ├── clock.js
    ├── music.js
    ├── video.js
    ├── image-viewer.js
    ├── notepad.js
    ├── task-manager.js
    ├── app-store.js
    ├── system-info.js
    ├── recycle-bin.js
    ├── screenshot.js
    └── todo.js
```

---

## Hinweise zu Einschränkungen

| Feature | Hinweis |
|---------|---------|
| Echtes Ping | Nur HTTP-Erreichbarkeits-Check (ICMP im Browser unmöglich) |
| iframe-Websites | Viele Seiten blockieren Embedding → Fallback „In neuem Tab öffnen“ |
| File System Access | Hauptsächlich Desktop-Chrome/Edge; auf vielen Tablets nicht verfügbar |
| Downloads | Absichtlich und vollständig deaktiviert |
| Offline | Service Worker cached die App-Dateien; externe Websites brauchen Netz |

---

Viel Spaß mit deinem virtuellen Windows 11 PC!
