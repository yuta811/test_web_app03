#!/usr/bin/env bash
set -euo pipefail

printf '\n[1/3] Installing npm dependencies...\n'
npm install

printf '\n[2/3] Installing Playwright browsers (Chromium)...\n'
npx playwright install chromium

printf '\n[3/3] Verifying Playwright runtime dependencies...\n'
if npx playwright install-deps chromium; then
  echo "Playwright OS dependencies look ready."
else
  echo "\n[WARN] Failed to install OS packages for Playwright automatically."
  echo "Run the command below on a machine/container where apt is available:"
  echo "  sudo npx playwright install-deps chromium"
  echo "Then re-run: npm test"
fi

printf '\nBootstrap finished. Next step: npm test\n'
