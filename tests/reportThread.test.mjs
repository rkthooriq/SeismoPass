import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceReport,
  assignReport,
  demoAccounts,
  sampleReports,
  visibleReports,
  releaseSurveyorAssignments,
} from '../src/lib/reportDemo.ts';
import { restoreReports } from '../src/lib/reportSession.ts';
import {
  initialDirectory,
  restoreDemoSession,
  serializeDemoSession,
} from '../src/lib/demoDirectory.ts';
import { recordOwnerConfirmation } from '../src/lib/ownerProgress.ts';

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

const longHistory = () =>
  Array.from({ length: 500 }, (_, index) => ({
    by: admin.name,
    role: 'admin',
    action: 'Catatan penugasan',
    note: String(index),
    at: '2026-11-20T00:00:00Z',
  }));

test('assignment with a full history survives a session restore', () => {
  const report = {
    ...sampleReports[0],
    status: 'Siap disurvei',
    activity: longHistory(),
  };
  const assigned = assignReport(report, admin, surveyor, 'Kunjungan contoh.');
  const restored = restoreDemoSession(
    serializeDemoSession(initialDirectory(), [assigned]),
    [],
  );
  assert.equal(restored.invalid, false);
  assert.equal(restored.reports[0].assignee, surveyor.id);
  assert.equal(restored.reports[0].activity.length, 500);
  assert.equal(restored.reports[0].activity[0].note, '1');
  assert.equal(restored.reports[0].activity.at(-1).note, 'Kunjungan contoh.');
  assert.equal(report.activity.length, 500);
});

test('release and reassignment preserve notes and restorable history while revoking old access', () => {
  const report = {
    ...sampleReports[0],
    status: 'Perlu revisi',
    assignee: surveyor.id,
    visitDate: '2026-11-20',
    visitNote: 'Catatan pesurvei sebelumnya.',
    activity: longHistory(),
  };
  const released = releaseSurveyorAssignments([report], surveyor.id, admin)[0];
  const replacement = {
    ...surveyor,
    id: 'survey-replacement',
    email: 'pengganti@example.com',
  };
  const reassigned = assignReport(
    released,
    admin,
    replacement,
    'Lanjutkan pemeriksaan contoh.',
  );
  const restored = restoreDemoSession(
    serializeDemoSession([...initialDirectory(), replacement], [reassigned]),
    [],
  );
  assert.equal(restored.invalid, false);
  const back = restored.reports[0];
  assert.equal(back.activity.length, 500);
  assert.equal(back.activity.at(-2).action, 'Penugasan dikembalikan');
  assert.equal(back.visitNote, report.visitNote);
  assert.equal(back.visitDate, report.visitDate);
  assert.deepEqual(visibleReports([back], surveyor), []);
  assert.deepEqual(visibleReports([back], replacement), [back]);
  assert.equal(
    advanceReport(back, surveyor, 'visit', {
      date: '2026-11-20',
      note: 'Perubahan dari pesurvei lama.',
    }),
    null,
  );
});

test('full-length visit and confirmation notes survive their formatted history context', () => {
  const note = 'x'.repeat(1000);
  const working = {
    ...sampleReports[0],
    status: 'Dalam survei',
    assignee: surveyor.id,
  };
  const sent = advanceReport(working, surveyor, 'visit', {
    date: '2026-11-20',
    note,
  });
  const pending = {
    ...working,
    status: 'Ditugaskan',
    appointment: {
      date: '2999-01-01',
      slot: 'Pagi (08.00–11.00)',
      response: 'proposed',
    },
  };
  const agreed = recordOwnerConfirmation(pending, admin, note);
  for (const report of [sent, agreed]) {
    assert.ok(report.activity.at(-1).note.length > 1000);
    const restored = restoreDemoSession(
      serializeDemoSession(initialDirectory(), [report]),
      [],
    );
    assert.equal(restored.invalid, false);
    assert.equal(
      restored.reports[0].activity.at(-1).note,
      report.activity.at(-1).note,
    );
  }
  assert.equal(sent.visitNote, note);
  assert.equal(agreed.appointment.confirmationNote, note);
});

test('oversized history still rejects the stored session', () => {
  const report = {
    ...sampleReports[0],
    activity: [
      {
        by: 'Admin',
        role: 'admin',
        action: 'Catatan',
        note: 'x'.repeat(2001),
        at: '2026-11-20T00:00:00Z',
      },
    ],
  };
  assert.equal(
    restoreDemoSession(serializeDemoSession(initialDirectory(), [report]), [])
      .invalid,
    true,
  );
});
