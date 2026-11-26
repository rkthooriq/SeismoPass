import { expect, test } from '@playwright/test';
import {
  accounts,
  approveAndAssign,
  createReport,
  dateFromToday,
  openAdminReport,
  openOwnerReport,
  signIn,
  switchTo,
} from './helpers';

test('sending without a visit time is refused at the access step', async ({
  page,
}) => {
  await signIn(page, accounts.owner);
  await page.goto('/#/dashboard/new');
  for (const [key, value] of Object.entries({
    title: 'Rumah Tanpa Waktu',
    location: 'Lembang',
    function: 'Rumah',
    year: '2000',
    floors: '1',
    material: 'Beton',
    structure: 'Rangka',
  }))
    await page.fill(`#report-${key}`, value);
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await page.fill('#report-address', 'Jl. A');
  await page.fill('#report-contactPhone', '081234567890');
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await expect(page.locator('#report-error-visitDate')).toHaveText(
    'Pilih tanggal kunjungan yang kamu inginkan.',
  );
  await expect(page.locator('#report-demoConsent')).toBeHidden();
});

test('report goes from reporter to admin to surveyor and into history', async ({
  page,
}) => {
  await signIn(page, accounts.owner);
  await createReport(page, 'Rumah Alur Penuh');

  await switchTo(page, accounts.admin);
  await approveAndAssign(page, 'Rumah Alur Penuh');
  await expect(
    page.getByText(/disepakati|dikonfirmasi/i).first(),
  ).toBeVisible();

  await switchTo(page, accounts.surveyor);
  await openAdminReport(page, 'tasks', 'Rumah Alur Penuh');
  await page.getByRole('button', { name: 'Mulai survei' }).click();
  await expect(page).toHaveURL(/\/survey$/);

  const note = 'Retak diagonal di dinding timur.';
  await page.fill('#survey-date', dateFromToday(0));
  await page.fill('#survey-note', note);
  await page.reload();
  await expect(page.locator('#survey-note')).toHaveValue(note);

  await page.fill('#survey-note', '');
  await page.getByRole('button', { name: 'Lanjut ke input RVS' }).click();
  await expect(page.getByText(/catatan kunjungan/i).first()).toBeVisible();

  await page.fill('#survey-note', note);
  await page.getByRole('button', { name: 'Lanjut ke input RVS' }).click();
  await page.getByRole('button', { name: 'Lanjut periksa' }).click();
  await page.locator('form.report-form button[type=submit]').last().click();
  await expect(page).toHaveURL(/#\/dashboard\/history/);
});

test('changed schedule needs the reporter; another time can be requested', async ({
  page,
}) => {
  await signIn(page, accounts.owner);
  await createReport(page, 'Rumah Jadwal Lain');

  await switchTo(page, accounts.admin);
  await approveAndAssign(page, 'Rumah Jadwal Lain', {
    changeTo: { days: 6, slot: 3 },
  });

  await test.step('surveyor cannot start before the schedule is confirmed', async () => {
    await switchTo(page, accounts.surveyor);
    await openAdminReport(page, 'tasks', 'Rumah Jadwal Lain');
    await expect(page.getByText(/belum bisa dimulai/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Mulai survei' }),
    ).toHaveCount(0);
  });

  await test.step('reporter asks for another time', async () => {
    await switchTo(page, accounts.owner);
    await openOwnerReport(page, 'Rumah Jadwal Lain');
    await expect(
      page.getByText('Konfirmasi jadwal kunjungan').first(),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Minta jadwal lain' }).click();
    await page.fill('input[type=date]:visible', dateFromToday(8));
    await page.selectOption('select:visible', { index: 1 });
    await page.getByRole('button', { name: 'Kirim permintaan jadwal' }).click();
    await expect(
      page.getByText('Menunggu jadwal baru dari admin'),
    ).toBeVisible();
  });

  await test.step('admin sees the request and the form is prefilled', async () => {
    await switchTo(page, accounts.admin);
    await page.goto('/#/dashboard');
    await expect(page.getByText(/pelapor meminta jadwal lain/i)).toBeVisible();
    await openAdminReport(page, 'assignments', 'Rumah Jadwal Lain');
    await expect(
      page.locator('h3', { hasText: 'Ubah penugasan' }),
    ).toBeVisible();
    await expect(page.locator('input[name=appointmentDate]')).toHaveValue(
      dateFromToday(8),
    );
  });
});

test('admin can record a phone confirmation so the surveyor can start', async ({
  page,
}) => {
  await signIn(page, accounts.owner);
  await createReport(page, 'Rumah Telepon');

  await switchTo(page, accounts.admin);
  await approveAndAssign(page, 'Rumah Telepon', {
    changeTo: { days: 6, slot: 3 },
  });
  await openAdminReport(page, 'assignments', 'Rumah Telepon');
  await page.getByRole('button', { name: 'Catat konfirmasi pelapor' }).click();
  await page.fill('textarea:visible', 'Pelapor setuju via telepon.');
  await page.getByRole('button', { name: 'Catat konfirmasi' }).last().click();

  await switchTo(page, accounts.surveyor);
  await openAdminReport(page, 'tasks', 'Rumah Telepon');
  await expect(
    page.getByRole('button', { name: 'Mulai survei' }),
  ).toBeVisible();
});

test('assigning without a schedule is refused', async ({ page }) => {
  await signIn(page, accounts.owner);
  await createReport(page, 'Rumah Tanpa Jadwal');

  await switchTo(page, accounts.admin);
  await openAdminReport(page, 'incoming', 'Rumah Tanpa Jadwal');
  await page.locator('button[id$=tab-action]').click();
  await page.check('input[name=completeness][value=verify]');
  await page.selectOption('select[name=surveyorId]', { index: 1 });
  await page.fill('textarea[name=assignmentNote]', 'x');
  await page.getByRole('button', { name: 'Ganti jadwal' }).click();
  await page.fill('input[name=appointmentDate]', '');
  await page.getByRole('button', { name: 'Setujui dan tugaskan' }).click();
  await expect(page.locator('input[name=appointmentDate]')).toHaveJSProperty(
    'validity.valueMissing',
    true,
  );
  await expect(
    page.getByRole('button', { name: 'Setujui dan tugaskan' }),
  ).toBeVisible();
});

test('returning a report asks for confirmation and Cancel changes nothing', async ({
  page,
}) => {
  await signIn(page, accounts.owner);
  await createReport(page, 'Rumah Dikembalikan');

  await switchTo(page, accounts.admin);
  await openAdminReport(page, 'incoming', 'Rumah Dikembalikan');
  await page.locator('button[id$=tab-action]').click();
  await page.check('input[name=completeness][value=return]');
  await page.fill('textarea[name=note]', 'Lengkapi foto.');
  await page.getByRole('button', { name: 'Kembalikan ke pelapor' }).click();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await page
    .locator('dialog[open]')
    .getByRole('button', { name: 'Batal' })
    .click();
  await page.goto('/#/dashboard/incoming');
  await expect(
    page.locator('a[id^=report-link-]', { hasText: 'Rumah Dikembalikan' }),
  ).toHaveCount(1);

  await openAdminReport(page, 'incoming', 'Rumah Dikembalikan');
  await page.locator('button[id$=tab-action]').click();
  await page.check('input[name=completeness][value=return]');
  await page.fill('textarea[name=note]', 'Lengkapi foto.');
  await page.getByRole('button', { name: 'Kembalikan ke pelapor' }).click();
  await page.getByRole('button', { name: 'Ya, kembalikan' }).click();

  await switchTo(page, accounts.owner);
  await openOwnerReport(page, 'Rumah Dikembalikan');
  await expect(
    page.getByText('Lengkapi foto.').locator('visible=true').first(),
  ).toBeVisible();
});
