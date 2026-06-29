#!/usr/bin/env bash
# setup-and-test.sh — Phase 1 setup + test for Font Maker
# Run: chmod +x tools/font-maker/setup-and-test.sh && tools/font-maker/setup-and-test.sh
set -e

cd '/home/amit/Desktop/my own website!!!/tools/font-maker'

# ── 1. npm install ──
echo '--- npm install ---'
npm install 2>&1 | tail -15

# ── 2. Python deps ──
echo '--- pip install ---'
pip install --break-system-packages 'rembg[cli]' Pillow 2>&1 | tail -10

# ── 3. Create test JPEG with PIL ──
echo '--- create test JPEG ---'
python3 -c "
from PIL import Image
img = Image.new('RGB', (300, 300), (200, 200, 200))
img.save('/tmp/font-maker-test.jpg', 'JPEG')
"

# ── 4. Start server in background ──
LOGFILE=$(mktemp)
trap "kill $SERVER_PID 2>/dev/null; rm -f $LOGFILE /tmp/font-maker-test.jpg" EXIT
node server.js > "$LOGFILE" 2>&1 &
SERVER_PID=$!
sleep 5

# ── 5. Test /status endpoint ──
echo '--- GET /status ---'
curl -s http://localhost:3333/status
echo

# ── 6. Test /upload endpoint ──
echo '--- POST /upload ---'
curl -s -F 'char=A' -F 'photo=@/tmp/font-maker-test.jpg' http://localhost:3333/upload
echo

# ── 7. List letters/ directory ──
echo '--- letters/ ---'
ls -la letters/

# ── 8. Show server log (last 20 lines) ──
echo '--- server log (last 20) ---'
tail -20 "$LOGFILE"

# ── 9. Kill the server (trap handles it) ──
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null || true

# ── 10. Stage and commit in 4 separate commits ──
echo '--- git commits ---'
cd '/home/amit/Desktop/my own website!!!'
git add tools/font-maker/ || true
git commit -m 'feat: scaffold font-maker tool' || echo 'nothing to commit'

git add tools/font-maker/public/
git commit -m 'feat: add font-maker phone UI' || echo 'nothing to commit'

git add tools/font-maker/server.js
git commit -m 'feat: add font-maker express server with rembg background removal' || echo 'nothing to commit'

git commit --allow-empty -m 'chore: phase 1 font maker tool complete' || echo 'nothing to commit'

# ── 11. Show git log ──
echo '--- git log (last 10) ---'
git log --oneline -10

echo
echo 'Phase 1 complete!'
