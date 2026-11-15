import assert from 'node:assert/strict';
import test from 'node:test';
import {
  sampleReports,
  refreshSampleReports,
  validateReportRegistration,
  demoAccounts,
} from '../src/lib/reportDemo.ts';
import {
  ownerStatusFilter,
  ownerStatusFilters,
} from '../src/lib/ownerNextStep.ts';
import { restoreReports } from '../src/lib/reportSession.ts';
import {
  initialDirectory,
  serializeDemoSession,
  restoreDemoSession,
} from '../src/lib/demoDirectory.ts';
import { updateOwnerProgress } from '../src/lib/ownerProgress.ts';

test('examples cover every owner filter group with intentional missing draft/correction fields', () => {
  assert.deepEqual(
    [
      ...new Set(
        sampleReports.map((report) => ownerStatusFilter(report.status)),
      ),
    ].sort(),
    [...ownerStatusFilters].sort(),
  );
  for (const report of sampleReports) {
    assert.match(report.title, /contoh/);
    assert.ok(report.ownerProgress.point);
    assert.ok(report.activity.length);
    assert.equal(report.rvs, undefined, 'No invented structural assessment');
    const errors = validateReportRegistration(report);
    if (report.status === 'Draf')
      assert.deepEqual(Object.keys(errors), ['floors']);
    else if (report.status === 'Perlu dilengkapi') {
      assert.deepEqual(Object.keys(errors), ['address']);
      assert.match(report.reviewNote, /alamat/);
    } else assert.deepEqual(errors, {});
  }
  assert.deepEqual(
    restoreReports(JSON.stringify(sampleReports), []),
    sampleReports,
  );
});

test('the scheduled and completed examples support real owner interactions without grants or expert results', () => {
  const owner = demoAccounts[0];
  const scheduled = sampleReports.find(
    (report) => report.appointment?.response === 'proposed',
  );
  assert.equal(scheduled.status, 'Ditugaskan');
  assert.equal(
    scheduled.appointment.date,
    scheduled.ownerProgress.availability.date,
  );
  const confirmed = updateOwnerProgress(scheduled, owner, {
    type: 'appointment',
    response: 'confirmed',
  });
  assert.equal(confirmed.appointment.response, 'confirmed');
  assert.equal(ownerStatusFilter(confirmed.status), 'Sedang diproses');
  const closed = sampleReports.find((report) => report.status === 'Selesai');
  assert.equal(closed.ownerProgress.followUp.choice, 'consultation');
  assert.equal(closed.ownerProgress.work.stage, 'preparing');
  assert.ok(closed.ownerProgress.support.note);
  assert.match(closed.reviewNote, /menunggu ahli/);
});

test('refresh replaces old built-in examples but preserves user-created and other owners reports', () => {
  const own = { ...sampleReports[0], id: 'LAP-MY-REPORT', title: 'Catatanku' };
  const other = {
    ...sampleReports[0],
    reporterId: 'another-owner',
    id: 'LAP-CONTOH-2',
  };
  const old = {
    ...sampleReports[0],
    id: 'LAP-CONTOH-4',
    status: 'Dalam survei',
  };
  const refreshed = refreshSampleReports([old, own, other]);
  assert.deepEqual(refreshed.slice(0, sampleReports.length), sampleReports);
  assert.equal(refreshed.at(-2), own);
  assert.equal(refreshed.at(-1), other);
  assert.ok(!refreshed.some((report) => report.id === old.id));
  assert.deepEqual(refreshSampleReports([own]), [own]);
  const raw = JSON.stringify({
    version: 2,
    accounts: initialDirectory(),
    reports: [old, own],
  });
  const restored = restoreDemoSession(raw, []);
  assert.equal(restored.invalid, false);
  assert.equal(restored.reports.length, sampleReports.length + 1);
  assert.equal(restored.reports.at(-1).title, 'Catatanku');
});

test('updated sample progress survives subsequent session reloads and empty accounts stay empty', () => {
  const changed = {
    ...sampleReports[0],
    ownerProgress: { point: { latitude: -6.9, longitude: 107.6 } },
  };
  const raw = serializeDemoSession(initialDirectory(), [changed]);
  assert.deepEqual(restoreDemoSession(raw, []).reports, [changed]);
  assert.deepEqual(
    restoreDemoSession(
      serializeDemoSession(initialDirectory(), []),
      sampleReports,
    ).reports,
    [],
  );
});
