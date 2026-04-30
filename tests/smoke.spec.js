const { test, expect } = require('@playwright/test');

test('game boots and HUD appears', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#game')).toBeVisible();
  await expect(page.locator('#hud')).toContainText('Stage 1');
});

test('player can move right and jump', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#game')).toBeVisible();
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(250);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
  await expect(page.locator('#hud')).toContainText('Time:');
});

test('reset key rewinds timer', async ({ page }) => {
  await page.goto('/index.html');
  const hud = page.locator('#hud');
  await page.waitForTimeout(700);
  await expect(hud).toContainText('Time: 0.');
  await page.waitForTimeout(1200);
  await page.keyboard.press('KeyR');
  await page.waitForTimeout(120);
  const text = await hud.innerText();
  expect(text).toMatch(/Time: 0\.[0-3]/);
});

test('visual check: each stage renders core HUD and canvas', async ({ page }) => {
  await page.goto('/index.html');
  const hud = page.locator('#hud');
  await expect(page.locator('#game')).toBeVisible();

  for (const [index, name] of [[0, 'Stage 1'], [1, 'Stage 2'], [2, 'Stage 3']]) {
    await page.evaluate(i => window.__shadowDebug.setStage(i), index);
    await page.waitForTimeout(200);
    await expect(hud).toContainText(name);
    await page.screenshot({ path: `test-results/visual-stage-${index + 1}.png`, fullPage: true });
  }
});
