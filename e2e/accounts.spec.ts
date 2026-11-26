import { expect, test } from '@playwright/test';
import {
  accounts,
  approveAndAssign,
  createReport,
  openAdminReport,
  signIn,
  signOut,
  switchTo,
} from './helpers';

const reporter = {
  email: 'budi.uji@example.com',
  password: 'KataSandiUji123!',
};
const newPassword = 'SandiBaruSari#2026';

async function createSurveyor(page: import('@playwright/test').Page) {
  await page.goto('/#/dashboard/surveyors');
  await page.getByRole('button', { name: /Tambah akun/ }).click();
  await page.fill('input[name=name]', 'Sari Pesurvei');
  await page.fill('input[name=email]', 'sari.pesurvei@example.com');
  await page.fill('input[name=organization]', 'Uji Organisasi');
  await page.fill('textarea[name=qualification]', 'Pelatihan RVS');
  await page.getByRole('button', { name: 'Buat akun pesurvei' }).click();
  const temporary = (await page.locator('code').first().innerText()).trim();
  await page.getByRole('button', { name: 'Sudah saya catat, tutup' }).click();
  return temporary;
}

async function register(
  page: import('@playwright/test').Page,
  email: string,
  confirm: string,
) {
  await page.goto('/#/register');
  await page.fill('#account-name', 'Budi Uji');
  await page.fill('#account-email', email);
  await page.fill('#account-password', reporter.password);
  await page.fill('#account-confirmPassword', confirm);
  await page.locator('button[type=submit]', { hasText: 'Daftar' }).click();
}

test('reporter registration: mismatch, email verification, duplicate', async ({
  page,
}) => {
  await register(page, reporter.email, 'Beda12345678!');
  await expect(page).toHaveURL(/register/);
  await expect(page.getByText(/sama|cocok|konfirmasi/i).first()).toBeVisible();

  await page.fill('#account-confirmPassword', reporter.password);
  await page.locator('button[type=submit]', { hasText: 'Daftar' }).click();
  await expect(
    page.getByText('Menunggu verifikasi email').first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Verifikasi email' }).click();
  await expect(page.getByText('Laporan saya').first()).toBeVisible();
  await signOut(page);

  await register(page, reporter.email, reporter.password);
  await expect(page).toHaveURL(/register/);
  await expect(
    page.getByText(/sudah|terdaftar|dipakai/i).first(),
  ).toBeVisible();
});

test('admin-created surveyor must change the temporary password', async ({
  page,
}) => {
  await signIn(page, accounts.admin);
  const temporary = await createSurveyor(page);
  expect(temporary.length).toBeGreaterThanOrEqual(12);
  await expect(page.getByText(temporary)).toHaveCount(0);

  await switchTo(page, 'sari.pesurvei@example.com', temporary);
  await expect(page.getByText(/kata sandi baru/i).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Penugasan saya' })).toHaveCount(
    0,
  );

  await page.fill('input[name=current]', temporary);
  await page.fill('input[name=next]', temporary);
  await page.fill('input[name=confirm]', temporary);
  await page.getByRole('button', { name: 'Simpan kata sandi baru' }).click();
  await expect(page.getByRole('link', { name: 'Penugasan saya' })).toHaveCount(
    0,
  );

  await page.fill('input[name=current]', temporary);
  await page.fill('input[name=next]', newPassword);
  await page.fill('input[name=confirm]', newPassword);
  await page.getByRole('button', { name: 'Simpan kata sandi baru' }).click();
  await expect(
    page.getByRole('link', { name: 'Penugasan saya' }),
  ).toBeVisible();
});

test('assignments are private to the surveyor; deactivation returns the task', async ({
  page,
}) => {
  await signIn(page, accounts.owner);
  await createReport(page, 'Gedung Sari');

  await switchTo(page, accounts.admin);
  const temporary = await createSurveyor(page);
  await switchTo(page, 'sari.pesurvei@example.com', temporary);
  await page.fill('input[name=current]', temporary);
  await page.fill('input[name=next]', newPassword);
  await page.fill('input[name=confirm]', newPassword);
  await page.getByRole('button', { name: 'Simpan kata sandi baru' }).click();

  await switchTo(page, accounts.admin);
  await approveAndAssign(page, 'Gedung Sari', { surveyor: /sari/ });

  await test.step('another surveyor sees nothing and cannot open admin pages', async () => {
    await switchTo(page, accounts.surveyor);
    await page.goto('/#/dashboard/tasks');
    await expect(
      page.locator('a[id^=report-link-]', { hasText: 'Gedung Sari' }),
    ).toHaveCount(0);
    await page.goto('/#/dashboard/incoming');
    await expect(page.getByText(/tidak tersedia/i).first()).toBeVisible();
  });

  await test.step('deactivation needs a note, then returns the task to the admin', async () => {
    await switchTo(page, accounts.admin);
    await page.goto('/#/dashboard/surveyors');
    await page
      .locator('tr', { hasText: 'sari.pesurvei' })
      .getByRole('button', { name: 'Kelola' })
      .click();
    await page.getByRole('button', { name: 'Nonaktifkan akses' }).click();
    await expect(page.locator('textarea[name=note]')).toHaveJSProperty(
      'validity.valueMissing',
      true,
    );
    await page.fill('textarea[name=note]', 'Uji penonaktifan.');
    await page.getByRole('button', { name: 'Nonaktifkan akses' }).click();
    await page.keyboard.press('Escape');
    await expect(
      page.locator('tr', { hasText: 'sari.pesurvei' }),
    ).toContainText('Dinonaktifkan');
    await openAdminReport(page, 'assignments', 'Gedung Sari');
    await page.getByRole('button', { name: /Riwayat/ }).click();
    await expect(
      page.locator('dialog[open], [role=dialog]').first(),
    ).toContainText(/nonaktif|dikembalikan|penugasan/i);
    await page.keyboard.press('Escape');
  });

  await test.step('the deactivated account only sees its status', async () => {
    await switchTo(page, 'sari.pesurvei@example.com', newPassword);
    await expect(page.getByText('Dinonaktifkan').first()).toBeVisible();
    await expect(page.getByText(/Catatan admin/)).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Penugasan saya' }),
    ).toHaveCount(0);
  });
});
