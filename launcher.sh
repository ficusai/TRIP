#!/usr/bin/env bash
# TAG: build.launcher - Development Server Launcher (ARCHITECTURE.md)
# This file is an executable Bash script: the first line tells the operating
# system to run it with Bash, even when the user types ./launcher.sh.

# Make the script fail fast and avoid silent mistakes:
# -e exits when a command fails, -u rejects unset variables, and pipefail
# makes a pipeline fail if any command in the pipeline fails.
set -euo pipefail

# Resolve the directory containing this script, regardless of where the user
# starts it. SCRIPT_DIR is then used for dependency installation and startup.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print an ordinary launcher message with an ISO-like timestamp on stdout.
# The function accepts any number of words; "$*" joins them into one message.
log() {
  echo "[$(date -Iseconds)] [launcher] $*"
}

# Print an error message with a timestamp to stderr (file descriptor 2).
# Sending errors to stderr keeps them separate from normal launcher output.
error() {
  echo "[$(date -Iseconds)] [launcher] [ERROR] $*" >&2
}

# Step 1: Verify Node.js is available
# NVM (Node Version Manager) lives in the current user's home directory.
# Exporting NVM_DIR makes that location available to the nvm command below.
export NVM_DIR="$HOME/.nvm"
# Load nvm into this shell without automatically switching Node versions.
# The -s test means "run this block only if nvm.sh exists and is not empty".
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # A leading dot sources another script, making its nvm function available here.
  . "$NVM_DIR/nvm.sh" --no-use
  # Prefer Node 22, then the user's default NVM version; ignore failure and continue.
  # Output is silenced because the later version log is easier to read.
  nvm use 22 &>/dev/null || nvm use default &>/dev/null || true
fi

# command -v node checks whether an executable named node is available in PATH.
# If it is missing, report the problem and stop with exit code 1.
if ! command -v node &>/dev/null; then
  error "Node.js is not installed or not in PATH"
  exit 1
fi
# Record the installed Node.js version so startup problems are diagnosable.
log "node found: $(node --version)"

# Step 2: Verify npm is available
# npm is Node's package manager and is required to install dependencies and run Vite.
# Stop with a clear message if npm is missing from PATH.
if ! command -v npm &>/dev/null; then
  error "npm is not installed or not in PATH"
  exit 1
fi
# Record the npm version before doing any installation.
log "npm found: $(npm --version)"

# Step 3: Ensure dependencies are installed
# node_modules is npm's local dependency directory. If absent, install dependencies.
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  log "node_modules not found, running npm install..."
  # --prefix keeps installation in this project even if the script was launched elsewhere.
  # If installation fails, print an error and stop with exit code 1.
  if ! npm install --prefix "$SCRIPT_DIR"; then
    error "npm install failed"
    exit 1
  fi
  log "npm install completed"
fi

# Step 4: Start dev server
# Announce the final startup step before changing the working directory.
log "starting dev server..."
# Run Vite from the project directory so relative paths and plugins resolve correctly.
cd "$SCRIPT_DIR"

# npm run dev executes the "dev" script from package.json (Vite on port 3001).
# If Vite exits unsuccessfully, report it and stop with exit code 1.
if ! npm run dev; then
  error "dev server exited with error"
  exit 1
fi
