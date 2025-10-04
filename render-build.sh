#!/usr/bin/env bash
set -euo pipefail

# Build script for Render single-service deployment
# 1) Install root deps and build frontend
# 2) Install server deps

echo "Installing root dependencies..."
npm install

echo "Building frontend..."
npm run build

# Install server dependencies (in case server has its own package.json in /server)
if [ -f server/package.json ]; then
  echo "Installing server dependencies..."
  (cd server && npm install)
fi

echo "Build complete."
