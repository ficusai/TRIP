#!/usr/bin/env bash
# TAG: build.launcher - Development Server Launcher (ARCHITECTURE.md)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
  echo "[$(date -Iseconds)] [launcher] $*"
}

error() {
  echo "[$(date -Iseconds)] [launcher] [ERROR] $*" >&2
}

# ── Step 1: Verify Node.js is available ──────────────────────────────
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh" --no-use
  nvm use 22 &>/dev/null || nvm use default &>/dev/null || true
fi

if ! command -v node &>/dev/null; then
  error "Node.js is not installed or not in PATH"
  exit 1
fi
log "node found: $(node --version)"

# ── Step 2: Verify npm is available ──────────────────────────────────
if ! command -v npm &>/dev/null; then
  error "npm is not installed or not in PATH"
  exit 1
fi
log "npm found: $(npm --version)"

# ── Step 3: Ensure dependencies are installed ────────────────────────
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  log "node_modules not found, running npm install..."
  if ! npm install --prefix "$SCRIPT_DIR"; then
    error "npm install failed"
    exit 1
  fi
  log "npm install completed"
fi

# ── Step 4: Start dev server ─────────────────────────────────────────
log "starting dev server..."
cd "$SCRIPT_DIR"

if ! npm run dev; then
  error "dev server exited with error"
  exit 1
fi
