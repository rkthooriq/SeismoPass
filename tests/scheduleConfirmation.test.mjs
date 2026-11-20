import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseAppointment,
  recordOwnerConfirmation,
} from '../src/lib/ownerProgress.ts';
import { advanceReport } from '../src/lib/reportDemo.ts';
import {
  ownerFilterGroups,
  ownerStageLabelFor,
  ownerStatusFilterFor,
} from '../src/lib/ownerNextStep.ts';
import { adminNextAction } from '../src/lib/roleNextAction.ts';

const admin = {
  id: 'admin-demo',
  role: 'admin',
  status: 'active',
  name: 'Admin',
};
const surveyor = {
  id: 'survey-demo',
  role: 'surveyor',
  status: 'active',
  name: 'Pesurvei',
};
const task = (response) => ({
  id: 'LAP-1',
  title: 'Rumah',
  location: 'Lembang',
  reporterId: 'owner-demo',
  status: 'Ditugaskan',
  assignee: surveyor.id,
  appointment: { date: '2026-12-01', slot: 'Pagi (08.00–11.00)', response },
  activity: [],
});

test('admin records a reporter confirmation given by phone', () => {
  const confirmed = recordOwnerConfirmation(
    task('proposed'),
    admin,
    ' Ditelepon, pelapor setuju. ',
    '2026-11-20',
  );
  assert.equal(confirmed.appointment.response, 'confirmed');
  assert.equal(confirmed.appointment.confirmedBy, 'admin');
  assert.equal(
    confirmed.appointment.confirmationNote,
    'Ditelepon, pelapor setuju.',
  );
  assert.match(confirmed.activity.at(-1).action, /Admin mencatat konfirmasi/);
  assert.equal(
    advanceReport(confirmed, surveyor, 'start').status,
    'Dalam survei',
  );
});

test('admin confirmation needs a note, an open proposal, and an admin', () => {
  const at = '2026-11-20';
  assert.equal(
    recordOwnerConfirmation(task('proposed'), admin, '  ', at),
    null,
  );
  assert.equal(
    recordOwnerConfirmation(task('change-requested'), admin, 'Setuju', at),
    null,
  );
  assert.equal(
    recordOwnerConfirmation(task('confirmed'), admin, 'Setuju', at),
    null,
  );
  assert.equal(
    recordOwnerConfirmation(task('proposed'), surveyor, 'Setuju', at),
    null,
  );
  assert.equal(
    recordOwnerConfirmation(task('proposed'), admin, 'Setuju', '2026-12-02'),
    null,
  );
});

test('who confirmed survives a session round-trip', () => {
  const stored = JSON.parse(
    JSON.stringify(
      recordOwnerConfirmation(task('proposed'), admin, 'Lewat WA', '2026-11-20')
        .appointment,
    ),
  );
  assert.deepEqual(parseAppointment(stored), {
    date: '2026-12-01',
    slot: 'Pagi (08.00–11.00)',
    response: 'confirmed',
    confirmedBy: 'admin',
    confirmationNote: 'Lewat WA',
  });
  assert.equal(
    parseAppointment({ ...stored, response: 'proposed' }).confirmedBy,
    undefined,
  );
});

test('a proposed date puts the report under Perlu tindakanmu', () => {
  assert.equal(ownerStatusFilterFor(task('proposed')), 'Perlu tindakanmu');
  assert.equal(ownerStageLabelFor(task('proposed')), 'Konfirmasi jadwal');
  assert.equal(ownerStatusFilterFor(task('confirmed')), 'Sedang diproses');
  assert.deepEqual(ownerFilterGroups([task('proposed'), task('confirmed')]), [
    {
      group: 'Perlu tindakanmu',
      count: 1,
      stages: [
        { status: 'Konfirmasi jadwal', label: 'Konfirmasi jadwal', count: 1 },
      ],
    },
    {
      group: 'Sedang diproses',
      count: 1,
      stages: [
        { status: 'Ditugaskan', label: 'Pesurvei ditugaskan', count: 1 },
      ],
    },
  ]);
});

test('admin is reminded about dates the reporter has not answered', () => {
  const action = adminNextAction([task('proposed')], 1);
  assert.match(action.title, /1 jadwal belum dikonfirmasi/);
  assert.equal(action.page, 'assignments');
});
