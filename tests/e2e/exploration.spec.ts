import { expect, test, type Page } from '@playwright/test';

async function snapshot(page: Page) {
  return page.evaluate(() => window.__VALDRIA_TEST__?.snapshot());
}

async function canvasPoint(page: Page, logicalX: number, logicalY: number) {
  const canvas = page.locator('#game canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas Phaser não encontrado.');
  return {
    x: box.x + (logicalX / 960) * box.width,
    y: box.y + (logicalY / 576) * box.height,
  };
}

async function startExploration(page: Page) {
  await page.goto('/modern.html');
  await expect(page.locator('#validation-status')).toHaveAttribute('data-valid', 'true');
  const start = await canvasPoint(page, 480, 355);
  await page.mouse.click(start.x, start.y);
  await expect.poll(async () => (await snapshot(page))?.activeScenes).toContain('WorldScene');
  await expect.poll(async () => Boolean((await snapshot(page))?.playerPosition)).toBe(true);
}

test('abre Campos de Valdria sem erros e prepara câmera/minimapa', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await startExploration(page);
  const state = await snapshot(page);
  expect(state?.minimapReady).toBe(true);
  expect(state?.cameraView?.width).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('movimento diagonal pelo teclado altera os dois eixos', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-landscape', 'teclado é validado no projeto desktop');
  await startExploration(page);
  const before = (await snapshot(page))!.playerPosition!;
  await page.keyboard.down('w');
  await page.keyboard.down('d');
  await page.waitForTimeout(450);
  await page.keyboard.up('w');
  await page.keyboard.up('d');
  const after = (await snapshot(page))!.playerPosition!;
  expect(after.x).toBeGreaterThan(before.x);
  expect(after.y).toBeLessThan(before.y);
});

test('toque/click calcula caminho e move o jogador', async ({ page }) => {
  await startExploration(page);
  const before = (await snapshot(page))!.playerPosition!;
  const destination = await canvasPoint(page, 700, 300);
  await page.mouse.click(destination.x, destination.y);
  await expect.poll(async () => (await snapshot(page))?.playerPosition?.x).toBeGreaterThan(before.x + 20);
  await expect.poll(async () => (await snapshot(page))?.interactionMessage).toContain('Caminho calculado');
});

test('viewport mobile mantém o canvas dentro da tela', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-landscape', 'layout mobile é validado no projeto mobile');
  await page.goto('/modern.html');
  const canvas = page.locator('#game canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(844);
});
