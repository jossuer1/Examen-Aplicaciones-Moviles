import { expect, test } from '@playwright/test';

test('muestra la identidad al iniciar y libera la navegación sin repetir el splash', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/*.mockapi.io/**', (route) => route.fulfill({ json: [] }));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const splash = page.getByRole('status', { name: 'Iniciando UrbanInspect' });
  await expect(splash).toBeVisible();
  await expect(splash.locator('img')).toHaveJSProperty('naturalWidth', 128);
  await page.screenshot({ path: '.local/splash-mobile.png' });
  await expect(splash).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByRole('heading', { name: 'Resumen de inspecciones' })).toBeVisible();
  await page.locator('ion-tab-button[tab="incidencias"]').click();
  await expect(page).toHaveURL(/tabs\/incidencias/);
  await expect(splash).toHaveCount(0);
  await expect(page.locator('.brand-logo').last()).toHaveJSProperty('naturalWidth', 128);
});
