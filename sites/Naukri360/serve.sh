#!/usr/bin/env bash
# Naukri360 site — LAN-shareable local server (macOS / Linux)
# Tries Node (http-server) first, falls back to Python.
# Port: 8082. Accessible on the same Wi-Fi at http://<your-lan-ip>:8082/

set -e
PORT=8082
cd "$(dirname "$0")"

echo
echo "=== Naukri360 local server ==="
echo
echo "Your LAN IP(s):"
if command -v ipconfig >/dev/null 2>&1; then
  # macOS
  for ip in $(ipconfig getifaddr en0 2>/dev/null) $(ipconfig getifaddr en1 2>/dev/null); do
    [ -n "$ip" ] && echo "  http://$ip:$PORT/"
  done
elif command -v hostname >/dev/null 2>&1; then
  # Linux
  for ip in $(hostname -I 2>/dev/null); do
    echo "  http://$ip:$PORT/"
  done
fi
echo
echo "Share any of the above URLs with teammates on the same Wi-Fi."
echo "Press Ctrl+C to stop the server."
echo

if command -v node >/dev/null 2>&1; then
  echo "[Node] Starting via npx http-server on port $PORT ..."
  exec npx --yes http-server . -p "$PORT" -a 0.0.0.0 -c-1 --cors
fi

if command -v python3 >/dev/null 2>&1; then
  echo "[Python] Starting via http.server on port $PORT ..."
  exec python3 -m http.server "$PORT" --bind 0.0.0.0
fi

if command -v python >/dev/null 2>&1; then
  echo "[Python] Starting via http.server on port $PORT ..."
  exec python -m http.server "$PORT" --bind 0.0.0.0
fi

echo "ERROR: Neither Node.js nor Python found on PATH."
echo "Install one of:"
echo "  - Node.js:  https://nodejs.org/"
echo "  - Python:   https://www.python.org/downloads/"
exit 1
