# Shadow Step Theater

Prototype implementation of a 2D puzzle platformer concept where light/shadow create temporary platforms.

## Setup

```bash
npm install
npx playwright install chromium
```

## Run game

```bash
npm run start
```

Open `http://127.0.0.1:8080/index.html`.

## Controls

- Arrow keys: move
- Space: jump
- A/D: rotate light
- W/S: adjust light range
- E: lock/unlock light
- R: reset stage

## Test play

Automated smoke tests:

```bash
npm test
```

Headed test play:

```bash
npm run test:headed
```
