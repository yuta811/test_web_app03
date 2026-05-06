#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

function runPlaywrightTest() {
  return spawnSync('npx', ['playwright', 'test'], { encoding: 'utf8' });
}

function printResult(result) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

function hasMissingLinuxLibError(output) {
  return /error while loading shared libraries:/i.test(output)
    || /cannot open shared object file/i.test(output);
}

let result = runPlaywrightTest();
printResult(result);
if (result.status === 0) process.exit(0);

const firstOutput = `${result.stdout || ''}\n${result.stderr || ''}`;
if (!hasMissingLinuxLibError(firstOutput)) {
  process.exit(result.status ?? 1);
}

console.warn('\n[info] Missing Linux browser libraries detected. Trying to install Playwright dependencies...');
const install = spawnSync('npx', ['playwright', 'install', '--with-deps', 'chromium'], {
  encoding: 'utf8',
  stdio: 'inherit'
});

if (install.status !== 0) {
  console.error('[error] Failed to install Playwright dependencies automatically.');
  process.exit(install.status ?? 1);
}

console.warn('[info] Dependency installation finished. Re-running E2E tests...');
result = runPlaywrightTest();
printResult(result);
process.exit(result.status ?? 1);
