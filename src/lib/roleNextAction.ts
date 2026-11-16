import type { ActorRole } from './actorAccess';
import type { Report } from './reportDemo';
import type { WorkflowPage } from './workflowNavigation';

// What this role should do now, picked from the reports in their scope. The
// order follows who is waiting longest: the reporter, then the surveyor.
export interface NextAction {
  title: string;
  text: string;
  page: WorkflowPage;
  label: string;
}

const n = (reports: Pick<Report, 'status'>[], status: Report['status']) =>
  reports.filter((report) => report.status === status).length;

export function adminNextAction(
  reports: Pick<Report, 'status'>[],
  activeSurveyors: number,
): NextAction {
  const incoming = n(reports, 'Dikirim');
  const review = n(reports, 'Ditinjau');
  const ready = n(reports, 'Siap disurvei');
  if (incoming)
    return {
      title: `${incoming} laporan menunggu keputusanmu`,
      text: 'Periksa datanya. Setujui dan teruskan ke pesurvei, atau kembalikan ke pelapor dengan catatan.',
      page: 'incoming',
      label: 'Buka laporan masuk',
    };
  if (review)
    return {
      title: `${review} catatan kunjungan perlu kamu tinjau`,
      text: 'Tutup administrasinya, atau minta pesurvei merevisi catatan.',
      page: 'review',
      label: 'Buka tinjauan catatan',
    };
  if (ready)
    return activeSurveyors
      ? {
          title: `${ready} laporan siap ditugaskan`,
          text: 'Pilih pesurvei aktif dan tulis catatan penugasan.',
          page: 'assignments',
          label: 'Buka penugasan',
        }
      : {
          title: 'Belum ada pesurvei aktif',
          text: `${ready} laporan menunggu pesurvei. Daftarkan pesurvei dulu, lalu tugaskan.`,
          page: 'surveyors',
          label: 'Kelola pesurvei',
        };
  return {
    title: 'Tidak ada yang menunggumu',
    text: 'Laporan baru dari pelapor muncul di Laporan masuk. Pesurvei sedang mengerjakan sisanya.',
    page: 'incoming',
    label: 'Lihat laporan masuk',
  };
}

export function surveyorNextAction(
  reports: Pick<Report, 'status'>[],
): NextAction {
  const revision = n(reports, 'Perlu revisi');
  const working = n(reports, 'Dalam survei');
  const assigned = n(reports, 'Ditugaskan');
  if (revision)
    return {
      title: `${revision} catatan diminta direvisi admin`,
      text: 'Baca arahan admin, perbaiki catatan kunjungan, lalu kirim ulang.',
      page: 'tasks',
      label: 'Buka penugasan',
    };
  if (working)
    return {
      title: `${working} kunjungan sedang kamu kerjakan`,
      text: 'Isi tanggal dan catatan kunjungan, lalu kirim ke admin.',
      page: 'tasks',
      label: 'Lanjutkan catatan',
    };
  if (assigned)
    return {
      title: `${assigned} penugasan baru dari admin`,
      text: 'Baca catatan penugasan dan jadwal, lalu mulai survei.',
      page: 'tasks',
      label: 'Buka penugasan',
    };
  return {
    title: 'Belum ada tugas untukmu',
    text: 'Admin akan menugaskan laporan kepadamu setelah menyetujuinya.',
    page: 'history',
    label: 'Lihat riwayat survei',
  };
}

export function nextActionFor(
  role: ActorRole,
  reports: Pick<Report, 'status'>[],
  activeSurveyors: number,
): NextAction | null {
  if (role === 'admin') return adminNextAction(reports, activeSurveyors);
  if (role === 'surveyor') return surveyorNextAction(reports);
  return null;
}

// Empty list text per page, so a fresh start explains where reports come from.
export const emptyListText: Partial<
  Record<WorkflowPage, { title: string; text: string }>
> = {
  incoming: {
    title: 'Belum ada laporan masuk',
    text: 'Laporan yang dikirim pelapor muncul di sini untuk kamu periksa.',
  },
  assignments: {
    title: 'Belum ada laporan untuk ditugaskan',
    text: 'Laporan yang kamu setujui muncul di sini sampai ditugaskan ke pesurvei.',
  },
  review: {
    title: 'Belum ada catatan untuk ditinjau',
    text: 'Catatan kunjungan yang dikirim pesurvei muncul di sini.',
  },
  reports: {
    title: 'Belum ada laporan',
    text: 'Semua laporan yang sudah dikirim pelapor akan terkumpul di sini.',
  },
  tasks: {
    title: 'Belum ada penugasan',
    text: 'Hanya laporan yang ditugaskan admin kepadamu yang muncul di sini.',
  },
  history: {
    title: 'Belum ada riwayat survei',
    text: 'Catatan yang sudah kamu kirim ke admin muncul di sini.',
  },
};
