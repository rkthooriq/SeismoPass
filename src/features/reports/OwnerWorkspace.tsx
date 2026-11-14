import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { DemoAccount, Report } from '../../lib/reportDemo';
import type { OwnerAction } from '../../lib/ownerProgress';
import { timeSlots } from '../../lib/ownerProgress';
import { ownerStep, sortByOwnerTurn } from '../../lib/ownerNextStep';
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

function BuildingMark({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? 'owner-building-mark is-small' : 'owner-building-mark'}
      viewBox="0 0 180 130"
      fill="none"
      aria-hidden="true"
    >
      <path d="m8 114 81-13 83 13-79 14z" fill="#E6D8C6" />
      <path
        d="M42 106V56l44-27 44 27v50l-44 17z"
        fill="#FFFCF6"
        stroke="#B89A80"
        strokeWidth="2"
      />
      <path d="m31 58 55-36 55 36-12 8-43-27-43 27z" fill="#8A5A3B" />
      <path
        d="M86 40v82m-23-10V79l20 8v32M97 66l17 9v20l-17-8zM54 66l17-10v17l-17 9z"
        stroke="#B89A80"
        strokeWidth="2"
      />
      <path
        d="M147 105V75m-12 8 12-20 12 20z"
        fill="#DCC3A3"
        stroke="#B89A80"
        strokeWidth="2"
      />
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
                  <strong>Catatan kunjungan</strong>
                  <p>{report.visitNote}</p>
                </div>
              )}
              {report.reviewNote && (
                <div className="owner-saved-note">
                  <strong>Catatan admin</strong>
                  <p>{report.reviewNote}</p>
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
