import assert from 'node:assert/strict';
import test from 'node:test';
import { formatDate } from '../src/lib/dateFormat.ts';

test('dates read the same for every role', () => {
  assert.equal(formatDate('2026-11-27'), '27 November 2026');
  assert.equal(formatDate('2026-02-01'), '1 Februari 2026');
});

test('missing or unusual values are not turned into "Invalid Date"', () => {
  assert.equal(formatDate(undefined), '');
  assert.equal(formatDate(''), '');
  assert.equal(formatDate('besok pagi'), 'besok pagi');
});
