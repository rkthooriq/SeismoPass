export const actorRoles = [
  {
    id: 'owner',
    name: 'Pengguna / pelapor',
    shortName: 'Pelapor',
    symbol: '⌂',
    description: 'Kirim laporan bangunan dan pantau tindak lanjut.',
    focus: 'Laporan bangunanmu',
    pages: [
      'dashboard',
      'buildings',
      'new',
      'profile',
      'screening',
      'referrals',
      'retrofit',
      'support',
      'data',
      'guide',
      'qr',
      'access',
    ],
    actions: [['buildings', 'Kelola bangunan']],
    boundary: 'Hanya laporan sendiri.',
  },
  {
    id: 'admin',
    name: 'Admin',
    shortName: 'Admin',
    symbol: '◫',
    description: 'Setujui akses pesurvei, atur penugasan, dan tinjau catatan.',
    focus: 'Kelola tindak lanjut',
    pages: ['dashboard'],
    actions: [],
    boundary:
      'Mengelola laporan yang sudah dikirim dan meninjau catatan kunjungan.',
  },
  {
    id: 'surveyor',
    name: 'Pesurvei',
    shortName: 'Pesurvei',
    symbol: '◎',
    description: 'Kerjakan laporan yang ditugaskan admin dan catat kunjungan.',
    focus: 'Penugasan survei',
    pages: ['dashboard'],
    actions: [],
    boundary:
      'Hanya melihat laporan yang ditugaskan admin setelah akses disetujui.',
  },
] as const;
export type ActorRole = (typeof actorRoles)[number]['id'];
export function isActorRole(value: unknown): value is ActorRole {
  return actorRoles.some((actor) => actor.id === value);
}
export function getActor(role: ActorRole) {
  return actorRoles.find((actor) => actor.id === role)!;
}
export function canOpenPage(
  role: unknown,
  page: string,
  editing = false,
): boolean {
  return (
    isActorRole(role) &&
    (!editing || (page === 'profile' && role === 'owner')) &&
    (getActor(role).pages as readonly string[]).includes(page)
  );
}
export function canManageBuildings(role: unknown): boolean {
  return role === 'owner';
}
