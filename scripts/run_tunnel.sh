#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================================="
echo " INTERPOSE // CLOUDFLARE TUNNEL RUNNER (LIVE REMOTE GPU DEMO)"
echo "=========================================================================="

API_PORT="${API_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3002}"

echo "[*] Checking local FastAPI reference monitor on port ${API_PORT}..."
if ! curl -s "http://localhost:${API_PORT}/api/health" > /dev/null; then
  echo "[!] FastAPI server not running on port ${API_PORT}. Starting background server..."
  export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
  .venv/bin/uvicorn interpose.server.app:app --host 0.0.0.0 --port "${API_PORT}" &
  SERVER_PID=$!
  sleep 2
  echo "[✓] FastAPI reference monitor active (PID: ${SERVER_PID})."
fi

echo "[*] Launching Cloudflare Tunnel for public GPU access..."
if command -v cloudflared &> /dev/null; then
  cloudflared tunnel --url "http://localhost:${API_PORT}"
else
  echo "[!] 'cloudflared' not found in PATH."
  echo "    Install with: sudo apt-get install cloudflared"
  echo "    Or download from: https://github.com/cloudflare/cloudflared/releases"
fi
