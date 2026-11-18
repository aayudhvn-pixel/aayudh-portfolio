#!/usr/bin/env bash
# Compresses the case study recordings and the full ad clips for the site.
# Usage: bash scripts/build-case-media.sh [path-to-PORTFOLIO-ASSETS]
# Output:
#   public/assets/case/<project>/<name>.mp4 + <name>-poster.jpg   (muted loops, H.264)
#   public/assets/films/clips/<name>.mp4 + <name>-poster.jpg      (full ads, 1080p max,
#                                                                  audio kept where it exists)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-$ROOT/../PORTFOLIO ASSETS}"
CASE="$ROOT/public/assets/case"
CLIPS="$ROOT/public/assets/films/clips"
mkdir -p "$CASE/memorease" "$CASE/tedx" "$CASE/path-of-stillness" "$CLIPS"

# Screen recordings: no audio (they play as muted loops), even dimensions,
# capped width, CRF 30 — screen content compresses well.
# args: source  out  max-width  [extra ffmpeg input args, e.g. a trim]
rec() {
  local src="$1" out="$2" w="$3"; shift 3
  ffmpeg -v error -y "$@" -i "$src" -an \
    -vf "scale='min($w,iw)':-2:flags=lanczos,fps=30,format=yuv420p" \
    -c:v libx264 -preset slow -crf 30 -profile:v high -movflags +faststart "$out.mp4"
  ffmpeg -v error -y -ss 1 -i "$out.mp4" -frames:v 1 -q:v 4 "$out-poster.jpg"
  echo "$(basename "$out").mp4  $(du -h "$out.mp4" | cut -f1)"
}

M="$SRC/MemorEase"
# The patient recording is a bare, taller screen capture (384×832). It is put on the
# caregiver video's 432×768 canvas, padded with the app's own cream (#FEF7F0), so
# the two recordings show at exactly the same size side by side.
ffmpeg -v error -y -i "$M/MemorEase_Patient_Full_Recording.mp4" -an \
  -vf "scale=-2:768:flags=lanczos,pad=432:768:(ow-iw)/2:0:color=0xFEF7F0,fps=30,format=yuv420p" \
  -c:v libx264 -preset slow -crf 30 -profile:v high -movflags +faststart "$CASE/memorease/patient.mp4"
ffmpeg -v error -y -ss 1 -i "$CASE/memorease/patient.mp4" -frames:v 1 -q:v 4 "$CASE/memorease/patient-poster.jpg"
echo "patient.mp4  $(du -h "$CASE/memorease/patient.mp4" | cut -f1)"
rec "$M/MemorEase_Caregiver_Recording.mp4" "$CASE/memorease/caregiver" 432

T="$SRC/TEDx"
# The 170 MB web recording: 720p, first 40 s (a full scroll through the site).
rec "$T/TEDxMITWPU_web_version.mp4" "$CASE/tedx/web" 1280 -t 40
rec "$T/TEDxMITWPU_mobile_version.mp4" "$CASE/tedx/mobile" 432

P="$SRC/Path Of Stillness"
rec "$P/WhatsApp Video 2026-11-16 at 9.54.51 PM.mp4" "$CASE/path-of-stillness/gameplay" 640

# Full ad clips for /films: 1080p max, CRF 24, audio kept (AAC 128k) when present.
for f in "$SRC/AI Ad Clips/"*.mp4; do
  name="$(basename "$f" .mp4)"
  ffmpeg -v error -y -i "$f" \
    -vf "scale='min(1920,iw)':-2:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset slow -crf 24 -profile:v high -c:a aac -b:a 128k -movflags +faststart \
    "$CLIPS/$name.mp4"
  ffmpeg -v error -y -ss 0.8 -i "$CLIPS/$name.mp4" -frames:v 1 -vf "scale=960:-2" -q:v 4 "$CLIPS/$name-poster.jpg"
  echo "$name.mp4  $(du -h "$CLIPS/$name.mp4" | cut -f1)"
done

# Posters: JPEG frames → WebP (smaller).
node "$ROOT/scripts/posters-to-webp.mjs"
