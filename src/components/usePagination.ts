import { useId, useState } from 'react';
import { defaultPageSize, isPageSize, paginate } from '../lib/pagination';
import type { PageSize } from '../lib/pagination';

const sizeKey = 'seismopass.pageSize';

function storedSize(): PageSize {
  try {
    const value = Number(window.localStorage.getItem(sizeKey));
    return isPageSize(value) ? value : defaultPageSize;
  } catch {
    return defaultPageSize;
  }
}

/**
 * Pages any list. `resetKey` is the search/filter state: when it changes the
 * list starts again from page 1. The chosen page size is remembered for this
 * browser, so every list opens with the size the viewer last picked.
 */
export default function usePagination<T>(items: readonly T[], resetKey = '') {
  const [page, setPage] = useState(1);
  const [size, setSizeState] = useState<PageSize>(storedSize);
  const [lastKey, setLastKey] = useState(resetKey);
  if (lastKey !== resetKey) {
    setLastKey(resetKey);
    setPage(1);
  }
  // Put id={pager.listId} on the element holding the items, so moving to
  // another page can bring the top of the list back into view.
  const listId = useId();
  const slice = paginate(items, page, size);
  function goTo(next: number) {
    setPage(next);
    // Bring the top of the list back into view; the controls sit below it.
    requestAnimationFrame(() => {
      const list = document.getElementById(listId);
      if (list && list.getBoundingClientRect().top < 0)
        list.scrollIntoView({
          block: 'start',
          behavior: 'instant',
        });
    });
  }
  function setSize(next: PageSize) {
    setSizeState(next);
    setPage(1);
    try {
      window.localStorage.setItem(sizeKey, String(next));
    } catch {
      // Remembering the size is a convenience only.
    }
  }
  return { ...slice, size, goTo, setSize, listId };
}
