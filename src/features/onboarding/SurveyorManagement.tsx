import { useState } from 'react';
import type { FormEvent } from 'react';
import { accountStatusLabels } from '../../lib/surveyorAccess';
import type { DemoAccount, Report } from '../../lib/reportDemo';
export type ReviewAction =
  | 'approve'
  | 'request-changes'
  | 'reject'
  | 'suspend'
  | 'reactivate';
export default function SurveyorManagement({
  accounts,
  reports,
  mode,
  onReview,
}: {
  accounts: DemoAccount[];
  reports: Report[];
  mode: 'applications' | 'surveyors';
  onReview: (
    id: string,
    action: ReviewAction,
    note: string,
    checked: boolean,
  ) => boolean;
}) {
  const [message, setMessage] = useState('');
  const candidates = accounts.filter(
    (account) =>
      account.role === 'surveyor' &&
      (mode === 'applications'
        ? !['active', 'suspended'].includes(account.status)
        : ['active', 'suspended'].includes(account.status)),
  );
  function submit(event: FormEvent<HTMLFormElement>, candidate: DemoAccount) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const button = (event.nativeEvent as SubmitEvent).submitter;
    if (!(button instanceof HTMLButtonElement)) return;
    const success = onReview(
      candidate.id,
      button.value as ReviewAction,
      String(form.get('note') ?? ''),
      form.get('checked') === 'on',
    );
    setMessage(
      success
        ? `Status ${candidate.name} diperbarui.`
        : 'Periksa status, catatan keputusan, dan konfirmasi pemeriksaan kompetensi.',
    );
  }
  return (
    <section className="ws-panel">
      <div className="ws-section-head">
        <div>
          <h2>
            {mode === 'applications' ? 'Pengajuan pesurvei' : 'Kelola pesurvei'}
          </h2>
          <p>
            Admin menentukan akses pesurvei. Penugasan bangunan dilakukan secara
            terpisah.
          </p>
        </div>
        <span className="ws-badge">{candidates.length} akun</span>
      </div>
      <p className="ws-muted">
        Semua identitas dan bukti di halaman ini adalah contoh demo. Verifikasi
        kompetensi nyata memerlukan tata cara organisasi dan supervisi ahli.
      </p>
      {message && (
        <p role="status" className="ws-notice">
          {message}
        </p>
      )}
      {!candidates.length && (
        <p className="role-empty">Belum ada akun pada daftar ini.</p>
      )}
      {candidates.map((candidate) => {
        const open = reports.filter(
          (report) =>
            report.assignee === candidate.id &&
            ['Ditugaskan', 'Dalam survei', 'Perlu revisi'].includes(
              report.status,
            ),
        ).length;
        return (
          <article className="access-candidate" key={candidate.id}>
            <header>
              <div>
                <h3>{candidate.name}</h3>
                <p>
                  {candidate.email} ·{' '}
                  {candidate.organization || 'Organisasi belum dicatat'}
                </p>
              </div>
              <span className="ws-badge">
                {accountStatusLabels[candidate.status]}
              </span>
            </header>
            <p>
              <strong>Email demo: </strong>
              {candidate.emailVerified
                ? 'Disimulasikan terverifikasi'
                : 'Belum disimulasikan'}
            </p>
            <p>
              <strong>Ringkasan kompetensi: </strong>
              {candidate.qualification || 'Belum dicatat'}
            </p>
            {candidate.reviewNote && (
              <p>
                <strong>Keputusan terakhir: </strong>
                {candidate.reviewNote}
              </p>
            )}
            {candidate.status === 'pending-email' ? (
              <p className="ws-disclaimer">
                Pemohon perlu menyelesaikan simulasi verifikasi email sebelum
                admin dapat menyetujui.
              </p>
            ) : candidate.status === 'rejected' ? (
              <p>
                Pengajuan ditolak. Pemohon dapat memperbaiki dan mengirim ulang
                sebelum admin meninjaunya lagi.
              </p>
            ) : (
              <form
                key={`${candidate.id}-${candidate.status}`}
                className="report-form"
                onSubmit={(event) => submit(event, candidate)}
              >
                <label>
                  Catatan keputusan (wajib)
                  <textarea
                    name="note"
                    maxLength={1000}
                    required
                    placeholder="Alasan keputusan dan tindak lanjut untuk pemohon"
                  />
                </label>
                {['pending', 'changes-requested', 'suspended'].includes(
                  candidate.status,
                ) && (
                  <label className="report-checkbox">
                    <input type="checkbox" name="checked" />
                    <span>
                      Saya telah meninjau informasi organisasi, pelatihan, dan
                      kebutuhan supervisi pada contoh pengajuan ini.
                    </span>
                  </label>
                )}
                {candidate.status === 'active' && (
                  <p>
                    {open} penugasan yang masih berjalan akan dikembalikan ke
                    admin jika akses dinonaktifkan. Catatan survei sebelumnya
                    tetap disimpan.
                  </p>
                )}
                <div className="report-actions">
                  {['pending', 'changes-requested'].includes(
                    candidate.status,
                  ) && (
                    <>
                      <button className="ws-primary" value="approve">
                        Setujui akses pesurvei
                      </button>
                      <button className="ws-secondary" value="request-changes">
                        Minta perbaikan
                      </button>
                      <button className="ws-secondary" value="reject">
                        Tolak pengajuan
                      </button>
                    </>
                  )}
                  {candidate.status === 'active' && (
                    <button className="ws-secondary" value="suspend">
                      Nonaktifkan akses
                    </button>
                  )}
                  {candidate.status === 'suspended' && (
                    <button className="ws-primary" value="reactivate">
                      Aktifkan kembali
                    </button>
                  )}
                </div>
              </form>
            )}
            <details className="access-history">
              <summary>Riwayat keputusan</summary>
              <ol>
                {candidate.history?.map((event, index) => (
                  <li key={index}>
                    <strong>{event.action}</strong>
                    <p>{event.note}</p>
                    <small>{event.at}</small>
                  </li>
                ))}
              </ol>
            </details>
          </article>
        );
      })}
    </section>
  );
}
