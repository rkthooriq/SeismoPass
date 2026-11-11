import { useRef, useState } from 'react';
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
export default function RvsForm({
  initial,
  stories = '',
  screener = 'Pesurvei demo',
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
  function change(key: keyof RvsInputs, value: string) {
    setInputs((previous) => ({ ...previous, [key]: value }));
    setResult(null);
    setMessage('');
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acknowledged) {
      setMessage(
        'Konfirmasi penggunaan simulasi dan data fiktif terlebih dahulu.',
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
    requestAnimationFrame(() => resultRef.current?.focus());
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
        Gunakan data fiktif untuk mencoba formulir yang kamu kirim. HIGH adalah
        tabel referensi yang dipilih, bukan hasil penetapan zona lokasi
        bangunan. Identitas, lokasi, fungsi, dan tahun bangunan mengikuti
        laporan induk.
      </p>
      <p>
        <a href={rvsHandbook} target="_blank" rel="noreferrer">
          Pedoman identifikasi dan penggunaan modifier ↗
        </a>
      </p>
      <form className="report-form" onSubmit={submit}>
        <fieldset>
          <legend>1. Input perhitungan Level 1</legend>
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
            bangunan Indonesia. Pilih berdasarkan acuan yang diperiksa ahli. DNK
            pada tanah memakai asumsi D sesuai formulir; tanah F dan kombinasi
            NA menghentikan perhitungan.
          </p>
        </fieldset>
        <fieldset>
          <legend>2. Bahaya geologi, kedekatan, dan elemen jatuh</legend>
          <div className="report-registration-grid">
            {hazardFields.map(([key, label]) =>
              select(key, label, ['DNK', 'no', 'yes']),
            )}
          </div>
        </fieldset>
        <details className="rvs-observations" open>
          <summary>3. Data survei, cakupan pemeriksaan, dan komentar</summary>
          <p>
            Pemeriksa: {screener}. Semua isian tambahan bersifat catatan; tidak
            otomatis mengubah skor.
          </p>
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
        </details>
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
            Saya memakai data fiktif dan memahami bahwa hasil ini simulasi belum
            divalidasi, bukan sertifikat aman.
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
