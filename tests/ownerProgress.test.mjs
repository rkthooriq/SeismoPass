import test from 'node:test';
import assert from 'node:assert/strict';
import {
  demoAccounts,
  sampleReports,
  assignReport,
  releaseSurveyorAssignments,
} from '../src/lib/reportDemo.ts';
import {
  updateOwnerProgress,
  proposeAppointment,
  parseOwnerProgress,
  parseAppointment,
  timeSlots,
} from '../src/lib/ownerProgress.ts';
import { restoreReports } from '../src/lib/reportSession.ts';
import { rvsDemoPath } from '../src/lib/rvsQr.ts';
import { validPhotoFile, maxPhotoBytes } from '../src/lib/buildingPhotos.ts';
const [owner, admin, surveyor] = demoAccounts;
const sent = { ...sampleReports[0], status: 'Dikirim' };
const now = '2026-11-14';
const availability = {
  type: 'availability',
  date: '2026-11-20',
  slot: timeSlots[0],
  note: 'Pengelola tersedia.',
};

test('owner updates cannot cross ownership, account state or role boundaries', () => {
  for (const actor of [
    admin,
    surveyor,
    { ...owner, id: 'someone-else' },
    { ...owner, status: 'pending-email' },
  ]) {
    assert.equal(updateOwnerProgress(sent, actor, availability, now), null);
  }
  const result = updateOwnerProgress(sent, owner, availability, now);
  assert.equal(result.status, 'Dikirim');
  assert.equal(result.ownerProgress.availability.date, availability.date);
  assert.equal(result.appointment, undefined);
});

test('schedule requests reject past or invalid dates, slots and stale report states', () => {
  for (const patch of [
    { date: '2026-02-30' },
    { date: '2026-11-13' },
    { slot: 'midnight' },
    { note: 'x'.repeat(1001) },
  ])
    assert.equal(
      updateOwnerProgress(sent, owner, { ...availability, ...patch }, now),
      null,
    );
  for (const status of ['Draf', 'Dalam survei', 'Ditinjau', 'Selesai'])
    assert.equal(
      updateOwnerProgress({ ...sent, status }, owner, availability, now),
      null,
    );
});

test('only admin can propose a schedule and owner confirmation follows a valid proposal', () => {
  const assigned = { ...sent, status: 'Ditugaskan', assignee: surveyor.id };
  assert.equal(
    proposeAppointment(
      assigned,
      owner,
      availability.date,
      availability.slot,
      now,
    ),
    null,
  );
  assert.equal(
    proposeAppointment(
      { ...assigned, assignee: undefined },
      admin,
      availability.date,
      availability.slot,
      now,
    ),
    null,
  );
  assert.equal(
    updateOwnerProgress(
      assigned,
      owner,
      { type: 'appointment', response: 'confirmed' },
      now,
    ),
    null,
  );
  const proposed = proposeAppointment(
    assigned,
    admin,
    availability.date,
    availability.slot,
    now,
  );
  const confirmed = updateOwnerProgress(
    proposed,
    owner,
    { type: 'appointment', response: 'confirmed' },
    now,
  );
  assert.equal(confirmed.appointment.response, 'confirmed');
  assert.equal(confirmed.status, 'Ditugaskan');
  assert.equal(
    updateOwnerProgress(
      proposed,
      owner,
      { type: 'appointment', response: 'confirmed' },
      '2026-11-21',
    ),
    null,
  );
  const changed = updateOwnerProgress(proposed, owner, availability, now);
  assert.equal(changed.appointment.response, 'change-requested');
  assert.equal(
    assignReport(
      proposed,
      admin,
      { ...surveyor, id: 'new-surveyor' },
      'Ganti petugas',
    ).appointment,
    undefined,
  );
  assert.equal(
    releaseSurveyorAssignments([confirmed], surveyor.id, admin)[0].appointment,
    undefined,
  );
});

test('follow-up, support and owner work notes cannot produce technical approval or program awards', () => {
  const done = { ...sent, status: 'Selesai' };
  const follow = {
    type: 'follow-up',
    choice: 'consultation',
    note: 'Butuh penjelasan.',
  };
  assert.equal(updateOwnerProgress(sent, owner, follow), null);
  let result = updateOwnerProgress(done, owner, follow);
  result = updateOwnerProgress(result, owner, {
    type: 'support',
    need: 'funding-information',
    note: 'Mencari informasi.',
  });
  result = updateOwnerProgress(result, owner, {
    type: 'work',
    stage: 'reported-complete',
    note: 'Catatan pemilik.',
  });
  assert.equal(result.ownerProgress.work.stage, 'reported-complete');
  assert.equal(result.ownerProgress.support.need, 'funding-information');
  for (const key of [
    'score',
    'riskCategory',
    'approved',
    'incentive',
    'referral',
    'verified',
  ])
    assert.equal(result[key], undefined);
  assert.equal(
    updateOwnerProgress(done, owner, { ...follow, choice: 'approved' }),
    null,
  );
  assert.equal(
    updateOwnerProgress(done, owner, { ...follow, note: '   ' }),
    null,
  );
});

test('restoring owner progress retains permitted values and drops fabricated decisions and malformed data', () => {
  const result = updateOwnerProgress(sent, owner, {
    type: 'location',
    point: { latitude: -6.87, longitude: 107.6 },
  });
  const [restored] = restoreReports(JSON.stringify([result]), []);
  assert.deepEqual(restored.ownerProgress, result.ownerProgress);
  const parsed = parseOwnerProgress({
    point: { latitude: 999, longitude: 0 },
    riskCategory: 'safe',
    support: { approved: true, need: 'award', note: '', at: '2026-11-14' },
  });
  assert.equal(parsed, undefined);
  assert.equal(
    parseAppointment({
      date: '2026-02-30',
      slot: timeSlots[0],
      response: 'proposed',
    }),
    undefined,
  );
  assert.equal(
    updateOwnerProgress(sent, owner, {
      type: 'location',
      point: { latitude: NaN, longitude: 100 },
    }),
    null,
  );
  assert.equal(
    updateOwnerProgress(sent, owner, {
      type: 'location',
      point: { latitude: 0, longitude: 0 },
    }).ownerProgress.point.latitude,
    0,
  );
  assert.equal(rvsDemoPath().includes('107.6'), false);
});

test('photo selection rejects oversized, executable and disguised files before storage', async () => {
  assert.equal(
    await validPhotoFile(
      new File(['<svg></svg>'], 'photo.svg', { type: 'image/svg+xml' }),
    ),
    false,
  );
  assert.equal(
    await validPhotoFile(
      new File(['not an image'], 'photo.jpg', { type: 'image/jpeg' }),
    ),
    false,
  );
  assert.equal(
    await validPhotoFile(
      new File([new Uint8Array(maxPhotoBytes + 1)], 'photo.png', {
        type: 'image/png',
      }),
    ),
    false,
  );
  assert.equal(
    await validPhotoFile(
      new File([new Uint8Array([255, 216, 255, 224])], 'photo.jpg', {
        type: 'image/jpeg',
      }),
    ),
    true,
  );
});
