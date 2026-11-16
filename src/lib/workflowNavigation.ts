import type { ActorRole } from './actorAccess';
import type { ReportStatus } from './reportDemo';
export const workflowMenus = {
  admin: [
    ['overview', 'Ringkasan', '◫'],
    ['surveyors', 'Kelola pesurvei', '◎'],
    ['incoming', 'Laporan masuk', '↙'],
    ['assignments', 'Penugasan survei', '↗'],
    ['review', 'Tinjauan catatan', '✓'],
    ['reports', 'Semua laporan', '▤'],
  ],
  // Pelapor hanya mencatat lalu menunggu, jadi tanpa halaman Ringkasan.
  // Halaman awalnya "Laporan saya" yang memuat langkah berikutnya.
  owner: [
    ['reports', 'Laporan saya', '▤'],
    ['new', 'Buat laporan', '＋'],
  ],
  surveyor: [
    ['overview', 'Ringkasan', '◫'],
    ['tasks', 'Penugasan saya', '◎'],
    ['history', 'Riwayat survei', '✓'],
  ],
} as const;
export type WorkflowPage =
  | (typeof workflowMenus)[ActorRole][number][0]
  | 'profile';
export function resolveWorkflowPage(
  role: ActorRole,
  route: string,
): WorkflowPage | null {
  if (!Object.hasOwn(workflowMenus, role)) return null;
  const page =
    route === 'dashboard'
      ? role === 'owner'
        ? 'reports'
        : 'overview'
      : route.startsWith('dashboard/')
        ? route.slice(10)
        : '';
  if (page === 'profile') return 'profile';
  return workflowMenus[role].some(([id]) => id === page)
    ? (page as WorkflowPage)
    : null;
}

// Statuses each list page can hold. A page with one status needs no status
// filter; the menu already narrows it. Admin never sees drafts, and a surveyor
// only sees reports assigned to them.
const reportStatuses = [
  'Dikirim',
  'Perlu dilengkapi',
  'Siap disurvei',
  'Ditugaskan',
  'Dalam survei',
  'Ditinjau',
  'Perlu revisi',
  'Selesai',
] as const satisfies readonly ReportStatus[];
export const pageStatuses: Partial<
  Record<WorkflowPage, readonly ReportStatus[]>
> = {
  incoming: ['Dikirim'],
  assignments: ['Siap disurvei', 'Ditugaskan'],
  review: ['Ditinjau'],
  reports: reportStatuses,
  tasks: ['Ditugaskan', 'Dalam survei', 'Perlu revisi'],
  history: ['Ditinjau', 'Selesai'],
};

export function reportsOnPage<T extends { status: ReportStatus }>(
  page: WorkflowPage | null,
  reports: T[],
): T[] {
  const scope = page ? pageStatuses[page] : undefined;
  return scope
    ? reports.filter((report) => scope.includes(report.status))
    : reports;
}

// Only statuses that can appear on the page and currently have reports, with
// their counts. Fewer than two choices means the filter would not narrow
// anything, so the page shows search only.
export function statusFilterOptions(
  page: WorkflowPage | null,
  reports: { status: ReportStatus }[],
): { status: ReportStatus; count: number }[] {
  const scope = page ? pageStatuses[page] : undefined;
  if (!scope || scope.length < 2) return [];
  const options = scope
    .map((status) => ({
      status,
      count: reports.filter((report) => report.status === status).length,
    }))
    .filter((option) => option.count > 0);
  return options.length < 2 ? [] : options;
}
