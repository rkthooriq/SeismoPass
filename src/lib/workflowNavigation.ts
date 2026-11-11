import type { ActorRole } from './actorAccess';
export const workflowMenus = {
  admin: [
    ['overview', 'Ringkasan', '◫'],
    ['surveyors', 'Kelola pesurvei', '◎'],
    ['incoming', 'Laporan masuk', '↙'],
    ['assignments', 'Penugasan survei', '↗'],
    ['review', 'Tinjauan catatan', '✓'],
    ['reports', 'Semua laporan', '▤'],
    ['pilot', 'Rencana pilot', '◇'],
    ['flow', 'Panduan alur', '→'],
  ],
  // Pelapor hanya mencatat lalu menunggu, jadi tanpa halaman Ringkasan.
  // Halaman awalnya "Laporan saya" yang memuat langkah berikutnya.
  owner: [
    ['reports', 'Laporan saya', '▤'],
    ['new', 'Buat laporan', '＋'],
    ['flow', 'Panduan alur', '→'],
  ],
  surveyor: [
    ['overview', 'Ringkasan', '◫'],
    ['tasks', 'Penugasan saya', '◎'],
    ['history', 'Riwayat survei', '✓'],
    ['flow', 'Panduan alur', '→'],
  ],
} as const;
export type WorkflowPage = (typeof workflowMenus)[ActorRole][number][0];
export function resolveWorkflowPage(
  role: ActorRole,
  route: string,
): WorkflowPage | null {
  const page =
    route === 'dashboard'
      ? role === 'owner'
        ? 'reports'
        : 'overview'
      : route.startsWith('dashboard/')
        ? route.slice(10)
        : '';
  return workflowMenus[role].some(([id]) => id === page)
    ? (page as WorkflowPage)
    : null;
}
