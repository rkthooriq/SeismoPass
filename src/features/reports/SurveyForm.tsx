import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Notice from '../../components/Notice';
import { scheduleConfirmed } from '../../lib/reportDemo';
import type { DemoAccount, Report } from '../../lib/reportDemo';
import type { RvsRecord } from '../../lib/rvs';
import { reviewNoteLabel } from '../../lib/ownerNextStep';
import { focusAndReveal } from '../../lib/reveal';
import {
  readVisitDraft,
  visitDraftKey,
  writeVisitDraft,
} from '../../lib/visitDraft';
import RvsForm from '../rvs/RvsForm';
import SavedRvsResult from '../rvs/SavedRvsResult';
import ReportTimeline from './ReportTimeline';
import './owner-workspace.css';
import { formatDate } from '../../lib/dateFormat';
import { localToday, validDate } from '../../lib/ownerProgress';
import { validateSurveyVisit } from '../../lib/surveyVisit';

const steps = ['Kunjungan', 'Input RVS', 'Periksa & kirim'] as const;

function BackLink() {
  return (
    <a className="owner-back" href="#/dashboard/tasks">
      <span aria-hidden="true">←</span> Penugasan saya
    </a>
  );
}

/**
 * The surveyor's own page for one assignment: record the visit, optionally
 * fill the RVS simulation, then send everything for the admin's check.
 */
export default function SurveyForm({
  report,
  account,
  accounts,
  onStart,
  onRvs,
  onSubmit,
}: {
  report: Report | undefined;
  account: DemoAccount;
  accounts: DemoAccount[];
  onStart: (report: Report) => boolean;
  onRvs: (report: Report, record: RvsRecord) => boolean;
  onSubmit: (report: Report, date: string, note: string) => boolean;
}) {
  const [step, setStep] = useState(0);
  // Filled on site or right after the visit, so today is the usual answer.
  // Unsent notes are kept as a draft for this report, so leaving the page or
  // refreshing it does not lose them; sending the visit clears the draft.
  const draftKey = visitDraftKey(account.id, report?.id ?? '');
  const [initialDraft] = useState(() =>
    readVisitDraft(() => window.sessionStorage, draftKey),
  );
  const [draftState, setDraftState] = useState<
    'idle' | 'restored' | 'saved' | 'unavailable'
  >(initialDraft ? 'restored' : 'idle');
  const [date, setDateValue] = useState(
    initialDraft?.date ?? report?.visitDate ?? localToday(),
  );
  const [note, setNoteValue] = useState(
    initialDraft?.note ?? report?.visitNote ?? '',
  );
  function saveVisitDraft(date: string, note: string) {
    const saved = writeVisitDraft(() => window.sessionStorage, draftKey, {
      date,
      note,
    });
    setDraftState(
      !saved ? 'unavailable' : date || note.trim() ? 'saved' : 'idle',
    );
  }
  function setDate(value: string) {
    setDateValue(value);
    saveVisitDraft(value, note);
    if (validDate(value) && value <= localToday())
      setErrors((previous) =>
        previous.date ? { ...previous, date: undefined } : previous,
      );
  }
  function setNote(value: string) {
    setNoteValue(value);
    saveVisitDraft(date, value);
    if (value.trim() && value.length <= 1000)
      setErrors((previous) =>
        previous.note ? { ...previous, note: undefined } : previous,
      );
  }
  const [errors, setErrors] = useState<{ date?: string; note?: string }>({});
  const [message, setMessage] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);

  const editable =
    report &&
    report.assignee === account.id &&
    ['Dalam survei', 'Perlu revisi'].includes(report.status);

  if (!report || report.assignee !== account.id)
    return (
      <div className="owner-detail">
        <BackLink />
        <section className="ws-panel">
          <h2>Penugasan tidak ditemukan</h2>
          <p className="ws-muted">
            Laporan ini tidak ditugaskan kepadamu atau sudah tidak tersedia.
          </p>
        </section>
      </div>
    );

  if (report.status === 'Ditugaskan')
    return (
      <div className="owner-detail">
        <BackLink />
        <section className="ws-panel report-form">
          <h2>{report.title}</h2>
          {report.appointment && (
            <Notice
              tone={scheduleConfirmed(report) ? 'success' : 'info'}
              title="Jadwal kunjungan"
            >
              <p>
                {formatDate(report.appointment.date)} ·{' '}
                {report.appointment.slot}
              </p>
            </Notice>
          )}
          {scheduleConfirmed(report) ? (
            <>
              <p className="ws-muted">
                Jadwal sudah dikonfirmasi pelapor. Tekan Mulai survei saat kamu
                tiba di lokasi, lalu catat kunjungan dan input RVS di halaman
                ini.
              </p>
              <div className="report-actions">
                <button
                  type="button"
                  className="ws-primary"
                  onClick={() => onStart(report)}
                >
                  Mulai survei
                </button>
              </div>
            </>
          ) : (
            <Notice tone="warning" title="Survei belum bisa dimulai">
              <p>
                {report.appointment?.response === 'change-requested'
                  ? 'Pelapor meminta jadwal lain. Tunggu admin mengusulkan jadwal baru dan pelapor mengonfirmasinya.'
                  : report.appointment
                    ? 'Jadwal masih menunggu konfirmasi pelapor. Jangan berkunjung sebelum jadwal dikonfirmasi.'
                    : 'Admin belum mengusulkan jadwal kunjungan.'}
              </p>
            </Notice>
          )}
        </section>
      </div>
    );

  if (!editable)
    return (
      <div className="owner-detail">
        <BackLink />
        <section className="ws-panel">
          <h2>Hasil survei sudah dikirim</h2>
          <p className="ws-muted">
            Status laporan: {report.status}. Isian terkunci selama ditinjau
            admin. Kamu bisa mengubahnya lagi jika admin meminta revisi.
          </p>
          <a href="#/dashboard/history">Buka riwayat survei →</a>
        </section>
      </div>
    );

  function moveTo(next: number) {
    setStep(next);
    setMessage('');
    requestAnimationFrame(() => focusAndReveal(heading.current));
  }

  function checkVisit(): boolean {
    const next = validateSurveyVisit(date, note);
    setErrors(next);
    if (next.date || next.note) {
      setStep(0);
      setMessage('');
      requestAnimationFrame(() =>
        focusAndReveal(
          document.getElementById(next.date ? 'survey-date' : 'survey-note'),
          'center',
        ),
      );
      return false;
    }
    return true;
  }

  function submitVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checkVisit()) moveTo(1);
  }

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!report) return;
    if (!checkVisit()) return;
    if (onSubmit(report, date, note.trim()))
      writeVisitDraft(() => window.sessionStorage, draftKey, null);
    else
      setMessage(
        'Hasil survei belum terkirim. Periksa tanggal, catatan, dan status penugasan.',
      );
  }

  const revision = report.status === 'Perlu revisi';
  return (
    <div className="owner-detail">
      <div className="report-detail-heading">
        <BackLink />
        <ReportTimeline
          activity={report.activity}
          accounts={accounts}
          reportTitle={report.title}
        />
      </div>
      <section className="ws-panel report-form owner-registration">
        <div className="owner-section-title">
          <div>
            <span className="owner-kicker">
              {report.id} · {revision ? 'Revisi survei' : 'Hasil survei'}
            </span>
            <h2 ref={heading} tabIndex={-1}>
              {report.title}
            </h2>
          </div>
          <span className="owner-chip">
            Langkah {step + 1} dari {steps.length}
          </span>
        </div>
        <p>
          {report.location || 'Lokasi belum diisi'}
          {report.address ? ` · ${report.address}` : ''}
        </p>
        <ol className="owner-form-steps" aria-label="Tahap pengisian survei">
          {steps.map((label, index) => (
            <li
              key={label}
              className={
                step === index
                  ? 'is-current'
                  : step > index
                    ? 'is-complete'
                    : ''
              }
            >
              <button
                type="button"
                aria-current={step === index ? 'step' : undefined}
                disabled={index > step}
                onClick={() => moveTo(index)}
              >
                <span>{index + 1}</span>
                {label}
              </button>
            </li>
          ))}
        </ol>

        {draftState === 'unavailable' ? (
          <Notice tone="warning" title="Draf belum tersimpan" role="status">
            <p>
              Perubahan terakhir belum tersimpan di browser. Catatan tetap ada
              di halaman ini; salin catatanmu sebelum keluar atau memuat ulang.
            </p>
            <button
              type="button"
              className="ws-secondary"
              onClick={() => saveVisitDraft(date, note)}
            >
              Coba simpan draf
            </button>
          </Notice>
        ) : (
          <p className="ws-muted" role="status">
            {draftState === 'saved'
              ? 'Draf tanggal dan catatan kunjungan tersimpan di tab ini. Belum dikirim ke admin.'
              : draftState === 'restored'
                ? 'Draf tanggal dan catatan kunjungan dipulihkan. Belum dikirim ke admin.'
                : 'Tanggal dan catatan kunjungan disimpan sebagai draf saat diubah. Kirim ke admin pada langkah terakhir.'}
          </p>
        )}

        <div hidden={step !== 0} className="owner-form-section">
          {report.reviewNote && revision && (
            <Notice tone="warning" title={reviewNoteLabel(report.status).title}>
              <p>{report.reviewNote}</p>
            </Notice>
          )}
          <div className="role-assignment-note">
            <strong>Catatan penugasan dari admin</strong>
            <p>{report.assignmentNote || 'Tidak ada catatan penugasan.'}</p>
            {report.appointment && (
              <p>
                Jadwal usulan: {formatDate(report.appointment.date)} ·{' '}
                {report.appointment.slot} (
                {report.appointment.response === 'confirmed'
                  ? 'dikonfirmasi pelapor'
                  : report.appointment.response === 'change-requested'
                    ? 'pelapor meminta perubahan'
                    : 'menunggu konfirmasi pelapor'}
                )
              </p>
            )}
            {report.contactPhone && (
              <p>Kontak pelapor: {report.contactPhone}</p>
            )}
          </div>
          <form className="report-form" onSubmit={submitVisit} noValidate>
            <div className="survey-form-head">
              <h3>Catat kunjungan</h3>
              <p className="ws-muted">
                Isi saat kamu di lokasi atau setelah kunjungan selesai.
              </p>
            </div>
            <label htmlFor="survey-date">
              Tanggal kunjungan *
              <input
                id="survey-date"
                type="date"
                value={date}
                max={localToday()}
                onChange={(event) => setDate(event.target.value)}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? 'survey-error-date' : undefined}
              />
            </label>
            {errors.date && (
              <small className="ws-error" id="survey-error-date">
                {errors.date}
              </small>
            )}
            <label htmlFor="survey-note">
              Catatan kunjungan *
              <textarea
                id="survey-note"
                value={note}
                maxLength={1000}
                rows={5}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Kondisi yang diamati, kendala akses, dan kebutuhan tindak lanjut."
                aria-invalid={!!errors.note}
                aria-describedby={errors.note ? 'survey-error-note' : undefined}
              />
            </label>
            {errors.note && (
              <small className="ws-error" id="survey-error-note">
                {errors.note}
              </small>
            )}
            <p className="ws-muted">
              * Wajib. Catatan ini belum terkirim sampai kamu menekan Kirim di
              langkah terakhir.
            </p>
            <div className="report-actions">
              <button type="submit" className="ws-primary">
                Lanjut ke input RVS
              </button>
            </div>
          </form>
        </div>

        {/* Kept mounted so unsaved RVS choices survive moving between steps. */}
        <div hidden={step !== 1} className="owner-form-section">
          <p className="ws-muted">
            Opsional. Tekan “Simpan input” agar hasil simulasi ikut terkirim;
            pilihan yang belum disimpan tidak ikut. Simulasi belum divalidasi
            ahli dan bukan sertifikat aman.
          </p>
          <RvsForm
            initial={report.rvs}
            stories={report.floors}
            screener={account.name}
            onSave={(record) => onRvs(report, record)}
          />
          <div className="report-actions">
            <button
              type="button"
              className="ws-secondary"
              onClick={() => moveTo(0)}
            >
              Sebelumnya
            </button>
            <button
              type="button"
              className="ws-primary"
              onClick={() => moveTo(2)}
            >
              Lanjut periksa
            </button>
          </div>
        </div>

        <div hidden={step !== 2} className="owner-form-section">
          <div className="owner-review">
            <span className="owner-kicker">Periksa sebelum mengirim</span>
            <h3>Kunjungan {date ? formatDate(date) : '—'}</h3>
            <p>{note.trim() || 'Catatan kunjungan belum diisi.'}</p>
            <div>
              <span>
                {report.rvs
                  ? `Input RVS tersimpan ${formatDate(report.rvs.savedAt.slice(0, 10))}`
                  : 'Tanpa input RVS'}
              </span>
            </div>
          </div>
          <Notice tone="info" title="Mengapa dikirim ke admin?">
            <p>
              Admin memeriksa kelengkapan administrasi hasil surveimu, bukan
              menilai keamanan bangunan. Jika lengkap, admin menutup laporan dan
              pelapor membaca hasilnya. Jika ada yang kurang, laporan kembali
              kepadamu dengan catatan revisi.
            </p>
          </Notice>
          {report.rvs && (
            <SavedRvsResult record={report.rvs} reportTitle={report.title} />
          )}
          <form className="report-form" onSubmit={send}>
            {message && (
              <Notice
                tone="error"
                title="Hasil survei belum terkirim"
                role="alert"
              >
                <p>{message}</p>
              </Notice>
            )}
            <div className="report-actions">
              <button
                type="button"
                className="ws-secondary"
                onClick={() => moveTo(1)}
              >
                Sebelumnya
              </button>
              <button type="submit" className="ws-primary">
                {revision
                  ? 'Kirim revisi untuk ditinjau'
                  : 'Kirim hasil survei untuk ditinjau'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
