#!/usr/bin/env bash
# Builds the home-page films teaser reel from the source ad clips.
# Usage: bash scripts/build-reel.sh [path-to-"AI Ad Clips"]
# Output: public/assets/reel/reel.mp4 (H.264), reel.webm (VP9), reel-poster.webp
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-$ROOT/../PORTFOLIO ASSETS/AI Ad Clips}"
OUT="$ROOT/public/assets/reel"
mkdir -p "$OUT"

# Cut list: file  start  duration (seconds). Order = playback order.
CUTS=(
  "adv_bike         2.0  3.0"   # storm road, lightning
  "adv_bike_jump    0.5  2.5"   # jump over lava
  "power_punch      0.0  2.5"   # glove into camera
  "midnight_random  8.0  2.5"   # mime + jellyfish
  "tiger            1.0  2.5"   # tiger steps forward
  "dharohar_2       1.0  3.0"   # pocket watch lifted, calm close before the loop
)

W=1920; H=1080; FPS=24
inputs=(); filters=""; labels=""; i=0
for cut in "${CUTS[@]}"; do
  read -r name start dur <<<"$cut"
  inputs+=(-ss "$start" -t "$dur" -i "$SRC/$name.mp4")
  filters+="[$i:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},setsar=1,format=yuv420p,setpts=PTS-STARTPTS[v$i];"
  labels+="[v$i]"
  i=$((i + 1))
done
filters+="${labels}concat=n=${i}:v=1:a=0[out]"

ffmpeg -v error -y "${inputs[@]}" -filter_complex "$filters" -map "[out]" -an \
  -c:v libx264 -preset slow -crf 28 -profile:v high -movflags +faststart \
  "$OUT/reel.mp4"

ffmpeg -v error -y -i "$OUT/reel.mp4" -an \
  -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 -deadline good -cpu-used 2 \
  "$OUT/reel.webm"

# Poster: first frame, so the first paint matches the start of playback.
ffmpeg -v error -y -i "$OUT/reel.mp4" -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -quality 80 "$OUT/reel-poster.webp"

ls -la "$OUT"

# Hero line film tile: a 3 s loop of adv_bike at tile size (PORTFOLIO.md 4.2).
HERO="$ROOT/public/assets/hero"
mkdir -p "$HERO"
ffmpeg -v error -y -ss 2.0 -t 3.0 -i "$SRC/adv_bike.mp4" -an \
  -vf "scale=-2:200,crop=356:200,fps=24,format=yuv420p" \
  -c:v libx264 -preset slow -crf 26 -movflags +faststart "$HERO/tile-film.mp4"
ffmpeg -v error -y -i "$HERO/tile-film.mp4" -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 "$HERO/tile-film.webm"
ffmpeg -v error -y -ss 0.8 -i "$HERO/tile-film.mp4" -frames:v 1 -c:v libwebp -quality 80 "$HERO/tile-film-poster.webp"
ls -la "$HERO"
