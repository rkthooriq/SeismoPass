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
  reviewSurveyor,
  resubmitSurveyor,
} from '../src/lib/surveyorAccess.ts';
import {
  initialDirectory,
  serializeDemoSession,
  restoreDemoSession,
  restoreDirectory,
} from '../src/lib/demoDirectory.ts';
import { resolveWorkflowPage } from '../src/lib/workflowNavigation.ts';
const [owner, admin, surveyor] = demoAccounts;
const applicant = {
  ...surveyor,
  id: 'applicant',
  email: 'applicant@example.com',
  status: 'pending-email',
  emailVerified: false,
  organization: 'Organisasi contoh',
  qualification: 'Pelatihan dan supervisi contoh',
};

test('surveyor application waits for simulated email verification and an active admin approval', () => {
  assert.equal(
    reviewSurveyor(admin, applicant, 'approve', 'Diperiksa', true),
    null,
  );
  const verified = verifyDemoEmail(applicant);
  assert.equal(verified.status, 'pending');
  assert.equal(verified.emailVerified, true);
  for (const actor of [owner, surveyor, { ...admin, status: 'suspended' }])
    assert.equal(
      reviewSurveyor(actor, verified, 'approve', 'Diperiksa', true),
      null,
    );
  assert.equal(reviewSurveyor(admin, verified, 'approve', '', true), null);
  assert.equal(
    reviewSurveyor(admin, verified, 'approve', 'Diperiksa', false),
    null,
  );
  const approved = reviewSurveyor(
    admin,
    verified,
    'approve',
    'Kompetensi demo ditinjau dan supervisi dicatat.',
    true,
  );
  assert.equal(approved.status, 'active');
  assert.equal(approved.history.at(-1).action, 'approved');
  assert.equal(
    reviewSurveyor(
      { ...admin, id: verified.id },
      verified,
      'approve',
      'Diperiksa',
      true,
    ),
    null,
  );
  assert.equal(verifyDemoEmail(approved), null);
});
test('changes and rejection can be corrected and resubmitted without granting a role early', () => {
  const pending = verifyDemoEmail(applicant);
  for (const action of ['request-changes', 'reject']) {
    const reviewed = reviewSurveyor(
      admin,
      pending,
      action,
      'Lengkapi organisasi.',
    );
    assert.equal(
      reviewed.status,
      action === 'reject' ? 'rejected' : 'changes-requested',
    );
    assert.deepEqual(visibleReports(sampleReports, reviewed), []);
    assert.equal(resubmitSurveyor(reviewed, '', 'kompetensi'), null);
    const updated = resubmitSurveyor(
      reviewed,
      'Organisasi baru',
      'Pelatihan contoh',
    );
    assert.equal(updated.status, 'pending');
    assert.equal(
      reviewSurveyor(admin, updated, 'approve', 'Diperiksa', true).status,
      'active',
    );
  }
});
test('admin assigns only active approved surveyors; there is no self claim and no unassigned visibility', () => {
  const queued = { ...sampleReports[0], status: 'Siap disurvei' };
  assert.equal(assignReport(queued, owner, surveyor, 'Tugas'), null);
  assert.equal(assignReport(queued, admin, applicant, 'Tugas'), null);
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
  assert.equal(
    advanceReport(assigned, surveyor, 'start').status,
    'Dalam survei',
  );
});
test('deactivation blocks access, releases open work and preserves historical notes', () => {
  const suspended = reviewSurveyor(
    admin,
    surveyor,
    'suspend',
    'Perlu tinjauan ulang.',
  );
  assert.equal(suspended.status, 'suspended');
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
    reviewSurveyor(admin, suspended, 'reactivate', 'Diperiksa', false),
    null,
  );
  assert.equal(
    reviewSurveyor(admin, suspended, 'reactivate', 'Diperiksa', true).status,
    'active',
  );
  assert.equal(
    releaseSurveyorAssignments(records, surveyor.id, owner),
    records,
  );
});
test('new owner/applicant metadata and reports persist together without persisting passwords', () => {
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
  const pending = verifyDemoEmail(applicant);
  const approved = reviewSurveyor(
    admin,
    pending,
    'approve',
    'Pelatihan contoh dan supervisi ditinjau.',
    true,
  );
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
      [assigned],
    ),
    [],
  );
  assert.equal(saved.invalid, false);
  const task = saved.reports[0];
  assert.deepEqual(visibleReports([task], pending), []);
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
