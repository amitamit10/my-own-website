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
    try {
      execSync(`"/home/amit/.local/bin/rembg" i "${rawPath}" "${outPath}"`, { stdio: 'pipe' });
    } catch (rembgErr) {
      const stderr = rembgErr.stderr ? rembgErr.stderr.toString() : '(no stderr captured)';
      const stdout = rembgErr.stdout ? rembgErr.stdout.toString() : '';
      // Clean up the raw upload on failure too
      try { fs.unlinkSync(rawPath); } catch {}
      return res.json({
        ok: false,
        error: `rembg failed (exit ${rembgErr.status || '?'}): ${stderr.trim() || stdout.trim() || rembgErr.message}`,
      });
    }
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
