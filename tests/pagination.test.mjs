import assert from 'node:assert/strict';
import test from 'node:test';
import {
  defaultPageSize,
  isPageSize,
  pageNumbers,
  pageSizes,
  paginate,
} from '../src/lib/pagination.ts';

const items = Array.from({ length: 23 }, (_, index) => index + 1);

test('page sizes are 5, 7, and 10 with 5 as default', () => {
  assert.deepEqual([...pageSizes], [5, 7, 10]);
  assert.equal(defaultPageSize, 5);
  assert.equal(isPageSize(7), true);
  assert.equal(isPageSize(8), false);
});

test('a page shows its slice and the range text numbers', () => {
  const second = paginate(items, 2, 10);
  assert.deepEqual(second.items, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  assert.equal(second.start, 11);
  assert.equal(second.end, 20);
  assert.equal(second.pageCount, 3);
  const last = paginate(items, 3, 10);
  assert.deepEqual(last.items, [21, 22, 23]);
  assert.equal(last.end, 23);
});

test('a page past the end falls back to the last page', () => {
  const clamped = paginate(items.slice(0, 6), 4, 5);
  assert.equal(clamped.page, 2);
  assert.deepEqual(clamped.items, [6]);
  assert.equal(paginate(items, 0, 5).page, 1);
});

test('an empty list is one empty page', () => {
  assert.deepEqual(paginate([], 3, 7), {
    items: [],
    page: 1,
    pageCount: 1,
    start: 0,
    end: 0,
    total: 0,
  });
});

test('long page ranges collapse into gaps around the current page', () => {
  assert.deepEqual(pageNumbers(1, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(pageNumbers(1, 12), [1, 2, 3, 4, 'gap', 12]);
  assert.deepEqual(pageNumbers(6, 12), [1, 'gap', 5, 6, 7, 'gap', 12]);
  assert.deepEqual(pageNumbers(12, 12), [1, 'gap', 9, 10, 11, 12]);
});
