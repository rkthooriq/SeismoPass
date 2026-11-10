import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBuilding } from '../src/lib/buildingValidation.ts';

const blank = {
  id: '',
  name: '',
  location: '',
  function: '',
  year: '',
  floors: '',
  material: '',
  structure: '',
  status: 'Draf',
};
const complete = {
  ...blank,
  name: 'Rumah fiktif',
  location: 'Kawasan fiktif',
  function: 'Rumah tinggal',
  floors: '2',
  material: 'Belum diketahui',
  structure: 'Belum diketahui',
};
test('draft requires a name and demo acknowledgement, while allowing incomplete building data', () => {
  assert.deepEqual(Object.keys(validateBuilding(blank, false, true)).sort(), [
    'consent',
    'name',
  ]);
  assert.deepEqual(
    validateBuilding({ ...blank, name: 'Contoh' }, true, true),
    {},
  );
});
test('complete registration rejects missing basic data and whitespace-only inputs', () => {
  const errors = validateBuilding(
    { ...blank, name: '  ', location: '  ' },
    true,
    false,
  );
  for (const key of [
    'name',
    'location',
    'function',
    'floors',
    'material',
    'structure',
  ])
    assert.ok(errors[key]);
});
test('unknown materials and an unknown year are valid without inventing assessment data', () => {
  assert.deepEqual(validateBuilding(complete, true, false), {});
});
test('year and floor validation rejects future dates, fractions, negative and malformed values even in drafts', () => {
  for (const year of ['2027', '0', 'abcd'])
    assert.ok(validateBuilding({ ...complete, year }, true, true, 2026).year);
  for (const floors of ['0', '-1', '1.5', '2e1', '201'])
    assert.ok(validateBuilding({ ...complete, floors }, true, true).floors);
  assert.deepEqual(
    validateBuilding(
      { ...complete, year: '2026', floors: '200' },
      true,
      false,
      2026,
    ),
    {},
  );
});
