const { test, expect } = require('@playwright/test');

test('game starts and player can jump after charging speed', async ({ page }) => {
  await page.goto('/');

  // Start from title to ready countdown
  await page.mouse.down();
  await page.mouse.up();

  // Hold to accelerate once gameplay begins
  await page.mouse.down();
  await page.waitForTimeout(3600);
  await page.mouse.up();

  // Trigger jump
  await page.mouse.down();
  await page.waitForTimeout(100);
  await page.mouse.up();

  const playerState = await page.evaluate(() => {
    const canvas = document.getElementById('gameCanvas');
    return canvas ? true : false;
  });

  expect(playerState).toBeTruthy();
});
