import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { DemoAccount, Report } from '../../lib/reportDemo';
import type { OwnerAction } from '../../lib/ownerProgress';
import { timeSlots } from '../../lib/ownerProgress';
import {
  ownerStep,
  reviewNoteLabel,
  sortByOwnerTurn,
} from '../../lib/ownerNextStep';
import OwnerNextSteps from './OwnerNextSteps';
import ReportPassport from './ReportPassport';
import BuildingLocation from './BuildingLocation';
import BuildingPhotos from './BuildingPhotos';
import './owner-workspace.css';

const tabs = [
  'Perjalanan',
  'Lokasi & foto',
  'Jadwal survei',
  'Tindak lanjut',
  'Dukungan',
] as const;
const followUpLabels = {
  consultation: 'Ingin berkonsultasi',
  explanation: 'Butuh penjelasan',
  later: 'Melanjutkan nanti',
};
const supportLabels = {
  consultation: 'Pendampingan teknis',
  'cost-information': 'Informasi biaya',
  'funding-information': 'Informasi pembiayaan',
};
const workLabels = {
  preparing: 'Persiapan',
  ongoing: 'Sedang berlangsung',
  'reported-complete': 'Selesai menurut pelapor',
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
  const canRequest = ['Dikirim', 'Siap disurvei', 'Ditugaskan'].includes(
    report.status,
  );
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
      ok
        ? 'Waktu tersedia dicatat. Jadwal belum disepakati sampai ada usulan dari admin.'
        : 'Pilih tanggal hari ini atau setelahnya dan lengkapi waktu.',
    );
  }
  return (
    <div className="owner-detail-grid">
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
            Tanggal {displayDate(report.visitDate)}. Catatan kunjungan dapat
            dibaca pada tab Perjalanan.
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
              {available ? 'Ubah waktu yang tersedia' : 'Kapan kamu tersedia?'}
            </h3>
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
            <button className="ws-primary">Simpan waktu tersedia</button>
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
      </section>
      <aside className="owner-side-note">
        <h3>Siapkan sebelum kunjungan</h3>
        <ul>
          <li>Pastikan alamat dan pin bangunan sesuai.</li>
          <li>Koordinasikan akses dengan penghuni atau pengelola.</li>
          <li>Siapkan foto atau catatan yang sudah dimiliki.</li>
          <li>Jangan memasuki bagian bangunan yang membahayakan.</li>
        </ul>
        <p>
          Nama petugas dan konfirmasi jadwal tercatat di sini. Tidak ada
          notifikasi email atau pesan otomatis pada versi ini.
        </p>
      </aside>
    </div>
  );
}

function SavedProgress({
  title,
  value,
  note,
}: {
  title: string;
  value?: string;
  note?: string;
}) {
  return value ? (
    <div className="owner-saved-note">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </div>
  ) : null;
}

function FollowUp({
  report,
  save,
}: {
  report: Report;
  save: (action: OwnerAction) => boolean;
}) {
  const [message, setMessage] = useState('');
  const id = useId();
  const progress = report.ownerProgress;
  const enabled = report.status === 'Selesai';
  function submit(
    event: FormEvent<HTMLFormElement>,
    type: 'follow-up' | 'work',
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const note = String(form.get('note'));
    const ok = save(
      type === 'follow-up'
        ? { type, choice: String(form.get('choice')), note }
        : { type, stage: String(form.get('stage')), note },
    );
    setMessage(
      ok
        ? 'Catatan tersimpan. Keputusan dan verifikasi teknis tetap memerlukan ahli.'
        : 'Catatan belum dapat disimpan. Periksa status dan isian.',
    );
  }
  return (
    <div className="owner-detail-grid">
      <section className="owner-sheet">
        <span className="owner-kicker">Sesudah pencatatan survei</span>
        <h2>Langkah berikutnya, lebih jelas</h2>
        <EmptyNotice title="Hasil tinjauan ahli belum tersedia">
          Penutupan administrasi tidak mengesahkan hasil simulasi. Prioritas
          pemeriksaan, rekomendasi teknis, serta rencana retrofit menunggu
          penilaian ahli yang berwenang.
        </EmptyNotice>
        <div className="owner-technical-list">
          <div>
            <span>Penilaian ahli</span>
            <strong>Belum tersedia</strong>
          </div>
          <div>
            <span>Rujukan pemeriksaan</span>
            <strong>Belum ditentukan</strong>
          </div>
          <div>
            <span>Rencana perkuatan</span>
            <strong>Menunggu evaluasi ahli</strong>
          </div>
        </div>
        {!enabled && (
          <p className="owner-inline-message">
            Pilihan tindak lanjut dapat dicatat setelah administrasi laporan
            selesai. Saat ini: {report.status}.
          </p>
        )}
        <form
          className="owner-form"
          onSubmit={(event) => submit(event, 'follow-up')}
        >
          <fieldset disabled={!enabled}>
            <legend>Apa yang kamu butuhkan?</legend>
            <label htmlFor={`${id}-choice`}>
              Pilihan tindak lanjut
              <select
                id={`${id}-choice`}
                name="choice"
                defaultValue={progress?.followUp?.choice ?? 'consultation'}
              >
                {Object.entries(followUpLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor={`${id}-follow-note`}>
              Catatan kebutuhan
              <textarea
                id={`${id}-follow-note`}
                name="note"
                rows={3}
                required
                maxLength={1000}
                defaultValue={progress?.followUp?.note}
                placeholder="Contoh: saya perlu penjelasan tentang pemeriksaan lanjutan."
              />
            </label>
            <button className="ws-primary">Simpan pilihan tindak lanjut</button>
          </fieldset>
        </form>
        <SavedProgress
          title="Pilihanmu"
          value={progress?.followUp && followUpLabels[progress.followUp.choice]}
          note={progress?.followUp?.note}
        />
        {message && (
          <p role="status" className="owner-inline-message">
            {message}
          </p>
        )}
      </section>
      <aside className="owner-sheet owner-work-note">
        <h3>Catatan pekerjaan pemilik</h3>
        <p>
          Jika persiapan atau pekerjaan sudah dilakukan, catat perkembangannya
          di sini. Catatan ini tidak menjadi rekomendasi maupun bukti kelayakan
          bangunan.
        </p>
        <form
          className="owner-form"
          onSubmit={(event) => submit(event, 'work')}
        >
          <fieldset disabled={!enabled}>
            <legend>Perkembangan yang kamu laporkan</legend>
            <label htmlFor={`${id}-stage`}>
              Tahap pekerjaan
              <select
                id={`${id}-stage`}
                name="stage"
                defaultValue={progress?.work?.stage ?? 'preparing'}
              >
                {Object.entries(workLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor={`${id}-work-note`}>
              Catatan
              <textarea
                id={`${id}-work-note`}
                name="note"
                required
                rows={3}
                maxLength={1000}
                defaultValue={progress?.work?.note}
                placeholder="Catat kegiatan contoh dan tanggalnya."
              />
            </label>
            <button className="ws-secondary">Simpan catatan pekerjaan</button>
          </fieldset>
        </form>
        <SavedProgress
          title="Belum diverifikasi ahli"
          value={progress?.work && workLabels[progress.work.stage]}
          note={progress?.work?.note}
        />
        <p className="owner-footnote">
          Perencanaan, pelaksanaan, dan verifikasi perkuatan memerlukan tenaga
          yang berwenang.
        </p>
      </aside>
    </div>
  );
}

function Support({
  report,
  save,
}: {
  report: Report;
  save: (action: OwnerAction) => boolean;
}) {
  const [message, setMessage] = useState('');
  const id = useId();
  const saved = report.ownerProgress?.support;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = save({
      type: 'support',
      need: String(form.get('need')),
      note: String(form.get('note')),
    });
    setMessage(
      ok
        ? 'Kebutuhan dukungan dicatat. Ini belum menjadi pengajuan bantuan.'
        : 'Kebutuhan belum dapat dicatat. Kirim laporan dan lengkapi catatan terlebih dahulu.',
    );
  }
  return (
    <div className="owner-detail-grid">
      <section className="owner-sheet">
        <span className="owner-kicker">Dukungan perkuatan</span>
        <h2>Mulai dari kebutuhanmu</h2>
        <p>
          Pencatatan kebutuhan membantu menyiapkan tindak lanjut ketika program
          dan mitra tersedia.
        </p>
        <div className="owner-program-empty">
          <span className="owner-chip">Belum ada program aktif</span>
          <h3>Informasi program akan ditampilkan di sini</h3>
          <p>
            Penyelenggara, persyaratan, bentuk dukungan, dan cara mengajukan
            belum ditetapkan. Tidak ada bantuan, potongan pajak, pembiayaan,
            atau asuransi yang otomatis diberikan.
          </p>
        </div>
        <form className="owner-form" onSubmit={submit}>
          <fieldset disabled={report.status === 'Draf'}>
            <legend>Catat kebutuhan dukungan</legend>
            <label htmlFor={`${id}-need`}>
              Dukungan yang ingin diketahui
              <select
                id={`${id}-need`}
                name="need"
                defaultValue={saved?.need ?? 'consultation'}
              >
                {Object.entries(supportLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor={`${id}-support-note`}>
              Ceritakan kebutuhanmu
              <textarea
                id={`${id}-support-note`}
                name="note"
                required
                rows={4}
                maxLength={1000}
                defaultValue={saved?.note}
                placeholder="Contoh: ingin mengetahui pilihan pendampingan dan perkiraan proses pembiayaan."
              />
            </label>
            <button className="ws-primary">Simpan kebutuhan dukungan</button>
          </fieldset>
        </form>
        {report.status === 'Draf' && (
          <p className="owner-inline-message">
            Kirim laporan terlebih dahulu untuk mencatat kebutuhan dukungan.
          </p>
        )}
        {message && (
          <p role="status" className="owner-inline-message">
            {message}
          </p>
        )}
        <SavedProgress
          title="Kebutuhan tercatat · belum diajukan ke program"
          value={saved && supportLabels[saved.need]}
          note={saved?.note}
        />
      </section>
      <aside className="owner-side-note">
        <h3>Saat program tersedia</h3>
        <ol>
          <li>Baca penyelenggara dan syarat program.</li>
          <li>Siapkan dokumen yang diminta.</li>
          <li>Ajukan melalui jalur resmi.</li>
          <li>Pantau pemeriksaan dan keputusan penyelenggara.</li>
        </ol>
        <p>Skor simulasi bukan dasar otomatis penerimaan dukungan.</p>
      </aside>
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
  const [tab, setTab] = useState(0);
  const [point, setPoint] = useState(report.ownerProgress?.point);
  const [message, setMessage] = useState('');
  const id = useId();
  const step = ownerStep(report.status);
  return (
    <div className="owner-detail">
      <button type="button" className="owner-back" onClick={onBack}>
        ← Semua bangunan
      </button>
      <section className="owner-detail-heading">
        <BuildingMark small />
        <div>
          <span className="owner-kicker">{report.id}</span>
          <h2 tabIndex={-1} id="owner-detail-heading">
            {report.title}
          </h2>
          <p>{report.location || 'Kawasan belum diisi'}</p>
        </div>
        <span className="owner-chip">{report.status}</span>
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
      <nav className="owner-detail-nav" aria-label="Bagian detail bangunan">
        {tabs.map((label, index) => (
          <button
            type="button"
            key={label}
            aria-pressed={tab === index}
            onClick={() => {
              setTab(index);
              setMessage('');
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      <section aria-label={tabs[tab]} className="owner-tab-content">
        {tab === 0 && (
          <div className="owner-detail-grid">
            <section className="owner-sheet">
              <ReportPassport report={report} />
              {['Draf', 'Perlu dilengkapi'].includes(report.status) && (
                <div className="owner-actions">
                  <button
                    type="button"
                    className="ws-secondary"
                    onClick={onEdit}
                  >
                    Ubah draf
                  </button>
                  <button
                    type="button"
                    className="ws-primary"
                    onClick={onSubmit}
                  >
                    Kirim laporan
                  </button>
                </div>
              )}
            </section>
            <aside className="owner-sheet">
              <h3>Jejak proses bangunan</h3>
              <ol className="owner-activity">
                <li>
                  <span className="owner-activity-dot" />
                  <div>
                    <strong>Status saat ini</strong>
                    <p>{report.status}</p>
                  </div>
                </li>
                {[...(report.activity ?? [])].reverse().map((event, index) => (
                  <li key={`${event.at}-${index}`}>
                    <span className="owner-activity-dot" />
                    <div>
                      <strong>{event.action}</strong>
                      <p>
                        {event.by} ·{' '}
                        {new Date(event.at).toLocaleDateString('id-ID')}
                      </p>
                      {event.note && <p>{event.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
              {report.visitNote && (
                <div className="owner-saved-note">
                  <strong>Catatan kunjungan dari pesurvei</strong>
                  <p>{report.visitNote}</p>
                </div>
              )}
              {report.reviewNote && (
                <div className="owner-saved-note">
                  <strong>{reviewNoteLabel(report.status).title}</strong>
                  <p>{report.reviewNote}</p>
                  {reviewNoteLabel(report.status).hint && (
                    <p className="owner-note-hint">
                      {reviewNoteLabel(report.status).hint}
                    </p>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}
        {tab === 1 && (
          <section className="owner-sheet">
            <div className="owner-section-title">
              <div>
                <h2>Lokasi & dokumentasi</h2>
                <p>{report.address || 'Alamat lengkap belum dicatat.'}</p>
              </div>
            </div>
            <BuildingLocation value={point} onChange={setPoint} />
            <button
              className="ws-primary"
              type="button"
              onClick={() =>
                setMessage(
                  onSave({ type: 'location', point })
                    ? 'Lokasi bangunan tersimpan.'
                    : 'Lokasi belum dapat disimpan.',
                )
              }
            >
              Simpan lokasi bangunan
            </button>
            {message && (
              <p role="status" className="owner-inline-message">
                {message}
              </p>
            )}
            <BuildingPhotos reportId={report.id} ownerId={account.id} />
          </section>
        )}
        {tab === 2 && (
          <Schedule report={report} accounts={accounts} save={onSave} />
        )}
        {tab === 3 && <FollowUp report={report} save={onSave} />}
        {tab === 4 && <Support report={report} save={onSave} />}
      </section>
      <p className="owner-footnote" id={`${id}-limit`}>
        Catatan dan perubahan mengikuti penyimpanan sesi browser. Belum ada
        pengiriman ke layanan operasional. RVS adalah penyaringan awal, bukan
        sertifikat aman.
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
  const [filter, setFilter] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const report = reports.find((item) => item.id === selected);
  const visible = sortByOwnerTurn(reports).filter(
    (item) =>
      (!filter || item.status === filter) &&
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
          <section className="owner-intro">
            <div>
              <span className="owner-kicker">Ruang pelapor</span>
              <h2 ref={heading} tabIndex={-1}>
                Bangunanmu, tercatat.
                <br />
                Langkah berikutnya, terlihat.
              </h2>
              <p>
                Simpan ceritanya, ikuti prosesnya, dan siapkan tindak lanjut
                bersama petugas serta ahli.
              </p>
              <a className="ws-primary" href="#/dashboard/new">
                ＋ Catat bangunan
              </a>
            </div>
            <BuildingMark />
          </section>
          <OwnerNextSteps reports={reports} />
          <section className="owner-building-list" aria-label="Daftar bangunan">
            <div className="owner-section-title">
              <div>
                <h2>Bangunan & laporan saya</h2>
                <p>{reports.length} catatan bangunan · hanya milik akunmu</p>
              </div>
            </div>
            <div className="owner-list-toolbar">
              <label>
                Cari bangunan
                <input
                  aria-label="Cari bangunan saya"
                  placeholder="Nama, kawasan, atau nomor laporan"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label>
                Status proses
                <select
                  aria-label="Status bangunan saya"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="">Semua status</option>
                  {[...new Set(reports.map((item) => item.status))].map(
                    (status) => (
                      <option key={status}>{status}</option>
                    ),
                  )}
                </select>
              </label>
            </div>
            <div className="owner-building-grid">
              {visible.map((item) => (
                <article className="owner-building-card" key={item.id}>
                  <div className="owner-building-card-top">
                    <span className="owner-house-icon" aria-hidden="true">
                      ⌂
                    </span>
                    <span className="owner-chip">{item.status}</span>
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
                    Lihat perjalanan bangunan <span aria-hidden="true">↗</span>
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
