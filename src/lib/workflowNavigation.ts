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
    ['help', 'Panduan', '?'],
  ],
  // Pelapor hanya mencatat lalu menunggu, jadi tanpa halaman Ringkasan.
  // Halaman awalnya "Laporan saya" yang memuat langkah berikutnya.
  owner: [
    ['reports', 'Laporan saya', '▤'],
    ['help', 'Panduan', '?'],
  ],
  surveyor: [
    ['overview', 'Ringkasan', '◫'],
    ['tasks', 'Penugasan saya', '◎'],
    ['history', 'Riwayat survei', '✓'],
    ['help', 'Panduan', '?'],
  ],
} as const;
// Pages reached from an action button at the right of the menu bar, not
// from a menu tab: "Buat laporan" is something the reporter does, not a
// place they browse.
export const workflowActions = {
  admin: [],
  owner: [['new', 'Buat laporan', '＋']],
  surveyor: [],
} as const;
export type WorkflowPage =
  | (typeof workflowMenus)[ActorRole][number][0]
  | (typeof workflowActions)[ActorRole][number][0]
  | 'profile';
export function workflowPageTitle(
  role: ActorRole,
  page: WorkflowPage | null,
): string {
  if (page === 'profile') return 'Profil saya';
  if (page === 'help') return 'Panduan penggunaan';
  const entries: readonly (readonly [string, string, string])[] = [
    ...workflowMenus[role],
    ...workflowActions[role],
  ];
  return entries.find(([id]) => id === page)?.[1] ?? 'Halaman tidak tersedia';
}
// A surveyor fills in a visit on its own page, not inside the task card.
const surveyPattern = /^dashboard\/tasks\/([\w-]+)\/survey$/;
export function surveyRoute(reportId: string): string {
  return `#/dashboard/tasks/${reportId}/survey`;
}
export function parseSurveyRoute(route: string): string | null {
  return surveyPattern.exec(route)?.[1] ?? null;
}

const detailPages = [
  'overview',
  'incoming',
  'assignments',
  'review',
  'reports',
  'tasks',
  'history',
] as const;
export type ReportDetailPage = (typeof detailPages)[number];
export function isReportDetailPage(
  page: string | null,
): page is ReportDetailPage {
  return detailPages.some((value) => value === page);
}
export function reportDetailRoute(
  page: ReportDetailPage,
  reportId: string,
): string {
  return `#/dashboard/${page}/${reportId}`;
}
export function parseReportDetailRoute(
  route: string,
): { page: ReportDetailPage; reportId: string } | null {
  const match = /^dashboard\/([a-z]+)\/([\w-]+)$/.exec(route);
  return match && isReportDetailPage(match[1])
    ? { page: match[1], reportId: match[2] }
    : null;
}

export function resolveWorkflowPage(
  role: ActorRole,
  route: string,
): WorkflowPage | null {
  if (!Object.hasOwn(workflowMenus, role)) return null;
  const detail = parseReportDetailRoute(route);
  if (detail && workflowMenus[role].some(([id]) => id === detail.page))
    return detail.page;
  // The survey page belongs under "Penugasan saya" in the menu.
  if (role === 'surveyor' && parseSurveyRoute(route)) return 'tasks';
  const page =
    route === 'dashboard'
      ? role === 'owner'
        ? 'reports'
        : 'overview'
      : route.startsWith('dashboard/')
        ? route.slice(10)
        : '';
  if (page === 'profile') return 'profile';
  const entries: readonly (readonly [string, string, string])[] = [
    ...workflowMenus[role],
    ...workflowActions[role],
  ];
  return entries.some(([id]) => id === page) ? (page as WorkflowPage) : null;
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
