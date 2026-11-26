import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Built-in test accounts share one password (see README).
export const password = 'SeismoDemo123!';
export const accounts = {
  owner: 'pelapor@example.com',
  admin: 'admin@example.com',
  surveyor: 'pesurvei@example.com',
} as const;

export function dateFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export async function signIn(page: Page, email: string, secret = password) {
  await page.goto('/#/login');
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', secret);
  await page.click('button[type=submit]');
  await expect(page.getByRole('button', { name: 'Keluar' })).toBeVisible();
}

export async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Keluar' }).click();
  await expect(page.locator('input[type=password]')).toBeVisible();
}

export async function switchTo(page: Page, email: string, secret?: string) {
  await signOut(page);
  await signIn(page, email, secret);
}

// Fills the three-step "Buat laporan" form. Navigates with the in-app link so
// the page keeps its in-memory state (a reload drops passwords of accounts
// created during the test).
export async function createReport(
  page: Page,
  title: string,
  options: { send?: boolean; visit?: boolean } = {},
) {
  const { send = true, visit = true } = options;
  await page.goto('/#/dashboard/new');
  const fields = {
    title,
    location: 'Lembang',
    function: 'Rumah tinggal',
    year: '2005',
    floors: '2',
    material: 'Beton',
    structure: 'Rangka',
  };
  for (const [key, value] of Object.entries(fields))
    await page.fill(`#report-${key}`, value);
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await page.fill('#report-address', 'Jl. Contoh 1');
  await page.fill('#report-landmark', 'Dekat pasar');
  await page.fill('#report-contactPhone', '081234567890');
  if (visit) {
    await page.fill('#report-visitDate', dateFromToday(3));
    await page.selectOption('#report-visitSlot', { index: 1 });
  }
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  if (!visit) return;
  await page.fill('#report-description', 'Retak rambut pada dinding.');
  if (!send) return;
  await page.check('#report-demoConsent');
  await page.check('#report-understandsRvs');
  await page.getByRole('button', { name: 'Simpan dan kirim laporan' }).click();
  await expect(
    page.getByText('Laporan dikirim untuk diperiksa admin.'),
  ).toBeVisible();
}

export async function openAdminReport(page: Page, list: string, title: string) {
  await page.goto(`/#/dashboard/${list}`);
  await page.locator('a[id^=report-link-]', { hasText: title }).first().click();
}

export async function openOwnerReport(page: Page, title: string) {
  await page.goto('/#/dashboard/reports');
  const search = page.locator('input[type=search]');
  if (await search.count()) await search.first().fill(title);
  await page
    .locator('article', { has: page.locator('h3', { hasText: title }) })
    .locator('button.owner-open-button')
    .first()
    .click();
}

export async function openTask(page: Page, list: string, title: string) {
  await openAdminReport(page, list, title);
}

// Admin: mark the report complete and assign the default surveyor. With
// `changeTo`, replace the reporter's visit time (the schedule becomes a
// proposal the reporter must confirm).
export async function approveAndAssign(
  page: Page,
  title: string,
  options: {
    surveyor?: RegExp;
    changeTo?: { days: number; slot: number };
  } = {},
) {
  await openAdminReport(page, 'incoming', title);
  await page.locator('button[id$=tab-action]').click();
  await page.check('input[name=completeness][value=verify]');
  const select = page.locator('select[name=surveyorId]');
  if (options.surveyor) {
    const index = await select
      .locator('option')
      .evaluateAll(
        (items, source) =>
          items.findIndex((item) =>
            new RegExp(source, 'i').test(item.textContent ?? ''),
          ),
        options.surveyor.source,
      );
    expect(index).toBeGreaterThan(0);
    await select.selectOption({ index });
  } else await select.selectOption({ index: 1 });
  await page.fill('textarea[name=assignmentNote]', 'Periksa kondisi umum.');
  if (options.changeTo) {
    await page.getByRole('button', { name: 'Ganti jadwal' }).click();
    await page.fill(
      'input[name=appointmentDate]',
      dateFromToday(options.changeTo.days),
    );
    await page.selectOption('select[name=appointmentSlot]', {
      index: options.changeTo.slot,
    });
  }
  await page.getByRole('button', { name: 'Setujui dan tugaskan' }).click();
  await expect(page.getByText('Ditugaskan').first()).toBeVisible();
}

export async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
}
