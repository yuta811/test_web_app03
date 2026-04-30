# Test Play Environment

## Setup

```bash
npm install
npx playwright install chromium
```

## Run manual playtest

```bash
npm run start
# open http://127.0.0.1:8080/index.html
```

## Run automated smoke tests

```bash
npm test
```

## Debug test run

```bash
npm run test:headed
```

Artifacts are saved by Playwright on failure (screenshot/video/trace).
