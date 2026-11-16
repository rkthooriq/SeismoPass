import { useId, useRef, useState } from 'react';
import type React from 'react';
import type { FormEvent } from 'react';
import {
  isSampleReport,
  validateReportRegistration,
} from '../../lib/reportDemo';
import type { DemoAccount, Report } from '../../lib/reportDemo';
import type { OwnerAction } from '../../lib/ownerProgress';
import { timeSlots } from '../../lib/ownerProgress';
import { statusToneClass } from '../../lib/statusTone';
import {
  ownerDetailFocus,
  ownerStageLabel,
  ownerStep,
  ownerFilterGroups,
  reviewNoteLabel,
  sortByOwnerTurn,
} from '../../lib/ownerNextStep';
import ReportPassport from './ReportPassport';
import ReportTimeline from './ReportTimeline';
import FilterMenu from '../../components/FilterMenu';
import BuildingPhotos from './BuildingPhotos';
import PointPreviewMap from './PointPreviewMap';
import './owner-workspace.css';

// Lokasi, foto, and the building data are entered in Buat laporan. The
// detail page has no tabs; ownerDetailFocus picks its main content per stage.
const followUpLabels = {
  consultation: 'Ingin berkonsultasi',
  explanation: 'Butuh penjelasan',
  later: 'Melanjutkan nanti',
};
const displayDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
  const [message, setMessage] = useState('');
  const appointment = report.appointment;
  const available = report.ownerProgress?.availability;
  // Availability is asked only after the admin accepts the report.
  const canRequest = ['Siap disurvei', 'Ditugaskan'].includes(report.status);
  // Saving a new time after agreeing reopens the agreed schedule, so the form
  // says so instead of looking like a harmless preference edit.
  const confirmed = appointment?.response === 'confirmed';
  const surveyor = accounts.find((person) => person.id === report.assignee);
  const id = useId();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = save({
      type: 'availability',
      date: String(form.get('date')),
      slot: String(form.get('slot')),
      note: String(form.get('note')),
    });
    setMessage(
      !ok
        ? 'Pilih tanggal hari ini atau setelahnya dan lengkapi waktu.'
        : confirmed
          ? 'Permintaan jadwal lain dicatat. Admin akan mengusulkan jadwal baru.'
          : 'Waktu tersedia dicatat. Jadwal belum disepakati sampai ada usulan dari admin.',
    );
  }
  return (
    <div className="owner-detail-grid is-single">
      <section className="owner-sheet">
        <div className="owner-section-title">
          <div>
            <span className="owner-kicker">Koordinasi kunjungan</span>
            <h2>Atur waktu yang cocok</h2>
          </div>
          <span className="owner-chip">
            {appointment?.response === 'confirmed'
              ? 'Dikonfirmasi'
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
            <span>Usulan dari admin</span>
            <h3>{displayDate(appointment.date)}</h3>
            <p>{appointment.slot}</p>
            <p>
              {surveyor
                ? `Pesurvei: ${surveyor.name}`
                : 'Pesurvei belum ditentukan'}
            </p>
            <strong>
              {appointment.response === 'confirmed'
                ? 'Kamu sudah menyetujui jadwal ini.'
                : appointment.response === 'change-requested'
                  ? 'Perubahan jadwal diminta. Menunggu usulan baru.'
                  : 'Periksa jadwal sebelum mengonfirmasi.'}
            </strong>
            {appointment.response === 'proposed' &&
              report.status === 'Ditugaskan' &&
              appointment.date >= today() && (
                <div className="owner-actions">
                  <button
                    className="ws-primary"
                    type="button"
                    onClick={() => {
                      setMessage(
                        save({ type: 'appointment', response: 'confirmed' })
                          ? 'Jadwal dikonfirmasi.'
                          : 'Jadwal belum dapat dikonfirmasi.',
                      );
                    }}
                  >
                    Jadwal ini cocok
                  </button>
                  <button
                    type="button"
                    className="ws-secondary"
                    onClick={() =>
                      setMessage(
                        save({
                          type: 'appointment',
                          response: 'change-requested',
                        })
                          ? 'Permintaan perubahan dicatat. Isi waktu alternatif di bawah.'
                          : 'Jadwal belum dapat diubah.',
                      )
                    }
                  >
                    Minta jadwal lain
                  </button>
                </div>
              )}
          </div>
        ) : (
          <EmptyNotice
            title={
              report.status === 'Draf'
                ? 'Kirim laporan terlebih dahulu'
                : 'Belum ada usulan jadwal'
            }
          >
            Admin mengatur penugasan dan jadwal survei. Waktu yang kamu isi
            merupakan preferensi, bukan janji kunjungan.
          </EmptyNotice>
        )}
        {canRequest && (
          <form className="owner-form" onSubmit={submit}>
            <h3>
              {confirmed
                ? 'Perlu waktu lain?'
                : available
                  ? 'Ubah waktu yang tersedia'
                  : 'Kapan kamu tersedia?'}
            </h3>
            {confirmed && (
              <p>
                Jadwal di atas sudah kamu setujui. Mengirim waktu baru
                membatalkan persetujuan itu, lalu admin mengusulkan jadwal baru.
              </p>
            )}
            <div className="owner-form-grid">
              <label htmlFor={`${id}-date`}>
                Tanggal
                <input
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
              Catatan akses (opsional)
              <textarea
                id={`${id}-note`}
                name="note"
                maxLength={1000}
                rows={3}
                defaultValue={available?.note}
                placeholder="Contoh: pengelola ada di lokasi setelah pukul 09.00."
              />
            </label>
            <button className={confirmed ? 'ws-secondary' : 'ws-primary'}>
              {confirmed ? 'Minta jadwal lain' : 'Simpan waktu tersedia'}
            </button>
          </form>
        )}
        {available && (
          <div className="owner-saved-note">
            <strong>Preferensi yang dicatat</strong>
            <p>
              {displayDate(available.date)} · {available.slot}
            </p>
            <p>{available.note}</p>
          </div>
        )}
        {message && (
          <p role="status" className="owner-inline-message">
            {message}
          </p>
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
          <p role="status" className="owner-inline-message">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}

function osmLink(latitude: number, longitude: number) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
}

type PreviewRow = {
  label: string;
  value?: React.ReactNode;
  // Field key checked by validateReportRegistration, for "Wajib diisi".
  field?: string;
  empty?: string;
};

// Read-only view of what the owner entered, in the same three steps and
// field order as the Buat laporan form. As the page's main content it gets a
// heading; folded under "Lihat isi laporan" it shows only the steps.
function SentReport({
  report,
  account,
  onEdit,
  onSubmit,
  folded = false,
}: {
  report: Report;
  account: DemoAccount;
  onEdit: () => void;
  onSubmit: () => void;
  folded?: boolean;
}) {
  const point = report.ownerProgress?.point;
  const editable = ['Draf', 'Perlu dilengkapi'].includes(report.status);
  // Missing required fields are flagged only while the owner can still fix
  // them; a sent report already passed validation.
  const missing = editable ? validateReportRegistration(report) : {};
  const missingCount = Object.keys(missing).length;
  const steps: [string, PreviewRow[]][] = [
    [
      'Data bangunan',
      [
        { label: 'Nama bangunan', value: report.title, field: 'title' },
        { label: 'Kawasan', value: report.location, field: 'location' },
        { label: 'Fungsi bangunan', value: report.function, field: 'function' },
        {
          label: 'Tahun pembangunan',
          value: report.year,
          empty: 'Belum diketahui',
        },
        {
          label: 'Jumlah lantai',
          value: report.floors && `${report.floors} lantai`,
          field: 'floors',
        },
        { label: 'Material utama', value: report.material, field: 'material' },
        {
          label: 'Sistem struktur',
          value: report.structure,
          field: 'structure',
        },
      ],
    ],
    [
      'Lokasi & akses',
      [
        { label: 'Alamat lengkap', value: report.address, field: 'address' },
        { label: 'Patokan', value: report.landmark, empty: 'Tidak diisi' },
        {
          label: 'Nomor kontak',
          value: report.contactPhone,
          empty: 'Tidak diisi',
        },
        {
          label: 'Titik peta',
          value: point ? (
            <a
              href={osmLink(point.latitude, point.longitude)}
              target="_blank"
              rel="noreferrer"
            >
              {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}{' '}
              <span aria-hidden="true">↗</span>
            </a>
          ) : undefined,
          empty: 'Tidak ditandai',
        },
      ],
    ],
  ];
  const consents: [string, boolean | undefined, string][] = [
    [
      'Data boleh dipakai untuk pencatatan dan penugasan survei',
      report.demoConsent,
      'demoConsent',
    ],
    [
      'Memahami bahwa RVS penyaringan awal, bukan sertifikat aman',
      report.understandsRvs,
      'understandsRvs',
    ],
  ];
  const row = ({ label, value, field, empty }: PreviewRow) => {
    const required = !!field && !!missing[field];
    return (
      <div key={label} className={required ? 'is-missing' : undefined}>
        <dt>{label}</dt>
        <dd>
          {value ||
            (required ? (
              <span className="owner-missing">Wajib diisi</span>
            ) : (
              <span className="owner-empty-value">
                {empty ?? 'Belum diisi'}
              </span>
            ))}
        </dd>
      </div>
    );
  };
  const body = (
    <ol className="owner-preview-steps">
      {steps.map(([title, rows], index) => (
        <li className="owner-preview-step" key={title}>
          <h3>
            <span aria-hidden="true">{index + 1}</span>
            {title}
          </h3>
          <dl className="owner-sent-facts">{rows.map(row)}</dl>
          {title === 'Lokasi & akses' && (
            <>
              {point && <PointPreviewMap point={point} />}
              <p className="owner-preview-note">
                Alamat, patokan, dan nomor hanya terlihat oleh admin dan
                pesurvei yang ditugaskan. Data ini tidak tampil di profil
                bangunan maupun QR.
              </p>
            </>
          )}
        </li>
      ))}
      <li className="owner-preview-step is-wide">
        <h3>
          <span aria-hidden="true">3</span>
          Periksa & kirim
        </h3>
        <dl className="owner-sent-facts">
          {row({
            label: 'Catatan laporan',
            value: report.description,
            field: 'description',
          })}
          <div>
            <dt>Persetujuan</dt>
            <dd>
              <ul className="owner-consents">
                {consents.map(([text, given, field]) => (
                  <li
                    key={field}
                    className={
                      given ? 'is-given' : missing[field] ? 'is-missing' : ''
                    }
                  >
                    <span aria-hidden="true">{given ? '✓' : '–'}</span>
                    {text}
                    {!given && (
                      <span className="owner-visually-hidden">
                        {' '}
                        (belum dicentang)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
        <BuildingPhotos reportId={report.id} ownerId={account.id} readOnly />
      </li>
    </ol>
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
        <div className="owner-saved-note">
          <strong>{reviewNoteLabel(report.status).title}</strong>
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
        </div>
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
  account,
  accounts,
  onBack,
  onEdit,
  onSave,
  onSubmit,
}: {
  report: Report;
  account: DemoAccount;
  accounts: DemoAccount[];
  onBack: () => void;
  onEdit: () => void;
  onSave: (action: OwnerAction) => boolean;
  onSubmit: () => void;
}) {
  const focus = ownerDetailFocus(report.status);
  const id = useId();
  const step = ownerStep(report.status);
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
      <SentReport
        report={report}
        account={account}
        onEdit={onEdit}
        onSubmit={onSubmit}
        folded
      />
    </details>
  );
  return (
    <div className="owner-detail">
      <button type="button" className="owner-back" onClick={onBack}>
        <span aria-hidden="true">←</span> Semua bangunan
      </button>
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
        <span
          className={`owner-chip ${statusToneClass(report.status, 'owner')}`}
        >
          {ownerStageLabel(report.status)}
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
          <SentReport
            report={report}
            account={account}
            onEdit={onEdit}
            onSubmit={onSubmit}
          />
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
      <ReportTimeline
        activity={report.activity}
        accounts={accounts}
        heading="Perjalanan laporan"
        defaultOpen={report.status !== 'Draf'}
      />
      <p className="owner-footnote" id={`${id}-limit`}>
        Catatan dan perubahan mengikuti penyimpanan sesi browser. Belum ada
        pengiriman ke layanan operasional.
      </p>
    </div>
  );
}

export default function OwnerWorkspace({
  reports,
  account,
  accounts,
  onEdit,
  onSave,
  onSubmit,
}: {
  reports: Report[];
  account: DemoAccount;
  accounts: DemoAccount[];
  onEdit: (report: Report) => void;
  onSave: (report: Report, action: OwnerAction) => boolean;
  onSubmit: (report: Report) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
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
      (!activeFilter.length || activeFilter.includes(item.status)) &&
      `${item.title} ${item.location} ${item.id}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  function select(id: string | null) {
    setSelected(id);
    requestAnimationFrame(() => {
      const target = id
        ? document.getElementById('owner-detail-heading')
        : heading.current;
      target?.focus();
      target?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }
  return (
    <div className="owner-journey">
      {report ? (
        <Detail
          key={report.id}
          report={report}
          account={account}
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
            <div className="owner-building-grid">
              {visible.map((item) => (
                <article className="owner-building-card" key={item.id}>
                  <div className="owner-building-card-top">
                    <span className="owner-house-icon" aria-hidden="true">
                      ⌂
                    </span>
                    <span
                      className={`owner-chip ${statusToneClass(item.status, 'owner')}`}
                    >
                      {ownerStageLabel(item.status)}
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
                    <strong>{ownerStep(item.status).title}</strong>
                  </div>
                  <button
                    type="button"
                    className="owner-open-button"
                    onClick={() => select(item.id)}
                  >
                    Lihat laporan <span aria-hidden="true">↗</span>
                  </button>
                </article>
              ))}
            </div>
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
