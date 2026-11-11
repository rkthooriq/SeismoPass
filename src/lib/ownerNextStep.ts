import type { ReportStatus } from './reportDemo';

// Teks langkah berikutnya untuk pelapor. Ini status administratif,
// bukan hasil screening atau kategori risiko.
export interface OwnerStep {
  turn: 'owner' | 'waiting';
  title: string;
  text: string;
}

export const ownerSteps: Record<ReportStatus, OwnerStep> = {
  Draf: {
    turn: 'owner',
    title: 'Lengkapi dan kirim laporan',
    text: 'Lengkapi data dasar bangunan, lalu kirim ke admin.',
  },
  Dikirim: {
    turn: 'waiting',
    title: 'Menunggu pemeriksaan admin',
    text: 'Admin memeriksa kelengkapan data laporanmu.',
  },
  'Perlu dilengkapi': {
    turn: 'owner',
    title: 'Perbaiki sesuai catatan admin',
    text: 'Baca catatan admin, ubah data, lalu kirim ulang.',
  },
  'Siap disurvei': {
    turn: 'waiting',
    title: 'Menunggu penugasan pesurvei',
    text: 'Admin akan menugaskan pesurvei. Siapkan akses ke lokasi bangunan.',
  },
  Ditugaskan: {
    turn: 'waiting',
    title: 'Pesurvei akan berkunjung',
    text: 'Siapkan akses ke lokasi bangunan untuk kunjungan pesurvei.',
  },
  'Dalam survei': {
    turn: 'waiting',
    title: 'Kunjungan sedang dicatat',
    text: 'Pesurvei mencatat kunjungan. Tidak ada tindakan darimu.',
  },
  Ditinjau: {
    turn: 'waiting',
    title: 'Admin meninjau catatan kunjungan',
    text: 'Admin memeriksa catatan secara administratif.',
  },
  'Perlu revisi': {
    turn: 'waiting',
    title: 'Catatan kunjungan sedang diperbaiki',
    text: 'Pesurvei memperbaiki catatan sesuai arahan admin.',
  },
  Selesai: {
    turn: 'owner',
    title: 'Baca profil dan batas RVS',
    text: 'Administrasi selesai. Hasil tetap "Belum dinilai" dan RVS bukan sertifikat aman. Keputusan perkuatan menunggu pemeriksaan ahli.',
  },
};

export function ownerStep(status: ReportStatus): OwnerStep {
  return ownerSteps[status];
}

// Laporan yang menunggu tindakan pelapor ditampilkan lebih dulu.
export function sortByOwnerTurn<T extends { status: ReportStatus }>(
  reports: T[],
): T[] {
  const rank = (report: T) => (ownerStep(report.status).turn === 'owner' ? 0 : 1);
  return reports
    .map((report, index) => ({ report, index }))
    .sort((a, b) => rank(a.report) - rank(b.report) || a.index - b.index)
    .map(({ report }) => report);
}
