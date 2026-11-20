import { useState } from 'react';
import type { FormEvent } from 'react';
import Notice from '../../components/Notice';
import { canSurvey } from '../../lib/surveyorAccess';
import { scheduleConfirmed } from '../../lib/reportDemo';
import type { DemoAccount, Report, ReportAction } from '../../lib/reportDemo';
import ReportPassport from './ReportPassport';
import ReportTimeline from './ReportTimeline';
import ReportCompletenessReview from './ReportCompletenessReview';
import ReportSubmissionDetails from './ReportSubmissionDetails';
import { surveyRoute } from '../../lib/workflowNavigation';
import { localToday, timeSlots } from '../../lib/ownerProgress';
import { reviewNoteLabel } from '../../lib/ownerNextStep';
import { statusToneClass } from '../../lib/statusTone';
import { formatDate } from '../../lib/dateFormat';
import ConfirmSubmit from '../../components/ConfirmSubmit';
export default function ReportCard({
  report,
  account,
  accounts,
  onUpdate,
  onAssign,
  onConfirmSchedule,
  onEdit,
  focused = false,
  detailHref,
}: {
  report: Report;
  account: DemoAccount;
  accounts: DemoAccount[];
  onUpdate: (event: FormEvent<HTMLFormElement>, report: Report) => void;
  onAssign: (event: FormEvent<HTMLFormElement>, report: Report) => void;
  onConfirmSchedule: (
    event: FormEvent<HTMLFormElement>,
    report: Report,
  ) => void;
  onEdit: () => void;
  focused?: boolean;
  detailHref: string;
}) {
  const surveyor = accounts.find((person) => person.id === report.assignee);
  const availability = report.ownerProgress?.availability;
  const rescheduleRequested =
    report.appointment?.response === 'change-requested';
  // Until a schedule exists (or when the reporter asked for another), the
  // form starts from the reporter's own chosen time; keeping it agrees the
  // schedule at once, changing it sends a proposal the reporter confirms.
  // A proposal still waiting for an answer although it is exactly the
  // reporter's own choice (assigned before choices existed) is treated the
  // same: keeping it agrees the schedule.
  const proposalIsChoice =
    report.appointment?.response === 'proposed' &&
    report.appointment.date === availability?.date &&
    report.appointment.slot === availability?.slot;
  const useChoice =
    !!availability &&
    availability.date >= localToday() &&
    (!report.appointment || rescheduleRequested || proposalIsChoice);
  // With the reporter's own time available the admin just keeps it; the date
  // fields only appear after "Ganti jadwal" (e.g. the surveyor cannot come).
  const [changingSchedule, setChangingSchedule] = useState(false);
  const showChoice = useChoice && !changingSchedule;
  const proposedDate = useChoice ? availability.date : report.appointment?.date;
  const proposedSlot = useChoice
    ? availability.slot
    : (report.appointment?.slot ?? '');
  const actions = (items: [ReportAction, string][]) => (
    <div className="report-actions">
      {items.map(([value, label], i) => (
        <button
          key={value}
          className={i === 0 ? 'ws-primary' : 'ws-secondary'}
          value={value}
        >
          {label}
        </button>
      ))}
    </div>
  );
  const identity = (
    <>
      <span className="report-building-icon" aria-hidden="true">
        ⌂
      </span>
      <div className="report-summary-name">
        {focused ? (
          <h1 id="report-focus-title" tabIndex={-1}>
            {report.title}
          </h1>
        ) : (
          <strong>{report.title}</strong>
        )}
        <small>{report.location || 'Lokasi belum diisi'}</small>
      </div>
      <span className={`ws-badge ${statusToneClass(report.status)}`}>
        {report.status}
      </span>
    </>
  );
  if (!focused)
    return (
      <a
        className="report-item report-list-item"
        id={`report-link-${report.id}`}
        href={detailHref}
        aria-label={`Buka laporan ${report.title}`}
      >
        {identity}
        <svg
          className="report-summary-arrow"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 5 7 7-7 7" />
        </svg>
      </a>
    );
  return (
    <article
      className="report-item report-focus-card"
      aria-labelledby="report-focus-title"
    >
      <header className="report-focus-heading">{identity}</header>
      <div className="report-detail">
        <div className="report-detail-heading">
          <p className="ws-muted">
            {report.id} · Pelapor:{' '}
            {accounts.find((person) => person.id === report.reporterId)?.name ??
              'Akun contoh'}
          </p>
          <ReportTimeline
            activity={report.activity}
            accounts={accounts}
            reportTitle={report.title}
          />
        </div>
        <ReportSubmissionDetails
          report={report}
          markMissing={account.role === 'admin' && report.status === 'Dikirim'}
        />
        {surveyor && (
          <div className="role-assignment-note">
            <strong>Pesurvei: {surveyor.name}</strong>
            <p>
              <span className="report-note-label">Catatan penugasan: </span>
              {report.assignmentNote || 'Penugasan dari sesi sebelumnya.'}
            </p>
          </div>
        )}
        {report.visitDate && (
          <p>
            <strong>Kunjungan {formatDate(report.visitDate)}</strong> ·{' '}
            {report.visitNote}
          </p>
        )}
        {report.reviewNote && (
          <Notice
            tone={
              ['Perlu dilengkapi', 'Perlu revisi'].includes(report.status)
                ? 'warning'
                : 'info'
            }
            title={reviewNoteLabel(report.status).title}
          >
            <p>{report.reviewNote}</p>
            {reviewNoteLabel(report.status).hint && (
              <p className="report-note-hint">
                {reviewNoteLabel(report.status).hint}
              </p>
            )}
          </Notice>
        )}
        {/* The reporter's chosen time is the admin's input for scheduling;
            the surveyor only needs the schedule that applies (below). */}
        {account.role === 'surveyor' ? null : rescheduleRequested ? (
          <Notice tone="warning" title="Pelapor meminta jadwal lain">
            {availability ? (
              <>
                <p>
                  {formatDate(availability.date)} · {availability.slot}
                </p>
                {availability.note && <p>{availability.note}</p>}
              </>
            ) : (
              <p>Usulkan jadwal baru untuk dikonfirmasi pelapor.</p>
            )}
          </Notice>
        ) : (
          report.ownerProgress?.availability && (
            <div className="role-assignment-note">
              <strong>Waktu kunjungan pilihan pelapor</strong>
              <p>
                {formatDate(report.ownerProgress.availability.date)} ·{' '}
                {report.ownerProgress.availability.slot}
              </p>
              <p>{report.ownerProgress.availability.note}</p>
            </div>
          )
        )}
        {report.appointment && (
          <Notice
            tone={
              report.appointment.response === 'confirmed' ? 'success' : 'info'
            }
            title={
              report.appointment.response === 'change-requested'
                ? 'Jadwal sebelumnya'
                : report.appointment.response === 'confirmed'
                  ? 'Jadwal kunjungan dikonfirmasi'
                  : 'Usulan jadwal kunjungan'
            }
          >
            <p>
              {formatDate(report.appointment.date)} · {report.appointment.slot}
            </p>
            {account.role === 'surveyor' &&
              report.ownerProgress?.availability?.note &&
              report.appointment.date ===
                report.ownerProgress.availability.date && (
                <p>Catatan pelapor: {report.ownerProgress.availability.note}</p>
              )}
            <p>
              {report.appointment.response === 'confirmed'
                ? report.appointment.confirmedBy === 'admin'
                  ? `Dikonfirmasi pelapor, dicatat admin: ${report.appointment.confirmationNote ?? ''}`
                  : 'Dikonfirmasi pelapor'
                : report.appointment.response === 'change-requested'
                  ? 'Pelapor meminta perubahan'
                  : 'Menunggu konfirmasi pelapor'}
            </p>
          </Notice>
        )}
        {report.ownerProgress?.support && (
          <div className="role-assignment-note">
            <strong>
              Kebutuhan dukungan pelapor · belum menjadi pengajuan program
            </strong>
            <p>{report.ownerProgress.support.note}</p>
          </div>
        )}
        {report.ownerProgress?.followUp && (
          <div className="role-assignment-note">
            <strong>Catatan tindak lanjut dari pelapor</strong>
            <p>{report.ownerProgress.followUp.note}</p>
          </div>
        )}
        {account.role === 'admin' && report.status === 'Dikirim' && (
          <ReportCompletenessReview report={report} onUpdate={onUpdate} />
        )}
        {account.role === 'admin' &&
          ['Siap disurvei', 'Ditugaskan'].includes(report.status) && (
            <form
              className="report-form role-assignment-form"
              onSubmit={(event) => onAssign(event, report)}
            >
              <h3>
                {report.assignee ? 'Ubah penugasan' : 'Tugaskan pesurvei'}
              </h3>
              {rescheduleRequested ? (
                <p className="ws-muted">
                  Pelapor meminta jadwal lain. Jadwal usulan di bawah sudah
                  diisi dengan waktu yang diminta; ubah bila perlu, lalu simpan
                  agar pelapor bisa mengonfirmasinya.
                </p>
              ) : useChoice ? (
                <p className="ws-muted">
                  Jadwal di bawah terisi waktu pilihan pelapor. Jika tetap
                  dipakai, jadwal langsung disepakati dan pesurvei bisa mulai
                  sesuai jadwal. Jika diubah, pelapor perlu mengonfirmasi lagi.
                </p>
              ) : (
                <p className="ws-muted">
                  Kelengkapan data sudah diperiksa. Pilih pesurvei dan isi
                  catatan penugasan agar laporan muncul di akunnya.
                </p>
              )}
              <label>
                Pesurvei aktif
                <select
                  name="surveyorId"
                  required
                  defaultValue={report.assignee ?? ''}
                >
                  <option value="">Pilih pesurvei yang disetujui</option>
                  {accounts
                    .filter(
                      (person) => canSurvey(person) && person.emailVerified,
                    )
                    .map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} · {person.organization || person.email}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Catatan penugasan
                <textarea
                  name="assignmentNote"
                  maxLength={1000}
                  required
                  defaultValue={report.assignmentNote}
                  placeholder="Lingkup kunjungan dan koordinasi supervisi"
                />
              </label>
              <fieldset className="report-visit-fields">
                <legend>
                  {rescheduleRequested && !showChoice
                    ? 'Usulkan jadwal baru'
                    : 'Jadwal kunjungan'}
                </legend>
                {showChoice && availability ? (
                  <div className="schedule-choice">
                    <div>
                      <strong>
                        {formatDate(availability.date)} · {availability.slot}
                      </strong>
                      <p className="ws-muted">
                        Pilihan pelapor. Langsung disepakati saat disimpan.
                      </p>
                    </div>
                    <input
                      type="hidden"
                      name="appointmentDate"
                      value={availability.date}
                    />
                    <input
                      type="hidden"
                      name="appointmentSlot"
                      value={availability.slot}
                    />
                    <button
                      type="button"
                      className="ws-secondary"
                      onClick={() => setChangingSchedule(true)}
                    >
                      Ganti jadwal
                    </button>
                  </div>
                ) : (
                  <>
                    <label>
                      Tanggal usulan
                      <input
                        name="appointmentDate"
                        type="date"
                        min={localToday()}
                        required
                        defaultValue={proposedDate}
                      />
                    </label>
                    <label>
                      Rentang waktu
                      <select
                        name="appointmentSlot"
                        required
                        defaultValue={proposedSlot}
                      >
                        <option value="" disabled>
                          Pilih rentang waktu
                        </option>
                        {timeSlots.map((slot) => (
                          <option key={slot}>{slot}</option>
                        ))}
                      </select>
                    </label>
                    <p className="ws-muted">
                      {useChoice
                        ? 'Jadwal selain pilihan pelapor perlu dikonfirmasi pelapor sebelum pesurvei bisa mulai.'
                        : 'Wajib. Pesurvei baru bisa memulai survei setelah pelapor mengonfirmasi jadwal ini. Pelapor juga dapat meminta jadwal lain.'}
                    </p>
                    {useChoice && (
                      <div className="report-actions">
                        <button
                          type="button"
                          className="ws-secondary"
                          onClick={() => setChangingSchedule(false)}
                        >
                          Pakai pilihan pelapor
                        </button>
                      </div>
                    )}
                  </>
                )}
              </fieldset>
              <button className="ws-primary">
                {report.assignee ? 'Simpan penugasan' : 'Teruskan ke pesurvei'}
              </button>
            </form>
          )}
        {account.role === 'admin' &&
          report.status === 'Ditugaskan' &&
          report.appointment?.response === 'proposed' &&
          !proposalIsChoice && (
            <form
              className="report-form role-assignment-form"
              onSubmit={(event) => onConfirmSchedule(event, report)}
            >
              <h3>Pelapor sudah setuju di luar aplikasi?</h3>
              <p className="ws-muted">
                Jika pelapor menyetujui jadwal{' '}
                {formatDate(report.appointment.date)} ·{' '}
                {report.appointment.slot} lewat telepon atau pesan, catat di
                sini agar pesurvei bisa memulai survei. Pelapor tetap dapat
                meminta jadwal lain.
              </p>
              <label>
                Bagaimana pelapor menyetujui?
                <textarea
                  name="confirmationNote"
                  required
                  maxLength={1000}
                  placeholder="Contoh: ditelepon 20 November pukul 10.00, pelapor setuju."
                />
              </label>
              <div className="report-actions">
                <button className="ws-secondary">
                  Catat konfirmasi pelapor
                </button>
              </div>
            </form>
          )}
        {((account.role === 'owner' &&
          ['Draf', 'Perlu dilengkapi'].includes(report.status)) ||
          (account.role === 'surveyor' &&
            report.assignee === account.id &&
            report.status === 'Ditugaskan' &&
            scheduleConfirmed(report)) ||
          (account.role === 'admin' && report.status === 'Ditinjau')) && (
          <form
            className="report-form"
            key={report.status}
            onSubmit={(event) => onUpdate(event, report)}
          >
            {account.role === 'owner' &&
              ['Draf', 'Perlu dilengkapi'].includes(report.status) && (
                <div className="report-actions">
                  <button
                    type="button"
                    className="ws-secondary"
                    onClick={onEdit}
                  >
                    Ubah draf
                  </button>
                  <button className="ws-primary" value="submit">
                    Kirim laporan
                  </button>
                </div>
              )}
            {account.role === 'surveyor' &&
              report.assignee === account.id &&
              report.status === 'Ditugaskan' && (
                <>
                  <p className="ws-muted">
                    Jadwal sudah dikonfirmasi pelapor. Tekan Mulai survei saat
                    kamu tiba di lokasi.
                  </p>
                  {actions([['start', 'Mulai survei']])}
                </>
              )}
            {account.role === 'admin' && report.status === 'Ditinjau' && (
              <>
                <label>
                  Catatan tinjauan administrasi
                  <textarea name="note" required maxLength={1000} />
                </label>
                <div className="report-actions">
                  <ConfirmSubmit
                    value="close"
                    label="Tutup administrasi laporan"
                    title="Tutup administrasi laporan?"
                    description="Laporan menjadi Selesai dan pelapor membaca catatan penutupmu. Laporan yang sudah ditutup tidak dapat dibuka kembali."
                    confirmLabel="Ya, tutup laporan"
                  />
                  <button className="ws-secondary" value="revise">
                    Minta revisi
                  </button>
                </div>
              </>
            )}
          </form>
        )}
        {account.role === 'surveyor' &&
          report.assignee === account.id &&
          report.status === 'Ditugaskan' &&
          !scheduleConfirmed(report) && (
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
        {account.role === 'surveyor' &&
          report.assignee === account.id &&
          ['Dalam survei', 'Perlu revisi'].includes(report.status) && (
            <div className="report-form">
              <p className="ws-muted">
                {report.status === 'Perlu revisi'
                  ? 'Baca catatan revisi di atas, lalu perbaiki hasil survei di halaman survei.'
                  : 'Catat kunjungan dan input RVS di halaman survei, lalu kirim untuk ditinjau admin.'}
              </p>
              <div className="report-actions">
                <a className="ws-primary" href={surveyRoute(report.id)}>
                  {report.status === 'Perlu revisi'
                    ? 'Perbaiki hasil survei'
                    : 'Isi hasil survei'}
                </a>
              </div>
            </div>
          )}
        {report.rvs &&
          ['Dalam survei', 'Perlu revisi', 'Ditinjau', 'Selesai'].includes(
            report.status,
          ) && <ReportPassport report={report} limitsOnly />}
      </div>
    </article>
  );
}
