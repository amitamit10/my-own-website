const express = require('express');
const multer = require('multer');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { execSync, execFileSync } = require('child_process');

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

// ── Use memoryStorage so the route handler can write the file AFTER multer fully parses the body ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/status', (req, res) => {
  const done = CHARS.filter(c => fs.existsSync(path.join(LETTERS_DIR, `${c}.png`)));
  const remaining = CHARS.filter(c => !done.includes(c));
  res.json({ done, remaining });
});

app.post('/upload', upload.single('photo'), (req, res) => {
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
    let stdout = '';
    try {
      stdout = execFileSync(REMBG_BIN, ['i', rawPath, outPath], { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
      if (stdout.trim()) console.log(`[rembg] ${char}: ${stdout.trim()}`);
    } catch (rembgErr) {
      const stderr = rembgErr.stderr ? rembgErr.stderr.toString() : '(no stderr captured)';
      const out = rembgErr.stdout ? rembgErr.stdout.toString() : '';
      try { fs.unlinkSync(rawPath); } catch {}
      return res.json({
        ok: false,
        error: `rembg failed (exit ${rembgErr.status || '?'}): ${(stderr + out).trim() || rembgErr.message}`,
      });
    }
    try { fs.unlinkSync(rawPath); } catch {}
    res.json({ ok: true });
  } catch (err) {
    if (rawPath) { try { fs.unlinkSync(rawPath); } catch {} }
    res.json({ ok: false, error: err.message });
  }
});

// ── Warm the rembg model cache at startup so the first user upload is fast ──
function warmRembg() {
  const warmPath = path.join(UPLOADS_DIR, '_warmup.png');
  const warmOut = path.join(UPLOADS_DIR, '_warmup_out.png');
  try {
    // 1x1 PNG (smallest possible valid PNG, 67 bytes)
    const tinyPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    fs.writeFileSync(warmPath, tinyPng);
    execFileSync(REMBG_BIN, ['i', warmPath, warmOut], { stdio: 'ignore' });
    console.log('[rembg] model warmed');
  } catch (err) {
    console.warn('[rembg] warm-up failed (non-fatal):', err.message);
  } finally {
    try { fs.unlinkSync(warmPath); } catch {}
    try { fs.unlinkSync(warmOut); } catch {}
  }
}

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
  // Fire-and-forget warm-up so it doesn't block the listen callback
  setImmediate(warmRembg);
});
