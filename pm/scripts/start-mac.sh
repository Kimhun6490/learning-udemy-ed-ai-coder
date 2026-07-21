#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="pm-mvp"
CONTAINER_NAME="pm-mvp-app"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

docker build -t "$IMAGE_NAME" .
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

if [[ -f "$ROOT_DIR/.env" ]]; then
  docker run -d --name "$CONTAINER_NAME" -p 8000:8000 --env-file "$ROOT_DIR/.env" "$IMAGE_NAME"
else
  docker run -d --name "$CONTAINER_NAME" -p 8000:8000 "$IMAGE_NAME"
fi

for _ in {1..30}; do
  if curl -fsS "http://localhost:8000/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

curl -fsS "http://localhost:8000/api/health" >/dev/null

echo "Started $CONTAINER_NAME at http://localhost:8000"
