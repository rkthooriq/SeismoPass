import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ownerStep,
  ownerSteps,
  ownerStatusFilter,
  ownerStatusFilters,
  reviewNoteLabel,
  sortByOwnerTurn,
} from '../src/lib/ownerNextStep.ts';
import {
  resolveWorkflowPage,
  workflowMenus,
} from '../src/lib/workflowNavigation.ts';

const statuses = [
  'Draf',
  'Dikirim',
  'Perlu dilengkapi',
  'Siap disurvei',
  'Ditugaskan',
  'Dalam survei',
  'Ditinjau',
  'Perlu revisi',
  'Selesai',
];

test('owner filters group stages by what the owner has to do', () => {
  const groups = Object.fromEntries(
    ownerStatusFilters.map((filter) => [
      filter,
      statuses.filter((status) => ownerStatusFilter(status) === filter),
    ]),
  );
  assert.deepEqual(groups, {
    'Perlu tindakanmu': ['Draf', 'Perlu dilengkapi'],
    'Sedang diproses': [
      'Dikirim',
      'Siap disurvei',
      'Ditugaskan',
      'Dalam survei',
      'Ditinjau',
      'Perlu revisi',
    ],
    Selesai: ['Selesai'],
  });
});

test('every report status has an owner-facing step', () => {
  for (const status of statuses) {
    const step = ownerStep(status);
    assert.ok(step.title && step.text, status);
    assert.ok(['owner', 'waiting'].includes(step.turn), status);
  }
  assert.deepEqual(Object.keys(ownerSteps).sort(), [...statuses].sort());
});

test('owner acts on drafts, corrections and closed reports only', () => {
  const mine = statuses.filter((status) => ownerStep(status).turn === 'owner');
  assert.deepEqual(mine.sort(), ['Draf', 'Perlu dilengkapi', 'Selesai']);
});

test('owner steps never present a result, risk category or safe claim', () => {
  const text = Object.values(ownerSteps)
    .map((step) => `${step.title} ${step.text}`)
    .join(' ')
    .toLowerCase();
  assert.ok(
    !/(aman\b(?!\.)|skor|kategori risiko|insentif)/.test(
      text.replace('bukan sertifikat aman', ''),
    ),
  );
  assert.match(ownerStep('Selesai').text, /bukan sertifikat aman/);
});

test('reports waiting on the owner are listed first, order otherwise kept', () => {
  const list = [
    { id: 'a', status: 'Dikirim' },
    { id: 'b', status: 'Draf' },
    { id: 'c', status: 'Ditinjau' },
    { id: 'd', status: 'Perlu dilengkapi' },
  ];
  assert.deepEqual(
    sortByOwnerTurn(list).map((item) => item.id),
    ['b', 'd', 'a', 'c'],
  );
  assert.deepEqual(
    list.map((item) => item.id),
    ['a', 'b', 'c', 'd'],
  );
});

test('owner has no overview page and lands on "Laporan saya"', () => {
  assert.deepEqual(
    workflowMenus.owner.map(([id]) => id),
    ['reports', 'help'],
  );
  // "Buat laporan" is an action button, but its page still resolves.
  assert.equal(resolveWorkflowPage('owner', 'dashboard/new'), 'new');
  assert.equal(resolveWorkflowPage('admin', 'dashboard/new'), null);
  assert.equal(resolveWorkflowPage('owner', 'dashboard'), 'reports');
  assert.equal(resolveWorkflowPage('owner', 'dashboard/overview'), null);
  assert.equal(resolveWorkflowPage('admin', 'dashboard'), 'overview');
  assert.equal(resolveWorkflowPage('surveyor', 'dashboard'), 'overview');
});

test('admin notes name who must act, so reporters are not asked to fix visit records', () => {
  assert.match(reviewNoteLabel('Perlu dilengkapi').title, /pelapor/);
  const revision = reviewNoteLabel('Perlu revisi');
  assert.match(revision.title, /pesurvei/);
  assert.match(revision.hint ?? '', /tidak perlu mengubah/);
  assert.equal(ownerStep('Perlu revisi').turn, 'waiting');
});

test('detail page leads with what the stage needs', async () => {
  const { ownerDetailFocus } = await import('../src/lib/ownerNextStep.ts');
  for (const status of ['Draf', 'Perlu dilengkapi', 'Ditinjau', 'Perlu revisi'])
    assert.equal(ownerDetailFocus(status), 'report', status);
  for (const status of [
    'Dikirim',
    'Siap disurvei',
    'Ditugaskan',
    'Dalam survei',
  ])
    assert.equal(ownerDetailFocus(status), 'schedule', status);
  assert.equal(ownerDetailFocus('Selesai'), 'closed');
});

test('owner status chip names the real stage, filter keeps broad groups', async () => {
  const { ownerStageLabel, ownerStatusFilter } = await import(
    '../src/lib/ownerNextStep.ts'
  );
  assert.equal(ownerStageLabel('Ditugaskan'), 'Pesurvei ditugaskan');
  assert.equal(ownerStatusFilter('Ditugaskan'), 'Sedang diproses');
  for (const status of statuses) assert.ok(ownerStageLabel(status));
});
