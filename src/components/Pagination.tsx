import { pageNumbers } from '../lib/pagination';
import './pagination.css';

export default function Pagination({ page, totalPages, total, start, end, label, onChange }: {
  page: number;
  totalPages: number;
  total: number;
  start: number;
  end: number;
  label: string;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="ws-pagination" aria-label={`Halaman ${label}`}>
      <p role="status">Menampilkan {start}–{end} dari {total} {label}</p>
      <div className="ws-pagination-controls">
        <button type="button" className="ws-secondary" disabled={page === 1} onClick={() => onChange(page - 1)}>
          <span aria-hidden="true">← </span>Sebelumnya
        </button>
        <div className="ws-pagination-numbers">
          {pageNumbers(page, totalPages).map((number, index) => number === 'gap'
            ? <span key={`gap-${index}`} aria-hidden="true">…</span>
            : <button type="button" className="ws-secondary" key={number} aria-label={`Halaman ${number}`} aria-current={number === page ? 'page' : undefined} onClick={() => onChange(number)}>{number}</button>)}
        </div>
        <button type="button" className="ws-secondary" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
          Selanjutnya<span aria-hidden="true"> →</span>
        </button>
      </div>
    </nav>
  );
}
