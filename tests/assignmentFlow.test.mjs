import assert from 'node:assert/strict';
import test from 'node:test';
import { planAssignment, verifyAndAssign } from '../src/lib/assignmentFlow.ts';
import { scheduleChoice } from '../src/lib/scheduleChoice.ts';
import { sampleReports } from '../src/lib/reportDemo.ts';

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
  email: 'pesurvei@example.com',
  emailVerified: true,
};
const choice = {
  date: '2999-01-02',
  slot: 'Pagi (08.00–11.00)',
  note: '',
  at: '2026-11-20T01:00:00.000Z',
};
const complete = {
  ...sampleReports[0],
  status: 'Dikirim',
  assignee: undefined,
  appointment: undefined,
  ownerProgress: { availability: choice },
};
const input = {
  note: 'Periksa dinding.',
  date: choice.date,
  slot: choice.slot,
};

test('approve and assign in one step keeps the reporter-chosen time agreed', () => {
  const plan = verifyAndAssign(complete, admin, surveyor, input);
  assert.equal(plan.report.status, 'Ditugaskan');
  assert.equal(plan.report.assignee, surveyor.id);
  assert.equal(plan.report.appointment.response, 'confirmed');
  assert.equal(plan.agreed, true);
  const actions = plan.report.activity.map((entry) => entry.action);
  assert.ok(
    actions.some((text) => /menyetujui/i.test(text)),
    'approval kept',
  );
});

test('another time becomes a proposal the reporter confirms', () => {
  const plan = verifyAndAssign(complete, admin, surveyor, {
    ...input,
    slot: 'Sore (14.00–17.00)',
  });
  assert.equal(plan.report.appointment.response, 'proposed');
  assert.equal(plan.agreed, false);
});

test('it is all or nothing: a missing surveyor or time leaves the report untouched', () => {
  assert.equal(verifyAndAssign(complete, admin, undefined, input), null);
  assert.equal(
    verifyAndAssign(complete, admin, surveyor, { ...input, date: '' }),
    null,
  );
  assert.equal(
    verifyAndAssign(complete, admin, surveyor, { ...input, note: ' ' }),
    null,
  );
  assert.equal(complete.status, 'Dikirim');
});

test('only an admin can approve and assign', () => {
  assert.equal(
    verifyAndAssign(complete, { ...admin, role: 'owner' }, surveyor, input),
    null,
  );
});

test('assigning an already approved report works as before', () => {
  const queued = { ...complete, status: 'Siap disurvei' };
  const plan = planAssignment(queued, admin, surveyor, input);
  assert.equal(plan.report.status, 'Ditugaskan');
});

test('the form starts from the reporter choice only while it is still ahead', () => {
  assert.equal(scheduleChoice(complete, '2026-11-20').useChoice, true);
  assert.equal(scheduleChoice(complete, '3000-01-01').useChoice, false);
  const settled = {
    ...complete,
    appointment: {
      date: '2999-01-05',
      slot: choice.slot,
      response: 'confirmed',
    },
  };
  assert.equal(scheduleChoice(settled, '2026-11-20').useChoice, false);
});
