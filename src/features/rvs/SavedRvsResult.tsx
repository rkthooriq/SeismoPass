import { useId, useRef } from 'react';
import { hazardFields, observationFields } from '../../lib/rvs';
import type { RvsRecord } from '../../lib/rvs';
import RvsResult from './RvsResult';
import QrPanel from './QrPanel';
import './rvs.css';

const valueLabels: Record<string, string> = {
  DNK: 'Belum diketahui (DNK)',
  none: 'Tidak ada',
  moderate: 'Moderate (sedang)',
  severe: 'Severe (berat)',
  no: 'Tidak',
  yes: 'Ya',
  neither: 'Bukan pre-code maupun post-benchmark',
  pre: 'Pre-code',
  post: 'Post-benchmark',
};

export default function SavedRvsResult({
  record,
  reportTitle,
}: {
  record: RvsRecord;
  reportTitle: string;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const savedAt = new Date(record.savedAt);
  const savedDate = Number.isNaN(savedAt.getTime())
    ? record.savedAt
    : savedAt.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
  const inputs = [
    ['Tipe bangunan FEMA', record.inputs.buildingType],
    ['Lantai di atas tanah', record.inputs.stories],
    ['Tipe tanah', record.inputs.soil],
    ['Ketidakberaturan vertikal', record.inputs.vertical],
    ['Ketidakberaturan denah', record.inputs.plan],
    ['Status kode bangunan', record.inputs.code],
  ] as const;
  const notes = observationFields.filter(([key]) =>
    record.observations[key].trim(),
  );
  return (
    <section
      className="rvs-saved-card"
      aria-label="Hasil simulasi RVS tersimpan"
    >
      <div className="rvs-saved-copy">
        <h3>Hasil simulasi RVS</h3>
        <p>
          Dicatat oleh {record.recordedBy} ·{' '}
          <time dateTime={record.savedAt}>{savedDate}</time>
        </p>
        <span className="rvs-saved-status">Belum divalidasi ahli</span>
      </div>
      <button
        ref={triggerRef}
        type="button"
        className="ws-secondary"
        aria-haspopup="dialog"
        aria-controls={`${id}-result`}
        onClick={() => {
          const position = { top: window.scrollY, left: window.scrollX };
          dialogRef.current?.showModal();
          bodyRef.current?.scrollTo({ top: 0, behavior: 'instant' });
          headingRef.current?.focus({ preventScroll: true });
          window.scrollTo({ ...position, behavior: 'instant' });
        }}
      >
        Lihat hasil
      </button>
      <dialog
        ref={dialogRef}
        id={`${id}-result`}
        className="rvs-saved-dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onClose={() => triggerRef.current?.focus({ preventScroll: true })}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            event.currentTarget.close();
        }}
      >
        <div className="rvs-saved-heading">
          <div>
            <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1}>
              Hasil simulasi RVS
            </h2>
            <p id={`${id}-description`}>{reportTitle}</p>
            <span className="rvs-saved-status">Belum divalidasi ahli</span>
          </div>
          <button
            type="button"
            className="ws-secondary"
            onClick={() => dialogRef.current?.close()}
          >
            Tutup
          </button>
        </div>
        <div className="rvs-saved-body" ref={bodyRef}>
          <RvsResult inputs={record.inputs} showStatus={false} />
          <details className="rvs-saved-disclosure">
            <summary>
              <span>
                <strong>Input dan catatan survei</strong>
                <small>
                  Pilihan perhitungan, tanda bahaya, dan catatan pemeriksa
                </small>
              </span>
              <span className="rvs-saved-fold-icon" aria-hidden="true">
                ›
              </span>
            </summary>
            <div className="rvs-saved-data">
              <h3>Input perhitungan</h3>
              <dl className="rvs-saved-facts">
                {inputs.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{valueLabels[value] ?? (value || 'Belum diisi')}</dd>
                  </div>
                ))}
              </dl>
              <h3>Tanda bahaya yang dicatat</h3>
              <dl className="rvs-saved-facts">
                {hazardFields.map(([key, label]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>{valueLabels[record.inputs[key]]}</dd>
                  </div>
                ))}
              </dl>
              <h3>Catatan pemeriksa</h3>
              {notes.length ? (
                <dl className="rvs-saved-facts">
                  {notes.map(([key, label]) => (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>{record.observations[key]}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p>Tidak ada catatan tambahan.</p>
              )}
            </div>
          </details>
          <details className="rvs-saved-disclosure">
            <summary>
              <span>
                <strong>QR simulasi</strong>
                <small>Tautan berisi data minimum, bukan sertifikat aman</small>
              </span>
              <span className="rvs-saved-fold-icon" aria-hidden="true">
                ›
              </span>
            </summary>
            <QrPanel inputs={record.inputs} />
          </details>
        </div>
      </dialog>
    </section>
  );
}
