import { useId } from 'react';
import { pageNumbers, pageSizes } from '../lib/pagination';
import type { PageSize, PageSlice } from '../lib/pagination';
import './pagination.css';

function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d={back ? 'm14 6-6 6 6 6' : 'm10 6 6 6-6 6'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Pagination({
  pager,
  label,
  unit = 'data',
}: {
  pager: PageSlice<unknown> & {
    size: PageSize;
    goTo: (page: number) => void;
    setSize: (size: PageSize) => void;
  };
  /** What the list holds, for screen readers, e.g. "laporan". */
  label: string;
  /** Word after the count, e.g. "laporan" or "akun". */
  unit?: string;
}) {
  const id = useId();
  const { page, pageCount, start, end, total, size, goTo, setSize } = pager;
  // With no more items than the smallest page there is nothing to split.
  if (total <= pageSizes[0]) return null;
  return (
    <nav className="pagination" aria-label={`Halaman ${label}`}>
      <p className="pagination-summary" aria-live="polite">
        Menampilkan {start}–{end} dari {total} {unit}
      </p>
      <label className="pagination-size" htmlFor={`${id}-size`}>
        Per halaman
        <select
          id={`${id}-size`}
          value={size}
          onChange={(event) => setSize(Number(event.target.value) as PageSize)}
        >
          {pageSizes.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      {pageCount > 1 && (
        <ul className="pagination-pages">
          <li>
            <button
              type="button"
              className="pagination-page"
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              aria-label="Halaman sebelumnya"
            >
              <Chevron back />
            </button>
          </li>
          {pageNumbers(page, pageCount).map((value, index) =>
            value === 'gap' ? (
              <li
                key={`gap-${index}`}
                className="pagination-gap pagination-number"
                aria-hidden="true"
              >
                …
              </li>
            ) : (
              <li key={value} className="pagination-number">
                <button
                  type="button"
                  className="pagination-page"
                  onClick={() => goTo(value)}
                  aria-current={value === page ? 'page' : undefined}
                  aria-label={`Halaman ${value}`}
                >
                  {value}
                </button>
              </li>
            ),
          )}
          {/* Phones show this instead of the row of page numbers. */}
          <li className="pagination-position" aria-hidden="true">
            Halaman {page} dari {pageCount}
          </li>
          <li>
            <button
              type="button"
              className="pagination-page"
              onClick={() => goTo(page + 1)}
              disabled={page === pageCount}
              aria-label="Halaman berikutnya"
            >
              <Chevron />
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}
