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
  assert.equal(
    writeVisitDraft(() => store, key, { date: '2026-11-20', note: 'Retak' }),
    true,
  );
  assert.deepEqual(
    readVisitDraft(() => store, key),
    {
      date: '2026-11-20',
      note: 'Retak',
    },
  );
  assert.equal(
    writeVisitDraft(() => store, key, null),
    true,
  );
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

test('a failed save preserves the earlier draft and a retry saves the latest note', () => {
  const store = memory();
  const key = visitDraftKey('survey-demo', 'LAP-1');
  const earlier = { date: '2026-11-20', note: 'Catatan awal' };
  const latest = { ...earlier, note: 'Catatan terbaru' };
  writeVisitDraft(() => store, key, earlier);
  const fullStore = {
    ...store,
    setItem: () => {
      throw new Error('quota exceeded');
    },
  };
  assert.equal(
    writeVisitDraft(() => fullStore, key, latest),
    false,
  );
  assert.deepEqual(
    readVisitDraft(() => store, key),
    earlier,
  );
  assert.equal(
    writeVisitDraft(() => store, key, latest),
    true,
  );
  assert.deepEqual(
    readVisitDraft(() => store, key),
    latest,
  );
});

test('unavailable storage and failed removal report failure without throwing', () => {
  const unavailable = () => {
    throw new Error('storage disabled');
  };
  assert.equal(
    writeVisitDraft(unavailable, 'draft', { date: '', note: 'Catatan' }),
    false,
  );
  assert.equal(writeVisitDraft(unavailable, 'draft', null), false);
  const store = {
    ...memory(),
    removeItem: () => {
      throw new Error('denied');
    },
  };
  assert.equal(
    writeVisitDraft(() => store, 'draft', null),
    false,
  );
});
