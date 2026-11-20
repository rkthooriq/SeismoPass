// Page sizes a viewer can pick for any list. Most lists are tall cards, so
// every list (landing, reporter, admin, surveyor) opens with 5 per page; 7 and
// 10 stay available for viewers who want more at once.
export const pageSizes = [5, 7, 10] as const;
export type PageSize = (typeof pageSizes)[number];
export const defaultPageSize: PageSize = 5;

export function isPageSize(value: unknown): value is PageSize {
  return pageSizes.includes(value as PageSize);
}

export interface PageSlice<T> {
  items: T[];
  /** 1-based page, clamped to the pages that exist. */
  page: number;
  pageCount: number;
  /** 1-based position of the first and last item shown; 0 when empty. */
  start: number;
  end: number;
  total: number;
}

// A page past the end (after a filter or a status change shrank the list)
// falls back to the last page instead of showing an empty one.
export function paginate<T>(
  items: readonly T[],
  page: number,
  size: number,
): PageSlice<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const from = (current - 1) * size;
  const shown = items.slice(from, from + size);
  return {
    items: shown,
    page: current,
    pageCount,
    start: total ? from + 1 : 0,
    end: from + shown.length,
    total,
  };
}

// Page buttons to show: always the first, last, and current page with its
// neighbours; longer gaps collapse into one ellipsis.
export function pageNumbers(
  page: number,
  pageCount: number,
): (number | 'gap')[] {
  if (pageCount <= 7)
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  const keep = new Set([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((value) => keep.add(value));
  if (page >= pageCount - 2)
    [pageCount - 3, pageCount - 2, pageCount - 1].forEach((value) =>
      keep.add(value),
    );
  const sorted = [...keep]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);
  const result: (number | 'gap')[] = [];
  sorted.forEach((value, index) => {
    if (index && value - sorted[index - 1] > 1) result.push('gap');
    result.push(value);
  });
  return result;
}
