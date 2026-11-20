import assert from 'node:assert/strict';
import test from 'node:test';
import {
  readVisitDraft,
  visitDraftKey,
  writeVisitDraft,
} from '../src/lib/visitDraft.ts';

function memory() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test('an unsent visit note survives leaving the page and ends when sent', () => {
  const store = memory();
  const key = visitDraftKey('survey-demo', 'LAP-1');
  writeVisitDraft(() => store, key, { date: '2026-11-20', note: 'Retak' });
  assert.deepEqual(
    readVisitDraft(() => store, key),
    {
      date: '2026-11-20',
      note: 'Retak',
    },
  );
  writeVisitDraft(() => store, key, null);
  assert.equal(
    readVisitDraft(() => store, key),
    null,
  );
});

test('drafts are separate per surveyor and report', () => {
  assert.notEqual(
    visitDraftKey('survey-demo', 'LAP-1'),
    visitDraftKey('survey-demo', 'LAP-2'),
  );
  assert.notEqual(
    visitDraftKey('survey-demo', 'LAP-1'),
    visitDraftKey('other', 'LAP-1'),
  );
});

test('damaged storage yields no draft', () => {
  const store = memory();
  store.setItem('k', '{bad');
  assert.equal(
    readVisitDraft(() => store, 'k'),
    null,
  );
  store.setItem('k', JSON.stringify({ date: 1, note: 'x' }));
  assert.equal(
    readVisitDraft(() => store, 'k'),
    null,
  );
});
