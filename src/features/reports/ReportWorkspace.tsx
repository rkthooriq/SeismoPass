import { useEffect, useRef, useState } from 'react';
import type { ComponentProps, FormEvent } from 'react';
import {
  advanceReport,
  saveReportRvs,
  visibleReports,
  validateReportRegistration,
} from '../../lib/reportDemo';
import type { DemoAccount, Report, ReportAction } from '../../lib/reportDemo';
import {
  parseSurveyRoute,
  isReportDetailPage,
  parseReportDetailRoute,
  reportDetailRoute,
  reportsOnPage,
  resolveWorkflowPage,
  statusFilterOptions,
  surveyRoute,
  workflowPageTitle,
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
import SurveyForm from './SurveyForm';
import FilterMenu from '../../components/FilterMenu';
import Pagination from '../../components/Pagination';
import Notice from '../../components/Notice';
import type { NoticeTone } from '../../components/Notice';
import usePagination from '../../components/usePagination';
import ReportRegistrationForm from './ReportRegistrationForm';
import OwnerWorkspace from './OwnerWorkspace';
import UsageGuide from '../help/UsageGuide';
import { planAssignment, verifyAndAssign } from '../../lib/assignmentFlow';
import {
  updateOwnerProgress,
  recordOwnerConfirmation,
} from '../../lib/ownerProgress';
import UserProfilePage from '../profile/UserProfilePage';
import { emptyListText, nextActionFor } from '../../lib/roleNextAction';
import { toUserProfile } from '../../lib/userProfile';
import type { ProfileInput } from '../../lib/userProfile';
import '../workspace/workspace.css';
import './reports.css';
import '../rvs/rvs.css';

function ReportWorkspaceContent({
  route = 'dashboard',
  account,
  accounts,
  reports,
  onChange,
  onProfileSave,
  onReview,
  onAddSurveyor,
  onImportSurveyors,
  onReissuePassword,
  storageFailed,
  invalidSession = false,
  notice = '',
  onNotice = () => {},
}: {
  /** A confirmation carried across a route change (the content remounts). */
  notice?: string;
  onNotice?: (text: string, route: string) => void;
  route?: string;
  account: DemoAccount;
  accounts: DemoAccount[];
  reports: Report[];
  onChange: (reports: Report[]) => void;
  onProfileSave: (input: ProfileInput) => string;
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
  onImportSurveyors: (
    inputs: NewSurveyorInput[],
  ) => { issued: IssuedPassword[] } | { error: string };
  onLeave: () => void;
  storageFailed: boolean;
  invalidSession?: boolean;
}) {
  const page = resolveWorkflowPage(account.role, route);
  const surveyId = account.role === 'surveyor' ? parseSurveyRoute(route) : null;
  const detailRoute =
    page && account.role !== 'owner' ? parseReportDetailRoute(route) : null;
  // The reporter's report detail has its own address too, so Back, refresh
  // and shared links work like on any other page.
  const ownerDetailId =
    account.role === 'owner' && page === 'reports'
      ? (parseReportDetailRoute(route)?.reportId ?? null)
      : null;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  // A status chosen on one list must not silently empty the next one.
  const [statusPage, setStatusPage] = useState(page);
  if (statusPage !== page) {
    setStatusPage(page);
    setStatus([]);
  }
  const [editing, setEditing] = useState<Report | null>(null);
  // Feedback after an action: green when it worked, red when it did not, so
  // a refusal never looks like a confirmation.
  const [feedback, setFeedback] = useState<{
    text: string;
    tone: NoticeTone;
  }>({ text: '', tone: 'success' });
  const message = feedback.text;
  const setMessage = (text: string, tone: NoticeTone = 'success') =>
    setFeedback({ text, tone });
  const visible = visibleReports(reports, account);
  const detailReport = detailRoute
    ? visible.find((item) => item.id === detailRoute.reportId)
    : undefined;
  const lastDetail = useRef<string | null>(null);
  const detailId = detailRoute?.reportId;
  useEffect(() => {
    if (detailId) {
      lastDetail.current = detailId;
      document
        .getElementById('report-focus-title')
        ?.focus({ preventScroll: true });
    } else if (lastDetail.current) {
      const target =
        document.getElementById(`report-link-${lastDetail.current}`) ??
        document.getElementById('role-main');
      target?.focus();
      lastDetail.current = null;
    }
  }, [detailId]);
  const onPage = reportsOnPage(page, visible);
  const statusOptions = statusFilterOptions(page, onPage);
  // A chosen status that no longer has reports drops out of the selection.
  const activeStatus = status.filter((value) =>
    statusOptions.some((option) => option.status === value),
  );
  const filtered = onPage.filter(
    (report) =>
      (!activeStatus.length || activeStatus.includes(report.status)) &&
      [report.id, report.title, report.location, report.address ?? ''].some(
        (value) => value.toLowerCase().includes(search.trim().toLowerCase()),
      ),
  );
  const pager = usePagination(
    filtered,
    `${page}|${search.trim()}|${activeStatus.join(',')}`,
  );
  const pageEmpty = page ? emptyListText[page] : undefined;
  const nextAction = nextActionFor(
    account.role,
    visible,
    accounts.filter(
      (person) => person.role === 'surveyor' && person.status === 'active',
    ).length,
  );
  const count = (statuses: string[]) =>
    visible.filter((report) => statuses.includes(report.status)).length;
  const title = workflowPageTitle(account.role, page);
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
    // The list route remounts this content, so the confirmation travels with
    // the navigation instead of living in this component's state.
    onNotice(
      send
        ? 'Laporan dikirim untuk diperiksa admin.'
        : 'Draf disimpan. Lengkapi data saat siap mengirim.',
      'dashboard/reports',
    );
    window.location.assign('#/dashboard/reports');
  }
  function update(event: FormEvent<HTMLFormElement>, report: Report) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const button = (event.nativeEvent as SubmitEvent).submitter;
    if (!(button instanceof HTMLButtonElement)) return;
    const action = button.value as ReportAction;
    // "Data lengkap" with a surveyor chosen: approve and assign in one go.
    if (action === 'verify' && form.has('surveyorId')) {
      const target = accounts.find(
        (person) => person.id === form.get('surveyorId'),
      );
      const plan = verifyAndAssign(report, account, target, {
        note: String(form.get('assignmentNote') ?? ''),
        date: String(form.get('appointmentDate') ?? ''),
        slot: String(form.get('appointmentSlot') ?? ''),
      });
      if (!plan) {
        setMessage(
          'Belum dapat ditugaskan. Pilih pesurvei aktif, isi catatan penugasan, serta tanggal kunjungan (hari ini atau setelahnya) dan rentang waktunya.',
          'error',
        );
        return;
      }
      replace(plan.report);
      const route = reportDetailRoute('assignments', report.id);
      onNotice(
        `Data laporan dinyatakan lengkap dan diteruskan ke ${target?.name ?? 'pesurvei'}. ${
          plan.agreed
            ? 'Jadwal mengikuti pilihan pelapor dan langsung disepakati.'
            : 'Pelapor perlu mengonfirmasi jadwal sebelum survei dimulai.'
        }`,
        route.slice(2),
      );
      window.location.assign(route);
      return;
    }
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
        'error',
      );
      return;
    }
    onChange(reports.map((item) => (item.id === report.id ? next : item)));
    if (action === 'start') {
      openSurvey(report.id);
      return;
    }
    if (action === 'verify') {
      onNotice(
        'Data laporan dinyatakan lengkap. Pilih pesurvei untuk meneruskan laporan.',
        'dashboard/assignments',
      );
      window.location.assign('#/dashboard/assignments');
      return;
    }
    setMessage(
      action === 'return'
        ? 'Laporan dikembalikan ke pelapor beserta catatanmu.'
        : action === 'revise'
          ? 'Catatan dikembalikan ke pesurvei untuk direvisi.'
          : action === 'close'
            ? 'Administrasi ditutup. Pelapor melihat catatan penutupmu.'
            : `Status laporan: ${next.status}.`,
    );
  }
  function openSurvey(id: string) {
    onNotice(
      'Survei dimulai. Catat kunjungan dan input RVS, lalu kirim untuk ditinjau admin.',
      surveyRoute(id).slice(2),
    );
    window.location.assign(surveyRoute(id));
  }
  function replace(next: Report) {
    onChange(reports.map((item) => (item.id === next.id ? next : item)));
  }
  function assign(event: FormEvent<HTMLFormElement>, report: Report) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const target = accounts.find(
      (person) => person.id === form.get('surveyorId'),
    );
    const plan = planAssignment(report, account, target, {
      note: String(form.get('assignmentNote') ?? ''),
      date: String(form.get('appointmentDate') ?? ''),
      slot: String(form.get('appointmentSlot') ?? ''),
    });
    if (!plan) {
      setMessage(
        'Pilih pesurvei aktif, isi catatan penugasan, serta tanggal kunjungan (hari ini atau setelahnya) dan rentang waktunya.',
        'error',
      );
      return;
    }
    replace(plan.report);
    const { agreed, unchanged } = plan;
    setMessage(
      report.assignee !== target?.id
        ? agreed
          ? `Laporan diteruskan ke ${target?.name ?? 'pesurvei'}. Jadwal mengikuti pilihan pelapor dan langsung disepakati.`
          : `Laporan diteruskan ke ${target?.name ?? 'pesurvei'}. Pelapor perlu mengonfirmasi jadwal sebelum survei dimulai.`
        : unchanged
          ? 'Penugasan diperbarui. Jadwal tetap sama.'
          : agreed
            ? 'Jadwal pilihan pelapor dipakai dan langsung disepakati.'
            : 'Jadwal baru diusulkan. Pesurvei menunggu konfirmasi pelapor.',
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
                'Catatan dan simulasi belum divalidasi. RVS bukan sertifikat aman.',
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
    link.download = 'seismopass-laporan.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const card = (report: Report) => (
    <ReportCard
      key={report.id}
      report={report}
      account={account}
      accounts={accounts}
      focused={!!detailRoute}
      detailHref={reportDetailRoute(
        isReportDetailPage(page)
          ? page
          : account.role === 'admin'
            ? 'reports'
            : 'tasks',
        report.id,
      )}
      onUpdate={update}
      onAssign={assign}
      onConfirmSchedule={(event, item) => {
        event.preventDefault();
        const note = String(
          new FormData(event.currentTarget).get('confirmationNote') ?? '',
        );
        const next = recordOwnerConfirmation(item, account, note);
        if (!next) {
          setMessage(
            'Konfirmasi belum dicatat. Tulis cara pelapor menyetujui, dan pastikan jadwal belum lewat.',
            'error',
          );
          return;
        }
        replace(next);
        setMessage(
          'Konfirmasi pelapor dicatat. Pesurvei kini bisa memulai survei sesuai jadwal.',
        );
      }}
      onEdit={() => {
        setEditing(report);
        requestAnimationFrame(() =>
          document
            .getElementById('edit-report')
            ?.scrollIntoView({ behavior: 'instant', block: 'start' }),
        );
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
    <>
      {storageFailed && (
        <Notice tone="warning" role="status">
          <p>
            Penyimpanan tab tidak tersedia. Perubahan hanya bertahan selama
            aplikasi terbuka.
          </p>
        </Notice>
      )}
      {invalidSession && (
        <Notice tone="warning" role="status">
          <p>
            Sesi sebelumnya tidak dapat dipulihkan; data contoh dipakai. Simpan
            perubahan untuk memulai sesi baru.
          </p>
        </Notice>
      )}
      {(message || notice) && (
        <Notice tone={message ? feedback.tone : 'success'} role="status">
          <p>{message || notice}</p>
        </Notice>
      )}
      {page === 'profile' && (
        <UserProfilePage
          profile={toUserProfile(account)}
          onSave={onProfileSave}
          storageFailed={storageFailed}
        />
      )}
      {page === 'help' && <UsageGuide role={account.role} />}
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

      {detailRoute && (
        <div className="report-focused-detail">
          <div className="report-detail-heading">
            <a
              className="ws-secondary"
              href={`#/dashboard/${detailRoute.page}`}
            >
              <span aria-hidden="true">←</span> Kembali ke {title}
            </a>
          </div>
          {detailReport ? (
            card(detailReport)
          ) : (
            <section className="ws-panel">
              <h1 id="report-focus-title" tabIndex={-1}>
                Laporan tidak ditemukan
              </h1>
              <p>
                Laporan ini tidak tersedia atau tidak berada dalam cakupan
                aksesmu.
              </p>
            </section>
          )}
        </div>
      )}
      {page === 'overview' && !detailRoute && (
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
                      : 'Laporan yang dikirim pelapor akan muncul di sini.'}
                  </p>
                </div>
              )}
            </section>
            {nextAction && (
              <aside className="role-next-step">
                <span className="ws-badge">Langkah berikutnya</span>
                <h2>{nextAction.title}</h2>
                <p>{nextAction.text}</p>
                <a
                  className="ws-primary"
                  href={`#/dashboard/${nextAction.page}`}
                >
                  {nextAction.label}
                </a>
              </aside>
            )}
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
          onImport={onImportSurveyors}
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
      {page === 'reports' && account.role === 'owner' && (
        // Kept mounted while editing so Batal returns to the same report.
        <div hidden={!!editing}>
          <OwnerWorkspace
            reports={visible}
            accounts={accounts}
            selectedId={ownerDetailId}
            onSelect={(id) =>
              window.location.assign(
                id ? reportDetailRoute('reports', id) : '#/dashboard/reports',
              )
            }
            onEdit={(report) => {
              setEditing(report);
              requestAnimationFrame(() =>
                document
                  .getElementById('edit-report')
                  ?.scrollIntoView({ block: 'start', behavior: 'instant' }),
              );
            }}
            onSave={(report, action) => {
              const next = updateOwnerProgress(report, account, action);
              if (!next) return false;
              onChange(
                reports.map((item) => (item.id === report.id ? next : item)),
              );
              return true;
            }}
            onSubmit={(report) => {
              const next = advanceReport(report, account, 'submit');
              if (!next) {
                setMessage(
                  [
                    'Lengkapi data sebelum mengirim.',
                    ...Object.values(validateReportRegistration(report)),
                  ].join(' '),
                  'error',
                );
                return;
              }
              onChange(
                reports.map((item) => (item.id === report.id ? next : item)),
              );
              setMessage('Laporan dikirim untuk diperiksa admin.');
            }}
          />
        </div>
      )}
      {surveyId && (
        <SurveyForm
          key={surveyId}
          report={visible.find((item) => item.id === surveyId)}
          account={account}
          accounts={accounts}
          onStart={(report) => {
            const next = advanceReport(report, account, 'start');
            if (!next) return false;
            replace(next);
            setMessage(
              'Survei dimulai. Catat kunjungan dan input RVS, lalu kirim untuk ditinjau admin.',
            );
            return true;
          }}
          onRvs={(report, record) => {
            const next = saveReportRvs(report, account, record);
            if (!next) return false;
            replace(next);
            return true;
          }}
          onSubmit={(report, date, note) => {
            const next = advanceReport(report, account, 'visit', {
              date,
              note,
            });
            if (!next) return false;
            replace(next);
            onNotice(
              'Hasil survei terkirim. Laporan pindah ke Riwayat survei selama ditinjau admin.',
              'dashboard/history',
            );
            window.location.assign('#/dashboard/history');
            return true;
          }}
        />
      )}
      {page &&
        !surveyId &&
        !detailRoute &&
        listPages.includes(page) &&
        account.role !== 'owner' && (
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
                {statusOptions.length > 0 && (
                  <FilterMenu
                    label="Status"
                    options={statusOptions.map((option) => ({
                      value: option.status,
                      label: option.status,
                      count: option.count,
                    }))}
                    selected={activeStatus}
                    onChange={setStatus}
                  />
                )}
              </div>
              {filtered.length ? (
                <>
                  <div className="role-report-items" id={pager.listId}>
                    {pager.items.map(card)}
                  </div>
                  <Pagination pager={pager} label="laporan" unit="laporan" />
                </>
              ) : (
                <div className="role-empty">
                  <span>▤</span>
                  <h3>
                    {onPage.length || !pageEmpty
                      ? 'Belum ada laporan yang sesuai.'
                      : pageEmpty.title}
                  </h3>
                  <p>
                    {onPage.length || !pageEmpty
                      ? 'Ubah pencarian atau filter status.'
                      : pageEmpty.text}
                  </p>
                </div>
              )}
            </section>
          </>
        )}
    </>
  );
}

// Keep the shell mounted so the liquid indicator can travel between destinations.
// A list and its detail share the same content state, preserving filters and
// pagination when returning. Other destinations start their own form state.
export default function ReportWorkspace(
  props: Omit<
    ComponentProps<typeof ReportWorkspaceContent>,
    'notice' | 'onNotice'
  >,
) {
  const { account, reports, route = 'dashboard', onLeave } = props;
  // A notice is shown on the route it was sent to, then dropped as soon as
  // the user moves on, so it never reappears on a later visit.
  const [notice, setNotice] = useState<{
    text: string;
    route: string;
    seen: boolean;
  } | null>(null);
  const [lastRoute, setLastRoute] = useState(route);
  if (route !== lastRoute) {
    setLastRoute(route);
    if (notice)
      setNotice(
        notice.route === route && !notice.seen
          ? { ...notice, seen: true }
          : null,
      );
  }
  const page = resolveWorkflowPage(account.role, route);
  const visible = visibleReports(reports, account);
  const count = (statuses: string[]) =>
    visible.filter((report) => statuses.includes(report.status)).length;
  const counts: Partial<Record<WorkflowPage, number>> = {
    incoming: count(['Dikirim']),
    assignments: count(['Siap disurvei', 'Ditugaskan']),
    review: count(['Ditinjau']),
    tasks: count(['Ditugaskan', 'Dalam survei', 'Perlu revisi']),
    reports: visible.length,
  };
  return (
    <WorkspaceShell
      account={account}
      page={page}
      counts={counts}
      onLeave={onLeave}
    >
      <ReportWorkspaceContent
        key={parseSurveyRoute(route) || !page ? route : `dashboard/${page}`}
        {...props}
        notice={notice?.route === route ? notice.text : ''}
        onNotice={(text, target) =>
          setNotice({ text, route: target, seen: target === route })
        }
      />
    </WorkspaceShell>
  );
}
