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
    text: 'Pesurvei memperbaiki catatan kunjungan sesuai arahan admin. Tidak ada data yang perlu kamu ubah.',
  },
  Selesai: {
    turn: 'owner',
    title: 'Baca hasil dan catat tindak lanjut',
    text: 'Administrasi laporan selesai, tetapi RVS bukan sertifikat aman. Penilaian, rujukan, dan rencana perkuatan masih menunggu ahli.',
  },
};

export function ownerStep(status: ReportStatus): OwnerStep {
  return ownerSteps[status];
}

// Owner list filter: three groups that answer "what do I need to do?".
// The card chip still names the exact stage (ownerStageLabel).
export const ownerStatusFilters = [
  'Perlu tindakanmu',
  'Sedang diproses',
  'Selesai',
] as const;
export type OwnerStatusFilter = (typeof ownerStatusFilters)[number];

export function ownerStatusFilter(status: ReportStatus): OwnerStatusFilter {
  if (status === 'Draf' || status === 'Perlu dilengkapi')
    return 'Perlu tindakanmu';
  if (status === 'Selesai') return 'Selesai';
  return 'Sedang diproses';
}

// Laporan yang menunggu tindakan pelapor ditampilkan lebih dulu.
export function sortByOwnerTurn<T extends { status: ReportStatus }>(
  reports: T[],
): T[] {
  const rank = (report: T) =>
    ownerStep(report.status).turn === 'owner' ? 0 : 1;
  return reports
    .map((report, index) => ({ report, index }))
    .sort((a, b) => rank(a.report) - rank(b.report) || a.index - b.index)
    .map(({ report }) => report);
}

// Catatan admin bisa ditujukan ke pihak berbeda. Judulnya menyebut penerima
// agar pelapor tahu apakah ada yang perlu ia ubah.
export interface ReviewNoteLabel {
  title: string;
  hint?: string;
}

export function reviewNoteLabel(status: ReportStatus): ReviewNoteLabel {
  if (status === 'Perlu dilengkapi')
    return {
      title: 'Catatan admin untuk pelapor',
      hint: 'Ubah data laporan sesuai catatan ini, lalu kirim ulang.',
    };
  if (status === 'Perlu revisi')
    return {
      title: 'Arahan admin untuk pesurvei',
      hint: 'Pesurvei yang memperbaiki catatan kunjungan. Pelapor tidak perlu mengubah data laporan.',
    };
  if (status === 'Selesai') return { title: 'Catatan penutup admin' };
  return { title: 'Catatan admin' };
}

// Owner list filter: only groups that currently hold a report, with counts.
// With fewer than two groups the filter cannot narrow anything and is hidden.

// The detail page has no tabs: it opens on the one thing the owner needs at
// this stage. 'report' shows the report itself (to complete it, or while the
// admin or surveyor works on it); 'schedule' leads with the visit schedule;
// 'closed' leads with the screening profile and follow-up. In the last two the
// sent report is folded below.
export type OwnerDetailFocus = 'report' | 'schedule' | 'closed';
export function ownerDetailFocus(status: ReportStatus): OwnerDetailFocus {
  if (status === 'Selesai') return 'closed';
  if (['Siap disurvei', 'Ditugaskan', 'Dalam survei'].includes(status))
    return 'schedule';
  return 'report';
}

// The status chip names the real stage in the owner's words, so it agrees with
// the banner and the visible tabs. The list filter keeps the four broad groups.
const ownerStageLabels: Record<ReportStatus, string> = {
  Draf: 'Draf',
  Dikirim: 'Diperiksa admin',
  'Perlu dilengkapi': 'Perlu dilengkapi',
  'Siap disurvei': 'Menunggu pesurvei',
  Ditugaskan: 'Pesurvei ditugaskan',
  'Dalam survei': 'Sedang disurvei',
  Ditinjau: 'Catatan survei ditinjau',
  'Perlu revisi': 'Catatan survei diperbaiki',
  Selesai: 'Selesai',
};
export function ownerStageLabel(status: ReportStatus): string {
  return ownerStageLabels[status];
}

// Owner list filter as a two-level tree: each group ("Perlu tindakanmu",
// "Sedang diproses", "Selesai") holds the detailed stages it covers. Only
// stages that currently have reports are listed, with counts. With fewer than
// two stages there is nothing to narrow, so the filter is hidden.
export interface OwnerFilterGroup {
  group: OwnerStatusFilter;
  count: number;
  stages: { status: ReportStatus; label: string; count: number }[];
}
const stageOrder = Object.keys(ownerStageLabels) as ReportStatus[];
export function ownerFilterGroups(
  reports: { status: ReportStatus }[],
): OwnerFilterGroup[] {
  const groups = ownerStatusFilters
    .map((group) => {
      const stages = stageOrder
        .filter((status) => ownerStatusFilter(status) === group)
        .map((status) => ({
          status,
          label: ownerStageLabel(status),
          count: reports.filter((report) => report.status === status).length,
        }))
        .filter((stage) => stage.count > 0);
      return {
        group,
        count: stages.reduce((sum, stage) => sum + stage.count, 0),
        stages,
      };
    })
    .filter((group) => group.count > 0);
  const stageCount = groups.reduce(
    (sum, group) => sum + group.stages.length,
    0,
  );
  return stageCount < 2 ? [] : groups;
}
