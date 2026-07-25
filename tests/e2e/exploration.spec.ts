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
  await expect.poll(async () => (await snapshot(page))?.activeScenes).toContain('MenuScene');
  const start = await canvasPoint(page, 480, 405);
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
  expect(state?.monsters.map(({ id }) => id)).toEqual(
    expect.arrayContaining(['ratino-do-campo', 'javali-musgoso', 'esporo-errante']),
  );
  expect(state?.monsters.every(({ aiState }) => typeof aiState === 'string')).toBe(true);
  expect(state?.guardian).toMatchObject({ id: 'folium', hp: 60, maxHp: 60, bonded: false });
  expect(['novo', 'indexeddb', 'legado-importado', 'salvo']).toContain(state?.saveStatus);
  expect(errors).toEqual([]);
});

test('seleciona Arqueiro e aplica seus atributos ao combate', async ({ page }) => {
  await page.goto('/modern.html');
  await expect.poll(async () => (await snapshot(page))?.activeScenes).toContain('MenuScene');
  const archerCard = await canvasPoint(page, 480, 292);
  await page.mouse.click(archerCard.x, archerCard.y);
  const start = await canvasPoint(page, 480, 405);
  await page.mouse.click(start.x, start.y);
  await expect.poll(async () => (await snapshot(page))?.combatState?.classId).toBe('arqueiro');
  const state = await snapshot(page);
  expect(state?.selectedPlayerClass).toBe('arqueiro');
  expect(state?.combatState?.maxHp).toBe(135);
  expect(state?.combatState?.mana).toBe(50);
  expect(state?.combatState?.maxMana).toBe(50);
});

test('save v3 restaura classe e posição após recarregar', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-landscape', 'persistência completa é validada uma vez no desktop');
  await page.goto('/modern.html');
  await expect.poll(async () => (await snapshot(page))?.activeScenes).toContain('MenuScene');
  const archerCard = await canvasPoint(page, 480, 292);
  await page.mouse.click(archerCard.x, archerCard.y);
  const start = await canvasPoint(page, 480, 405);
  await page.mouse.click(start.x, start.y);
  await expect.poll(async () => (await snapshot(page))?.combatState?.classId).toBe('arqueiro');
  await page.keyboard.down('d');
  await page.waitForTimeout(500);
  await page.keyboard.up('d');
  const savedPosition = (await snapshot(page))!.playerPosition!;
  await expect
    .poll(async () => (await snapshot(page))?.saveStatus, { timeout: 8_000 })
    .toBe('salvo');

  await page.reload();
  await expect.poll(async () => (await snapshot(page))?.activeScenes).toContain('MenuScene');
  const continueButton = await canvasPoint(page, 480, 405);
  await page.mouse.click(continueButton.x, continueButton.y);
  await expect.poll(async () => (await snapshot(page))?.combatState?.classId).toBe('arqueiro');
  const restored = (await snapshot(page))!.playerPosition!;
  expect(restored.x).toBeCloseTo(savedPosition.x, 0);
  expect(restored.y).toBeCloseTo(savedPosition.y, 0);
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

test('abre e fecha a tela de equipe pelo teclado', async ({ page }) => {
  await startExploration(page);
  await page.keyboard.press('t');
  await expect.poll(async () => (await snapshot(page))?.guardianTeamOpen).toBe(true);
  await page.keyboard.press('t');
  await expect.poll(async () => (await snapshot(page))?.guardianTeamOpen).toBe(false);
});
