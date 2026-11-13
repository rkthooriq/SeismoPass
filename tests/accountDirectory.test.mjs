import assert from 'node:assert/strict';
import test from 'node:test';
import { accountDirectory } from '../src/lib/accountDirectory.ts';
import { initialDirectory } from '../src/lib/demoDirectory.ts';

const defaults = { query: '', role: 'all', status: 'all' };
const accounts = [
  ...initialDirectory(),
  {
    ...initialDirectory()[2],
    id: 'survey-new',
    name: 'Pesurvei Baru',
    email: 'baru@example.com',
    organization: 'Tim Cisarua',
    status: 'must-change-password',
  },
  {
    ...initialDirectory()[2],
    id: 'survey-suspended',
    name: 'Pesurvei Nonaktif',
    email: 'nonaktif@example.com',
    organization: 'Tim Lembang',
    status: 'suspended',
  },
  {
    ...initialDirectory()[2],
    id: 'survey-pending',
    name: 'Pesurvei Pengajuan',
    email: 'pengajuan@example.com',
    organization: 'Tim Cisarua',
    status: 'pending',
  },
];

test('directory lists admins and all surveyor statuses, excluding reporter accounts', () => {
  const before = structuredClone(accounts);
  const result = accountDirectory(accounts, defaults);
  assert.equal(result.length, 5);
  assert.deepEqual(
    result.map((account) => account.role),
    ['admin', 'surveyor', 'surveyor', 'surveyor', 'surveyor'],
  );
  assert.ok(
    result.some((account) => account.status === 'must-change-password'),
  );
  assert.ok(result.some((account) => account.status === 'suspended'));
  assert.deepEqual(accounts, before);
});

test('directory combines case-insensitive name, email or organization search with role and status filters', () => {
  assert.deepEqual(
    accountDirectory(accounts, {
      ...defaults,
      query: '  ADMIN@EXAMPLE.COM  ',
    }).map((account) => account.id),
    ['admin-demo'],
  );
  assert.deepEqual(
    accountDirectory(accounts, { ...defaults, query: 'pesurvei baru' }).map(
      (account) => account.id,
    ),
    ['survey-new'],
  );
  assert.deepEqual(
    accountDirectory(accounts, {
      query: 'CISARUA',
      role: 'surveyor',
      status: 'pending',
    }).map((account) => account.id),
    ['survey-pending'],
  );
  assert.deepEqual(
    accountDirectory(accounts, { ...defaults, role: 'admin' }).map(
      (account) => account.id,
    ),
    ['admin-demo'],
  );
  assert.deepEqual(
    accountDirectory(accounts, {
      ...defaults,
      role: 'admin',
      status: 'suspended',
    }),
    [],
  );
  assert.deepEqual(
    accountDirectory(accounts, { ...defaults, query: 'tidak ditemukan' }),
    [],
  );
});

test('legacy applications view remains limited to surveyors awaiting review', () => {
  const result = accountDirectory(accounts, defaults, 'applications');
  assert.deepEqual(
    result.map((account) => account.id),
    ['survey-pending'],
  );
});
