export const pageSize = 10;

export function paginate<T>(items: T[], requestedPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(totalPages, Math.max(1, Math.trunc(requestedPage) || 1));
  const offset = (page - 1) * pageSize;
  return {
    page,
    totalPages,
    total: items.length,
    start: items.length ? offset + 1 : 0,
    end: Math.min(offset + pageSize, items.length),
    items: items.slice(offset, offset + pageSize),
  };
}

export function pageNumbers(page: number, totalPages: number): (number | 'gap')[] {
  const numbers = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...numbers].filter((number) => number >= 1 && number <= totalPages).sort((a, b) => a - b);
  const result: (number | 'gap')[] = [];
  sorted.forEach((number, index) => {
    const previous = sorted[index - 1];
    if (previous && number - previous === 2) result.push(previous + 1);
    else if (previous && number - previous > 2) result.push('gap');
    result.push(number);
  });
  return result;
}
