import { expect, test } from '@playwright/test';

test('plays a one-question addition round', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '1 question' }).click();
  await page.getByRole('button', { name: /start 1 questions/i }).click();

  const questionText = await page.locator('.question-row.active span').innerText();
  const match = questionText.match(/(\d+) \+ (\d+) =/);
  expect(match).not.toBeNull();

  const answer = Number(match![1]) + Number(match![2]);
  for (const digit of String(answer)) {
    await page.getByRole('button', { name: digit }).click();
  }

  await expect(page.getByRole('heading', { name: /great job|good job|good try/i })).toBeVisible({ timeout: 3000 });
});

test('phone layout keeps setup and play screen above the fold', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Mobile viewport assertion only applies to the phone project.');

  await page.goto('/');

  const setupMetrics = await page.evaluate(() => {
    const root = document.scrollingElement ?? document.documentElement;
    return {
      scrollHeight: root.scrollHeight,
      clientHeight: root.clientHeight
    };
  });

  expect(setupMetrics.scrollHeight).toBeLessThanOrEqual(setupMetrics.clientHeight);

  await page.getByRole('button', { name: /start/i }).click();
  await page.waitForURL('**/play');
  await expect(page.locator('.game-screen')).toBeVisible();

  const keypad = page.locator('.keypad');
  await expect(keypad).toBeVisible();
  const keypadBox = await keypad.boundingBox();

  const playMetrics = await page.evaluate(() => {
    const root = document.scrollingElement ?? document.documentElement;
    return {
      scrollHeight: root.scrollHeight,
      clientHeight: root.clientHeight,
      viewportHeight: window.innerHeight
    };
  });

  expect(playMetrics.scrollHeight).toBeLessThanOrEqual(playMetrics.clientHeight);
  expect(keypadBox).not.toBeNull();
  expect(keypadBox!.y + keypadBox!.height).toBeLessThanOrEqual(playMetrics.viewportHeight);
});

test('370x740 play layout shows current and two upcoming questions', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Mobile viewport assertion only applies to the phone project.');

  await page.setViewportSize({ width: 370, height: 740 });
  await page.goto('/');
  await page.getByRole('button', { name: /start/i }).click();
  await page.waitForURL('**/play');

  const visibleQuestionCount = await page.locator('.question-row').evaluateAll((rows) =>
    rows.filter((row) => getComputedStyle(row).display !== 'none').length
  );
  expect(visibleQuestionCount).toBe(3);

  const viewportWidth = await page.evaluate(() => window.innerWidth);
  const quitButton = page.getByRole('button', { name: 'Quit' });
  const quitBox = await quitButton.boundingBox();
  expect(quitBox).not.toBeNull();
  expect(quitBox!.width).toBeLessThan(viewportWidth * 0.45);
  expect(quitBox!.x).toBeGreaterThan(viewportWidth * 0.5);

  const keypadBox = await page.locator('.keypad').boundingBox();
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  expect(keypadBox).not.toBeNull();
  expect(keypadBox!.y + keypadBox!.height).toBeLessThanOrEqual(viewportHeight);
});