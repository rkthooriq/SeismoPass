import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRvs,
  emptyRvsInputs,
  emptyObservations,
  highScores,
  buildingTypes,
  parseRvsRecord,
} from '../src/lib/rvs.ts';
import { rvsDemoPath, parseRvsDemoPath } from '../src/lib/rvsQr.ts';
import {
  demoAccounts,
  sampleReports,
  saveReportRvs,
} from '../src/lib/reportDemo.ts';
import { restoreReports } from '../src/lib/reportSession.ts';
const base = {
  ...emptyRvsInputs('2'),
  buildingType: 'W1',
  soil: 'D',
  vertical: 'none',
  plan: 'no',
  code: 'neither',
};
const [owner, admin, surveyor] = demoAccounts;
const record = {
  version: 1,
  form: 'FEMA-P154-2015-HIGH',
  inputs: base,
  observations: emptyObservations(),
  recordedBy: surveyor.name,
  savedAt: '2026-11-11T00:00:00.000Z',
  demoAcknowledged: true,
};

test('all 17 HIGH basic/minimum scores match the supplied FEMA form', () => {
  const expected = {
    W1: [3.6, 1.1],
    W1A: [3.2, 0.9],
    W2: [2.9, 0.7],
    S1: [2.1, 0.5],
    S2: [2, 0.5],
    S3: [2.6, 0.6],
    S4: [2, 0.5],
    S5: [1.7, 0.5],
    C1: [1.5, 0.3],
    C2: [2, 0.3],
    C3: [1.2, 0.3],
    PC1: [1.6, 0.2],
    PC2: [1.4, 0.2],
    RM1: [1.7, 0.3],
    RM2: [1.7, 0.3],
    URM: [1, 0.2],
    MH: [1.5, 1],
  };
  for (const [buildingType, [score, minimum]] of Object.entries(expected)) {
    const result = calculateRvs({ ...base, buildingType });
    assert.equal(result.score, score);
    assert.equal(result.minimum, minimum);
    assert.equal(highScores[buildingType].length, 10);
  }
});
test('FEMA C3 example applies minimum after raw sum; severe replaces moderate', () => {
  const result = calculateRvs({
    ...base,
    buildingType: 'C3',
    stories: '12',
    soil: 'E',
    vertical: 'severe',
  });
  assert.equal(result.raw, 0.2);
  assert.equal(result.score, 0.3);
  assert.deepEqual(
    result.terms.map((t) => t.value),
    [1.2, -0.7, -0.3],
  );
  assert.equal(calculateRvs({ ...base, vertical: 'moderate' }).score, 2.9);
  assert.equal(calculateRvs({ ...base, vertical: 'severe' }).score, 2.4);
});
test('soil E uses correct floor boundary and A/B match; DNK explicitly assumes D', () => {
  assert.equal(calculateRvs({ ...base, soil: 'E', stories: '3' }).score, 3.8);
  assert.equal(calculateRvs({ ...base, soil: 'E', stories: '4' }).score, 3.3);
  for (const soil of ['A', 'B'])
    assert.equal(calculateRvs({ ...base, soil }).score, 3.7);
  assert.equal(calculateRvs({ ...base, soil: 'DNK' }).score, 3.6);
  assert.match(
    calculateRvs({ ...base, soil: 'DNK' }).warnings.join(' '),
    /asumsi D/,
  );
});
test('unknown type, incomplete choices, invalid floors, soil F and every selected NA block scoring', () => {
  for (const input of [
    { ...base, buildingType: 'DNK' },
    { ...base, buildingType: 'fake' },
    { ...base, stories: '0' },
    { ...base, stories: '1.5' },
    { ...base, stories: '' },
    { ...base, soil: 'F' },
    { ...base, vertical: 'DNK' },
    { ...base, plan: 'DNK' },
    { ...base, code: 'DNK' },
  ])
    assert.equal(calculateRvs(input).score, null);
  for (const buildingType of ['S5', 'C3', 'URM'])
    assert.equal(
      calculateRvs({ ...base, buildingType, code: 'post' }).score,
      null,
    );
  for (const buildingType of ['S3', 'PC1', 'MH'])
    assert.equal(
      calculateRvs({ ...base, buildingType, soil: 'E', stories: '4' }).score,
      null,
    );
  assert.equal(
    calculateRvs({ ...base, buildingType: 'MH', vertical: 'severe' }).score,
    null,
  );
  assert.equal(
    calculateRvs({ ...base, buildingType: 'MH', plan: 'yes' }).score,
    null,
  );
});
test('geologic, adjacent, damage and nonstructural hazards remain visible regardless of high score', () => {
  const result = calculateRvs({
    ...base,
    code: 'post',
    liquefaction: 'yes',
    pounding: 'yes',
    damage: 'yes',
    parapet: 'yes',
  });
  assert.equal(result.score, 5.2);
  assert.match(result.warnings.join(' '), /likuefaksi/);
  assert.match(result.warnings.join(' '), /nonstruktur/);
  assert.match(result.warnings.join(' '), /belum diketahui/);
  assert.equal('riskCategory' in result, false);
  assert.equal('safe' in result, false);
});
test('only assigned surveyor can save a simulation during work/revision; cache never trusts a stored score', () => {
  const report = {
    ...sampleReports[0],
    status: 'Dalam survei',
    assignee: surveyor.id,
  };
  assert.equal(saveReportRvs(report, owner, record), null);
  assert.equal(saveReportRvs(report, admin, record), null);
  assert.equal(
    saveReportRvs(report, { ...surveyor, id: 'other' }, record),
    null,
  );
  assert.equal(
    saveReportRvs({ ...report, status: 'Selesai' }, surveyor, record),
    null,
  );
  const saved = saveReportRvs(report, surveyor, record);
  assert.deepEqual(saved.rvs, record);
  const restored = restoreReports(
    JSON.stringify([
      {
        ...saved,
        rvs: {
          ...record,
          score: 999,
          inputs: { ...base, privateNote: 'secret' },
        },
      },
    ]),
    [],
  );
  assert.deepEqual(restored[0].rvs, record);
  assert.equal(
    parseRvsRecord({ ...record, inputs: { ...base, stories: {} } }),
    null,
  );
  assert.equal(parseRvsRecord({ ...record, demoAcknowledged: false }), null);
});
test('QR round trips all building types, empty and NA outcomes, without private report information', () => {
  for (const buildingType of ['DNK', ...buildingTypes]) {
    const inputs = { ...base, buildingType };
    const path = rvsDemoPath(inputs);
    const restored = parseRvsDemoPath(path.slice(2));
    assert.equal(restored.kind, 'inputs');
    assert.deepEqual(restored.inputs, inputs);
    assert.equal(
      calculateRvs(restored.inputs).score,
      calculateRvs(inputs).score,
    );
  }
  assert.equal(parseRvsDemoPath('rvs-demo').kind, 'empty');
  const path = rvsDemoPath({
    ...base,
    location: 'SECRET',
    latitude: 'SECRET',
    owner: 'SECRET',
    comments: 'SECRET',
  });
  assert.equal(path.includes('SECRET'), false);
  for (const value of [
    'rvs-demo?data=2.0',
    'rvs-demo?data=NaN',
    'rvs-demo?data=1',
    'rvs-demo?data=<script>',
    rvsDemoPath(base).slice(2).replace(/\.0$/, '.9'),
    rvsDemoPath(base).slice(2).replace(/\.0$/, '.'),
  ])
    assert.equal(parseRvsDemoPath(value).kind, 'invalid');
});
