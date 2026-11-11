import { useState } from 'react';
import type { FormEvent } from 'react';
import { accountStatusLabels } from '../../lib/surveyorAccess';
import type { NewSurveyorInput } from '../../lib/surveyorAccess';
import type { DemoAccount, Report } from '../../lib/reportDemo';
export type ReviewAction =
  | 'approve'
  | 'request-changes'
  | 'reject'
  | 'suspend'
  | 'reactivate';
export interface IssuedPassword {
  name: string;
  email: string;
  password: string;
}
type IssueResult = IssuedPassword | { error: string };
export default function SurveyorManagement({
  accounts,
  reports,
  mode,
  onReview,
  onAdd,
  onReissue,
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
  onAdd: (input: NewSurveyorInput) => IssueResult;
  onReissue: (id: string) => IssueResult;
}) {
  const [message, setMessage] = useState('');
  // Sandi sementara hanya hidup di state ini, tampil sekali, tidak disimpan.
  const [issued, setIssued] = useState<IssuedPassword | null>(null);
  const [addError, setAddError] = useState('');
  const settled = ['active', 'suspended', 'must-change-password'];
  const candidates = accounts.filter(
    (account) =>
      account.role === 'surveyor' &&
      (mode === 'applications'
        ? !settled.includes(account.status)
        : settled.includes(account.status)),
  );
  function addSurveyor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = onAdd({
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      organization: String(data.get('organization') ?? ''),
      qualification: String(data.get('qualification') ?? ''),
    });
    if ('error' in result) {
      setAddError(result.error);
      return;
    }
    setAddError('');
    setMessage('');
    setIssued(result);
    form.reset();
  }
  function reissue(candidate: DemoAccount) {
    const result = onReissue(candidate.id);
    if ('error' in result) {
      setIssued(null);
      setMessage(result.error);
      return;
    }
    setMessage('');
    setIssued(result);
  }
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
            Admin menentukan siapa yang menjadi pesurvei dan menyiapkan akunnya.
            Penugasan bangunan dilakukan secara terpisah.
          </p>
        </div>
        <span className="ws-badge">{candidates.length} akun</span>
      </div>
      <p className="ws-muted">
        Semua identitas dan bukti di halaman ini adalah contoh demo. Verifikasi
        kompetensi nyata memerlukan tata cara organisasi dan supervisi ahli.
      </p>
      {mode === 'surveyors' && (
        <form className="report-form access-add" onSubmit={addSurveyor}>
          <h3>Tambah pesurvei</h3>
          <p className="ws-muted">
            Sistem membuat akun dengan sandi sementara acak. Pesurvei wajib
            membuat kata sandi barunya sendiri saat masuk pertama, sehingga
            admin tidak pernah mengetahui kata sandi mereka.
          </p>
          <label>
            Nama pesurvei (contoh)
            <input name="name" maxLength={200} required />
          </label>
          <label>
            Alamat email
            <input
              name="email"
              type="email"
              maxLength={254}
              placeholder="nama@example.com"
              required
            />
          </label>
          <label>
            Organisasi / instansi (contoh)
            <input name="organization" maxLength={200} required />
          </label>
          <label>
            Catatan pelatihan / kompetensi (contoh)
            <textarea
              name="qualification"
              maxLength={1000}
              placeholder="Contoh pelatihan RVS dan kebutuhan supervisi ahli"
              required
            />
          </label>
          {addError && (
            <p role="alert" className="ws-disclaimer">
              {addError}
            </p>
          )}
          <button className="ws-primary">Buat akun pesurvei</button>
        </form>
      )}
      {issued && (
        <div className="ws-notice access-issued" role="status">
          <strong>Sandi sementara untuk {issued.name}</strong>
          <p>
            Email: <code>{issued.email}</code>
            <br />
            Sandi sementara: <code>{issued.password}</code>
          </p>
          <p>
            Catat sekarang. Sandi ini hanya tampil sekali dan tidak disimpan.
            Sampaikan lewat jalur terpisah. Pesurvei wajib menggantinya saat
            masuk pertama.
          </p>
          <button className="ws-secondary" onClick={() => setIssued(null)}>
            Sudah saya catat, tutup
          </button>
        </div>
      )}
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
              <strong>{candidate.managed ? 'Akun: ' : 'Email demo: '}</strong>
              {candidate.managed
                ? 'Dibuat dan didata admin'
                : candidate.emailVerified
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
            {candidate.status === 'must-change-password' ? (
              <>
                <p className="ws-disclaimer">
                  Menunggu pesurvei masuk dengan sandi sementara dan membuat
                  kata sandi baru. Sebelum itu akun belum dapat menerima
                  penugasan.
                </p>
                <div className="report-actions">
                  <button
                    className="ws-secondary"
                    type="button"
                    onClick={() => reissue(candidate)}
                  >
                    Terbitkan sandi sementara baru
                  </button>
                </div>
              </>
            ) : candidate.status === 'pending-email' ? (
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
                  {candidate.status === 'active' && candidate.managed && (
                    <button
                      className="ws-secondary"
                      type="button"
                      onClick={() => reissue(candidate)}
                    >
                      Terbitkan sandi sementara baru
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
