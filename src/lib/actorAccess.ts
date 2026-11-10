export const actorRoles = [
  {
    id: 'owner',
    name: 'Pemilik / pengelola',
    shortName: 'Pemilik',
    symbol: '⌂',
    description: 'Catat bangunan dan ikuti perjalanan tindak lanjutnya.',
    focus: 'Bangunan yang kamu kelola, dalam satu tempat.',
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
    actions: [
      ['buildings', 'Kelola data bangunan'],
      ['new', 'Catat bangunan baru'],
    ],
    boundary:
      'Hanya data bangunan milik sendiri pada layanan nyata. Pada demo, seluruh catatan adalah fiktif.',
  },
  {
    id: 'assessor',
    name: 'Petugas penilai',
    shortName: 'Petugas',
    symbol: '◎',
    description: 'Tinjau penugasan screening dengan supervisi ahli.',
    focus: 'Pemeriksaan terarah dimulai dari penugasan yang jelas.',
    pages: ['dashboard', 'screening', 'guide', 'access'],
    actions: [['screening', 'Lihat alur screening']],
    boundary:
      'Hanya bangunan penugasan. Metode dan pencatatan RVS menunggu protokol resmi; tidak dapat menerbitkan sertifikat aman.',
  },
  {
    id: 'expert',
    name: 'Ahli struktur',
    shortName: 'Ahli struktur',
    symbol: '↗',
    description: 'Supervisi screening, evaluasi rujukan, dan rencana retrofit.',
    focus: 'Keahlian yang terhubung dengan tindak lanjut.',
    pages: [
      'dashboard',
      'screening',
      'referrals',
      'retrofit',
      'guide',
      'access',
    ],
    actions: [
      ['referrals', 'Tinjau alur rujukan'],
      ['retrofit', 'Lihat alur rencana retrofit'],
    ],
    boundary:
      'Kasus yang ditugaskan dan kewenangan yang telah diverifikasi. Demo belum memuat hasil evaluasi atau rencana teknis.',
  },
  {
    id: 'government',
    name: 'Pemerintah daerah',
    shortName: 'Pemerintah daerah',
    symbol: '◫',
    description: 'Tinjau kebutuhan koordinasi, dukungan, dan evaluasi pilot.',
    focus: 'Koordinasi yang lebih baik, berawal dari informasi yang tepat.',
    pages: ['dashboard', 'support', 'guide', 'access'],
    actions: [['support', 'Lihat dukungan & evaluasi']],
    boundary:
      'Ringkasan minimum sesuai kewenangan; tidak otomatis memperoleh identitas pemilik atau data rinci bangunan.',
  },
  {
    id: 'provider',
    name: 'Penyedia retrofit',
    shortName: 'Penyedia retrofit',
    symbol: '▧',
    description: 'Ikuti pekerjaan perkuatan berdasarkan rencana ahli.',
    focus: 'Pelaksanaan mengikuti rencana yang telah disahkan.',
    pages: ['dashboard', 'retrofit', 'guide', 'access'],
    actions: [['retrofit', 'Lihat alur pelaksanaan']],
    boundary:
      'Pekerjaan yang ditugaskan. Fungsi pelaksanaan terpisah dari penilai; tidak menetapkan hasil screening atau memvalidasi pekerjaan sendiri.',
  },
  {
    id: 'finance',
    name: 'Mitra keuangan',
    shortName: 'Mitra keuangan',
    symbol: '◇',
    description: 'Tinjau dukungan berdasarkan persetujuan dan kerja sama.',
    focus: 'Dukungan yang transparan, sesuai kesepakatan.',
    pages: ['dashboard', 'support', 'guide', 'access'],
    actions: [['support', 'Lihat alur dukungan']],
    boundary:
      'Data minimum dengan persetujuan yang sesuai. Tidak ada penawaran, keputusan pembiayaan, atau penyesuaian premi otomatis.',
  },
] as const;
export type ActorRole = (typeof actorRoles)[number]['id'];
export function isActorRole(value: unknown): value is ActorRole {
  return actorRoles.some((role) => role.id === value);
}
export function getActor(role: ActorRole) {
  return actorRoles.find((actor) => actor.id === role)!;
}
export function canOpenPage(
  role: unknown,
  page: string,
  editing = false,
): boolean {
  if (!isActorRole(role)) return false;
  if (editing && (page !== 'profile' || role !== 'owner')) return false;
  return (getActor(role).pages as readonly string[]).includes(page);
}
export function canManageBuildings(role: unknown): boolean {
  return role === 'owner';
}
