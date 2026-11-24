#!/usr/bin/env bash
# Bir filmi baştan sona üretir:  npm run film -- <film> [goruntu|ses|hepsi]
#   goruntu : denetim + sessiz görüntü (out/<film>/sessiz.mp4)
#   ses     : olaylar + miks + MP4 (görüntü varsa yeniden render ETMEZ)
#   hepsi   : ikisi (varsayılan)
set -euo pipefail
cd "$(dirname "$0")/.."
FILM="${1:?film adı gerekli}"; MODE="${2:-hepsi}"; PY="${PYTHON:-python3}"; O="out/$FILM"; mkdir -p "$O"
if [ "$MODE" != ses ]; then
  npx tsx tools/audit.ts "$FILM"
  bash tools/render.sh "$FILM" "$O/sessiz.mp4"
fi
if [ "$MODE" != goruntu ]; then
  [ -f "$O/sessiz.mp4" ] || bash tools/render.sh "$FILM" "$O/sessiz.mp4"
  npx tsx tools/events.ts "$FILM"
  "$PY" tools/audio/mix.py "$FILM"
  ffmpeg -v error -y -i "$O/sessiz.mp4" -i "$O/karisim.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$O/$FILM.mp4"
  echo "→ $O/$FILM.mp4"
fi
