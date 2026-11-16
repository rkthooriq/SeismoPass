import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adminNextAction,
  surveyorNextAction,
} from '../src/lib/roleNextAction.ts';

const reports = (...statuses) => statuses.map((status) => ({ status }));

test('admin is pointed at whoever has waited longest', () => {
  assert.equal(adminNextAction([], 1).page, 'incoming');
  assert.match(adminNextAction([], 1).title, /Tidak ada/);
  assert.equal(
    adminNextAction(reports('Ditinjau', 'Dikirim', 'Dikirim'), 1).page,
    'incoming',
  );
  assert.match(
    adminNextAction(reports('Dikirim', 'Dikirim'), 1).title,
    /^2 laporan/,
  );
  assert.equal(adminNextAction(reports('Ditinjau'), 1).page, 'review');
  assert.equal(
    adminNextAction(reports('Siap disurvei'), 1).page,
    'assignments',
  );
});

test('admin must register a surveyor before ready reports can move on', () => {
  assert.equal(adminNextAction(reports('Siap disurvei'), 0).page, 'surveyors');
});

test('surveyor sees revisions first, then work in progress, then new tasks', () => {
  assert.match(
    surveyorNextAction(reports('Ditugaskan', 'Perlu revisi')).title,
    /direvisi/,
  );
  assert.match(
    surveyorNextAction(reports('Ditugaskan', 'Dalam survei')).title,
    /dikerjakan|kamu kerjakan/,
  );
  assert.match(surveyorNextAction(reports('Ditugaskan')).title, /baru/);
  assert.match(surveyorNextAction([]).title, /Belum ada tugas/);
});
