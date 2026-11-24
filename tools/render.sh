#!/usr/bin/env bash
# Kullanım: tools/render.sh <KompozisyonId> <çıktı.mp4>   (sessiz görüntü)
set -euo pipefail
cd "$(dirname "$0")/.."
COMP="$1"; OUT="$2"; mkdir -p "$(dirname "$OUT")"
BROWSER="${KT_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
[ -x "$BROWSER" ] || BROWSER=""
npx remotion render src/index.ts "$COMP" "$OUT" ${BROWSER:+--browser-executable="$BROWSER"} --log=error
echo "→ $OUT"
