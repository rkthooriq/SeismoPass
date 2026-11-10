import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadBuildingSession,
  saveBuildingSession,
  exportBuildingDemo,
  sessionKey,
} from '../src/lib/buildingSession.ts';
const building = {
  id: 'DEMO-001',
  name: 'Rumah fiktif',
  location: 'Kawasan fiktif',
  function: 'Rumah tinggal',
  year: '',
  floors: '1',
  material: 'Belum diketahui',
  structure: 'Belum diketahui',
  status: 'Draf',
};
const fallback = [building];
function memoryStore() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}
test('new session starts with demo data; saved edits survive a new load', () => {
  const store = memoryStore();
  assert.equal(loadBuildingSession(() => store, fallback).status, 'new');
  const edited = [
    { ...building, name: 'Nama diperbarui', status: 'Data tercatat' },
  ];
  assert.equal(
    saveBuildingSession(() => store, edited),
    true,
  );
  assert.deepEqual(
    loadBuildingSession(() => store, fallback),
    { buildings: edited, status: 'restored' },
  );
});
test('explicitly empty data stays empty rather than restoring examples', () => {
  const store = memoryStore();
  saveBuildingSession(() => store, []);
  assert.deepEqual(loadBuildingSession(() => store, fallback).buildings, []);
});
test('unavailable and quota-limited storage keep application usable without claiming persistence', () => {
  const denied = () => {
    throw new Error('SecurityError');
  };
  assert.equal(loadBuildingSession(denied, fallback).status, 'unavailable');
  assert.equal(saveBuildingSession(denied, fallback), false);
  assert.equal(
    saveBuildingSession(
      () => ({
        setItem() {
          throw new Error('QuotaExceededError');
        },
      }),
      fallback,
    ),
    false,
  );
});
test('invalid, incompatible and duplicate session records safely fall back without overwriting stored data', () => {
  for (const raw of [
    '{',
    'null',
    JSON.stringify({ version: 2, buildings: [] }),
    JSON.stringify({ version: 1, buildings: [{ ...building, name: 42 }] }),
    JSON.stringify({
      version: 1,
      buildings: [{ ...building, status: 'Aman' }],
    }),
    JSON.stringify({ version: 1, buildings: [building, building] }),
  ]) {
    const store = memoryStore();
    store.setItem(sessionKey, raw);
    assert.deepEqual(
      loadBuildingSession(() => store, fallback),
      { buildings: fallback, status: 'invalid' },
    );
    assert.equal(store.getItem(sessionKey), raw);
  }
});
test('reset replaces saved edits and export is explicitly labelled demonstration', () => {
  const store = memoryStore();
  saveBuildingSession(() => store, [{ ...building, name: 'Diubah' }]);
  saveBuildingSession(() => store, fallback);
  assert.deepEqual(loadBuildingSession(() => store, []).buildings, fallback);
  const exported = JSON.parse(exportBuildingDemo(fallback));
  assert.equal(exported.mode, 'DEMONSTRASI');
  assert.match(exported.description, /Bukan hasil screening/);
  assert.deepEqual(exported.buildings, fallback);
});
