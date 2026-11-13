import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceReport,
  assignReport,
  demoAccounts,
  sampleReports,
  validateReportRegistration,
} from '../src/lib/reportDemo.ts';
import { restoreReports } from '../src/lib/reportSession.ts';
const [owner, admin, surveyor] = demoAccounts;
const complete = { ...sampleReports[0], status: 'Draf' };

test('draft can be incomplete, but sending requires basic building data and RVS acknowledgement', () => {
  const draft = {
    id: 'LAP-TEST',
    reporterId: owner.id,
    title: 'Contoh',
    location: '',
    description: '',
    status: 'Draf',
    demoConsent: true,
  };
  assert.deepEqual(validateReportRegistration(draft, true), {});
  for (const key of [
    'location',
    'description',
    'function',
    'floors',
    'material',
    'structure',
    'understandsRvs',
  ])
    assert.ok(validateReportRegistration(draft)[key]);
  assert.equal(advanceReport(draft, owner, 'submit'), null);
  assert.ok(
    validateReportRegistration({ ...draft, demoConsent: false }, true)
      .demoConsent,
  );
  assert.ok(advanceReport(complete, owner, 'submit'));
});

test('registration rejects malformed year, floor counts and oversized fields but allows unknown material', () => {
  for (const floors of ['0', '-1', '1.5', '2e1', '201'])
    assert.ok(validateReportRegistration({ ...complete, floors }).floors);
  for (const year of ['100', '20xx', '2027'])
    assert.ok(
      validateReportRegistration({ ...complete, year }, false, 2026).year,
    );
  assert.deepEqual(
    validateReportRegistration({
      ...complete,
      year: '',
      material: 'Belum diketahui',
      structure: 'Belum diketahui',
    }),
    {},
  );
  assert.ok(
    validateReportRegistration({ ...complete, title: 'a'.repeat(101) }).title,
  );
  assert.ok(
    validateReportRegistration({ ...complete, function: '   ' }).function,
  );
});

test('legacy incomplete reports require owner correction before admin can queue them', () => {
  const legacy = {
    ...complete,
    status: 'Dikirim',
    floors: undefined,
    demoConsent: undefined,
  };
  assert.equal(advanceReport(legacy, admin, 'verify'), null);
  const returned = advanceReport(legacy, admin, 'return', {
    note: 'Lengkapi jumlah lantai dan konfirmasi demo.',
  });
  assert.equal(returned.status, 'Perlu dilengkapi');
  const corrected = { ...returned, floors: '2', demoConsent: true };
  const submitted = advanceReport(corrected, owner, 'submit');
  assert.equal(
    advanceReport(submitted, admin, 'verify').status,
    'Siap disurvei',
  );
});

test('surveyor must be assigned before recording a valid calendar date; closure produces no assessment', () => {
  const sent = advanceReport(complete, owner, 'submit');
  const queued = advanceReport(sent, admin, 'verify');
  assert.equal(
    advanceReport(queued, surveyor, 'visit', {
      date: '2026-11-11',
      note: 'Kunjungan demo',
    }),
    null,
  );
  const assignment = assignReport(
    queued,
    admin,
    surveyor,
    'Catatan penugasan demo.',
  );
  const assigned = advanceReport(assignment, surveyor, 'start');
  for (const date of ['2026-02-30', 'invalid', '2026-13-01'])
    assert.equal(
      advanceReport(assigned, surveyor, 'visit', {
        date,
        note: 'Kunjungan demo',
      }),
      null,
    );
  const visited = advanceReport(assigned, surveyor, 'visit', {
    date: '2026-11-11',
    note: 'Kunjungan demo',
  });
  const closed = advanceReport(visited, admin, 'close', {
    note: 'Administrasi lengkap.',
  });
  assert.equal(closed.status, 'Selesai');
  assert.equal(closed.floors, complete.floors);
  for (const key of [
    'score',
    'riskCategory',
    'referral',
    'retrofit',
    'incentive',
  ])
    assert.equal(key in closed, false);
});

test('session restores basic fields and consent, migrates legacy assignment without inventing data', () => {
  assert.deepEqual(restoreReports(JSON.stringify([complete]), []), [complete]);
  const legacy = {
    id: 'LAP-OLD',
    reporterId: owner.id,
    title: 'Contoh lama',
    location: 'Fiktif',
    description: 'Catatan',
    status: 'Ditugaskan',
  };
  const [restored] = restoreReports(JSON.stringify([legacy]), []);
  assert.equal(restored.status, 'Siap disurvei');
  assert.equal(restored.floors, undefined);
  assert.equal(restored.demoConsent, undefined);
  assert.equal(
    restoreReports(
      JSON.stringify([{ ...legacy, assignee: surveyor.id }]),
      [],
    )[0].status,
    'Ditugaskan',
  );
});

test('session rejects corrupt fields, unknown statuses, duplicate IDs and other owners; drops extra assessment fields', () => {
  const fallback = [complete];
  for (const raw of [
    'broken',
    '{}',
    '[null]',
    JSON.stringify([{ ...complete, floors: {} }]),
    JSON.stringify([{ ...complete, demoConsent: 'yes' }]),
    JSON.stringify([{ ...complete, status: 'Aman' }]),
    JSON.stringify([{ ...complete, reporterId: 'other' }]),
    JSON.stringify([complete, complete]),
  ])
    assert.equal(restoreReports(raw, fallback), fallback);
  assert.equal(
    restoreReports(JSON.stringify([{ ...complete, score: 9 }]), [])[0].score,
    undefined,
  );
  assert.deepEqual(restoreReports('[]', fallback), []);
});

test('sending a report requires a full visit address; landmark and phone are optional but phone is validated', () => {
  assert.ok(
    validateReportRegistration({ ...complete, address: '   ' }).address,
  );
  assert.equal(
    advanceReport({ ...complete, address: '' }, owner, 'submit'),
    null,
  );
  // A draft may still lack the address.
  assert.equal(
    validateReportRegistration({ ...complete, address: '' }, true).address,
    undefined,
  );
  assert.deepEqual(
    validateReportRegistration({ ...complete, landmark: '', contactPhone: '' }),
    {},
  );
  for (const contactPhone of [
    'abc',
    '12345',
    '0812-3456-7890x',
    '1'.repeat(16),
  ])
    assert.ok(
      validateReportRegistration({ ...complete, contactPhone }).contactPhone,
    );
  for (const contactPhone of ['0812 3456 7890', '+62 812-3456-7890'])
    assert.equal(
      validateReportRegistration({ ...complete, contactPhone }).contactPhone,
      undefined,
    );
  assert.ok(
    validateReportRegistration({ ...complete, address: 'a'.repeat(301) })
      .address,
  );
});

test('session keeps address, landmark and phone; older reports without them stay blocked from the queue', () => {
  const withVisit = {
    ...complete,
    landmark: 'Pagar biru',
    contactPhone: '0812 3456 7890',
  };
  assert.deepEqual(restoreReports(JSON.stringify([withVisit]), []), [
    withVisit,
  ]);
  const old = { ...complete, status: 'Dikirim', address: undefined };
  assert.equal(advanceReport(old, admin, 'verify'), null);
});
