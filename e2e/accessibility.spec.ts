import { expect, test } from '@playwright/test';
import { accounts, createReport, openOwnerReport, signIn } from './helpers';

test('the sign-in form works with the keyboard alone', async ({ page }) => {
  await page.goto('/#/login');
  await page.focus('input[type=email]');
  await page.keyboard.type(accounts.owner);
  await page.keyboard.press('Tab');
  await page.keyboard.type('SeismoDemo123!');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Laporan saya').first()).toBeVisible();
});

for (const [role, email] of Object.entries(accounts)) {
  test(`${role}: every focused control shows a focus indicator`, async ({
    page,
  }) => {
    await signIn(page, email);
    const missing: string[] = [];
    let seen = 0;
    for (let index = 0; index < 25; index++) {
      await page.keyboard.press('Tab');
      const state = await page.evaluate(() => {
        const element = document.activeElement;
        if (!element || element === document.body) return null;
        const style = getComputedStyle(element);
        return {
          label: (
            (element as HTMLElement).innerText ||
            element.getAttribute('aria-label') ||
            element.id
          )
            .trim()
            .slice(0, 24),
          visible:
            (style.outlineStyle !== 'none' &&
              parseFloat(style.outlineWidth) > 0) ||
            style.boxShadow !== 'none',
        };
      });
      if (!state) break;
      seen++;
      if (!state.visible) missing.push(state.label);
    }
    expect(seen).toBeGreaterThan(5);
    expect(missing).toEqual([]);
  });
}

test('the history dialog closes with Escape and returns focus', async ({
  page,
}) => {
  await signIn(page, accounts.owner);
  await createReport(page, 'Gedung Fokus');
  await openOwnerReport(page, 'Gedung Fokus');
  await page.getByRole('button', { name: /Riwayat/ }).click();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(page.locator(':focus')).toContainText('Riwayat');
});

test('reduced motion turns off animations and transitions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await signIn(page, accounts.owner);
  const moving = await page.evaluate(() => {
    const found: string[] = [];
    for (const element of document.querySelectorAll('*')) {
      const style = getComputedStyle(element);
      if (
        (parseFloat(style.animationDuration) || 0) > 0.05 ||
        (parseFloat(style.transitionDuration) || 0) > 0.05
      )
        found.push(element.className.toString().slice(0, 30));
    }
    return found;
  });
  expect(moving).toEqual([]);
});
