import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activeSessionKey,
  isProtectedRoute,
  readActiveSession,
  writeActiveSession,
} from '../src/lib/activeSession.ts';

function memory() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    data,
  };
}

test('a signed-in tab survives a refresh and ends on sign-out', () => {
  const store = memory();
  writeActiveSession(() => store, { accountId: 'owner-demo', demoMode: true });
  assert.deepEqual(
    readActiveSession(() => store),
    {
      accountId: 'owner-demo',
      demoMode: true,
    },
  );
  assert.doesNotMatch(store.data.get(activeSessionKey), /password|sandi/i);
  writeActiveSession(() => store, null);
  assert.equal(
    readActiveSession(() => store),
    null,
  );
});

test('damaged or missing storage never signs anyone in', () => {
  const store = memory();
  store.setItem(activeSessionKey, '{not json');
  assert.equal(
    readActiveSession(() => store),
    null,
  );
  store.setItem(activeSessionKey, JSON.stringify({ accountId: '' }));
  assert.equal(
    readActiveSession(() => store),
    null,
  );
  assert.equal(
    readActiveSession(() => {
      throw new Error('blocked');
    }),
    null,
  );
});

test('only workspace routes need an account', () => {
  assert.equal(isProtectedRoute('dashboard'), true);
  assert.equal(isProtectedRoute('dashboard/reports/LAP-1'), true);
  for (const path of ['login', 'register', 'rvs-lab', 'contoh', ''])
    assert.equal(isProtectedRoute(path), false, path);
});
