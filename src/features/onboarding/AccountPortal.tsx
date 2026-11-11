import { useState } from 'react';
import type { FormEvent } from 'react';
import { accountStatusLabels } from '../../lib/surveyorAccess';
import type { DemoAccount } from '../../lib/reportDemo';
import '../workspace/workspace.css';
import '../reports/reports.css';
export default function AccountPortal({
  account,
  onVerify,
  onResubmit,
  onLeave,
}: {
  account: DemoAccount;
  onVerify: () => void;
  onResubmit: (organization: string, qualification: string) => boolean;
  onLeave: () => void;
}) {
  const [message, setMessage] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage(
      onResubmit(
        String(form.get('organization') ?? ''),
        String(form.get('qualification') ?? ''),
      )
        ? 'Perbaikan dikirim untuk ditinjau admin.'
        : 'Lengkapi organisasi dan ringkasan kompetensi.',
    );
  }
  return (
    <div className="workspace report-workspace">
      <header className="report-top">
        <a href="#" className="ws-logo">
          seismopass.
        </a>
        <button className="ws-secondary" onClick={onLeave}>
          Keluar demo
        </button>
      </header>
      <main className="ws-main">
        <section className="ws-panel access-status-panel">
          <span className="ws-badge">AKUN DEMO · DATA FIKTIF</span>
          <h1>{accountStatusLabels[account.status]}</h1>
          <p>
            {account.name} · {account.email}
          </p>
          <ol className="access-progress">
            <li>Daftar akun</li>
            <li>Verifikasi email demo</li>
            {account.role === 'surveyor' && <li>Tinjauan admin</li>}
            <li>Akses diaktifkan</li>
          </ol>
          {account.status === 'pending-email' && (
            <>
              <p>
                Pada layanan nyata, tautan dikirim ke emailmu. Demo ini tidak
                mengirim email. Tombol berikut hanya mensimulasikan verifikasi.
              </p>
              <button className="ws-primary" onClick={onVerify}>
                Simulasikan verifikasi email demo
              </button>
            </>
          )}
          {account.status === 'pending' && (
            <p>
              Pengajuan sudah masuk ke admin. Kamu belum dapat melihat laporan
              bangunan atau mengisi survei. Keluar, lalu masuk dengan akun admin
              untuk mencoba peninjauan di tab yang sama.
            </p>
          )}
          {account.status === 'suspended' && (
            <p>
              Akses pesurvei dinonaktifkan. Hubungi pengelola pada layanan
              nyata; pada demo, admin dapat meninjau pengaktifan kembali.
              Penugasan yang masih berjalan dikembalikan ke admin.
            </p>
          )}
          {account.reviewNote && (
            <p className="ws-disclaimer">
              <strong>Catatan admin: </strong>
              {account.reviewNote}
            </p>
          )}
          {['changes-requested', 'rejected'].includes(account.status) && (
            <form className="report-form" onSubmit={submit}>
              <h2>Perbaiki pengajuan</h2>
              <label>
                Organisasi contoh
                <input
                  name="organization"
                  defaultValue={account.organization}
                  maxLength={200}
                  required
                />
              </label>
              <label>
                Ringkasan pelatihan / kompetensi contoh
                <textarea
                  name="qualification"
                  defaultValue={account.qualification}
                  maxLength={1000}
                  required
                />
              </label>
              <button className="ws-primary">Kirim ulang ke admin</button>
            </form>
          )}
          {message && <p role="status">{message}</p>}
          <details className="access-history">
            <summary>Riwayat pengajuan demo</summary>
            <ol>
              {account.history?.map((event, index) => (
                <li key={index}>
                  <strong>{event.action}</strong>
                  <p>{event.note}</p>
                  <small>{event.at}</small>
                </li>
              ))}
            </ol>
          </details>
          <a href="#/flows">Lihat alur tiga peran →</a>
        </section>
      </main>
    </div>
  );
}
