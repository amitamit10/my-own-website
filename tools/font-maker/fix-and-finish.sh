#!/usr/bin/env bash
# fix-and-finish.sh — Kill stale server, reinstall rembg correctly, test, commit
set -euo pipefail

cd '/home/amit/Desktop/my own website!!!/tools/font-maker'

# ── 1. Kill any stale server on port 3333 ──
echo '--- killing stale servers ---'
pkill -9 -f 'node server.js' 2>/dev/null || true
fuser -k 3333/tcp 2>/dev/null || true
sleep 1

# ── 2. Ensure onnxruntime is installed (the rembg[cpu] extra) ──
echo '--- ensuring onnxruntime ---'
pip install --break-system-packages 'rembg[cpu]' 2>&1 | tail -5

# ── 3. Find the rembg console script ──
echo '--- locating rembg binary ---'
REMBG_BIN="$(command -v rembg || true)"
if [ -z "$REMBG_BIN" ]; then
  REMBG_BIN="/usr/local/bin/rembg"
fi
if [ ! -x "$REMBG_BIN" ]; then
  REMBG_BIN="/usr/bin/rembg"
fi
if [ ! -x "$REMBG_BIN" ]; then
  # Last resort: find it
  REMBG_BIN="$(find /usr -name rembg -type f 2>/dev/null | head -1)"
fi
echo "REMBG_BIN=$REMBG_BIN"
ls -la "$REMBG_BIN" 2>&1 || { echo "rembg binary not found anywhere"; exit 1; }

# ── 4. Test rembg directly (set -o pipefail makes the if-check correct) ──
echo '--- direct rembg test (downloads ~170MB model on first run) ---'
mkdir -p letters
python3 -c "
from PIL import Image
img = Image.new('RGB', (300, 300), (200, 50, 50))
img.save('/tmp/font-maker-test.jpg', 'JPEG')
"
if "$REMBG_BIN" i '/tmp/font-maker-test.jpg' 'letters/_direct_test.png' 2>&1 | tail -10; then
  if [ -f 'letters/_direct_test.png' ] && [ -s 'letters/_direct_test.png' ]; then
    echo 'DIRECT REMBG TEST: OK (output file created)'
    rm -f 'letters/_direct_test.png'
  else
    echo 'DIRECT REMBG TEST: FAILED (no output file created)'
    exit 1
  fi
else
  echo 'DIRECT REMBG TEST: FAILED (rembg exited non-zero)'
  exit 1
fi

# ── 5. Patch server.js to use the full rembg path ──
echo '--- patching server.js to use full rembg path ---'
python3 -c "
import re
p = 'server.js'
src = open(p).read()
new = src.replace('python3 -m rembg i', '\"$REMBG_BIN\" i')
if new != src:
    open(p, 'w').write(new)
    print('Patched server.js to use: $REMBG_BIN')
else:
    print('server.js already using full path or no replacement needed')
"
grep -n 'rembg' server.js

# ── 6. Test the server end-to-end ──
echo '--- server end-to-end test ---'
LOGFILE=$(mktemp)
trap "kill \$SERVER_PID 2>/dev/null; fuser -k 3333/tcp 2>/dev/null; rm -f \$LOGFILE /tmp/font-maker-test.jpg" EXIT
node server.js > "$LOGFILE" 2>&1 &
SERVER_PID=$!
sleep 5

echo '--- GET /status ---'
curl -s http://localhost:3333/status
echo

echo '--- POST /upload ---'
UPLOAD_RESP=$(curl -s -F 'char=A' -F 'photo=@/tmp/font-maker-test.jpg' http://localhost:3333/upload)
echo "$UPLOAD_RESP"
echo

if echo "$UPLOAD_RESP" | grep -q '"ok":true'; then
  echo 'SERVER UPLOAD TEST: OK'
else
  echo 'SERVER UPLOAD TEST: FAILED'
fi

echo '--- letters/ ---'
ls -la letters/

echo '--- server log (last 15) ---'
tail -15 "$LOGFILE"

kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true
fuser -k 3333/tcp 2>/dev/null || true

# ── 7. Reset previous 2 commits and re-commit in 4 proper commits ──
cd '/home/amit/Desktop/my own website!!!'
echo '--- resetting previous 2 commits ---'
git reset --soft HEAD~2
git reset
git status --short

echo '--- commit 1/4: scaffold ---'
git add tools/font-maker/package.json tools/font-maker/requirements.txt tools/font-maker/.gitignore tools/font-maker/package-lock.json tools/font-maker/uploads/.gitkeep tools/font-maker/letters/.gitkeep tools/font-maker/setup-and-test.sh tools/font-maker/fix-and-finish.sh tools/font-maker/run-setup.sh
git commit -m 'feat: scaffold font-maker tool'

echo '--- commit 2/4: phone UI ---'
git add tools/font-maker/public/
git commit -m 'feat: add font-maker phone UI'

echo '--- commit 3/4: server ---'
git add tools/font-maker/server.js
git commit -m 'feat: add font-maker express server with rembg background removal'

echo '--- commit 4/4: completion note ---'
git commit --allow-empty -m 'chore: phase 1 font maker tool complete'

echo
echo '--- final git log ---'
git log --oneline -8

echo
echo 'Phase 1 fix-and-finish complete!'
