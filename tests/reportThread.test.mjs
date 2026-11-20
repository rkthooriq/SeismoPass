import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceReport,
  assignReport,
  demoAccounts,
  sampleReports,
  visibleReports,
} from '../src/lib/reportDemo.ts';
import { restoreReports } from '../src/lib/reportSession.ts';

const confirmed = (report) => ({
  ...report,
  appointment: {
    date: '2026-11-12',
    slot: 'Pagi (08.00–11.00)',
    response: 'confirmed',
  },
});

const [owner, admin, surveyor] = demoAccounts;
const draft = { ...sampleReports[0], status: 'Draf', activity: [] };

test('every hand-over between the three roles is written to the shared thread', () => {
  const sent = advanceReport(draft, owner, 'submit');
  const returned = advanceReport(sent, admin, 'return', {
    note: 'Lengkapi alamat.',
  });
  const resent = advanceReport(returned, owner, 'submit');
  const approved = advanceReport(resent, admin, 'verify');
  const assigned = assignReport(
    approved,
    admin,
    surveyor,
    'Hubungi pengelola.',
  );
  const started = advanceReport(confirmed(assigned), surveyor, 'start');
  const visited = advanceReport(started, surveyor, 'visit', {
    date: '2026-11-11',
    note: 'Kunjungan tercatat.',
  });
  const revision = advanceReport(visited, admin, 'revise', {
    note: 'Tambahkan patokan.',
  });
  const revised = advanceReport(revision, surveyor, 'visit', {
    date: '2026-11-11',
    note: 'Patokan ditambahkan.',
  });
  const closed = advanceReport(revised, admin, 'close', {
    note: 'Administrasi diterima.',
  });
  assert.deepEqual(
    closed.activity.map((event) => event.role),
    [
      'owner',
      'admin',
      'owner',
      'admin',
      'admin',
      'surveyor',
      'surveyor',
      'admin',
      'surveyor',
      'admin',
    ],
  );
  assert.equal(closed.activity[1].note, 'Lengkapi alamat.');
  assert.equal(closed.activity[7].note, 'Tambahkan patokan.');
  assert.match(closed.activity[9].note, /diterima/);
});

test('the surveyor only sees the report once admin has assigned it', () => {
  const sent = advanceReport(draft, owner, 'submit');
  const approved = advanceReport(sent, admin, 'verify');
  assert.equal(visibleReports([approved], surveyor).length, 0);
  const assigned = assignReport(approved, admin, surveyor, 'Mulai kunjungan.');
  assert.equal(visibleReports([assigned], surveyor).length, 1);
});

test('roles in the thread survive a session restore', () => {
  const sent = advanceReport(draft, owner, 'submit');
  const [back] = restoreReports(JSON.stringify([sent]), [], [owner.id]);
  assert.equal(back.activity[0].role, 'owner');
});
