const { test, expect } = require('@playwright/test');

test('game starts and player can jump after charging speed', async ({ page }) => {
  await page.goto('/');

  await expect
    .poll(async () => page.evaluate(() => window.__ABORT_RUN_DEBUG__?.getMode()))
    .toBe('title');

  // Start from title to ready countdown
  await page.mouse.down();
  await page.mouse.up();

  await expect
    .poll(async () => page.evaluate(() => window.__ABORT_RUN_DEBUG__?.getMode()), { timeout: 5_000 })
    .toBe('ready');

  await expect
    .poll(async () => page.evaluate(() => window.__ABORT_RUN_DEBUG__?.getMode()), { timeout: 5_000 })
    .toBe('playing');

  // Hold to accelerate once gameplay begins
  await page.mouse.down();
  await page.waitForTimeout(1400);
  await page.mouse.up();

  await expect
    .poll(async () => page.evaluate(() => window.__ABORT_RUN_DEBUG__?.getPlayer()), { timeout: 3_000 })
    .toMatchObject({ grounded: true });

  const beforeJump = await page.evaluate(() => window.__ABORT_RUN_DEBUG__?.getPlayer());
  expect(beforeJump.vx).toBeGreaterThan(50);

  // Trigger jump
  await page.mouse.down();
  await page.waitForTimeout(100);
  await page.mouse.up();

  await expect
    .poll(async () => page.evaluate(() => window.__ABORT_RUN_DEBUG__?.getPlayer()), { timeout: 3_000 })
    .toMatchObject({ grounded: false });

  const afterJump = await page.evaluate(() => window.__ABORT_RUN_DEBUG__?.getPlayer());
  expect(afterJump.vy).toBeLessThan(0);
});
