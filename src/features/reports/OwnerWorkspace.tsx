import { useEffect, useId, useRef, useState } from 'react';
import type React from 'react';
import type { FormEvent } from 'react';
import {
  isSampleReport,
  validateReportRegistration,
} from '../../lib/reportDemo';
import type { DemoAccount, Report } from '../../lib/reportDemo';
import type { OwnerAction } from '../../lib/ownerProgress';
import { timeSlots } from '../../lib/ownerProgress';
import {
  ownerDetailFocus,
  ownerChipClass,
  ownerStageKey,
  ownerStageLabelFor,
  ownerStepFor,
  ownerFilterGroups,
  reviewNoteLabel,
  sortByOwnerTurn,
} from '../../lib/ownerNextStep';
import ReportPassport from './ReportPassport';
import ReportTimeline from './ReportTimeline';
import FilterMenu from '../../components/FilterMenu';
import Pagination from '../../components/Pagination';
import Notice from '../../components/Notice';
import type { NoticeTone } from '../../components/Notice';
import usePagination from '../../components/usePagination';
import ReportSubmissionDetails from './ReportSubmissionDetails';
import './owner-workspace.css';
import { formatDate } from '../../lib/dateFormat';

// Lokasi, foto, and the building data are entered in Buat laporan. The
// detail page has no tabs; ownerDetailFocus picks its main content per stage.
const followUpLabels = {
  consultation: 'Ingin berkonsultasi',
  explanation: 'Butuh penjelasan',
  later: 'Melanjutkan nanti',
};
const displayDate = formatDate;
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Isometric house with lit and shaded faces so it reads as a 3D object.
function BuildingMark({ small = false }: { small?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const g = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${g(name)})`;
  return (
    <svg
      className={small ? 'owner-building-mark is-small' : 'owner-building-mark'}
      viewBox="0 8 180 138"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={g('lit')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFDF8" />
          <stop offset="1" stopColor="#F1E6D6" />
        </linearGradient>
        <linearGradient id={g('shade')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E3D2BC" />
          <stop offset="1" stopColor="#CDB698" />
        </linearGradient>
        <linearGradient id={g('roof')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A2714D" />
          <stop offset="1" stopColor="#7A4C30" />
        </linearGradient>
        <linearGradient id={g('roofBack')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6E432A" />
          <stop offset="1" stopColor="#5A3622" />
        </linearGradient>
        <linearGradient id={g('glass')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFE0E4" />
          <stop offset="1" stopColor="#9DB6BD" />
        </linearGradient>
        <linearGradient id={g('ground')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EFE3D2" />
          <stop offset="1" stopColor="#DCC8AE" />
        </linearGradient>
        <filter id={g('blur')} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>
      {/* Ground slab with visible thickness. */}
      <path d="M90 62 166 100 90 138 14 100Z" fill={url('ground')} />
      <path d="M14 100v5l76 38v-5Z" fill="#CDB698" />
      <path d="M90 138v5l76-38v-5Z" fill="#BCA284" />
      {/* Soft cast shadow to the lower right. */}
      <path
        d="M90 126 142 100l20 9-52 26Z"
        fill="#7A5A40"
        opacity="0.28"
        filter={url('blur')}
      />
      {/* Walls: left face lit, right face in shade. */}
      <path d="M38 64 90 90v36L38 100Z" fill={url('lit')} />
      <path d="M90 90 116 47l26 17v36l-52 26Z" fill={url('shade')} />
      <path d="M90 90v36" stroke="#B89A80" strokeWidth="1" opacity="0.6" />
      {/* Door and windows sit on the faces they belong to. */}
      <path d="M66.6 92.7 77 97.9v21.6l-10.4-5.2Z" fill="#8A5A3B" />
      <path d="M68 95.3l7.6 3.8v18" stroke="#6E432A" strokeWidth="1" />
      <circle cx="74.6" cy="108.3" r="0.9" fill="#F3E4CF" />
      <path d="M45.8 78.7 57.8 84.7v10.8l-12-6Z" fill={url('glass')} />
      <path
        d="M45.8 78.7 57.8 84.7v10.8l-12-6Z M51.8 81.7v10.8"
        stroke="#FFFDF8"
        strokeWidth="1.6"
      />
      <path d="M105.6 94.8 121.2 87v10.8l-15.6 7.8Z" fill={url('glass')} />
      <path
        d="M105.6 94.8 121.2 87v10.8l-15.6 7.8Z M113.4 90.9v10.8"
        stroke="#EADBC6"
        strokeWidth="1.6"
      />
      {/* Roof: back plane first, then the front plane and its fascia. */}
      <path d="M120 48 60 18l26 18 60 30Z" fill={url('roofBack')} />
      <path d="M34 63 94 93l26-45-60-30Z" fill={url('roof')} />
      <path d="M34 63 94 93v4L34 67Z" fill="#5A3622" />
      <path d="M94 93 120 48v4L94 97Z" fill="#4A2C1B" />
      <path d="M60 18 120 48" stroke="#C4936C" strokeWidth="1.4" />
      {/* Tree: two-tone cone so it shares the same light direction. */}
      <path d="M154 102V90" stroke="#8A6A50" strokeWidth="3" />
      <path d="M154 56 142 90l12 4Z" fill="#B7A27E" />
      <path d="M154 56l12 34-12 4Z" fill="#8F7A58" />
    </svg>
  );
}

function EmptyNotice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="owner-empty-note">
      <span className="owner-empty-symbol" aria-hidden="true">
        ◷
      </span>
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}

function Schedule({
  report,
  accounts,
  save,
}: {
  report: Report;
  accounts: DemoAccount[];
  save: (action: OwnerAction) => boolean;
}) {
  const [feedback, setFeedback] = useState<{
    text: string;
    tone: NoticeTone;
  }>({ text: '', tone: 'success' });
  const message = feedback.text;
  const setMessage = (text: string, tone: NoticeTone = 'success') =>
    setFeedback({ text, tone });
  // "Minta jadwal lain" only opens the form; nothing is recorded until the
  // owner sends an alternative time, so a request never arrives empty.
  const [changing, setChanging] = useState(false);
  const appointment = report.appointment;
  const available = report.ownerProgress?.availability;
  // The visit time can be chosen or changed from the moment the report is
  // sent, so the admin can use it while reviewing and assigning.
  const canRequest =
    ['Dikirim', 'Siap disurvei', 'Ditugaskan'].includes(report.status) &&
    !report.visitDate;
  const confirmed = appointment?.response === 'confirmed';
  const pending = appointment?.response === 'change-requested';
  const canConfirm =
    appointment?.response === 'proposed' &&
    report.status === 'Ditugaskan' &&
    appointment.date >= today();
  const showForm = canRequest && (!appointment || changing);
  const surveyor = accounts.find((person) => person.id === report.assignee);
  const id = useId();
  const dateRef = useRef<HTMLInputElement>(null);
  function openForm() {
    setMessage('');
    setChanging(true);
    requestAnimationFrame(() => dateRef.current?.focus());
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = save({
      type: 'availability',
      date: String(form.get('date')),
      slot: String(form.get('slot')),
      note: String(form.get('note')),
    });
    if (!ok) {
      setMessage(
        'Pilih tanggal hari ini atau setelahnya dan rentang waktu.',
        'error',
      );
      return;
    }
    setChanging(false);
    setMessage(
      appointment
        ? 'Permintaan jadwal lain terkirim. Admin akan mengusulkan jadwal baru di halaman ini.'
        : 'Waktu kunjungan disimpan. Admin memakainya saat menugaskan pesurvei.',
    );
  }
  const status = message && (
    <Notice tone={feedback.tone} role="status">
      <p>{message}</p>
    </Notice>
  );
  return (
    <div className="owner-detail-grid is-single">
      <section className="owner-sheet owner-schedule">
        <div className="owner-section-title">
          <div>
            <span className="owner-kicker">Koordinasi kunjungan</span>
            <h2>Atur waktu yang cocok</h2>
          </div>
          <span className="owner-chip">
            {confirmed
              ? 'Dikonfirmasi'
              : pending
                ? 'Menunggu jadwal baru'
                : 'Koordinasi'}
          </span>
        </div>
        {report.visitDate ? (
          <EmptyNotice title="Kunjungan sudah dicatat">
            Tanggal {displayDate(report.visitDate)}. Catatan kunjungan dari
            pesurvei ada di bagian atas halaman ini.
          </EmptyNotice>
        ) : appointment ? (
          <div className="owner-appointment">
            <span>
              {pending ? 'Jadwal lama dari admin' : 'Usulan dari admin'}
            </span>
            <h3>{displayDate(appointment.date)}</h3>
            <p>{appointment.slot}</p>
            <p>
              {surveyor
                ? `Pesurvei: ${surveyor.name}`
                : 'Pesurvei belum ditentukan'}
            </p>
            <Notice
              tone={confirmed ? 'success' : pending ? 'warning' : 'info'}
              title={
                confirmed
                  ? 'Jadwal dikonfirmasi'
                  : pending
                    ? 'Jadwal perlu diatur ulang'
                    : 'Konfirmasi jadwal kunjungan'
              }
            >
              <p>
                {confirmed
                  ? appointment.confirmedBy === 'admin'
                    ? 'Admin mencatat persetujuanmu untuk jadwal ini dari telepon atau pesan. Jika keliru, minta jadwal lain.'
                    : 'Kamu sudah menyetujui jadwal ini.'
                  : pending
                    ? 'Kamu meminta jadwal lain. Jadwal ini tidak berlaku sampai admin mengusulkan jadwal baru.'
                    : 'Periksa jadwal ini, lalu konfirmasi atau minta jadwal lain.'}
              </p>
            </Notice>
            {pending && available && (
              <div className="owner-saved-note">
                <strong>Waktu yang kamu minta</strong>
                <p>
                  {displayDate(available.date)} · {available.slot}
                </p>
                {available.note && <p>{available.note}</p>}
              </div>
            )}
            {!changing && (canConfirm || canRequest) && (
              <div className="owner-actions">
                {canConfirm && (
                  <button
                    className="ws-primary"
                    type="button"
                    onClick={() => {
                      if (save({ type: 'appointment', response: 'confirmed' }))
                        setMessage(
                          'Jadwal dikonfirmasi. Pesurvei dan admin melihat konfirmasimu.',
                        );
                      else
                        setMessage('Jadwal belum dapat dikonfirmasi.', 'error');
                    }}
                  >
                    Jadwal ini cocok
                  </button>
                )}
                {canRequest && (
                  <button
                    type="button"
                    className="ws-secondary"
                    onClick={openForm}
                    aria-expanded={changing}
                  >
                    {pending ? 'Ubah waktu yang diminta' : 'Minta jadwal lain'}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <EmptyNotice
            title={
              report.status === 'Draf'
                ? 'Kirim laporan terlebih dahulu'
                : available
                  ? 'Waktu pilihanmu sudah tercatat'
                  : 'Pilih waktu kunjungan'
            }
          >
            {available
              ? 'Saat menugaskan pesurvei, admin memakai waktu ini. Jika waktunya dipakai, jadwal langsung disepakati tanpa konfirmasi ulang.'
              : 'Pilih kapan ada orang di lokasi. Admin memakainya saat menugaskan pesurvei; jika dipakai, jadwal langsung disepakati.'}
          </EmptyNotice>
        )}
        {!showForm && status}
        {showForm && (
          <form className="owner-form" onSubmit={submit}>
            <h3>
              {appointment
                ? 'Waktu lain yang cocok untukmu'
                : available
                  ? 'Ubah waktu kunjungan'
                  : 'Kapan pesurvei bisa datang?'}
            </h3>
            {appointment && (
              <p>
                {confirmed
                  ? 'Jadwal yang sudah kamu setujui akan dibatalkan. '
                  : ''}
                Admin akan mengusulkan jadwal baru berdasarkan waktu ini, lalu
                kamu mengonfirmasinya lagi di halaman ini.
              </p>
            )}
            <div className="owner-form-grid">
              <label htmlFor={`${id}-date`}>
                Tanggal
                <input
                  ref={dateRef}
                  id={`${id}-date`}
                  name="date"
                  type="date"
                  min={today()}
                  required
                  defaultValue={available?.date}
                />
              </label>
              <label htmlFor={`${id}-slot`}>
                Rentang waktu
                <select
                  id={`${id}-slot`}
                  name="slot"
                  required
                  defaultValue={available?.slot ?? ''}
                >
                  <option value="" disabled>
                    Pilih waktu
                  </option>
                  {timeSlots.map((slot) => (
                    <option key={slot}>{slot}</option>
                  ))}
                </select>
              </label>
            </div>
            <label htmlFor={`${id}-note`}>
              {appointment
                ? 'Alasan atau catatan akses (opsional)'
                : 'Catatan akses (opsional)'}
              <textarea
                id={`${id}-note`}
                name="note"
                maxLength={1000}
                rows={3}
                defaultValue={available?.note}
                placeholder={
                  appointment
                    ? 'Contoh: tanggal itu rumah kosong; pengelola ada setelah pukul 09.00.'
                    : 'Contoh: pengelola ada di lokasi setelah pukul 09.00.'
                }
              />
            </label>
            {status}
            <div className="owner-actions">
              <button className="ws-primary">
                {appointment
                  ? 'Kirim permintaan jadwal'
                  : 'Simpan waktu kunjungan'}
              </button>
              {appointment && (
                <button
                  type="button"
                  className="ws-secondary"
                  onClick={() => {
                    setChanging(false);
                    setMessage('');
                  }}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        )}
        {!appointment && available && (
          <div className="owner-saved-note">
            <strong>Waktu kunjungan pilihanmu</strong>
            <p>
              {displayDate(available.date)} · {available.slot}
            </p>
            {available.note && <p>{available.note}</p>}
          </div>
        )}
        <p className="owner-footnote owner-schedule-note">
          Jangan memasuki bagian bangunan yang membahayakan. Tidak ada
          notifikasi email atau pesan otomatis; jadwal dan nama pesurvei
          diperbarui di halaman ini.
        </p>
      </section>
    </div>
  );
}

// After the administration is closed: what is (not yet) known, and one place
// to note what the owner needs next. Expert results stay "not available";
// nothing here is a recommendation, referral, or programme application.
function Closed({
  report,
  save,
}: {
  report: Report;
  save: (action: OwnerAction) => boolean;
}) {
  const [message, setMessage] = useState('');
  const [savedOk, setSavedOk] = useState(false);
  const id = useId();
  const saved = report.ownerProgress?.followUp;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = save({
      type: 'follow-up',
      choice: String(form.get('choice')),
      note: String(form.get('note')),
    });
    setMessage(
      ok
        ? 'Catatan tersimpan. Ini belum menjadi keputusan atau rujukan ahli.'
        : 'Catatan belum dapat disimpan. Periksa isian.',
    );
    setSavedOk(ok);
  }
  return (
    <div className="owner-detail-grid is-pair">
      <section className="owner-sheet owner-closed">
        <h2>Hasil laporan</h2>
        <dl className="owner-sent-facts">
          <div>
            <dt>Screening RVS</dt>
            <dd>
              {report.rvs ? 'Simulasi, belum divalidasi ahli' : 'Belum dinilai'}
            </dd>
          </div>
          <div>
            <dt>Penilaian ahli</dt>
            <dd>Belum tersedia</dd>
          </div>
          <div>
            <dt>Rujukan pemeriksaan</dt>
            <dd>Belum ditentukan</dd>
          </div>
          <div>
            <dt>Rencana perkuatan</dt>
            <dd>Menunggu evaluasi ahli</dd>
          </div>
        </dl>
        {report.rvs && <ReportPassport report={report} limitsOnly />}
        <ReportNotes report={report} />
      </section>
      <section className="owner-sheet owner-closed">
        <h2>Catat tindak lanjut</h2>
        <p>
          Beri tahu apa yang kamu butuhkan sesudah survei. Catatan ini dibaca
          admin, bukan pengajuan bantuan.
        </p>
        <form className="owner-form" onSubmit={submit}>
          <label htmlFor={`${id}-choice`}>
            Yang kamu butuhkan
            <select
              id={`${id}-choice`}
              name="choice"
              defaultValue={saved?.choice ?? 'consultation'}
            >
              {Object.entries(followUpLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor={`${id}-note`}>
            Catatan
            <textarea
              id={`${id}-note`}
              name="note"
              rows={3}
              required
              maxLength={1000}
              defaultValue={saved?.note}
              placeholder="Contoh: saya perlu penjelasan tentang pemeriksaan lanjutan."
            />
          </label>
          <button className="ws-primary">Simpan catatan</button>
        </form>
        {message && (
          <Notice tone={savedOk ? 'success' : 'error'} role="status">
            <p>{message}</p>
          </Notice>
        )}
      </section>
    </div>
  );
}

// Read-only view of what the owner entered, in the same three steps and
// field order as the Buat laporan form. As the page's main content it gets a
// heading; folded under "Lihat isi laporan" it shows only the steps.
function SentReport({
  report,
  onEdit,
  onSubmit,
  folded = false,
}: {
  report: Report;
  onEdit: () => void;
  onSubmit: () => void;
  folded?: boolean;
}) {
  const editable = ['Draf', 'Perlu dilengkapi'].includes(report.status);
  // Missing required fields are flagged only while the owner can still fix
  // them; a sent report already passed validation.
  const missing = editable ? validateReportRegistration(report) : {};
  const missingCount = Object.keys(missing).length;
  const body = (
    <ReportSubmissionDetails report={report} markMissing={editable} />
  );
  if (folded) return <div className="owner-sent-report is-folded">{body}</div>;
  return (
    <section className="owner-sheet owner-sent-report">
      <div className="owner-sent-head">
        <div>
          <h2>
            {report.status === 'Draf' ? 'Draf laporan' : 'Laporan yang dikirim'}
          </h2>
          <p id={`${report.id}-preview-state`}>
            {!editable
              ? 'Isi laporan terkunci selama diproses admin dan pesurvei.'
              : missingCount
                ? `${missingCount} isian wajib belum diisi. Lengkapi lewat Lengkapi data, lalu kirim ke admin.`
                : 'Semua isian wajib sudah terisi. Periksa sekali lagi, lalu kirim ke admin.'}
          </p>
        </div>
        <span className="owner-chip">
          {editable ? 'Bisa diubah' : 'Terkunci'}
        </span>
      </div>
      {body}
      {editable && (
        <div className="owner-actions">
          <button type="button" className="ws-secondary" onClick={onEdit}>
            Ubah draf
          </button>
          <button
            type="button"
            className="ws-primary"
            onClick={onSubmit}
            disabled={missingCount > 0}
            aria-describedby={`${report.id}-preview-state`}
          >
            Kirim laporan
          </button>
        </div>
      )}
    </section>
  );
}

// Notes addressed to the owner or written after the visit. Shown beside the
// main content at every stage, never folded away.
function ReportNotes({ report }: { report: Report }) {
  if (!report.reviewNote && !report.visitNote) return null;
  return (
    <div className="owner-notes">
      {report.reviewNote && (
        <Notice
          tone={report.status === 'Perlu dilengkapi' ? 'warning' : 'info'}
          title={reviewNoteLabel(report.status).title}
        >
          <p>{report.reviewNote}</p>
          {/* The banner above already says what to do when the report is
              returned to the owner; repeat the hint only when it adds
              something (e.g. "no change needed" during a revision). */}
          {report.status !== 'Perlu dilengkapi' &&
            reviewNoteLabel(report.status).hint && (
              <p className="owner-note-hint">
                {reviewNoteLabel(report.status).hint}
              </p>
            )}
        </Notice>
      )}
      {report.visitNote && (
        <div className="owner-saved-note">
          <strong>Catatan kunjungan dari pesurvei</strong>
          <p>{report.visitNote}</p>
        </div>
      )}
    </div>
  );
}

function Detail({
  report,
  accounts,
  onBack,
  onEdit,
  onSave,
  onSubmit,
}: {
  report: Report;
  accounts: DemoAccount[];
  onBack: () => void;
  onEdit: () => void;
  onSave: (action: OwnerAction) => boolean;
  onSubmit: () => void;
}) {
  const focus = ownerDetailFocus(report.status);
  const id = useId();
  const step = ownerStepFor(report);
  const fold = (
    <details className="owner-report-fold">
      <summary>
        <span>
          <strong>Lihat isi laporan yang dikirim</strong>
          <small>Data bangunan, lokasi, catatan, dan foto</small>
        </span>
        <span className="owner-fold-icon" aria-hidden="true">
          ›
        </span>
      </summary>
      <SentReport report={report} onEdit={onEdit} onSubmit={onSubmit} folded />
    </details>
  );
  return (
    <div className="owner-detail">
      <div className="report-detail-heading">
        <button type="button" className="owner-back" onClick={onBack}>
          <span aria-hidden="true">←</span> Semua bangunan
        </button>
        <ReportTimeline
          activity={report.activity}
          accounts={accounts}
          reportTitle={report.title}
        />
      </div>
      <section className="owner-detail-heading">
        <BuildingMark small />
        <div>
          <span className="owner-kicker">{report.id}</span>
          <h2 tabIndex={-1} id="owner-detail-heading">
            {report.title}
          </h2>
          <p>{report.location || 'Kawasan belum diisi'}</p>
          {isSampleReport(report) && (
            <p className="owner-footnote">
              Bangunan, pin lokasi, jadwal, dan riwayat ini adalah contoh
              rekaan.
            </p>
          )}
        </div>
        <span className={`owner-chip ${ownerChipClass(report)}`}>
          {ownerStageLabelFor(report)}
        </span>
      </section>
      <div className="owner-next-banner">
        <span aria-hidden="true">↳</span>
        <div>
          <strong>{step.title}</strong>
          <p>{step.text}</p>
        </div>
        {['Draf', 'Perlu dilengkapi'].includes(report.status) && (
          <button className="ws-primary" type="button" onClick={onEdit}>
            Lengkapi data
          </button>
        )}
      </div>
      <div className="owner-detail-body">
        {/* Notes to the owner come first, as compact boxes above the
            stage's main content, so the content keeps the full width. */}
        {focus !== 'closed' && <ReportNotes report={report} />}
        {focus === 'report' && (
          <SentReport report={report} onEdit={onEdit} onSubmit={onSubmit} />
        )}
        {focus === 'schedule' && (
          <>
            <Schedule report={report} accounts={accounts} save={onSave} />
            {fold}
          </>
        )}
        {focus === 'closed' && (
          <>
            <Closed report={report} save={onSave} />
            {fold}
          </>
        )}
      </div>
      <p className="owner-footnote" id={`${id}-limit`}>
        Catatan dan perubahan mengikuti penyimpanan sesi browser. Belum ada
        pengiriman ke layanan operasional.
      </p>
    </div>
  );
}

export default function OwnerWorkspace({
  reports,
  accounts,
  onEdit,
  onSave,
  onSubmit,
  selectedId = null,
  onSelect,
}: {
  reports: Report[];
  accounts: DemoAccount[];
  onEdit: (report: Report) => void;
  onSave: (report: Report, action: OwnerAction) => boolean;
  onSubmit: (report: Report) => void;
  /** The report open in detail, taken from the URL (#/dashboard/reports/<id>). */
  selectedId?: string | null;
  /** Opens a report (or the list, with null) by changing the URL. */
  onSelect: (id: string | null) => void;
}) {
  const selected = selectedId;
  const lastOpened = useRef<string | null>(null);
  // Moving between list and detail is a navigation: focus the new view's
  // heading and start it at the top. The first render keeps the browser's
  // own position.
  const shownBefore = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (shownBefore.current === undefined) {
      shownBefore.current = selected;
      if (!selected) return;
    }
    if (shownBefore.current === selected && selected === null) return;
    shownBefore.current = selected;
    const target = selected
      ? document.getElementById('owner-detail-heading')
      : (document.getElementById(`owner-open-${lastOpened.current}`) ??
        heading.current);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({
      block: selected ? 'start' : 'center',
      behavior: 'instant',
    });
  }, [selected]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const report = reports.find((item) => item.id === selected);
  const filterGroups = ownerFilterGroups(reports);
  // Chip row like a filter bar: each group with several stages is a pill
  // that opens its stages as checkboxes; a one-stage group is a toggle pill.
  // Selection holds stage statuses; stages whose reports are gone drop out.
  const activeFilter = filter.filter((value) =>
    filterGroups.some((group) =>
      group.stages.some((stage) => stage.status === value),
    ),
  );
  const inGroup = (group: (typeof filterGroups)[number]) =>
    activeFilter.filter((value) =>
      group.stages.some((stage) => stage.status === value),
    );
  const setGroupSelection = (
    group: (typeof filterGroups)[number],
    next: string[],
  ) =>
    setFilter([
      ...activeFilter.filter((value) => !inGroup(group).includes(value)),
      ...next,
    ]);
  const visible = sortByOwnerTurn(reports).filter(
    (item) =>
      (!activeFilter.length || activeFilter.includes(ownerStageKey(item))) &&
      `${item.title} ${item.location} ${item.id}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  const pager = usePagination(
    visible,
    `${search.trim()}|${activeFilter.join(',')}`,
  );
  function select(id: string | null) {
    if (id) lastOpened.current = id;
    onSelect(id);
  }
  return (
    <div className="owner-journey">
      {report ? (
        <Detail
          key={report.id}
          report={report}
          accounts={accounts}
          onBack={() => select(null)}
          onEdit={() => onEdit(report)}
          onSave={(action) => onSave(report, action)}
          onSubmit={() => onSubmit(report)}
        />
      ) : (
        <>
          <section className="owner-building-list" aria-label="Daftar bangunan">
            {/* The page title already says "Laporan saya"; this heading stays
                for screen readers and as the focus target when going back. */}
            <h2 ref={heading} tabIndex={-1} className="owner-visually-hidden">
              Bangunan & laporan saya
            </h2>
            <div className="owner-list-toolbar">
              <label className="owner-search">
                <span className="owner-visually-hidden">Cari bangunan</span>
                <input
                  type="search"
                  placeholder="Cari nama, kawasan, atau nomor laporan"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>
            {filterGroups.length > 0 && (
              <div
                className="owner-filter-chips"
                role="group"
                aria-label="Filter status"
              >
                <button
                  type="button"
                  className="filter-chip"
                  aria-pressed={!activeFilter.length}
                  onClick={() => setFilter([])}
                >
                  Semua{' '}
                  <span className="filter-chip-badge">{reports.length}</span>
                </button>
                {filterGroups.map((group) =>
                  group.stages.length > 1 ? (
                    <FilterMenu
                      key={group.group}
                      label={group.group}
                      icon={false}
                      count={
                        inGroup(group).length
                          ? group.stages
                              .filter((stage) =>
                                inGroup(group).includes(stage.status),
                              )
                              .reduce((sum, stage) => sum + stage.count, 0)
                          : group.count
                      }
                      align="start"
                      summarize={false}
                      options={group.stages.map((stage) => ({
                        value: stage.status,
                        label: stage.label,
                        count: stage.count,
                      }))}
                      selected={inGroup(group)}
                      onChange={(next) => setGroupSelection(group, next)}
                    />
                  ) : (
                    <button
                      type="button"
                      key={group.group}
                      className="filter-chip"
                      aria-pressed={inGroup(group).length > 0}
                      onClick={() =>
                        setGroupSelection(
                          group,
                          inGroup(group).length ? [] : [group.stages[0].status],
                        )
                      }
                    >
                      {group.group}{' '}
                      <span className="filter-chip-badge">{group.count}</span>
                    </button>
                  ),
                )}
              </div>
            )}
            <p className="owner-list-count" role="status">
              {visible.length === reports.length
                ? `${reports.length} bangunan · hanya milik akunmu`
                : `${visible.length} dari ${reports.length} bangunan`}
            </p>
            {!reports.length && (
              <div className="owner-empty-note">
                <span className="owner-empty-symbol" aria-hidden="true">
                  ⌂
                </span>
                <div>
                  <h3>Belum ada laporan</h3>
                  <p>
                    Catat bangunan pertamamu. Setelah dikirim, admin memeriksa
                    datanya, lalu pesurvei dijadwalkan.
                  </p>
                  <a className="ws-primary" href="#/dashboard/new">
                    Buat laporan
                  </a>
                </div>
              </div>
            )}
            <div className="owner-building-grid" id={pager.listId}>
              {pager.items.map((item) => (
                <article className="owner-building-card" key={item.id}>
                  <div className="owner-building-card-top">
                    <span className="owner-house-icon" aria-hidden="true">
                      ⌂
                    </span>
                    <span className={`owner-chip ${ownerChipClass(item)}`}>
                      {ownerStageLabelFor(item)}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.location || 'Kawasan belum dicatat'}</p>
                  <div className="owner-building-facts">
                    <span>{item.function || 'Fungsi belum diisi'}</span>
                    <span>
                      {item.floors
                        ? `${item.floors} lantai`
                        : 'Lantai belum diisi'}
                    </span>
                  </div>
                  <div className="owner-card-next">
                    <span>Langkah berikutnya</span>
                    <strong>{ownerStepFor(item).title}</strong>
                  </div>
                  <button
                    id={`owner-open-${item.id}`}
                    type="button"
                    className="owner-open-button"
                    onClick={() => select(item.id)}
                  >
                    Lihat laporan <span aria-hidden="true">↗</span>
                  </button>
                </article>
              ))}
            </div>
            <Pagination pager={pager} label="bangunan" unit="bangunan" />
            {!visible.length && (
              <div className="owner-list-empty">
                <BuildingMark small />
                <h3>
                  {reports.length
                    ? 'Belum ada bangunan yang cocok'
                    : 'Mulai dengan satu bangunan'}
                </h3>
                <p>
                  {reports.length
                    ? 'Coba nama lain atau ubah filter status.'
                    : 'Catat informasi yang kamu ketahui. Data dapat dilengkapi sedikit demi sedikit.'}
                </p>
                {!reports.length && (
                  <a className="ws-primary" href="#/dashboard/new">
                    Catat bangunan pertama
                  </a>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
