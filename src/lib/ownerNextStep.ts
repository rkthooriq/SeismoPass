import type { ReportStatus } from './reportDemo';
import { statusToneClass } from './statusTone.ts';

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

// While assigned, the visit waits on the reporter's answer to the proposed
// date, so the step reads from the appointment as well as the status.
export function ownerStepFor(report: {
  status: ReportStatus;
  appointment?: { response: string };
}): OwnerStep {
  if (report.status === 'Ditugaskan') {
    const response = report.appointment?.response;
    if (response === 'proposed')
      return {
        turn: 'owner',
        title: 'Konfirmasi jadwal kunjungan',
        text: 'Pesurvei baru bisa datang setelah kamu memilih Jadwal ini cocok atau meminta jadwal lain.',
      };
    if (response === 'change-requested')
      return {
        turn: 'waiting',
        title: 'Menunggu jadwal baru dari admin',
        text: 'Admin akan mengusulkan jadwal berdasarkan waktu yang kamu minta.',
      };
    if (response === 'confirmed')
      return {
        turn: 'waiting',
        title: 'Jadwal kunjungan disepakati',
        text: 'Siapkan akses ke lokasi bangunan pada jadwal yang kamu setujui.',
      };
    return {
      turn: 'waiting',
      title: 'Menunggu usulan jadwal',
      text: 'Admin akan mengusulkan jadwal kunjungan untuk kamu konfirmasi.',
    };
  }
  return ownerSteps[report.status];
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

// A proposed visit date waits on the reporter, so that report is the
// reporter's turn even though its status still reads "Ditugaskan".
type OwnerStageInput = {
  status: ReportStatus;
  appointment?: { response: string };
};
export const confirmScheduleStage = 'Konfirmasi jadwal';
export function awaitingOwnerConfirmation(report: OwnerStageInput): boolean {
  return (
    report.status === 'Ditugaskan' &&
    report.appointment?.response === 'proposed'
  );
}
export function ownerStageKey(report: OwnerStageInput): string {
  return awaitingOwnerConfirmation(report)
    ? confirmScheduleStage
    : report.status;
}
export function ownerStageLabelFor(report: OwnerStageInput): string {
  return awaitingOwnerConfirmation(report)
    ? confirmScheduleStage
    : ownerStageLabel(report.status);
}
export function ownerStatusFilterFor(
  report: OwnerStageInput,
): OwnerStatusFilter {
  return awaitingOwnerConfirmation(report)
    ? 'Perlu tindakanmu'
    : ownerStatusFilter(report.status);
}
export function ownerChipClass(report: OwnerStageInput): string {
  return awaitingOwnerConfirmation(report)
    ? 'status-action'
    : statusToneClass(report.status, 'owner');
}

// Laporan yang menunggu tindakan pelapor ditampilkan lebih dulu.
export function sortByOwnerTurn<
  T extends { status: ReportStatus; appointment?: { response: string } },
>(reports: T[]): T[] {
  const rank = (report: T) => (ownerStepFor(report).turn === 'owner' ? 0 : 1);
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
  // From "Dikirim" the reporter can already pick or change the visit time.
  if (
    ['Dikirim', 'Siap disurvei', 'Ditugaskan', 'Dalam survei'].includes(status)
  )
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
  /** `status` is the stage key: a report status, or confirmScheduleStage. */
  stages: { status: string; label: string; count: number }[];
}
const stageOrder: string[] = Object.keys(ownerStageLabels).flatMap((status) =>
  status === 'Perlu dilengkapi' ? [status, confirmScheduleStage] : [status],
);
const stageGroup = (key: string): OwnerStatusFilter =>
  key === confirmScheduleStage
    ? 'Perlu tindakanmu'
    : ownerStatusFilter(key as ReportStatus);
const stageLabel = (key: string): string =>
  key === confirmScheduleStage
    ? confirmScheduleStage
    : ownerStageLabel(key as ReportStatus);
export function ownerFilterGroups(
  reports: OwnerStageInput[],
): OwnerFilterGroup[] {
  const groups = ownerStatusFilters
    .map((group) => {
      const stages = stageOrder
        .filter((key) => stageGroup(key) === group)
        .map((key) => ({
          status: key,
          label: stageLabel(key),
          count: reports.filter((report) => ownerStageKey(report) === key)
            .length,
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
