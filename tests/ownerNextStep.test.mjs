import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ownerStep,
  ownerSteps,
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
    ['reports', 'new'],
  );
  assert.equal(resolveWorkflowPage('owner', 'dashboard'), 'reports');
  assert.equal(resolveWorkflowPage('owner', 'dashboard/overview'), null);
  assert.equal(resolveWorkflowPage('admin', 'dashboard'), 'overview');
  assert.equal(resolveWorkflowPage('surveyor', 'dashboard'), 'overview');
});
