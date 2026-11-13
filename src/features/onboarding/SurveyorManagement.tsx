import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { accountStatusLabels } from '../../lib/surveyorAccess';
import type { NewSurveyorInput } from '../../lib/surveyorAccess';
import type { DemoAccount, Report } from '../../lib/reportDemo';
import { accountDirectory } from '../../lib/accountDirectory';
import type { DirectoryFilters } from '../../lib/accountDirectory';
import ImportSurveyors from './ImportSurveyors';
import type { ImportAccounts } from './ImportSurveyors';
import { credentialsCsv } from '../../lib/surveyorImport';

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
type DialogView =
  | { type: 'add' }
  | { type: 'import' }
  | { type: 'detail'; id: string }
  | { type: 'issued' };
const emptyFilters: DirectoryFilters = {
  query: '',
  role: 'all',
  status: 'all',
};

export default function SurveyorManagement({
  accounts,
  reports,
  mode,
  onReview,
  onAdd,
  onImport,
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
  onImport: ImportAccounts;
  onReissue: (id: string) => IssueResult;
}) {
  const id = useId();
  const [filters, setFilters] = useState<DirectoryFilters>(emptyFilters);
  const [view, setView] = useState<DialogView | null>(null);
  const [message, setMessage] = useState('');
  const [addError, setAddError] = useState('');
  // Temporary credentials are only present while the result dialog is open.
  const [issued, setIssued] = useState<IssuedPassword[] | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const candidates = accountDirectory(accounts, filters, mode);
  const total = accountDirectory(accounts, emptyFilters, mode).length;
  const selected =
    view?.type === 'detail'
      ? accounts.find(
          (account) => account.id === view.id && account.role !== 'owner',
        )
      : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (view) {
      if (!dialog.open) dialog.showModal();
      (view.type === 'add' ? nameRef : headingRef).current?.focus();
    } else if (dialog.open) dialog.close();
  }, [view]);

  function openDialog(next: DialogView, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setMessage('');
    setAddError('');
    setIssued(null);
    setView(next);
  }
  function closeDialog() {
    setView(null);
    setIssued(null);
    setAddError('');
    setMessage('');
    if (triggerRef.current?.isConnected) triggerRef.current.focus();
    else searchRef.current?.focus();
  }
  function addSurveyor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
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
    setIssued([result]);
    setFilters(emptyFilters);
    setView({ type: 'issued' });
  }
  function reissue(candidate: DemoAccount) {
    const result = onReissue(candidate.id);
    if ('error' in result) {
      setMessage(result.error);
      return;
    }
    setMessage('');
    setIssued([result]);
    setView({ type: 'issued' });
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
    <section className="account-directory" aria-labelledby={`${id}-title`}>
      <div className="directory-heading">
        <div>
          <h2 id={`${id}-title`}>
            {mode === 'applications'
              ? 'Pengajuan pesurvei'
              : 'Daftar pesurvei dan admin'}
          </h2>
          <p>
            Lihat akun, organisasi, dan status akses. Penugasan bangunan
            dikelola secara terpisah.
          </p>
        </div>
        {mode === 'surveyors' && (
          <div className="directory-heading-actions">
            <button
              type="button"
              className="ws-secondary"
              aria-haspopup="dialog"
              onClick={(event) =>
                openDialog({ type: 'import' }, event.currentTarget)
              }
            >
              Impor Excel/CSV
            </button>
            <button
              type="button"
              className="ws-primary"
              aria-haspopup="dialog"
              onClick={(event) =>
                openDialog({ type: 'add' }, event.currentTarget)
              }
            >
              <span aria-hidden="true">＋</span> Tambah akun
            </button>
          </div>
        )}
      </div>
      <div className="ws-panel directory-filters">
        <label className="directory-search">
          Cari akun
          <input
            ref={searchRef}
            type="search"
            placeholder="Nama, email, atau organisasi"
            value={filters.query}
            onChange={(event) =>
              setFilters({ ...filters, query: event.target.value })
            }
          />
        </label>
        <label>
          Peran
          <select
            value={filters.role}
            onChange={(event) =>
              setFilters({
                ...filters,
                role: event.target.value as DirectoryFilters['role'],
              })
            }
          >
            <option value="all">Semua peran</option>
            <option value="surveyor">Pesurvei</option>
            {mode === 'surveyors' && <option value="admin">Admin</option>}
          </select>
        </label>
        <label>
          Status akun
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters({
                ...filters,
                status: event.target.value as DirectoryFilters['status'],
              })
            }
          >
            <option value="all">Semua status</option>
            {Object.entries(accountStatusLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="directory-results">
        <p role="status">
          {candidates.length} dari {total} akun
        </p>
        {(filters.query ||
          filters.role !== 'all' ||
          filters.status !== 'all') && (
          <button
            type="button"
            className="ws-secondary"
            onClick={() => setFilters(emptyFilters)}
          >
            Reset filter
          </button>
        )}
      </div>
      <div
        className="ws-panel directory-table-wrap"
        role="region"
        aria-label="Daftar akun"
        tabIndex={0}
      >
        <table className="directory-table">
          <caption className="directory-sr-only">
            Daftar akun pesurvei dan admin
          </caption>
          <thead>
            <tr>
              <th scope="col">Nama dan email</th>
              <th scope="col">Organisasi</th>
              <th scope="col">Peran</th>
              <th scope="col">Status akun</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <th scope="row">
                  <strong>{candidate.name}</strong>
                  <span>{candidate.email}</span>
                </th>
                <td>{candidate.organization || 'Belum dicatat'}</td>
                <td>{candidate.role === 'admin' ? 'Admin' : 'Pesurvei'}</td>
                <td>
                  <span
                    className={`directory-status ${candidate.status === 'active' ? 'is-active' : ''}`}
                  >
                    {accountStatusLabels[candidate.status]}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="ws-secondary"
                    aria-haspopup="dialog"
                    aria-label={`${candidate.role === 'admin' ? 'Detail' : 'Kelola'} akun ${candidate.name}`}
                    onClick={(event) =>
                      openDialog(
                        { type: 'detail', id: candidate.id },
                        event.currentTarget,
                      )
                    }
                  >
                    {candidate.role === 'admin' ? 'Detail' : 'Kelola'}
                  </button>
                </td>
              </tr>
            ))}
            {!candidates.length && (
              <tr>
                <td colSpan={5} className="directory-empty">
                  {total
                    ? 'Tidak ada akun yang sesuai. Ubah pencarian atau reset filter.'
                    : 'Belum ada akun pada daftar ini.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <dialog
        ref={dialogRef}
        className={`directory-dialog ${view?.type === 'import' ? 'directory-dialog-wide' : ''}`}
        aria-labelledby={`${id}-dialog-title`}
        onClose={closeDialog}
      >
        {view && (
          <>
            <div className="directory-dialog-heading">
              <h2 ref={headingRef} tabIndex={-1} id={`${id}-dialog-title`}>
                {view.type === 'add'
                  ? 'Tambah akun pesurvei'
                  : view.type === 'import'
                    ? 'Impor akun pesurvei'
                    : view.type === 'issued'
                      ? 'Sandi sementara siap'
                      : selected?.role === 'admin'
                        ? 'Detail akun admin'
                        : 'Kelola akun pesurvei'}
              </h2>
              {view.type !== 'issued' && (
                <button
                  className="ws-secondary"
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                >
                  Tutup
                </button>
              )}
            </div>
            {view.type === 'import' && (
              <ImportSurveyors
                accounts={accounts}
                onImport={onImport}
                onSuccess={(credentials) => {
                  setIssued(credentials);
                  setFilters(emptyFilters);
                  setView({ type: 'issued' });
                }}
              />
            )}
            {view.type === 'add' && (
              <form
                className="report-form directory-add"
                onSubmit={addSurveyor}
              >
                <p className="ws-muted">
                  Akun baru mendapat peran pesurvei. Sistem menyiapkan sandi
                  sementara; pesurvei wajib menggantinya saat masuk pertama.
                </p>
                <label>
                  Nama pesurvei (contoh)
                  <input ref={nameRef} name="name" maxLength={200} required />
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
                <p className="ws-muted">
                  Verifikasi kompetensi mengikuti tata cara organisasi dan
                  supervisi ahli.
                </p>
                {addError && (
                  <p role="alert" className="ws-disclaimer">
                    {addError}
                  </p>
                )}
                <div className="report-actions">
                  <button className="ws-primary" type="submit">
                    Buat akun pesurvei
                  </button>
                  <button
                    className="ws-secondary"
                    type="button"
                    onClick={() => dialogRef.current?.close()}
                  >
                    Batalkan
                  </button>
                </div>
              </form>
            )}
            {view.type === 'issued' && issued && (
              <div className="directory-issued">
                <p>{issued.length} akun siap digunakan.</p>
                {issued.map((credential) => (
                  <div key={credential.email} className="directory-credential">
                    <strong>{credential.name}</strong>
                    <dl>
                      <div>
                        <dt>Email</dt>
                        <dd>{credential.email}</dd>
                      </div>
                      <div>
                        <dt>Sandi sementara</dt>
                        <dd>
                          <code>{credential.password}</code>
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
                <p>
                  Catat sandi sebelum menutup dialog ini. Sampaikan lewat jalur
                  terpisah; pesurvei wajib menggantinya saat masuk pertama.
                </p>
                {issued.length > 1 && (
                  <button
                    type="button"
                    className="ws-secondary"
                    onClick={() => {
                      const url = URL.createObjectURL(
                        new Blob([credentialsCsv(issued)], {
                          type: 'text/csv;charset=utf-8',
                        }),
                      );
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'sandi-sementara-pesurvei.csv';
                      link.click();
                      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
                    }}
                  >
                    Unduh sandi sementara (CSV)
                  </button>
                )}
                <button
                  type="button"
                  className="ws-primary"
                  onClick={() => dialogRef.current?.close()}
                >
                  Sudah saya catat, tutup
                </button>
              </div>
            )}
            {view.type === 'detail' && selected?.role === 'admin' && (
              <dl className="directory-admin-detail">
                <div>
                  <dt>Nama</dt>
                  <dd>{selected.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{selected.email}</dd>
                </div>
                <div>
                  <dt>Organisasi</dt>
                  <dd>{selected.organization || 'Belum dicatat'}</dd>
                </div>
                <div>
                  <dt>Status akun</dt>
                  <dd>{accountStatusLabels[selected.status]}</dd>
                </div>
              </dl>
            )}
            {view.type === 'detail' && selected?.role === 'surveyor' && (
              <SurveyorDetails
                candidate={selected}
                reports={reports}
                submit={submit}
                reissue={reissue}
              />
            )}
            {message && (
              <p role="status" className="ws-notice">
                {message}
              </p>
            )}
          </>
        )}
      </dialog>
    </section>
  );
}

function SurveyorDetails({
  candidate,
  reports,
  submit,
  reissue,
}: {
  candidate: DemoAccount;
  reports: Report[];
  submit: (event: FormEvent<HTMLFormElement>, candidate: DemoAccount) => void;
  reissue: (candidate: DemoAccount) => void;
}) {
  const open = reports.filter(
    (report) =>
      report.assignee === candidate.id &&
      ['Ditugaskan', 'Dalam survei', 'Perlu revisi'].includes(report.status),
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
        <strong>{candidate.managed ? 'Akun: ' : 'Email: '}</strong>
        {candidate.managed
          ? 'Dibuat dan didata admin'
          : candidate.emailVerified
            ? 'Terverifikasi'
            : 'Belum diverifikasi'}
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
            Menunggu pesurvei masuk dengan sandi sementara dan membuat kata
            sandi baru. Sebelum itu akun belum dapat menerima penugasan.
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
          Pemohon perlu memverifikasi email sebelum admin dapat menyetujui.
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
              {open} penugasan yang masih berjalan akan dikembalikan ke admin
              jika akses dinonaktifkan. Catatan survei sebelumnya tetap
              disimpan.
            </p>
          )}
          <div className="report-actions">
            {['pending', 'changes-requested'].includes(candidate.status) && (
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
}
