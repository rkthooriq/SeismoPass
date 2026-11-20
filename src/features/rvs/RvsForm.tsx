import { useId, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { FormEvent } from 'react';
import {
  buildingTypes,
  emptyRvsInputs,
  emptyObservations,
  hazardFields,
  observationFields,
  isRvsInputs,
  rvsHandbook,
} from '../../lib/rvs';
import type { RvsRecord, RvsInputs } from '../../lib/rvs';
import { focusAndReveal } from '../../lib/reveal';
import RvsResult from './RvsResult';
import QrPanel from './QrPanel';

const labels: Record<string, string> = {
  DNK: 'Belum diketahui (DNK)',
  none: 'Tidak ada',
  moderate: 'Moderate (sedang)',
  severe: 'Severe (berat, termasuk bila ada moderate)',
  no: 'Tidak',
  yes: 'Ya',
  neither: 'Bukan pre-code maupun post-benchmark',
  pre: 'Pre-code',
  post: 'Post-benchmark',
};
// One part of the form, shown on the page as a short summary row; its fields
// open in a modal dialog so the page stays short while progress stays visible.
function SectionDialog({
  id,
  index,
  title,
  hint,
  progress,
  chosen,
  done,
  onDone,
  dialogRef,
  children,
}: {
  id: string;
  index: number;
  title: string;
  hint: string;
  progress: string;
  chosen: string[];
  /** The surveyor has worked through this part (or it was saved before). */
  done: boolean;
  onDone: () => void;
  dialogRef: RefObject<HTMLDialogElement | null>;
  children: ReactNode;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className="rvs-section-row">
      <div className="rvs-section-copy">
        <h3>
          {index}. {title}
        </h3>
        <p>{progress}</p>
        {chosen.length > 0 && (
          <ul className="rvs-section-chosen" aria-label="Isian terpilih">
            {chosen.slice(0, 4).map((value) => (
              <li key={value}>{value}</li>
            ))}
            {chosen.length > 4 && <li>+{chosen.length - 4} lainnya</li>}
          </ul>
        )}
      </div>
      <button
        ref={triggerRef}
        type="button"
        className={done ? 'ws-secondary' : 'ws-primary'}
        aria-haspopup="dialog"
        aria-controls={id}
        onClick={() => {
          const position = { top: window.scrollY, left: window.scrollX };
          dialogRef.current?.showModal();
          bodyRef.current?.scrollTo({ top: 0, behavior: 'instant' });
          headingRef.current?.focus({ preventScroll: true });
          window.scrollTo({ ...position, behavior: 'instant' });
        }}
      >
        {done ? 'Ubah' : 'Isi'}
      </button>
      <dialog
        ref={dialogRef}
        id={id}
        className="rvs-saved-dialog rvs-section-dialog"
        aria-labelledby={`${id}-title`}
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
              {index}. {title}
            </h2>
            <p>{hint}</p>
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
          {children}
        </div>
        <div className="report-actions rvs-section-actions">
          <button
            type="button"
            className="ws-primary"
            onClick={() => {
              onDone();
              dialogRef.current?.close();
            }}
          >
            Selesai
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default function RvsForm({
  initial,
  stories = '',
  screener = 'Pesurvei',
  onSave,
}: {
  initial?: RvsRecord;
  stories?: string;
  screener?: string;
  onSave?: (record: RvsRecord) => boolean;
}) {
  const [inputs, setInputs] = useState<RvsInputs>(
    () => initial?.inputs ?? emptyRvsInputs(stories),
  );
  const [observations, setObservations] = useState(
    () => initial?.observations ?? emptyObservations(),
  );
  const [acknowledged, setAcknowledged] = useState(
    initial?.demoAcknowledged ?? false,
  );
  const [result, setResult] = useState<RvsInputs | null>(null);
  const [message, setMessage] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);
  const id = useId();
  // A part counts as worked through once the surveyor presses Selesai in it,
  // or when a saved record is being edited. Values copied from the report
  // (such as the number of floors) do not count on their own.
  const [reviewed, setReviewed] = useState<number[]>(() =>
    initial ? [1, 2, 3] : [],
  );
  const markReviewed = (part: number) =>
    setReviewed((current) =>
      current.includes(part) ? current : [...current, part],
    );
  const levelRef = useRef<HTMLDialogElement>(null);
  const hazardRef = useRef<HTMLDialogElement>(null);
  const observationsRef = useRef<HTMLDialogElement>(null);
  const codeSourceRef = useRef<HTMLInputElement>(null);
  // What the summary rows show: how much is decided and the decided values.
  const levelKeys = [
    'buildingType',
    'stories',
    'soil',
    'vertical',
    'plan',
    'code',
  ] as const;
  const levelNames: Record<(typeof levelKeys)[number], string> = {
    buildingType: 'Tipe',
    stories: 'Lantai',
    soil: 'Tanah',
    vertical: 'Vertikal',
    plan: 'Denah',
    code: 'Kode',
  };
  const levelChosen = levelKeys
    .filter((key) => inputs[key] && inputs[key] !== 'DNK')
    .map((key) => `${levelNames[key]}: ${labels[inputs[key]] ?? inputs[key]}`);
  const hazardChosen = hazardFields
    .filter(([key]) => inputs[key] !== 'DNK')
    .map(([key, label]) => `${label}: ${labels[inputs[key]]}`);
  const notesFilled = observationFields.filter(([key]) =>
    observations[key].trim(),
  ).length;
  function change(key: keyof RvsInputs, value: string) {
    setInputs((previous) => ({ ...previous, [key]: value }));
    setResult(null);
    setMessage('');
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acknowledged) {
      setMessage(
        'Konfirmasi bahwa kamu memahami batas simulasi ini terlebih dahulu.',
      );
      return;
    }
    if (!isRvsInputs(inputs)) {
      setMessage(
        'Periksa input. Lantai harus bilangan bulat 1–200 atau dikosongkan.',
      );
      return;
    }
    if (
      (inputs.code === 'pre' || inputs.code === 'post') &&
      !observations.codeSource.trim()
    ) {
      setMessage(
        'Catat dasar pemilihan pre-code / post-benchmark. Tahun acuan tidak ditentukan otomatis.',
      );
      observationsRef.current?.showModal();
      requestAnimationFrame(() => codeSourceRef.current?.focus());
      return;
    }
    const record: RvsRecord = {
      version: 1,
      form: 'FEMA-P154-2015-HIGH',
      inputs: { ...inputs },
      observations: { ...observations },
      recordedBy: screener,
      savedAt: new Date().toISOString(),
      demoAcknowledged: true,
    };
    if (onSave && !onSave(record)) {
      setMessage(
        'Catatan tidak tersimpan. Periksa penugasan dan status laporan.',
      );
      return;
    }
    setResult({ ...inputs });
    setMessage(
      onSave
        ? 'Input simulasi disimpan pada laporan. Belum divalidasi ahli.'
        : 'Simulasi dihitung. Catatan di halaman latihan ini tidak disimpan setelah keluar atau refresh.',
    );
    requestAnimationFrame(() => focusAndReveal(resultRef.current));
  }
  function select(
    key: keyof RvsInputs,
    title: string,
    options: readonly string[],
  ) {
    return (
      <label key={key}>
        {title}
        <select
          value={inputs[key]}
          onChange={(event) => change(key, event.target.value)}
        >
          {options.map((value) => (
            <option key={value} value={value}>
              {labels[value] ?? value}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <section className="rvs-editor">
      <span className="ws-badge">FEMA P-154 · LEVEL 1 · HIGH SEISMICITY</span>
      <h2>Input RVS dari formulir</h2>
      <p>
        HIGH adalah tabel referensi yang dipilih, bukan hasil penetapan zona
        lokasi bangunan. Identitas, lokasi, fungsi, dan tahun bangunan mengikuti
        laporan induk.
      </p>
      <p>
        <a href={rvsHandbook} target="_blank" rel="noreferrer">
          Pedoman identifikasi dan penggunaan modifier ↗
        </a>
      </p>
      <form className="report-form" onSubmit={submit}>
        <div className="rvs-section-list">
          <SectionDialog
            id={`${id}-level`}
            index={1}
            title="Input perhitungan Level 1"
            hint="Tipe bangunan, lantai, tanah, ketidakberaturan, dan status kode. Biarkan DNK bila belum diketahui."
            progress={`${levelChosen.length} dari ${levelKeys.length} sudah ditentukan`}
            chosen={levelChosen}
            done={
              reviewed.includes(1) || levelChosen.length === levelKeys.length
            }
            onDone={() => markReviewed(1)}
            dialogRef={levelRef}
          >
            <div className="report-registration-grid">
              {select('buildingType', 'Tipe bangunan FEMA', [
                'DNK',
                ...buildingTypes,
              ])}
              <label>
                Lantai di atas tanah
                <input
                  value={inputs.stories}
                  inputMode="numeric"
                  maxLength={3}
                  onChange={(event) => change('stories', event.target.value)}
                />
              </label>
              {select('soil', 'Tipe tanah', [
                'DNK',
                'A',
                'B',
                'C',
                'D',
                'E',
                'F',
              ])}
              {select('vertical', 'Ketidakberaturan vertikal', [
                'DNK',
                'none',
                'moderate',
                'severe',
              ])}
              {select('plan', 'Ketidakberaturan denah', ['DNK', 'no', 'yes'])}
              {select('code', 'Status kode bangunan', [
                'DNK',
                'neither',
                'pre',
                'post',
              ])}
            </div>
            <p className="ws-muted">
              Kode pre-code dan post-benchmark tidak disimpulkan dari tahun
              bangunan Indonesia. Pilih berdasarkan acuan yang diperiksa ahli.
              DNK pada tanah memakai asumsi D sesuai formulir; tanah F dan
              kombinasi NA menghentikan perhitungan.
            </p>
          </SectionDialog>
          <SectionDialog
            id={`${id}-hazard`}
            index={2}
            title="Bahaya geologi, kedekatan, dan elemen jatuh"
            hint="Tandai Ya atau Tidak untuk tiap bahaya yang diamati. DNK berarti belum diketahui, bukan tidak ada."
            progress={`${hazardChosen.length} dari ${hazardFields.length} sudah ditentukan`}
            chosen={hazardChosen}
            done={
              reviewed.includes(2) ||
              hazardChosen.length === hazardFields.length
            }
            onDone={() => markReviewed(2)}
            dialogRef={hazardRef}
          >
            <div className="report-registration-grid">
              {hazardFields.map(([key, label]) =>
                select(key, label, ['DNK', 'no', 'yes']),
              )}
            </div>
          </SectionDialog>
          <SectionDialog
            id={`${id}-notes`}
            index={3}
            title="Data survei, cakupan pemeriksaan, dan komentar"
            hint={`Opsional. Pemeriksa: ${screener}. Semua isian bersifat catatan dan tidak mengubah skor.`}
            progress={`${notesFilled} dari ${observationFields.length} catatan terisi · opsional`}
            chosen={[]}
            done={reviewed.includes(3)}
            onDone={() => markReviewed(3)}
            dialogRef={observationsRef}
          >
            <div className="report-registration-grid">
              {observationFields.map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  {type === 'textarea' ? (
                    <textarea
                      value={observations[key]}
                      maxLength={1000}
                      onChange={(event) =>
                        setObservations({
                          ...observations,
                          [key]: event.target.value,
                        })
                      }
                    />
                  ) : (
                    <input
                      ref={key === 'codeSource' ? codeSourceRef : undefined}
                      type={type}
                      value={observations[key]}
                      maxLength={1000}
                      onChange={(event) =>
                        setObservations({
                          ...observations,
                          [key]: event.target.value,
                        })
                      }
                    />
                  )}
                </label>
              ))}
            </div>
          </SectionDialog>
        </div>
        <p className="ws-muted">
          Foto/sketsa dan perhitungan Level 2 belum termasuk modul ini; catat
          referensi lampiran pada komentar. Keputusan evaluasi tidak ditentukan
          oleh skor secara otomatis.
        </p>
        <label className="report-checkbox">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          <span>
            Saya memahami bahwa hasil ini simulasi yang belum divalidasi, bukan
            sertifikat aman.
          </span>
        </label>
        <button className="ws-primary" type="submit">
          {onSave
            ? 'Simpan input dan lihat hasil simulasi'
            : 'Hitung simulasi RVS'}
        </button>
        {message && (
          <p role="status" className="ws-notice">
            {message}
          </p>
        )}
      </form>
      {result && (
        <div ref={resultRef} tabIndex={-1}>
          <RvsResult inputs={result} />
          <QrPanel inputs={result} />
        </div>
      )}
    </section>
  );
}
