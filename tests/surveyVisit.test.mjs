import assert from 'node:assert/strict';
import test from 'node:test';
import { validateSurveyVisit } from '../src/lib/surveyVisit.ts';
import {
  advanceReport,
  demoAccounts,
  sampleReports,
} from '../src/lib/reportDemo.ts';

const today = '2026-11-26';
const surveyor = demoAccounts[2];

test('a visit accepts today or a past calendar date with a nonempty note', () => {
  for (const date of [today, '2024-02-29', '2026-11-20'])
    assert.deepEqual(
      validateSurveyVisit(date, 'Catatan kunjungan.', today),
      {},
    );
});

test('missing, malformed and future visit dates report a field error', () => {
  for (const date of [
    '',
    '26/11/2026',
    '2026-02-29',
    '2026-13-01',
    '2026-11-27',
  ])
    assert.ok(validateSurveyVisit(date, 'Catatan.', today).date, date);
});

test('visit notes reject whitespace and values beyond the storage limit', () => {
  assert.ok(validateSurveyVisit(today, '   ', today).note);
  assert.deepEqual(validateSurveyVisit(today, 'x'.repeat(1000), today), {});
  assert.ok(validateSurveyVisit(today, 'x'.repeat(1001), today).note);
});

test('submission rejects future dates and oversized notes in both work and revision', () => {
  for (const status of ['Dalam survei', 'Perlu revisi']) {
    const report = { ...sampleReports[0], assignee: surveyor.id, status };
    for (const values of [
      { date: '2999-01-01', note: 'Catatan.' },
      { date: '2026-02-29', note: 'Catatan.' },
      { date: '2026-11-20', note: 'x'.repeat(1001) },
    ])
      assert.equal(advanceReport(report, surveyor, 'visit', values), null);
    assert.equal(report.status, status);
    const sent = advanceReport(report, surveyor, 'visit', {
      date: '2026-11-20',
      note: '  Catatan lengkap.  ',
    });
    assert.equal(sent.status, 'Ditinjau');
    assert.equal(sent.visitNote, 'Catatan lengkap.');
  }
});
