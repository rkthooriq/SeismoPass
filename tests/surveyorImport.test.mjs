import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readSheet } from 'read-excel-file/node';
import Papa from 'papaparse';
import {
  importColumns,
  parseSurveyorCsv,
  previewSurveyorImport,
  createSurveyorBatch,
  credentialsCsv,
} from '../src/lib/surveyorImport.ts';
import { demoAccounts } from '../src/lib/reportDemo.ts';
import { serializeDemoSession } from '../src/lib/demoDirectory.ts';

const admin = demoAccounts.find((account) => account.role === 'admin');
const row = [
  'Pesurvei Satu (contoh)',
  'baru@example.com',
  'Instansi Contoh',
  'Pelatihan contoh',
];
const input = {
  name: row[0],
  email: row[1],
  organization: row[2],
  qualification: row[3],
};
const matrix = (...rows) => [importColumns, ...rows];

test('CSV supports BOM, semicolons, quoted multiline fields and escaped quotes', () => {
  const csv =
    '\uFEFFnama;email;organisasi;catatan_kompetensi\r\n"Pesurvei, Contoh";baru@example.com;"Instansi ""Contoh""";"Pelatihan\ncontoh"\r\n';
  const preview = previewSurveyorImport(parseSurveyorCsv(csv), demoAccounts);
  assert.deepEqual(preview.errors, []);
  assert.equal(preview.rows.length, 1);
  assert.deepEqual(preview.rows[0].errors, []);
  assert.equal(preview.rows[0].input.organization, 'Instansi "Contoh"');
  assert.equal(preview.rows[0].input.qualification, 'Pelatihan\ncontoh');
  assert.throws(
    () => parseSurveyorCsv('nama,email\n"unterminated,email'),
    /CSV tidak terbaca/,
  );
});

test('downloadable Excel and CSV templates parse identically with valid example accounts', async () => {
  const xlsx = await readSheet('public/templates/template-pesurvei.xlsx');
  const csv = parseSurveyorCsv(
    await readFile('public/templates/template-pesurvei.csv', 'utf8'),
  );
  const first = previewSurveyorImport(xlsx, demoAccounts);
  assert.deepEqual(first, previewSurveyorImport(csv, demoAccounts));
  assert.equal(first.rows.length, 2);
  assert.deepEqual(first.errors, []);
  assert.ok(first.rows.every((item) => item.errors.length === 0));
});

test('headers are matched by name; unknown, duplicate and missing columns are rejected', () => {
  assert.equal(
    previewSurveyorImport(
      [
        ['email', 'nama', 'catatan_kompetensi', 'organisasi'],
        [row[1], row[0], row[3], row[2]],
      ],
      [],
    ).rows[0].input.name,
    row[0],
  );
  for (const headers of [
    [],
    ['nama', 'email'],
    [...importColumns, 'role'],
    ['nama', 'nama', 'organisasi', 'catatan_kompetensi'],
  ])
    assert.ok(previewSurveyorImport([headers, row], []).errors.length);
});

test('preview reports original row numbers, every duplicate and field errors without mutations', () => {
  const accounts = structuredClone(demoAccounts);
  const preview = previewSurveyorImport(
    matrix(
      [],
      row,
      [row[0], ' BARU@EXAMPLE.COM ', row[2], row[3]],
      ['', admin.email.toUpperCase(), '', ''],
      ['=1+1', 'not-email', 'x'.repeat(201), 'q'.repeat(1001)],
    ),
    accounts,
  );
  assert.deepEqual(
    preview.rows.map((item) => item.row),
    [3, 4, 5, 6],
  );
  assert.ok(preview.rows[0].errors.some((error) => /berulang/.test(error)));
  assert.ok(preview.rows[1].errors.some((error) => /berulang/.test(error)));
  assert.ok(preview.rows[2].errors.some((error) => /terdaftar/.test(error)));
  assert.equal(preview.rows[3].errors.length, 4);
  assert.deepEqual(accounts, demoAccounts);
});

test('empty files, excessive rows, non-text cells and capacity are rejected', () => {
  assert.ok(previewSurveyorImport(matrix(), []).errors.length);
  assert.ok(
    previewSurveyorImport(matrix(...Array(101).fill(row)), []).errors.length,
  );
  assert.ok(
    previewSurveyorImport(matrix(row), Array(500).fill(admin)).errors.length,
  );
  assert.ok(
    previewSurveyorImport(matrix([123, ...row.slice(1)]), []).rows[0].errors
      .length,
  );
});

test('batch creation is atomic, admin-only, preserves roles and never persists passwords', () => {
  let calls = 0;
  const credential = () => ({
    id: `import-${++calls}`,
    password: `Temporary-test-${calls}`,
  });
  for (const actor of [demoAccounts[0], { ...admin, status: 'suspended' }])
    assert.ok(
      'error' in createSurveyorBatch(actor, [input], demoAccounts, credential),
    );
  assert.equal(calls, 0);
  assert.ok(
    'error' in
      createSurveyorBatch(admin, [input, input], demoAccounts, credential),
  );
  assert.equal(calls, 0);
  const result = createSurveyorBatch(
    admin,
    [
      input,
      {
        ...input,
        email: 'dua@example.com',
        role: 'admin',
        password: 'injected',
      },
    ],
    demoAccounts,
    credential,
  );
  assert.equal(result.accounts.length, demoAccounts.length + 2);
  assert.equal(result.issued.length, 2);
  assert.notEqual(result.issued[0].password, result.issued[1].password);
  assert.ok(
    result.accounts
      .slice(-2)
      .every(
        (account) =>
          account.role === 'surveyor' &&
          account.status === 'must-change-password' &&
          account.managed,
      ),
  );
  const serialized = serializeDemoSession(result.accounts, []);
  assert.ok(!serialized.includes('Temporary-test-'));
  assert.ok(!serialized.includes('injected'));
  // A newly registered duplicate must also be checked at confirmation time.
  assert.ok(
    'error' in createSurveyorBatch(admin, [input], result.accounts, credential),
  );
  assert.equal(
    demoAccounts.some((account) => account.id.startsWith('import-')),
    false,
  );
});

test('batch returns no partially created accounts when a credential fails', () => {
  let calls = 0;
  const result = createSurveyorBatch(
    admin,
    [input, { ...input, email: 'dua@example.com' }],
    demoAccounts,
    () => ({
      id: `partial-${++calls}`,
      password: calls === 1 ? 'Temporary-long-password' : 'short',
    }),
  );
  assert.ok('error' in result);
  assert.equal(result.accounts, undefined);
  assert.equal(
    demoAccounts.some((account) => account.id.startsWith('partial-')),
    false,
  );
});

test('credential CSV escapes formulas and preserves passwords and quoting', () => {
  const exported = credentialsCsv([
    { name: '=1+1', email: 'baru@example.com', password: 'abc,"def123456' },
  ]);
  const parsed = Papa.parse(exported).data;
  assert.equal(parsed[1][0], "'=1+1");
  assert.equal(parsed[1][2], 'abc,"def123456');
});
