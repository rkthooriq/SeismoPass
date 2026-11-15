import assert from 'node:assert/strict';
import test from 'node:test';
import {
  pageStatuses,
  reportsOnPage,
  statusFilterOptions,
} from '../src/lib/workflowNavigation.ts';

const reports = [
  { id: 1, status: 'Dikirim' },
  { id: 2, status: 'Siap disurvei' },
  { id: 3, status: 'Ditugaskan' },
  { id: 4, status: 'Perlu revisi' },
  { id: 5, status: 'Selesai' },
  { id: 6, status: 'Draf' },
];

test('single-status pages show no status filter', () => {
  for (const page of ['incoming', 'review']) {
    assert.equal(pageStatuses[page].length, 1);
    assert.deepEqual(
      statusFilterOptions(page, reportsOnPage(page, reports)),
      [],
    );
  }
});

test('filters list only statuses that can appear on the page and have reports', () => {
  const page = 'assignments';
  const options = statusFilterOptions(page, reportsOnPage(page, reports));
  assert.deepEqual(options, [
    { status: 'Siap disurvei', count: 1 },
    { status: 'Ditugaskan', count: 1 },
  ]);
  const all = statusFilterOptions('reports', reportsOnPage('reports', reports));
  assert.ok(!all.some((option) => option.status === 'Draf'));
  assert.ok(!all.some((option) => option.count === 0));
});

test('surveyor pages never offer statuses a surveyor cannot see', () => {
  const hidden = ['Draf', 'Dikirim', 'Perlu dilengkapi', 'Siap disurvei'];
  for (const page of ['tasks', 'history'])
    assert.ok(pageStatuses[page].every((status) => !hidden.includes(status)));
});

test('a filter with one remaining choice is hidden', () => {
  const page = 'tasks';
  assert.deepEqual(
    statusFilterOptions(page, [
      { status: 'Ditugaskan' },
      { status: 'Ditugaskan' },
    ]),
    [],
  );
});

test('pages without a status scope keep every report', () => {
  assert.equal(reportsOnPage('overview', reports).length, reports.length);
});

test('owner filter nests detailed stages under their group, only those with reports', async () => {
  const { ownerFilterGroups } = await import('../src/lib/ownerNextStep.ts');
  const mixed = [
    { status: 'Draf' },
    { status: 'Dikirim' },
    { status: 'Ditugaskan' },
    { status: 'Ditugaskan' },
  ];
  assert.deepEqual(ownerFilterGroups(mixed), [
    {
      group: 'Perlu tindakanmu',
      count: 1,
      stages: [{ status: 'Draf', label: 'Draf', count: 1 }],
    },
    {
      group: 'Sedang diproses',
      count: 3,
      stages: [
        { status: 'Dikirim', label: 'Diperiksa admin', count: 1 },
        { status: 'Ditugaskan', label: 'Pesurvei ditugaskan', count: 2 },
      ],
    },
  ]);
  assert.deepEqual(
    ownerFilterGroups([{ status: 'Dikirim' }, { status: 'Dikirim' }]),
    [],
  );
});

test('account directory offers only roles and statuses that exist', async () => {
  const { directoryFilterOptions } = await import(
    '../src/lib/accountDirectory.ts'
  );
  const base = { email: 'x@example.com', name: 'X', emailVerified: true };
  const accounts = [
    { ...base, id: 'a', role: 'admin', status: 'active' },
    { ...base, id: 's1', role: 'surveyor', status: 'active' },
    { ...base, id: 's2', role: 'surveyor', status: 'must-change-password' },
    { ...base, id: 'o', role: 'owner', status: 'pending-email' },
  ];
  const { roles, statuses } = directoryFilterOptions(accounts);
  assert.deepEqual(roles, [
    { value: 'surveyor', count: 2 },
    { value: 'admin', count: 1 },
  ]);
  assert.deepEqual(statuses.map((option) => option.value).sort(), [
    'active',
    'must-change-password',
  ]);
  const onlyActive = directoryFilterOptions(accounts.slice(0, 2));
  assert.deepEqual(onlyActive.statuses, []);
});
