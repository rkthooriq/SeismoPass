import { expect, test } from '@playwright/test';
import {
  accounts,
  createReport,
  hasHorizontalScroll,
  openOwnerReport,
  password,
  signIn,
  signOut,
} from './helpers';

test('workspace URLs need a signed-in account of the right role', async ({
  page,
}) => {
  await page.goto('/#/dashboard/reports');
  await expect(page.locator('input[type=password]')).toBeVisible();

  await signIn(page, accounts.owner);
  await page.goto('/#/dashboard/incoming');
  await expect(page.getByText(/tidak tersedia/i).first()).toBeVisible();
});

test('session survives a refresh and never stores the password', async ({
  page,
}) => {
  await signIn(page, accounts.owner);
  await page.reload();
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByRole('button', { name: 'Keluar' })).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.stringify({ ...sessionStorage }),
  );
  expect(stored).not.toContain(password);

  await signOut(page);
  await page.goto('/#/dashboard/reports');
  await expect(page.locator('input[type=password]')).toBeVisible();
});

test('lists paginate 5 per page and details have their own URL', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await signIn(page, accounts.owner);
  for (let index = 1; index <= 7; index++)
    await createReport(page, `Bangunan Uji ${index}`);

  await page.goto('/#/dashboard/reports');
  const cards = page.locator('article button.owner-open-button');
  await expect(cards).toHaveCount(5);
  const nav = page.locator('nav.pagination');
  await page.getByRole('button', { name: 'Halaman berikutnya' }).click();
  await expect(nav).toContainText('Menampilkan 6–7 dari 7');
  await nav.locator('select').selectOption('10');
  await expect(cards).toHaveCount(7);
  await nav.locator('select').selectOption('5');
  await page.getByRole('button', { name: 'Halaman berikutnya' }).click();
  await page.locator('input[type=search]').fill('Uji 1');
  await expect(cards).toHaveCount(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('input[type=search]').fill('');
  expect(await hasHorizontalScroll(page)).toBe(false);
  await page.setViewportSize({ width: 1280, height: 900 });

  await openOwnerReport(page, 'Bangunan Uji 7');
  const detailUrl = page.url();
  expect(detailUrl).toMatch(/#\/dashboard\/reports\/LAP-/);
  await page.reload();
  await expect(page).toHaveURL(detailUrl);
  await expect(
    page.getByText('Bangunan Uji 7').locator('visible=true').first(),
  ).toBeVisible();
  await page.goBack();
  await expect(cards.first()).toBeVisible();
});
