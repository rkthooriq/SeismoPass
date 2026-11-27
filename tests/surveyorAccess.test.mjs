import test from 'node:test';
import assert from 'node:assert/strict';
import {
  demoAccounts,
  demoPassword,
  sampleReports,
  assignReport,
  advanceReport,
  visibleReports,
  releaseSurveyorAssignments,
  saveReportRvs,
} from '../src/lib/reportDemo.ts';
import {
  verifyDemoEmail,
  changeSurveyorAccess,
} from '../src/lib/surveyorAccess.ts';
import {
  initialDirectory,
  serializeDemoSession,
  restoreDemoSession,
  restoreDirectory,
} from '../src/lib/demoDirectory.ts';
import { resolveWorkflowPage } from '../src/lib/workflowNavigation.ts';

const confirmed = (report) => ({
  ...report,
  appointment: {
    date: '2026-11-12',
    slot: 'Pagi (08.00–11.00)',
    response: 'confirmed',
  },
});
const [owner, admin, surveyor] = demoAccounts;

test('only reporters verify their own email; surveyors are never self-activated', () => {
  const pendingOwner = {
    ...owner,
    status: 'pending-email',
    emailVerified: false,
  };
  const verified = verifyDemoEmail(pendingOwner);
  assert.equal(verified.status, 'active');
  assert.equal(verified.emailVerified, true);
  assert.equal(verifyDemoEmail(verified), null);
  assert.equal(
    verifyDemoEmail({
      ...surveyor,
      status: 'pending-email',
      emailVerified: false,
    }),
    null,
  );
});
test('the old surveyor application actions no longer exist', () => {
  for (const action of ['approve', 'request-changes', 'reject'])
    assert.equal(
      changeSurveyorAccess(admin, surveyor, action, 'Catatan', true),
      null,
    );
});
test('admin assigns only active approved surveyors; there is no self claim and no unassigned visibility', () => {
  const queued = { ...sampleReports[0], status: 'Siap disurvei' };
  assert.equal(assignReport(queued, owner, surveyor, 'Tugas'), null);
  assert.equal(
    assignReport(queued, admin, { ...surveyor, status: 'suspended' }, 'Tugas'),
    null,
  );
  assert.equal(
    assignReport(queued, admin, { ...surveyor, emailVerified: false }, 'Tugas'),
    null,
  );
  assert.equal(assignReport(queued, admin, surveyor, ''), null);
  assert.equal(advanceReport(queued, surveyor, 'claim'), null);
  assert.deepEqual(visibleReports([queued], surveyor), []);
  const assigned = assignReport(
    queued,
    admin,
    surveyor,
    'Kunjungan sesuai supervisi.',
  );
  assert.equal(assigned.status, 'Ditugaskan');
  assert.deepEqual(visibleReports([assigned], surveyor), [assigned]);
  assert.equal(
    advanceReport(assigned, { ...surveyor, id: 'other' }, 'start'),
    null,
  );
  assert.equal(
    advanceReport(assigned, surveyor, 'visit', {
      date: '2026-11-11',
      note: 'Catatan',
    }),
    null,
  );
  // The reporter has not confirmed a visit date yet.
  assert.equal(advanceReport(assigned, surveyor, 'start'), null);
  assert.equal(
    advanceReport(confirmed(assigned), surveyor, 'start').status,
    'Dalam survei',
  );
});
test('deactivation blocks access, releases open work and preserves historical notes', () => {
  for (const actor of [owner, surveyor, { ...admin, status: 'suspended' }])
    assert.equal(
      changeSurveyorAccess(actor, surveyor, 'suspend', 'Catatan'),
      null,
    );
  assert.equal(changeSurveyorAccess(admin, surveyor, 'suspend', ''), null);
  assert.equal(changeSurveyorAccess(admin, admin, 'suspend', 'Catatan'), null);
  const suspended = changeSurveyorAccess(
    admin,
    surveyor,
    'suspend',
    'Perlu tinjauan ulang.',
  );
  assert.equal(suspended.status, 'suspended');
  assert.equal(suspended.history.at(-1).action, 'suspended');
  assert.equal(changeSurveyorAccess(admin, suspended, 'suspend', 'Lagi'), null);
  const records = [
    'Ditugaskan',
    'Dalam survei',
    'Perlu revisi',
    'Ditinjau',
    'Selesai',
  ].map((status, i) => ({
    ...sampleReports[0],
    id: `LAP-${i}`,
    status,
    assignee: surveyor.id,
    visitNote: 'Catatan lama',
  }));
  const released = releaseSurveyorAssignments(records, surveyor.id, admin);
  assert.deepEqual(
    released.map((report) => report.status),
    ['Siap disurvei', 'Siap disurvei', 'Siap disurvei', 'Ditinjau', 'Selesai'],
  );
  assert.equal(released[0].assignee, undefined);
  assert.equal(released[0].visitNote, 'Catatan lama');
  assert.deepEqual(visibleReports(records, suspended), []);
  assert.equal(
    advanceReport(records[1], suspended, 'visit', {
      date: '2026-11-11',
      note: 'Dilarang',
    }),
    null,
  );
  assert.equal(saveReportRvs(records[1], suspended, {}), null);
  assert.equal(
    changeSurveyorAccess(admin, suspended, 'reactivate', 'Diperiksa', false),
    null,
  );
  assert.equal(
    changeSurveyorAccess(
      admin,
      { ...suspended, emailVerified: false },
      'reactivate',
      'Diperiksa',
      true,
    ),
    null,
  );
  const reactivated = changeSurveyorAccess(
    admin,
    suspended,
    'reactivate',
    'Diperiksa',
    true,
  );
  assert.equal(reactivated.status, 'active');
  assert.equal(reactivated.history.at(-1).action, 'reactivated');
  assert.equal(
    releaseSurveyorAssignments(records, surveyor.id, owner),
    records,
  );
});
test('new owner metadata and reports persist together without persisting passwords', () => {
  const accounts = [
    ...initialDirectory(),
    {
      ...owner,
      id: 'new-owner',
      email: 'new@example.com',
      password: 'NEVER-PERSIST-THIS',
    },
  ];
  const reports = [
    {
      ...sampleReports[0],
      reporterId: 'new-owner',
      status: 'Ditugaskan',
      assignee: surveyor.id,
      assignedBy: admin.id,
      assignmentNote: 'Tugas',
      activity: [
        {
          by: admin.id,
          action: 'Penugasan',
          note: 'Catatan',
          at: '2026-11-11T00:00:00Z',
        },
      ],
    },
  ];
  const raw = serializeDemoSession(accounts, reports);
  assert.equal(raw.includes('NEVER-PERSIST-THIS'), false);
  assert.equal(raw.includes('password'), false);
  const restored = restoreDemoSession(raw, []);
  assert.equal(restored.invalid, false);
  assert.equal(restored.accounts.at(-1).password, demoPassword);
  assert.deepEqual(restored.reports, reports);
  assert.equal(
    restoreDirectory([
      ...accounts,
      {
        ...owner,
        id: 'rogue-admin',
        email: 'rogue@example.com',
        role: 'admin',
      },
    ]),
    null,
  );
  assert.equal(restoreDirectory([...accounts, accounts[0]]), null);
  assert.equal(restoreDemoSession('{broken', []).invalid, true);
  assert.equal(
    restoreDemoSession(
      JSON.stringify({
        version: 2,
        accounts,
        reports: [{ ...reports[0], reporterId: 'unknown' }],
      }),
      [],
    ).invalid,
    true,
  );
});
test('sidebar destinations are restricted by role including direct URL access', () => {
  for (const role of ['owner', 'admin', 'surveyor']) {
    assert.equal(resolveWorkflowPage(role, 'dashboard/flow'), null);
  }
  // Pesurvei didaftarkan admin, jadi tidak ada lagi halaman pengajuan publik.
  assert.equal(resolveWorkflowPage('admin', 'dashboard/applications'), null);
  assert.equal(
    resolveWorkflowPage('admin', 'dashboard/surveyors'),
    'surveyors',
  );
  assert.equal(resolveWorkflowPage('owner', 'dashboard/surveyors'), null);
  assert.equal(resolveWorkflowPage('surveyor', 'dashboard/surveyors'), null);
  assert.equal(resolveWorkflowPage('surveyor', 'dashboard/tasks'), 'tasks');
  assert.equal(resolveWorkflowPage('admin', 'dashboard/new'), null);
  assert.equal(resolveWorkflowPage('owner', 'dashboard/new'), 'new');
  assert.equal(
    resolveWorkflowPage('admin', 'dashboard/../../applications'),
    null,
  );
});

test('complete three-role workflow survives an account switch and session reload', () => {
  const pendingOwner = {
    ...owner,
    id: 'reporter-e2e',
    email: 'reporter-e2e@example.com',
    status: 'pending-email',
    emailVerified: false,
  };
  const reporter = verifyDemoEmail(pendingOwner);
  // Pesurvei dibuat admin dan sudah membuat kata sandi sendiri.
  const approved = {
    ...surveyor,
    id: 'surveyor-e2e',
    email: 'surveyor-e2e@example.com',
    managed: true,
  };
  const locked = { ...approved, status: 'must-change-password' };
  const draft = {
    ...sampleReports[0],
    id: 'LAP-E2E',
    reporterId: reporter.id,
    status: 'Draf',
  };
  assert.equal(advanceReport(draft, pendingOwner, 'submit'), null);
  const sent = advanceReport(draft, reporter, 'submit');
  const queued = advanceReport(sent, admin, 'verify');
  const assigned = assignReport(
    queued,
    admin,
    approved,
    'Kunjungan demo dengan supervisi.',
  );
  const saved = restoreDemoSession(
    serializeDemoSession(
      [...initialDirectory(), reporter, approved],
      [confirmed(assigned)],
    ),
    [],
  );
  assert.equal(saved.invalid, false);
  const task = saved.reports[0];
  assert.deepEqual(visibleReports([task], locked), []);
  assert.deepEqual(visibleReports([task], approved), [task]);
  const started = advanceReport(task, approved, 'start');
  const visited = advanceReport(started, approved, 'visit', {
    date: '2026-11-11',
    note: 'Catatan kunjungan contoh.',
  });
  const revised = advanceReport(visited, admin, 'revise', {
    note: 'Lengkapi catatan supervisi.',
  });
  const resubmitted = advanceReport(revised, approved, 'visit', {
    date: '2026-11-11',
    note: 'Catatan supervisi dilengkapi.',
  });
  const closed = advanceReport(resubmitted, admin, 'close', {
    note: 'Administrasi lengkap, tanpa pengesahan teknis.',
  });
  assert.equal(closed.status, 'Selesai');
  assert.deepEqual(visibleReports([closed], reporter), [closed]);
  assert.equal(
    advanceReport(closed, approved, 'visit', {
      date: '2026-11-11',
      note: 'Tidak diizinkan',
    }),
    null,
  );
});
