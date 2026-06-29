const express = require('express');
const multer = require('multer');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { execSync, spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3333;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const LETTERS_DIR = path.join(__dirname, 'letters');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(LETTERS_DIR, { recursive: true });

// ── Locate rembg binary at startup (auto-detect, no machine-specific hardcoding) ──
function findRembgBin() {
  if (process.env.REMBG_BIN && fs.existsSync(process.env.REMBG_BIN)) {
    return process.env.REMBG_BIN;
  }
  try {
    const found = execSync('command -v rembg', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (found && fs.existsSync(found)) return found;
  } catch {}
  const candidates = [
    '/usr/local/bin/rembg',
    '/usr/bin/rembg',
    path.join(os.homedir(), '.local', 'bin', 'rembg'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

const REMBG_BIN = findRembgBin();
if (!REMBG_BIN) {
  console.error('\n[FATAL] rembg CLI not found. Install with:');
  console.error('  pip install --break-system-packages "rembg[cpu,cli]"');
  console.error('Or set REMBG_BIN=/path/to/rembg in the environment.\n');
  process.exit(1);
}
console.log(`[rembg] using ${REMBG_BIN}`);

// ── Persistent rembg HTTP server (keeps the 176MB model in memory between uploads) ──
const REMBG_PORT = parseInt(process.env.REMBG_PORT || '5000', 10);
const REMBG_URL = `http://127.0.0.1:${REMBG_PORT}/api/remove`;
let rembgProc = null;

function startRembgServer() {
  rembgProc = spawn(REMBG_BIN, ['s', '--host', '127.0.0.1', '--port', String(REMBG_PORT), '--no-ui', '--model', 'u2netp'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  rembgProc.stdout.on('data', d => {
    const msg = d.toString().trim();
    if (msg) console.log(`[rembg] ${msg}`);
  });
  rembgProc.stderr.on('data', d => {
    const msg = d.toString().trim();
    if (msg) console.error(`[rembg] ${msg}`);
  });
  rembgProc.on('exit', code => {
    if (code !== 0 && code !== null) {
      console.error(`[rembg] server exited with code ${code}, restarting in 2s...`);
      setTimeout(startRembgServer, 2000);
    }
  });
}

function killRembgServer() {
  if (rembgProc && !rembgProc.killed) {
    try { rembgProc.kill(); } catch {}
  }
}

process.on('exit', killRembgServer);
process.on('SIGINT', () => { killRembgServer(); process.exit(0); });
process.on('SIGTERM', () => { killRembgServer(); process.exit(0); });

async function waitForRembgServer(timeoutMs = 30000) {
  const net = require('net');
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await new Promise(resolve => {
      const sock = net.createConnection({ host: '127.0.0.1', port: REMBG_PORT }, () => {
        sock.end();
        resolve(true);
      });
      sock.on('error', () => resolve(false));
    });
    if (ok) return;
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error(`rembg server failed to accept connections on port ${REMBG_PORT} within ${timeoutMs / 1000}s`);
}

// ── Use memoryStorage so the route handler can write the file AFTER multer fully parses the body ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/letters', express.static(LETTERS_DIR));

app.get('/status', (req, res) => {
  const done = CHARS.filter(c => fs.existsSync(path.join(LETTERS_DIR, `${c}.png`)));
  const remaining = CHARS.filter(c => !done.includes(c));
  res.json({ done, remaining });
});

app.post('/upload', upload.single('photo'), async (req, res) => {
  let rawPath = null;
  try {
    const char = (req.body.char || '').toUpperCase();
    if (!CHARS.includes(char)) {
      return res.json({ ok: false, error: 'Invalid character' });
    }
    if (!req.file || !req.file.buffer) {
      return res.json({ ok: false, error: 'No photo uploaded' });
    }

    // Write the uploaded buffer to a temp file using req.body.char (now fully parsed)
    const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    rawPath = path.join(UPLOADS_DIR, `${char}_${crypto.randomBytes(4).toString('hex')}_raw${ext}`);
    fs.writeFileSync(rawPath, req.file.buffer);

    const outPath = path.join(LETTERS_DIR, `${char}.png`);
    let outBuffer;
    try {
      const form = new FormData();
      form.append('file', new Blob([req.file.buffer], { type: req.file.mimetype || 'image/jpeg' }), req.file.originalname || 'photo.jpg');
      const res = await fetch(REMBG_URL, { method: 'POST', body: form });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`rembg server returned ${res.status}: ${errText.slice(0, 200)}`);
      }
      outBuffer = Buffer.from(await res.arrayBuffer());
    } catch (rembgErr) {
      try { fs.unlinkSync(rawPath); } catch {}
      return res.json({ ok: false, error: `rembg failed: ${rembgErr.message}` });
    }
    fs.writeFileSync(outPath, outBuffer);
    try { fs.unlinkSync(rawPath); } catch {}
    res.json({ ok: true });
  } catch (err) {
    if (rawPath) { try { fs.unlinkSync(rawPath); } catch {} }
    res.json({ ok: false, error: err.message });
  }
});

app.post('/reset', (req, res) => {
  try {
    const files = fs.readdirSync(LETTERS_DIR);
    let deleted = 0;
    for (const f of files) {
      if (f.toLowerCase().endsWith('.png') && f !== '.gitkeep') {
        fs.unlinkSync(path.join(LETTERS_DIR, f));
        deleted++;
      }
    }
    console.log(`[reset] deleted ${deleted} letter(s)`);
    res.json({ ok: true, deleted });
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
  startRembgServer();
  setTimeout(() => {
    waitForRembgServer()
      .then(async () => {
        console.log(`[rembg] HTTP server ready on port ${REMBG_PORT}`);
        // Pre-warm: send a 1x1 transparent PNG so the model loads before the first real photo
        const tiny1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
        const warmForm = new FormData();
        warmForm.append('file', new Blob([tiny1x1], { type: 'image/png' }), 'warm.png');
        await fetch(REMBG_URL, { method: 'POST', body: warmForm }).catch(() => {});
        console.log('[rembg] model pre-warmed — first upload will be fast');
      })
      .catch(err => console.error('[rembg] startup error:', err.message));
  }, 500);
});
