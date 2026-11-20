import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import type { Report } from '../../lib/reportDemo';
import ConfirmSubmit from '../../components/ConfirmSubmit';

export default function ReportCompletenessReview({
  report,
  onUpdate,
}: {
  report: Report;
  onUpdate: (event: FormEvent<HTMLFormElement>, report: Report) => void;
}) {
  const id = useId();
  const [decision, setDecision] = useState<'return' | 'verify' | ''>('');
  return (
    <form
      className="report-form report-completeness-review"
      onSubmit={(event) => onUpdate(event, report)}
    >
      <fieldset className="report-completeness-options" aria-describedby={id}>
        <legend>Apakah data laporan sudah lengkap?</legend>
        <p id={id} className="ws-muted">
          Periksa data bangunan dan alamat kunjungan sebelum menentukan tindak
          lanjut.
        </p>
        <div className="report-completeness-choices">
          {(
            [
              [
                'return',
                'Perlu perbaikan',
                'Kembalikan ke pelapor untuk dilengkapi.',
              ],
              ['verify', 'Data lengkap', 'Lanjutkan ke penugasan pesurvei.'],
            ] as const
          ).map(([value, title, text]) => (
            <label className="report-completeness-choice" key={value}>
              <input
                type="radio"
                name="completeness"
                value={value}
                checked={decision === value}
                onChange={() => setDecision(value)}
                required
              />
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {decision === 'return' && (
        <label>
          Catatan perbaikan untuk pelapor
          <textarea
            name="note"
            required
            maxLength={1000}
            placeholder="Sebutkan data yang kurang dan apa yang perlu diperbaiki."
          />
        </label>
      )}
      {decision === 'verify' && (
        <p className="ws-muted">
          Setelah disimpan, pilih pesurvei di halaman Penugasan survei. Data
          lengkap bukan pernyataan keamanan bangunan.
        </p>
      )}
      {decision === 'return' && (
        <ConfirmSubmit
          value="return"
          label="Kembalikan ke pelapor"
          title="Kembalikan laporan ke pelapor?"
          description="Pelapor menerima catatan perbaikanmu, lalu perlu memperbaiki dan mengirim ulang laporan sebelum bisa ditugaskan."
          confirmLabel="Ya, kembalikan"
        />
      )}
      {decision === 'verify' && (
        <button className="ws-primary" value="verify">
          Data lengkap, lanjut ke penugasan
        </button>
      )}
    </form>
  );
}
