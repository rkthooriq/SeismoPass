import { expect, test } from '@playwright/test';
import { accounts, hasHorizontalScroll, signIn } from './helpers';

const publicPages = ['/#/', '/#/login', '/#/register'];
const workspacePages: Record<keyof typeof accounts, string[]> = {
  owner: ['', 'new', 'help'],
  admin: ['', 'incoming', 'assignments', 'surveyors', 'help'],
  surveyor: ['', 'tasks', 'history', 'help'],
};

// 320 px is the narrowest phone; 640 px matches a 1280 px screen at 200% zoom.
for (const width of [320, 360, 390, 640, 768, 1440]) {
  test(`no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const overflowing: string[] = [];
    for (const path of publicPages) {
      await page.goto(path);
      if (await hasHorizontalScroll(page)) overflowing.push(path);
    }
    for (const role of Object.keys(accounts) as (keyof typeof accounts)[]) {
      await signIn(page, accounts[role]);
      for (const name of workspacePages[role]) {
        await page.goto(`/#/dashboard${name ? `/${name}` : ''}`);
        await expect(
          page.getByRole('button', { name: 'Keluar' }),
        ).toBeVisible();
        if (await hasHorizontalScroll(page))
          overflowing.push(`${role}/${name || 'overview'}`);
      }
      await page.getByRole('button', { name: 'Keluar' }).click();
    }
    expect(overflowing).toEqual([]);
  });
}

test('the usage guide is reachable from each role menu', async ({ page }) => {
  for (const email of Object.values(accounts)) {
    await signIn(page, email);
    await page.getByRole('link', { name: /Panduan/ }).click();
    await expect(page).toHaveURL(/#\/dashboard\/help/);
    await expect(
      page.getByRole('heading', { name: 'Panduan penggunaan' }),
    ).toBeVisible();
    await expect(
      page
        .getByText(/bukan sertifikat aman/i)
        .locator('visible=true')
        .first(),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Keluar' }).click();
  }
});
