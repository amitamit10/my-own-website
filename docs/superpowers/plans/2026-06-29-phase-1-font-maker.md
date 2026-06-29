# Phase 1: Font Maker Tool — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local tool that guides the user to photograph each letter with their phone and saves transparent-background PNGs ready for font assembly.

**Architecture:** A Node.js Express server runs on the local network. The phone browses to it via QR code, photographs letters one by one using the native camera, and uploads them. A Python `rembg` call strips the background from each photo and saves clean PNGs to `tools/font-maker/letters/`.

**Tech Stack:** Node.js ≥ 20, Express 4, Multer, qrcode-terminal, Python ≥ 3.9, rembg

## Global Constraints
- Output format: PNG with transparency, named `A.png` … `Z.png`, `0.png` … `9.png`
- Server binds to `0.0.0.0` on port 3333 (phone must be on same WiFi)
- All paths relative to `tools/font-maker/`
- `rembg` CLI must be on PATH before running server

---

### Task 1: Project scaffold

**Files:**
- Create: `tools/font-maker/package.json`
- Create: `tools/font-maker/.gitignore`
- Create: `tools/font-maker/requirements.txt`
- Create: `tools/font-maker/uploads/.gitkeep`
- Create: `tools/font-maker/letters/.gitkeep`

**Interfaces:**
- Produces: `npm start` launches server

- [ ] **Step 1: Create `tools/font-maker/package.json`**

```json
{
  "name": "font-maker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "qrcode-terminal": "^0.12.0"
  }
}
```

- [ ] **Step 2: Create `tools/font-maker/requirements.txt`**

```
rembg[cli]
Pillow
```

- [ ] **Step 3: Create `tools/font-maker/.gitignore`**

```
uploads/*
!uploads/.gitkeep
node_modules/
__pycache__/
*.pyc
```

- [ ] **Step 4: Create directory placeholders**

```bash
touch tools/font-maker/uploads/.gitkeep
touch tools/font-maker/letters/.gitkeep
```

- [ ] **Step 5: Install Node dependencies**

```bash
cd tools/font-maker && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Install Python dependencies**

```bash
pip install rembg[cli] Pillow
```

Verify: `rembg --help` prints usage without error.

- [ ] **Step 7: Commit**

```bash
git add tools/font-maker/
git commit -m "feat: scaffold font-maker tool"
```

---

### Task 2: Phone UI

**Files:**
- Create: `tools/font-maker/public/index.html`
- Create: `tools/font-maker/public/style.css`

**Interfaces:**
- Consumes: `GET /status` → `{ done: string[], remaining: string[] }`
- Produces: `POST /upload` FormData with fields `char: string` and `photo: File`

- [ ] **Step 1: Create `tools/font-maker/public/style.css`**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #0a0a0a;
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}
#letter {
  font-size: 40vw;
  line-height: 1;
  font-weight: 900;
  color: #00d4ff;
  margin-bottom: 1rem;
}
#instruction { font-size: 1.2rem; color: #aaa; margin-bottom: 2rem; }
#capture-btn {
  background: #00d4ff;
  color: #000;
  font-size: 1.2rem;
  font-weight: 700;
  padding: 1rem 2.5rem;
  border-radius: 999px;
  cursor: pointer;
  border: none;
  margin-bottom: 1rem;
}
#capture-btn:disabled { opacity: 0.4; cursor: not-allowed; }
#status-msg { font-size: 1rem; color: #aaa; min-height: 1.5rem; }
#progress { font-size: 0.85rem; color: #555; margin-top: 1rem; }
#done-list { font-size: 0.75rem; color: #333; margin-top: 0.5rem; word-break: break-all; }
input[type="file"] { display: none; }
```

- [ ] **Step 2: Create `tools/font-maker/public/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Font Maker</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div id="letter">A</div>
  <p id="instruction">Form this letter with water, then tap capture.</p>
  <button id="capture-btn">📸 Capture</button>
  <input type="file" id="file-input" accept="image/*" capture="environment" />
  <p id="status-msg"></p>
  <p id="progress"></p>
  <p id="done-list"></p>

  <script>
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    const letterEl = document.getElementById('letter');
    const statusEl = document.getElementById('status-msg');
    const progressEl = document.getElementById('progress');
    const doneEl = document.getElementById('done-list');
    const btn = document.getElementById('capture-btn');
    const fileInput = document.getElementById('file-input');
    let current = null;

    async function loadStatus() {
      const { done, remaining } = await fetch('/status').then(r => r.json());
      current = remaining[0] || null;
      letterEl.textContent = current || '✓';
      progressEl.textContent = `${done.length}/${CHARS.length} captured`;
      doneEl.textContent = done.length ? `Done: ${done.join(' ')}` : '';
      btn.disabled = !current;
      if (!current) statusEl.textContent = 'All letters captured!';
    }

    btn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file || !current) return;
      btn.disabled = true;
      statusEl.textContent = 'Uploading…';
      const form = new FormData();
      form.append('char', current);
      form.append('photo', file);
      try {
        const { ok, error } = await fetch('/upload', { method: 'POST', body: form }).then(r => r.json());
        statusEl.textContent = ok ? `✓ ${current} saved!` : `Error: ${error}`;
        if (ok) await loadStatus();
        else btn.disabled = false;
      } catch {
        statusEl.textContent = 'Upload failed, try again.';
        btn.disabled = false;
      }
      fileInput.value = '';
    });

    loadStatus();
  </script>
</body>
</html>
```

- [ ] **Step 3: Verify UI in browser**

Open `tools/font-maker/public/index.html` via `file://` in a desktop browser. You should see a dark screen with a large cyan "A" and a capture button. (The fetch calls will fail — that's expected without the server.)

- [ ] **Step 4: Commit**

```bash
git add tools/font-maker/public/
git commit -m "feat: add font-maker phone UI"
```

---

### Task 3: Express server

**Files:**
- Create: `tools/font-maker/server.js`

**Interfaces:**
- Consumes: `rembg` CLI on PATH, `uploads/` dir, `letters/` dir
- Produces:
  - `GET /` → serves `public/index.html`
  - `GET /status` → `{ done: string[], remaining: string[] }`
  - `POST /upload` (multipart: `char`, `photo`) → `{ ok: true }` or `{ ok: false, error: string }`

- [ ] **Step 1: Create `tools/font-maker/server.js`**

```js
const express = require('express');
const multer = require('multer');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3333;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const LETTERS_DIR = path.join(__dirname, 'letters');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(LETTERS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const char = (req.body.char || 'X').toUpperCase().replace(/[^A-Z0-9]/g, 'X');
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${char}_raw${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/status', (req, res) => {
  const done = CHARS.filter(c => fs.existsSync(path.join(LETTERS_DIR, `${c}.png`)));
  const remaining = CHARS.filter(c => !done.includes(c));
  res.json({ done, remaining });
});

app.post('/upload', upload.single('photo'), (req, res) => {
  try {
    const char = (req.body.char || '').toUpperCase();
    if (!CHARS.includes(char)) {
      return res.json({ ok: false, error: 'Invalid character' });
    }
    const rawPath = req.file.path;
    const outPath = path.join(LETTERS_DIR, `${char}.png`);
    execSync(`rembg i "${rawPath}" "${outPath}"`, { stdio: 'pipe' });
    fs.unlinkSync(rawPath);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  const url = `http://${ip}:${PORT}`;
  console.log(`\nFont Maker running at ${url}\n`);
  console.log('Scan this QR code with your phone (same WiFi required):\n');
  qrcode.generate(url, { small: true });
});
```

- [ ] **Step 2: Start the server and verify QR code appears**

```bash
cd tools/font-maker && npm start
```

Expected:
```
Font Maker running at http://192.168.x.x:3333

Scan this QR code with your phone (same WiFi required):

[QR CODE PRINTED IN TERMINAL]
```

- [ ] **Step 3: Test `/status` endpoint**

```bash
curl http://localhost:3333/status
```

Expected: `{"done":[],"remaining":["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"]}`

- [ ] **Step 4: Test `/upload` with a real image**

Replace `/path/to/any/photo.jpg` with any JPEG on your machine:

```bash
curl -X POST http://localhost:3333/upload \
  -F "char=A" \
  -F "photo=@/path/to/any/photo.jpg"
```

Expected: `{"ok":true}` and `tools/font-maker/letters/A.png` exists.

- [ ] **Step 5: Verify background was removed**

Open `tools/font-maker/letters/A.png` in an image viewer. Background should be transparent (checkerboard pattern in most viewers).

- [ ] **Step 6: Commit**

```bash
git add tools/font-maker/server.js
git commit -m "feat: add font-maker express server with rembg background removal"
```

---

### Task 4: End-to-end phone test

No new files — this is a manual verification task.

- [ ] **Step 1: Start the server**

```bash
cd tools/font-maker && npm start
```

- [ ] **Step 2: Connect your phone**

Scan the QR code with your phone's camera. Your phone and computer must be on the same WiFi. The Font Maker UI should open in your phone's browser.

- [ ] **Step 3: Capture a letter**

Tap "Capture", photograph something (can be anything for testing), and confirm the UI advances to the next letter and the progress counter increments.

- [ ] **Step 4: Verify the output PNG**

On your computer, check `tools/font-maker/letters/` — the captured letter's PNG should be present with a transparent background.

- [ ] **Step 5: Commit completion note**

```bash
git commit --allow-empty -m "chore: phase 1 font maker tool complete"
```
