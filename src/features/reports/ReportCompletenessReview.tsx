import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import type { DemoAccount, Report } from '../../lib/reportDemo';
import { canSurvey } from '../../lib/surveyorAccess';
import ConfirmSubmit from '../../components/ConfirmSubmit';
import Notice from '../../components/Notice';
import AssignmentFields from './AssignmentFields';

export default function ReportCompletenessReview({
  report,
  accounts,
  onUpdate,
}: {
  report: Report;
  accounts: DemoAccount[];
  onUpdate: (event: FormEvent<HTMLFormElement>, report: Report) => void;
}) {
  const id = useId();
  const [decision, setDecision] = useState<'return' | 'verify' | ''>('');
  const hasSurveyor = accounts.some(
    (person) => canSurvey(person) && person.emailVerified,
  );
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
              [
                'verify',
                'Data lengkap',
                'Lanjutkan dengan menugaskan pesurvei.',
              ],
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
      {decision === 'verify' &&
        (hasSurveyor ? (
          <>
            <p className="ws-muted">
              Data lengkap bukan pernyataan keamanan bangunan. Pilih pesurvei
              dan jadwal kunjungan agar laporan langsung ditugaskan.
            </p>
            <div className="report-form role-assignment-form">
              <h3>Tugaskan pesurvei</h3>
              <AssignmentFields report={report} accounts={accounts} />
            </div>
          </>
        ) : (
          <Notice tone="warning" title="Belum ada pesurvei aktif">
            <p>
              Laporan masuk ke antrean Penugasan survei sampai ada pesurvei
              aktif. Daftarkan pesurvei di Kelola pesurvei.
            </p>
          </Notice>
        ))}
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
          {hasSurveyor
            ? 'Setujui dan tugaskan'
            : 'Data lengkap, simpan ke antrean'}
        </button>
      )}
    </form>
  );
}
