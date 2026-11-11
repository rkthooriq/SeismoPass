import test from 'node:test';
import assert from 'node:assert/strict';
import {
  actorRoles,
  canOpenPage,
  canManageBuildings,
} from '../src/lib/actorAccess.ts';
import {
  advanceReport,
  assignReport,
  demoAccounts,
  sampleReports,
  visibleReports,
} from '../src/lib/reportDemo.ts';

const [owner, admin, surveyor] = demoAccounts;
const draft = { ...sampleReports[0], status: 'Draf' };

test('only three account roles exist and legacy building pages remain owner-only', () => {
  assert.deepEqual(
    actorRoles.map((role) => role.id),
    ['owner', 'admin', 'surveyor'],
  );
  for (const account of demoAccounts) {
    assert.equal(canOpenPage(account.role, 'dashboard'), true);
    assert.equal(
      canOpenPage(account.role, 'profile', true),
      account.role === 'owner',
    );
    assert.equal(canManageBuildings(account.role), account.role === 'owner');
  }
  assert.equal(canOpenPage('expert', 'dashboard'), false);
});

test('a report can go through admin assignment, requested revision, and administrative closure', () => {
  const submitted = advanceReport(draft, owner, 'submit');
  const queued = advanceReport(submitted, admin, 'verify');
  const assignment = assignReport(
    queued,
    admin,
    surveyor,
    'Kunjungan contoh dengan supervisi.',
  );
  const assigned = advanceReport(assignment, surveyor, 'start');
  const visited = advanceReport(assigned, surveyor, 'visit', {
    date: '2026-11-11',
    note: 'Kunjungan tercatat.',
  });
  const revision = advanceReport(visited, admin, 'revise', {
    note: 'Lengkapi catatan kunjungan.',
  });
  const revised = advanceReport(revision, surveyor, 'visit', {
    date: '2026-11-11',
    note: 'Catatan dilengkapi.',
  });
  const closed = advanceReport(revised, admin, 'close', {
    note: 'Catatan diterima.',
  });
  assert.deepEqual(
    [submitted, queued, assigned, visited, revision, revised, closed].map(
      (report) => report.status,
    ),
    [
      'Dikirim',
      'Siap disurvei',
      'Dalam survei',
      'Ditinjau',
      'Perlu revisi',
      'Ditinjau',
      'Selesai',
    ],
  );
  assert.equal(advanceReport(closed, surveyor, 'visit'), null);
});

test('report visibility and updates respect ownership, assignment and status', () => {
  const other = { ...owner, id: 'another-reporter' };
  assert.deepEqual(visibleReports([draft], other), []);
  assert.deepEqual(visibleReports([draft], surveyor), []);
  assert.deepEqual(visibleReports([draft], admin), []);
  assert.equal(advanceReport(draft, other, 'submit'), null);
  const sent = advanceReport(draft, owner, 'submit');
  assert.equal(advanceReport(sent, surveyor, 'claim'), null);
  assert.equal(advanceReport(sent, admin, 'return'), null);
  const returned = advanceReport(sent, admin, 'return', {
    note: 'Lengkapi lokasi.',
  });
  assert.equal(returned.status, 'Perlu dilengkapi');
  assert.equal(advanceReport(returned, owner, 'submit').status, 'Dikirim');
  const queued = advanceReport(sent, admin, 'verify');
  assert.deepEqual(visibleReports([queued], surveyor), []);
  assert.equal(advanceReport(queued, admin, 'claim'), null);
  const assignment = assignReport(
    queued,
    admin,
    surveyor,
    'Kunjungan contoh dengan supervisi.',
  );
  const assigned = advanceReport(assignment, surveyor, 'start');
  const anotherSurveyor = { ...surveyor, id: 'other-surveyor' };
  assert.equal(advanceReport(assigned, anotherSurveyor, 'claim'), null);
  assert.deepEqual(visibleReports([assigned], anotherSurveyor), []);
  assert.deepEqual(visibleReports([assigned], surveyor), [assigned]);
  assert.equal(
    advanceReport(assigned, { ...surveyor, id: 'other-surveyor' }, 'visit', {
      date: '2026-11-11',
      note: 'Catatan',
    }),
    null,
  );
  assert.equal(
    advanceReport(assigned, surveyor, 'visit', {
      date: '2026-11-11',
      note: ' ',
    }),
    null,
  );
});
