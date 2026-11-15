import assert from 'node:assert/strict';
import test from 'node:test';
import { statusTone, statusToneClass } from '../src/lib/statusTone.ts';

test('each status maps to the party that holds the report', () => {
  assert.equal(statusTone('Draf'), 'draft');
  assert.equal(statusTone('Dikirim'), 'admin');
  assert.equal(statusTone('Ditinjau'), 'admin');
  assert.equal(statusTone('Siap disurvei'), 'field');
  assert.equal(statusTone('Ditugaskan'), 'field');
  assert.equal(statusTone('Dalam survei'), 'field');
  assert.equal(statusTone('Perlu dilengkapi'), 'action');
  assert.equal(statusTone('Perlu revisi'), 'action');
  assert.equal(statusTone('Selesai'), 'done');
});

test('owner sees surveyor revisions as field work, not their own action', () => {
  assert.equal(statusTone('Perlu revisi', 'owner'), 'field');
  assert.equal(statusTone('Perlu dilengkapi', 'owner'), 'action');
});

test('class name follows the tone', () => {
  assert.equal(statusToneClass('Selesai'), 'status-done');
  assert.equal(statusToneClass('Perlu revisi', 'owner'), 'status-field');
});
