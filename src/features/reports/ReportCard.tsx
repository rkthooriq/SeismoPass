import { useState } from 'react';
import type { FormEvent } from 'react';
import Notice from '../../components/Notice';
import {
  scheduleConfirmed,
  validateReportRegistration,
} from '../../lib/reportDemo';
import type { DemoAccount, Report, ReportAction } from '../../lib/reportDemo';
import ReportPassport from './ReportPassport';
import ReportTimeline from './ReportTimeline';
import ReportCompletenessReview from './ReportCompletenessReview';
import ReportSubmissionDetails from './ReportSubmissionDetails';
import { surveyRoute } from '../../lib/workflowNavigation';
import { reviewNoteLabel } from '../../lib/ownerNextStep';
import { statusToneClass } from '../../lib/statusTone';
import { formatDate } from '../../lib/dateFormat';
import ConfirmSubmit from '../../components/ConfirmSubmit';
import ReportDetailTabs from './ReportDetailTabs';
import AssignmentFields from './AssignmentFields';
import { scheduleChoice } from '../../lib/scheduleChoice';
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
  const { availability, rescheduleRequested, proposalIsChoice, useChoice } =
    scheduleChoice(report);
  // The admin's detail page is long (the form data alone is over a screen),
  // so it is split in two: what to do, and what the reporter submitted. A
  // report waiting for the completeness check opens on the data, because
  // that is what is checked first.
  const tabbed = account.role === 'admin';
  type DetailPart = 'action' | 'data';
  const [part, setPart] = useState<DetailPart>(
    report.status === 'Dikirim' ? 'data' : 'action',
  );
  const tabId = `report-${report.id}`;
  function showPart(next: DetailPart) {
    setPart(next);
    // Coming from the bottom of a long part, bring the tabs back into view.
    requestAnimationFrame(() => {
      const tabs = document.getElementById(`${tabId}-tabs`);
      if (tabs && tabs.getBoundingClientRect().top < 0)
        tabs.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }
  const missingCount =
    tabbed && report.status === 'Dikirim'
      ? Object.keys(validateReportRegistration(report)).length
      : 0;
  // Once a surveyor and a schedule are set, the admin sees one summary of the
  // assignment instead of the same facts in several boxes and again in the
  // form; the form opens on "Ubah penugasan" (or by itself when the reporter
  // asked for another time, which needs a decision).
  const adminSummary =
    account.role === 'admin' &&
    report.status === 'Ditugaskan' &&
    !!surveyor &&
    !!report.appointment &&
    !rescheduleRequested;
  const assignmentSignature = JSON.stringify([
    report.assignee,
    report.assignmentNote,
    report.appointment,
  ]);
  // Tied to the assignment itself, so saving (which changes it) closes the
  // form again while a refused save leaves it open.
  const [editedFrom, setEditedFrom] = useState<string | null>(null);
  const editingAssignment = editedFrom === assignmentSignature;
  // While the admin's form is open it already shows the surveyor and note.
  const assignmentFormOpen =
    account.role === 'admin' &&
    ['Siap disurvei', 'Ditugaskan'].includes(report.status) &&
    (!adminSummary || editingAssignment);
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
        {tabbed && (
          <ReportDetailTabs
            idPrefix={tabId}
            label="Bagian laporan"
            active={part}
            onChange={showPart}
            tabs={
              // The order follows the work: a submitted report is read first
              // and decided second; later stages open on what to do.
              report.status === 'Dikirim'
                ? [
                    { id: 'data', label: 'Data laporan' },
                    { id: 'action', label: 'Keputusan' },
                  ]
                : [
                    { id: 'action', label: 'Tindakan' },
                    { id: 'data', label: 'Data laporan' },
                  ]
            }
          />
        )}
        {(!tabbed || part === 'data') && (
          <div
            {...(tabbed
              ? {
                  id: `${tabId}-panel-data`,
                  role: 'tabpanel',
                  'aria-labelledby': `${tabId}-tab-data`,
                }
              : {})}
            className={tabbed ? 'report-tab-panel' : undefined}
          >
            <ReportSubmissionDetails
              report={report}
              markMissing={
                account.role === 'admin' && report.status === 'Dikirim'
              }
            />
            {tabbed && report.status === 'Dikirim' && (
              <div className="report-actions">
                <button
                  type="button"
                  className="ws-primary"
                  onClick={() => showPart('action')}
                >
                  Lanjut ke keputusan
                </button>
              </div>
            )}
          </div>
        )}
        {(!tabbed || part === 'action') && (
          <div
            {...(tabbed
              ? {
                  id: `${tabId}-panel-action`,
                  role: 'tabpanel',
                  'aria-labelledby': `${tabId}-tab-action`,
                }
              : {})}
            className={tabbed ? 'report-tab-panel' : undefined}
          >
            {tabbed && report.status === 'Dikirim' && (
              <Notice
                tone={missingCount ? 'warning' : 'success'}
                title={
                  missingCount
                    ? `${missingCount} isian wajib belum terisi`
                    : 'Semua isian wajib sudah terisi'
                }
              >
                <p>
                  {missingCount
                    ? 'Isian yang kurang ditandai di Data laporan. Kembalikan ke pelapor jika perlu perbaikan.'
                    : 'Periksa isi laporan di Data laporan sebelum memutuskan.'}
                </p>
                <div className="report-actions">
                  <button
                    type="button"
                    className="ws-secondary"
                    onClick={() => showPart('data')}
                  >
                    Lihat data laporan
                  </button>
                </div>
              </Notice>
            )}
            {adminSummary && surveyor && report.appointment && (
              <div className="role-assignment-note">
                <strong>Penugasan: {surveyor.name}</strong>
                <p>
                  <span className="report-note-label">Catatan penugasan: </span>
                  {report.assignmentNote || 'Penugasan dari sesi sebelumnya.'}
                </p>
                <p>
                  <span className="report-note-label">Jadwal: </span>
                  {formatDate(report.appointment.date)} ·{' '}
                  {report.appointment.slot} ·{' '}
                  {report.appointment.response === 'confirmed'
                    ? report.appointment.confirmedBy === 'admin'
                      ? `Dikonfirmasi pelapor, dicatat admin: ${report.appointment.confirmationNote ?? ''}`
                      : 'Dikonfirmasi pelapor'
                    : 'Menunggu konfirmasi pelapor'}
                </p>
                {availability?.note &&
                  availability.date === report.appointment.date && (
                    <p>
                      <span className="report-note-label">
                        Catatan pelapor:{' '}
                      </span>
                      {availability.note}
                    </p>
                  )}
              </div>
            )}
            {surveyor && !adminSummary && !assignmentFormOpen && (
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
            {account.role === 'surveyor' ||
            adminSummary ? null : rescheduleRequested ? (
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
                {report.appointment && (
                  <p>
                    <span className="report-note-label">
                      Jadwal sebelumnya:{' '}
                    </span>
                    {formatDate(report.appointment.date)} ·{' '}
                    {report.appointment.slot}
                  </p>
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
            {report.appointment &&
              !adminSummary &&
              !(account.role === 'admin' && rescheduleRequested) && (
                <Notice
                  tone={
                    report.appointment.response === 'confirmed'
                      ? 'success'
                      : 'info'
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
                    {formatDate(report.appointment.date)} ·{' '}
                    {report.appointment.slot}
                  </p>
                  {account.role === 'surveyor' &&
                    report.ownerProgress?.availability?.note &&
                    report.appointment.date ===
                      report.ownerProgress.availability.date && (
                      <p>
                        Catatan pelapor:{' '}
                        {report.ownerProgress.availability.note}
                      </p>
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
              <ReportCompletenessReview
                report={report}
                accounts={accounts}
                onUpdate={onUpdate}
              />
            )}
            {adminSummary && !editingAssignment && (
              <div className="report-actions">
                <button
                  type="button"
                  className="ws-secondary"
                  onClick={() => setEditedFrom(assignmentSignature)}
                >
                  Ubah penugasan
                </button>
              </div>
            )}
            {assignmentFormOpen && (
              <form
                className="report-form role-assignment-form"
                onSubmit={(event) => onAssign(event, report)}
              >
                <h3>
                  {report.assignee ? 'Ubah penugasan' : 'Tugaskan pesurvei'}
                </h3>
                {rescheduleRequested ? (
                  <p className="ws-muted">
                    {useChoice
                      ? 'Waktu yang diminta pelapor sudah terisi di bawah. Simpan untuk menyepakatinya, atau ganti jadwal jika tidak bisa.'
                      : 'Waktu yang diminta pelapor sudah lewat. Usulkan jadwal baru untuk dikonfirmasi pelapor.'}
                  </p>
                ) : useChoice ? (
                  <p className="ws-muted">
                    Jadwal di bawah terisi waktu pilihan pelapor. Jika tetap
                    dipakai, jadwal langsung disepakati dan pesurvei bisa mulai
                    sesuai jadwal. Jika diubah, pelapor perlu mengonfirmasi
                    lagi.
                  </p>
                ) : report.assignee ? (
                  <p className="ws-muted">
                    Ubah pesurvei, catatan, atau jadwal. Jadwal yang berubah
                    perlu dikonfirmasi ulang oleh pelapor.
                  </p>
                ) : (
                  <p className="ws-muted">
                    Kelengkapan data sudah diperiksa. Pilih pesurvei dan isi
                    catatan penugasan agar laporan muncul di akunnya.
                  </p>
                )}
                <AssignmentFields report={report} accounts={accounts} />
                <div className="report-actions">
                  <button className="ws-primary">
                    {report.assignee
                      ? 'Simpan penugasan'
                      : 'Teruskan ke pesurvei'}
                  </button>
                  {adminSummary && (
                    <button
                      type="button"
                      className="ws-secondary"
                      onClick={() => setEditedFrom(null)}
                    >
                      Batal
                    </button>
                  )}
                </div>
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
                        Jadwal sudah dikonfirmasi pelapor. Tekan Mulai survei
                        saat kamu tiba di lokasi.
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
        )}
      </div>
    </article>
  );
}
