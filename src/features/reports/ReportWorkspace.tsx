import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  advanceReport,
  assignReport,
  saveReportRvs,
  visibleReports,
  validateReportRegistration,
} from '../../lib/reportDemo';
import type { DemoAccount, Report, ReportAction } from '../../lib/reportDemo';
import {
  resolveWorkflowPage,
  workflowMenus,
} from '../../lib/workflowNavigation';
import type { WorkflowPage } from '../../lib/workflowNavigation';
import type {
  IssuedPassword,
  ReviewAction,
} from '../onboarding/SurveyorManagement';
import type { NewSurveyorInput } from '../../lib/surveyorAccess';
import SurveyorManagement from '../onboarding/SurveyorManagement';
import WorkspaceShell from './WorkspaceShell';
import ReportCard from './ReportCard';
import ReportRegistrationForm from './ReportRegistrationForm';
import PilotOverview from './PilotOverview';
import OwnerNextSteps from './OwnerNextSteps';
import RoleFlowGuide from './RoleFlowGuide';
import '../workspace/workspace.css';
import './reports.css';
import '../rvs/rvs.css';

export default function ReportWorkspace({
  route = 'dashboard',
  account,
  accounts,
  reports,
  onChange,
  onReview,
  onAddSurveyor,
  onReissuePassword,
  onLeave,
  storageFailed,
  invalidSession = false,
}: {
  route?: string;
  account: DemoAccount;
  accounts: DemoAccount[];
  reports: Report[];
  onChange: (reports: Report[]) => void;
  onReview: (
    id: string,
    action: ReviewAction,
    note: string,
    checked: boolean,
  ) => boolean;
  onAddSurveyor: (
    input: NewSurveyorInput,
  ) => IssuedPassword | { error: string };
  onReissuePassword: (id: string) => IssuedPassword | { error: string };
  onLeave: () => void;
  storageFailed: boolean;
  invalidSession?: boolean;
}) {
  const page = resolveWorkflowPage(account.role, route);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<Report | null>(null);
  const [message, setMessage] = useState('');
  const visible = visibleReports(reports, account);
  const matchesPage = (report: Report) =>
    page === 'incoming'
      ? report.status === 'Dikirim'
      : page === 'assignments'
        ? ['Siap disurvei', 'Ditugaskan'].includes(report.status)
        : page === 'review'
          ? report.status === 'Ditinjau'
          : page === 'tasks'
            ? ['Ditugaskan', 'Dalam survei', 'Perlu revisi'].includes(
                report.status,
              )
            : page === 'history'
              ? ['Ditinjau', 'Selesai'].includes(report.status)
              : true;
  const filtered = visible.filter(
    (report) =>
      matchesPage(report) &&
      (!status || report.status === status) &&
      [report.id, report.title, report.location].some((value) =>
        value.toLowerCase().includes(search.trim().toLowerCase()),
      ),
  );
  const count = (statuses: string[]) =>
    visible.filter((report) => statuses.includes(report.status)).length;
  const counts: Partial<Record<WorkflowPage, number>> = {
    incoming: count(['Dikirim']),
    assignments: count(['Siap disurvei', 'Ditugaskan']),
    review: count(['Ditinjau']),
    tasks: count(['Ditugaskan', 'Dalam survei', 'Perlu revisi']),
    reports: visible.length,
  };
  const title =
    workflowMenus[account.role].find(([id]) => id === page)?.[1] ??
    'Halaman tidak tersedia';
  const intro =
    account.role === 'admin'
      ? 'Kelola akses pesurvei, atur penugasan, dan pantau tindak lanjut bangunan.'
      : account.role === 'surveyor'
        ? 'Kerjakan penugasan dari admin dan catat hasil kunjungan secara tertata.'
        : 'Catat bangunanmu dan ikuti setiap langkah tindak lanjutnya.';
  function saveDraft(draft: Report, send: boolean) {
    if (account.role !== 'owner' || draft.reporterId !== account.id) return;
    const original = editing
      ? visible.find(
          (item) =>
            item.id === editing.id &&
            ['Draf', 'Perlu dilengkapi'].includes(item.status),
        )
      : undefined;
    if (editing && !original) return;
    const next = send ? advanceReport(draft, account, 'submit') : draft;
    if (!next) return;
    onChange(
      original
        ? reports.map((item) => (item.id === original.id ? next : item))
        : [...reports, next],
    );
    setEditing(null);
    setMessage(
      send
        ? 'Laporan dikirim untuk diperiksa admin.'
        : 'Draf disimpan. Lengkapi data saat siap mengirim.',
    );
    window.location.assign('#/dashboard/reports');
  }
  function update(event: FormEvent<HTMLFormElement>, report: Report) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const button = (event.nativeEvent as SubmitEvent).submitter;
    if (!(button instanceof HTMLButtonElement)) return;
    const action = button.value as ReportAction;
    const next = advanceReport(report, account, action, {
      date: String(form.get('date') ?? ''),
      note: String(form.get('note') ?? ''),
    });
    if (!next) {
      setMessage(
        [
          'Tindakan belum dapat diproses.',
          ...(['submit', 'verify'].includes(action)
            ? Object.values(validateReportRegistration(report))
            : ['Periksa isian, tanggal, status, dan penugasan.']),
        ].join(' '),
      );
      return;
    }
    onChange(reports.map((item) => (item.id === report.id ? next : item)));
    setMessage(`Status laporan: ${next.status}.`);
  }
  function assign(event: FormEvent<HTMLFormElement>, report: Report) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const target = accounts.find(
      (person) => person.id === form.get('surveyorId'),
    );
    const next = target
      ? assignReport(
          report,
          account,
          target,
          String(form.get('assignmentNote') ?? ''),
        )
      : null;
    if (!next) {
      setMessage(
        'Pilih pesurvei aktif yang telah disetujui dan isi catatan penugasan.',
      );
      return;
    }
    onChange(reports.map((item) => (item.id === report.id ? next : item)));
    setMessage(
      'Penugasan disimpan. Laporan kini terlihat pada akun pesurvei yang dipilih.',
    );
  }
  function exportReports() {
    if (account.role !== 'admin') return;
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              mode: 'DEMONSTRASI',
              description:
                'Catatan demo dan simulasi belum divalidasi. RVS bukan sertifikat aman.',
              reports: filtered,
            },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'seismopass-laporan-demo.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const card = (report: Report) => (
    <ReportCard
      key={report.id}
      report={report}
      account={account}
      accounts={accounts}
      onUpdate={update}
      onAssign={assign}
      onEdit={() => {
        setEditing(report);
        requestAnimationFrame(() =>
          document
            .getElementById('edit-report')
            ?.scrollIntoView({ behavior: 'instant', block: 'start' }),
        );
      }}
      onRvs={(record) => {
        const next = saveReportRvs(report, account, record);
        if (!next) return false;
        onChange(reports.map((item) => (item.id === report.id ? next : item)));
        return true;
      }}
    />
  );
  const listPages = [
    'reports',
    'incoming',
    'assignments',
    'review',
    'tasks',
    'history',
  ];
  const stats: {
    label: string;
    value: number;
    page: WorkflowPage;
    note: string;
  }[] =
    account.role === 'admin'
      ? [
          {
            label: 'Pesurvei aktif',
            value: accounts.filter(
              (person) =>
                person.role === 'surveyor' && person.status === 'active',
            ).length,
            page: 'surveyors',
            note: 'Akun yang kamu daftarkan',
          },
          {
            label: 'Laporan masuk',
            value: count(['Dikirim']),
            page: 'incoming',
            note: 'Periksa kelengkapan data',
          },
          {
            label: 'Menunggu penugasan',
            value: count(['Siap disurvei']),
            page: 'assignments',
            note: 'Pilih pesurvei yang aktif',
          },
          {
            label: 'Catatan perlu ditinjau',
            value: count(['Ditinjau']),
            page: 'review',
            note: 'Tinjauan administrasi',
          },
        ]
      : account.role === 'owner'
        ? [
            {
              label: 'Semua laporan',
              value: visible.length,
              page: 'reports',
              note: 'Bangunan yang kamu catat',
            },
            {
              label: 'Draf / perlu dilengkapi',
              value: count(['Draf', 'Perlu dilengkapi']),
              page: 'reports',
              note: 'Lanjutkan pencatatanmu',
            },
            {
              label: 'Dalam proses',
              value: count([
                'Dikirim',
                'Siap disurvei',
                'Ditugaskan',
                'Dalam survei',
                'Perlu revisi',
                'Ditinjau',
              ]),
              page: 'reports',
              note: 'Ikuti catatan tindak lanjut',
            },
            {
              label: 'Administrasi selesai',
              value: count(['Selesai']),
              page: 'reports',
              note: 'Bukan pengesahan keamanan',
            },
          ]
        : [
            {
              label: 'Tugas baru',
              value: count(['Ditugaskan']),
              page: 'tasks',
              note: 'Penugasan dari admin',
            },
            {
              label: 'Sedang dikerjakan',
              value: count(['Dalam survei']),
              page: 'tasks',
              note: 'Lengkapi catatan kunjungan',
            },
            {
              label: 'Perlu revisi',
              value: count(['Perlu revisi']),
              page: 'tasks',
              note: 'Baca catatan admin',
            },
            {
              label: 'Sudah dikirim',
              value: count(['Ditinjau', 'Selesai']),
              page: 'history',
              note: 'Tinjauan dan riwayat',
            },
          ];
  return (
    <WorkspaceShell
      account={account}
      page={page}
      counts={counts}
      onLeave={onLeave}
    >
      <div className="role-demo-notice">
        <span className="role-live-dot" />
        <span>
          Demo lokal · Data fiktif · Berganti akun di tab yang sama untuk
          mencoba alur
        </span>
        <a href="#/flows">Lihat alur ↗</a>
      </div>
      <div className="role-page-heading">
        <div>
          <span className="role-eyebrow">SEISMOPASS WORKSPACE</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        {account.role === 'owner' && page !== 'new' && (
          <a className="ws-primary" href="#/dashboard/new">
            ＋ Buat laporan
          </a>
        )}
      </div>
      {storageFailed && (
        <p role="status" className="ws-disclaimer">
          Penyimpanan tab tidak tersedia. Perubahan hanya bertahan selama
          aplikasi terbuka.
        </p>
      )}
      {invalidSession && (
        <p role="status" className="ws-disclaimer">
          Sesi demo tidak dapat dipulihkan; data contoh dipakai. Simpan
          perubahan untuk memulai sesi baru.
        </p>
      )}
      {message && (
        <p role="status" className="ws-notice">
          {message}
        </p>
      )}
      {!page && (
        <section className="ws-panel">
          <h2>Halaman tidak tersedia untuk akun ini.</h2>
          <a href="#/dashboard">Kembali ke halaman utama →</a>
        </section>
      )}
      {editing && account.role === 'owner' && (
        <div id="edit-report">
          <ReportRegistrationForm
            key={editing.id}
            initial={editing}
            reporterId={account.id}
            onSave={saveDraft}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {page === 'overview' && (
        <>
          <section
            className="role-stat-grid"
            aria-label="Ringkasan ruang kerja"
          >
            {stats.map((stat) => (
              <a href={`#/dashboard/${stat.page}`} key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <small>{stat.note}</small>
                <span className="role-stat-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </section>
          <div className="role-overview-grid">
            <section className="ws-panel">
              <div className="ws-section-head">
                <div>
                  <h2>
                    {account.role === 'surveyor'
                      ? 'Penugasan terbaru'
                      : 'Laporan terbaru'}
                  </h2>
                  <p>Catatan dalam cakupan aksesmu.</p>
                </div>
                <a
                  href={`#/dashboard/${account.role === 'surveyor' ? 'tasks' : 'reports'}`}
                >
                  Lihat semua →
                </a>
              </div>
              {visible.length ? (
                visible.slice(-5).reverse().map(card)
              ) : (
                <div className="role-empty">
                  <span>⌂</span>
                  <h3>
                    {account.role === 'surveyor'
                      ? 'Belum ada penugasan'
                      : 'Belum ada laporan'}
                  </h3>
                  <p>
                    {account.role === 'surveyor'
                      ? 'Admin akan menentukan laporan yang ditugaskan kepadamu.'
                      : 'Mulai dari mencatat data dasar bangunan contoh.'}
                  </p>
                </div>
              )}
            </section>
            <aside className="role-next-step">
              <span className="ws-badge">LANGKAH BERIKUTNYA</span>
              <h2>
                {account.role === 'admin'
                  ? 'Daftarkan pesurvei yang tepat.'
                  : account.role === 'owner'
                    ? 'Satu catatan, langkah lebih jelas.'
                    : 'Penugasan yang jelas, catatan tertata.'}
              </h2>
              <p>
                {account.role === 'admin'
                  ? 'Daftarkan pesurvei yang berwenang dan siapkan akunnya, lalu tugaskan laporan kepada pesurvei yang aktif.'
                  : account.role === 'owner'
                    ? 'Lengkapi data dasar. Admin akan memeriksa dan mengatur kunjungan pesurvei.'
                    : 'Buka penugasanmu, mulai survei, lalu kirim catatan kunjungan untuk ditinjau admin.'}
              </p>
              <a
                className="ws-primary"
                href={`#/dashboard/${account.role === 'admin' ? 'surveyors' : account.role === 'owner' ? 'new' : 'tasks'}`}
              >
                {account.role === 'admin'
                  ? 'Kelola pesurvei'
                  : account.role === 'owner'
                    ? 'Catat bangunan'
                    : 'Lihat penugasan'}{' '}
                →
              </a>
              <a href="#/dashboard/flow">Pelajari alur peranmu ↗</a>
            </aside>
          </div>
        </>
      )}
      {page === 'surveyors' && account.role === 'admin' && (
        <SurveyorManagement
          accounts={accounts}
          reports={reports}
          mode="surveyors"
          onReview={onReview}
          onAdd={onAddSurveyor}
          onReissue={onReissuePassword}
        />
      )}
      {page === 'new' && account.role === 'owner' && (
        <ReportRegistrationForm
          initial={null}
          reporterId={account.id}
          onSave={saveDraft}
          onCancel={() => {
            window.location.assign('#/dashboard/reports');
          }}
        />
      )}
      {page === 'flow' && <RoleFlowGuide />}
      {page === 'pilot' && <PilotOverview />}
      {page === 'reports' && account.role === 'owner' && (
        <OwnerNextSteps reports={visible} />
      )}
      {page && listPages.includes(page) && (
        <>
          <section className="ws-panel role-report-list">
            <div className="ws-section-head">
              <div>
                <h2>{title}</h2>
                <p>{filtered.length} laporan dalam daftar ini.</p>
              </div>
              {account.role === 'admin' && (
                <button
                  className="ws-secondary"
                  onClick={exportReports}
                  disabled={!filtered.length}
                >
                  Unduh daftar ↓
                </button>
              )}
            </div>
            <div className="ws-toolbar">
              <label className="ws-search">
                <input
                  aria-label="Cari laporan"
                  placeholder="Cari nama bangunan, lokasi, atau ID"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select
                aria-label="Filter status laporan"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">Semua status</option>
                {[
                  'Draf',
                  'Dikirim',
                  'Perlu dilengkapi',
                  'Siap disurvei',
                  'Ditugaskan',
                  'Dalam survei',
                  'Ditinjau',
                  'Perlu revisi',
                  'Selesai',
                ].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            {filtered.length ? (
              filtered.map(card)
            ) : (
              <div className="role-empty">
                <span>▤</span>
                <h3>Belum ada laporan yang sesuai.</h3>
                <p>
                  {account.role === 'surveyor'
                    ? 'Hanya laporan yang ditugaskan oleh admin yang muncul di sini.'
                    : 'Gunakan menu yang sesuai atau ubah pencarian.'}
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </WorkspaceShell>
  );
}
