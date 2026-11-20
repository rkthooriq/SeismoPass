import { canSurvey, isActiveAdmin } from './surveyorAccess.ts';
import type { AccountStatus, AccessDecision } from './surveyorAccess';
import { parseRvsRecord } from './rvs.ts';
import type { RvsRecord } from './rvs';
import type { ActorRole } from './actorAccess';
import type { OwnerProgress, SurveyAppointment } from './ownerProgress';
import { formatDate } from './dateFormat.ts';

export interface DemoAccount {
  id: string;
  email: string;
  name: string;
  role: ActorRole;
  password: string;
  status: AccountStatus;
  emailVerified: boolean;
  // Akun yang dibuat admin. Sandinya hanya ada di memori tab, tidak disimpan.
  managed?: boolean;
  organization?: string;
  qualification?: string;
  reviewNote?: string;
  history?: AccessDecision[];
}
export const demoPassword = 'SeismoDemo123!';
export const demoAccounts: DemoAccount[] = [
  {
    id: 'owner-demo',
    email: 'pelapor@example.com',
    name: 'Pelapor Contoh',
    role: 'owner',
    password: demoPassword,
    status: 'active',
    emailVerified: true,
  },
  {
    id: 'admin-demo',
    email: 'admin@example.com',
    name: 'Admin SeismoPass',
    role: 'admin',
    password: demoPassword,
    status: 'active',
    emailVerified: true,
  },
  {
    id: 'survey-demo',
    email: 'pesurvei@example.com',
    name: 'Pesurvei Contoh',
    role: 'surveyor',
    password: demoPassword,
    status: 'active',
    emailVerified: true,
  },
];
export type AccountIdentity = Pick<
  DemoAccount,
  'id' | 'name' | 'role' | 'status'
>;
export type ReportStatus =
  | 'Draf'
  | 'Dikirim'
  | 'Perlu dilengkapi'
  | 'Siap disurvei'
  | 'Ditugaskan'
  | 'Dalam survei'
  | 'Ditinjau'
  | 'Perlu revisi'
  | 'Selesai';
export interface ReportActivity {
  by: string;
  /** Who wrote the entry. Older entries may lack it; the name is then matched to an account. */
  role?: ActorRole;
  action: string;
  note: string;
  at: string;
}
export interface Report {
  ownerProgress?: OwnerProgress;
  appointment?: SurveyAppointment;
  id: string;
  reporterId: string;
  title: string;
  /** Area only (desa/kelurahan, kecamatan); safe for lists and search. */
  location: string;
  /** Full visit address. Private: only the reporter, admins and the assigned surveyor see it. */
  address?: string;
  landmark?: string;
  /** Optional number the surveyor may call to arrange the visit. Private. */
  contactPhone?: string;
  description: string;
  status: ReportStatus;
  function?: string;
  year?: string;
  floors?: string;
  material?: string;
  structure?: string;
  demoConsent?: boolean;
  understandsRvs?: boolean;
  assignee?: string;
  assignedBy?: string;
  assignmentNote?: string;
  activity?: ReportActivity[];
  visitDate?: string;
  visitNote?: string;
  reviewNote?: string;
  rvs?: RvsRecord;
}
// Fictional buildings and activities for trying the owner journey.
const exampleAt = '2026-11-14T02:00:00.000Z';
const exampleBase = {
  reporterId: 'owner-demo',
  demoConsent: true,
  understandsRvs: true,
} as const;
function exampleDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export const sampleReports: Report[] = [
  {
    ...exampleBase,
    id: 'LAP-CONTOH',
    title: 'Balai warga Lembang (contoh)',
    location: 'Kecamatan Lembang, Kabupaten Bandung Barat',
    address: 'Jalan Warga Contoh No. 1, RT 01/RW 02, Lembang',
    landmark: 'Pagar krem di sebelah lapangan contoh',
    description:
      'Contoh pencatatan balai warga satu lantai untuk koordinasi kunjungan awal.',
    status: 'Dikirim',
    function: 'Fasilitas umum',
    year: '2005',
    floors: '1',
    material: 'Bata',
    structure: 'Belum diketahui',
    ownerProgress: {
      point: { latitude: -6.8185, longitude: 107.6164 },
      availability: {
        date: exampleDate(5),
        slot: 'Pagi (08.00–11.00)',
        note: 'Contoh: pengelola membuka akses setelah pukul 09.00.',
        at: exampleAt,
      },
      support: {
        need: 'consultation',
        note: 'Contoh: ingin memahami tahapan pemeriksaan awal dan dokumen yang perlu disiapkan.',
        at: exampleAt,
      },
    },
    activity: [
      {
        by: 'Pelapor Contoh',
        action: 'Laporan dikirim',
        note: 'Data contoh dikirim untuk pemeriksaan kelengkapan.',
        at: exampleAt,
      },
    ],
  },
  {
    ...exampleBase,
    id: 'LAP-CONTOH-3',
    title: 'Rumah Jambudipa (contoh)',
    location: 'Desa Jambudipa, Kecamatan Cisarua',
    address: 'Gang Hunian Contoh No. 7, RT 02/RW 03, Desa Jambudipa',
    landmark: 'Rumah berpagar hijau di gang contoh',
    description:
      'Contoh rumah dua lantai. Pengelola ingin menyiapkan akses untuk kunjungan pesurvei.',
    status: 'Ditugaskan',
    assignee: 'survey-demo',
    assignedBy: 'admin-demo',
    assignmentNote:
      'Penugasan contoh untuk mencoba koordinasi jadwal. Hubungi pengelola sebelum kunjungan.',
    function: 'Rumah tinggal',
    year: '2008',
    floors: '2',
    material: 'Beton',
    structure: 'Rangka beton',
    appointment: {
      date: exampleDate(7),
      slot: 'Pagi (08.00–11.00)',
      response: 'proposed',
    },
    ownerProgress: {
      point: { latitude: -6.8042, longitude: 107.5502 },
      availability: {
        date: exampleDate(7),
        slot: 'Pagi (08.00–11.00)',
        note: 'Contoh: penghuni tersedia pukul 09.00, akses melalui pintu depan.',
        at: exampleAt,
      },
      support: {
        need: 'cost-information',
        note: 'Contoh: ingin mengetahui komponen biaya konsultasi sebelum menentukan langkah berikutnya.',
        at: exampleAt,
      },
    },
    activity: [
      {
        by: 'Pelapor Contoh',
        action: 'Laporan dikirim',
        note: 'Data dasar dan alamat contoh dicatat.',
        at: '2026-11-12T02:00:00.000Z',
      },
      {
        by: 'Admin SeismoPass',
        action: 'Kelengkapan diperiksa',
        note: 'Data contoh lengkap untuk penugasan kunjungan.',
        at: '2026-11-13T02:00:00.000Z',
      },
      {
        by: 'Admin SeismoPass',
        action: 'Jadwal kunjungan diusulkan',
        note: 'Usulan contoh menunggu konfirmasi pelapor.',
        at: exampleAt,
      },
    ],
  },
  {
    ...exampleBase,
    id: 'LAP-CONTOH-7',
    title: 'Pos kesehatan Cisarua (contoh)',
    location: 'Kecamatan Cisarua, Kabupaten Bandung Barat',
    address: 'Jalan Kesehatan Contoh No. 3, RT 01/RW 04, Cisarua',
    landmark: 'Di samping balai desa contoh',
    description:
      'Contoh fasilitas kesehatan satu lantai untuk mencoba pencatatan tindak lanjut.',
    status: 'Selesai',
    assignee: 'survey-demo',
    assignedBy: 'admin-demo',
    assignmentNote: 'Contoh pencatatan kunjungan awal fasilitas kesehatan.',
    function: 'Fasilitas kesehatan',
    year: '2010',
    floors: '1',
    material: 'Beton',
    structure: 'Rangka beton',
    visitDate: '2026-11-10',
    visitNote:
      'Contoh: pengelola mendampingi kunjungan dan menunjukkan ruang pelayanan. Catatan ini tidak memuat penilaian struktur.',
    reviewNote:
      'Administrasi contoh ditutup. Penilaian struktur dan rekomendasi tetap menunggu ahli.',
    appointment: {
      date: '2026-11-10',
      slot: 'Pagi (08.00–11.00)',
      response: 'confirmed',
    },
    ownerProgress: {
      point: { latitude: -6.8201, longitude: 107.5431 },
      followUp: {
        choice: 'consultation',
        note: 'Contoh: ingin berkonsultasi dengan ahli tentang kebutuhan pemeriksaan lanjutan.',
        at: exampleAt,
      },
      support: {
        need: 'funding-information',
        note: 'Contoh: ingin mengetahui persyaratan pembiayaan jika kelak ada program resmi. Belum mengajukan bantuan.',
        at: exampleAt,
      },
      work: {
        stage: 'preparing',
        note: 'Contoh: mengumpulkan gambar bangunan dan catatan pemeliharaan untuk konsultasi. Belum ada pekerjaan perkuatan.',
        at: exampleAt,
      },
    },
    activity: [
      {
        by: 'Pelapor Contoh',
        action: 'Laporan dikirim',
        note: 'Data contoh diterima untuk proses pencatatan.',
        at: '2026-11-08T02:00:00.000Z',
      },
      {
        by: 'Admin SeismoPass',
        action: 'Kunjungan dikoordinasikan',
        note: 'Jadwal contoh disepakati bersama pengelola.',
        at: '2026-11-09T02:00:00.000Z',
      },
      {
        by: 'Pesurvei Contoh',
        action: 'Catatan kunjungan diterima',
        note: 'Kunjungan contoh pada 10 November 2026.',
        at: '2026-11-10T04:00:00.000Z',
      },
      {
        by: 'Admin SeismoPass',
        action: 'Administrasi selesai',
        note: 'Bukan keputusan kelayakan atau keamanan bangunan.',
        at: '2026-11-11T02:00:00.000Z',
      },
      {
        by: 'Pelapor Contoh',
        action: 'Kebutuhan tindak lanjut dicatat',
        note: 'Pilihan konsultasi, kebutuhan informasi, dan persiapan dokumen dicatat sebagai contoh.',
        at: exampleAt,
      },
    ],
  },
  {
    ...exampleBase,
    id: 'LAP-CONTOH-8',
    title: 'Rumah Cipada (contoh)',
    location: 'Desa Cipada, Kecamatan Cisarua',
    address: 'Gang Rumah Contoh No. 2, RT 01/RW 01, Desa Cipada',
    landmark: 'Dekat kebun contoh, pagar kayu',
    description:
      'Contoh draf yang belum dikirim. Lengkapi jumlah lantai sebelum melanjutkan.',
    status: 'Draf',
    function: 'Rumah tinggal',
    year: '',
    floors: '',
    material: 'Bata',
    structure: 'Belum diketahui',
    ownerProgress: { point: { latitude: -6.7881, longitude: 107.5302 } },
    activity: [
      {
        by: 'Pelapor Contoh',
        action: 'Draf disimpan',
        note: 'Jumlah lantai belum dicatat. Draf belum masuk antrean admin.',
        at: exampleAt,
      },
    ],
  },
  {
    ...exampleBase,
    id: 'LAP-CONTOH-9',
    title: 'Warung Parongpong (contoh)',
    location: 'Kecamatan Parongpong, Kabupaten Bandung Barat',
    address: '',
    landmark: 'Di samping lapangan contoh',
    description:
      'Contoh laporan yang perlu dilengkapi: alamat kunjungan belum cukup rinci.',
    status: 'Perlu dilengkapi',
    function: 'Tempat usaha',
    year: '2015',
    floors: '1',
    material: 'Bata',
    structure: 'Belum diketahui',
    reviewNote:
      'Lengkapi nama jalan atau gang, nomor, RT/RW, dan desa pada alamat kunjungan, lalu kirim ulang laporan.',
    ownerProgress: { point: { latitude: -6.8084, longitude: 107.5815 } },
    activity: [
      {
        by: 'Pelapor Contoh',
        action: 'Laporan dikirim',
        note: 'Contoh laporan diajukan untuk pemeriksaan kelengkapan.',
        at: '2026-11-13T02:00:00.000Z',
      },
      {
        by: 'Admin SeismoPass',
        action: 'Data perlu dilengkapi',
        note: 'Alamat kunjungan belum dicatat secara lengkap.',
        at: exampleAt,
      },
    ],
  },
];

// Only the built-in sample catalogue is refreshed; user-created reports stay.
export function isSampleReport(
  report: Pick<Report, 'id' | 'reporterId'>,
): boolean {
  return (
    report.reporterId === 'owner-demo' &&
    /^LAP-CONTOH(?:-[2-9])?$/.test(report.id)
  );
}
export function refreshSampleReports(reports: Report[]): Report[] {
  if (!reports.some(isSampleReport)) return reports;
  return [
    ...sampleReports,
    ...reports.filter((report) => !isSampleReport(report)),
  ];
}

export function visibleReports(reports: Report[], account: AccountIdentity) {
  return reports.filter(
    (report) =>
      (isActiveAdmin(account) && report.status !== 'Draf') ||
      (account.role === 'owner' && account.status === 'active'
        ? report.reporterId === account.id
        : canSurvey(account) && report.assignee === account.id),
  );
}
export type ReportAction =
  | 'submit'
  | 'verify'
  | 'return'
  | 'claim'
  | 'start'
  | 'visit'
  | 'revise'
  | 'close';
// Every hand-over between reporter, admin and surveyor leaves one entry, so
// all three can read the same thread of notes.
// A visit starts only on a date the reporter has agreed to, so the surveyor
// never travels to a time that is still being negotiated.
export function scheduleConfirmed(
  report: Pick<Report, 'appointment'>,
): boolean {
  return report.appointment?.response === 'confirmed';
}

export function withActivity(
  report: Report,
  account: AccountIdentity,
  action: string,
  note = '',
): Report {
  return {
    ...report,
    activity: [
      ...(report.activity ?? []),
      {
        by: account.name,
        role: account.role,
        action,
        note,
        at: new Date().toISOString(),
      },
    ].slice(-500),
  };
}
export function advanceReport(
  report: Report,
  account: AccountIdentity,
  action: ReportAction,
  values: { date?: string; note?: string } = {},
): Report | null {
  if (account.status !== 'active') return null;
  const note = values.note?.trim();
  if (
    action === 'submit' &&
    account.role === 'owner' &&
    report.reporterId === account.id &&
    ['Draf', 'Perlu dilengkapi'].includes(report.status) &&
    Object.keys(validateReportRegistration(report)).length === 0
  ) {
    return withActivity(
      { ...report, reviewNote: undefined, status: 'Dikirim' },
      account,
      report.status === 'Draf'
        ? 'Laporan dikirim ke admin'
        : 'Laporan dikirim ulang ke admin',
      report.status === 'Draf'
        ? 'Menunggu pemeriksaan kelengkapan.'
        : 'Data sudah diperbaiki sesuai catatan admin.',
    );
  }
  if (account.role === 'admin' && report.status === 'Dikirim') {
    if (
      action === 'verify' &&
      Object.keys(validateReportRegistration(report)).length === 0
    )
      return withActivity(
        { ...report, status: 'Siap disurvei' },
        account,
        'Admin menyetujui laporan',
        'Data lengkap dan siap ditugaskan ke pesurvei.',
      );
    if (action === 'return' && note)
      return withActivity(
        { ...report, reviewNote: note, status: 'Perlu dilengkapi' },
        account,
        'Admin meminta pelapor melengkapi',
        note,
      );
  }
  if (
    action === 'start' &&
    canSurvey(account) &&
    report.assignee === account.id &&
    report.status === 'Ditugaskan' &&
    scheduleConfirmed(report)
  )
    return withActivity(
      { ...report, status: 'Dalam survei' },
      account,
      'Pesurvei memulai survei',
    );
  // Self-claim is deliberately unsupported: an active admin assigns each report.
  if (
    action === 'visit' &&
    account.role === 'surveyor' &&
    report.assignee === account.id &&
    ['Dalam survei', 'Perlu revisi'].includes(report.status) &&
    values.date &&
    isVisitDate(values.date) &&
    note
  ) {
    return withActivity(
      {
        ...report,
        visitDate: values.date,
        visitNote: note,
        reviewNote: undefined,
        status: 'Ditinjau',
      },
      account,
      report.status === 'Perlu revisi'
        ? 'Pesurvei mengirim catatan revisi ke admin'
        : 'Pesurvei mengirim catatan kunjungan ke admin',
      `Kunjungan ${formatDate(values.date)}. ${note}`,
    );
  }
  if (account.role === 'admin' && report.status === 'Ditinjau' && note) {
    if (action === 'revise')
      return withActivity(
        { ...report, reviewNote: note, status: 'Perlu revisi' },
        account,
        'Admin meminta pesurvei merevisi catatan',
        note,
      );
    if (action === 'close')
      return withActivity(
        { ...report, reviewNote: note, status: 'Selesai' },
        account,
        'Admin menutup administrasi laporan',
        note,
      );
  }
  return null;
}

export const reportBuildingFields = [
  ['function', 'Fungsi bangunan'],
  ['year', 'Tahun pembangunan'],
  ['floors', 'Jumlah lantai'],
  ['material', 'Material utama'],
  ['structure', 'Sistem struktur'],
] as const;

export function validateReportRegistration(
  report: Report,
  draft = false,
  currentYear = new Date().getFullYear(),
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!report.title.trim()) errors.title = 'Isi nama bangunan.';
  if (!draft) {
    for (const [key, label] of [
      ['location', 'Kawasan'],
      ['address', 'Alamat lengkap'],
      ['description', 'Catatan laporan'],
      ...reportBuildingFields,
    ] as const) {
      if (key !== 'year' && !report[key]?.trim())
        errors[key] = `${label} perlu diisi.`;
    }
    if (!report.understandsRvs)
      errors.understandsRvs = 'Konfirmasi pemahaman batas RVS.';
  }
  for (const [key, limit] of [
    ['title', 100],
    ['location', 200],
    ['address', 300],
    ['landmark', 150],
    ['description', 1000],
    ...reportBuildingFields.map(([key]) => [key, 100] as const),
  ] as const) {
    if ((report[key]?.length ?? 0) > limit)
      errors[key] = `Maksimal ${limit} karakter.`;
  }
  if (
    report.year &&
    (!/^\d{4}$/.test(report.year) ||
      Number(report.year) < 1000 ||
      Number(report.year) > currentYear)
  )
    errors.year =
      'Isi tahun antara 1000 dan tahun berjalan, atau kosongkan jika belum diketahui.';
  if (
    report.floors &&
    (!/^\d+$/.test(report.floors) ||
      Number(report.floors) < 1 ||
      Number(report.floors) > 200)
  )
    errors.floors = 'Isi jumlah lantai bulat antara 1–200.';
  if (report.contactPhone) {
    const digits = report.contactPhone.replace(/\D/g, '');
    if (
      !/^\+?[\d\s-]+$/.test(report.contactPhone) ||
      digits.length < 8 ||
      digits.length > 15
    )
      errors.contactPhone =
        'Isi nomor 8–15 angka (boleh diawali +, spasi, atau tanda hubung), atau kosongkan.';
  }
  if (!report.demoConsent)
    errors.demoConsent = 'Centang persetujuan data untuk melanjutkan.';
  return errors;
}

function isVisitDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function saveReportRvs(
  report: Report,
  account: AccountIdentity,
  value: unknown,
): Report | null {
  const record = parseRvsRecord(value);
  if (
    !canSurvey(account) ||
    report.assignee !== account.id ||
    !['Dalam survei', 'Perlu revisi'].includes(report.status) ||
    !record ||
    record.recordedBy !== account.name
  )
    return null;
  return { ...report, rvs: record };
}

export function assignReport(
  report: Report,
  admin: AccountIdentity,
  target: DemoAccount,
  note: string,
): Report | null {
  if (
    !isActiveAdmin(admin) ||
    !canSurvey(target) ||
    !target.emailVerified ||
    !['Siap disurvei', 'Ditugaskan'].includes(report.status) ||
    !note.trim() ||
    note.length > 1000
  )
    return null;
  return {
    ...report,
    assignee: target.id,
    assignedBy: admin.id,
    assignmentNote: note.trim(),
    ...(report.appointment && report.assignee !== target.id
      ? { appointment: undefined }
      : {}),
    status: 'Ditugaskan',
    activity: [
      ...(report.activity ?? []),
      {
        by: admin.name,
        role: 'admin' as const,
        action: `Admin meneruskan ke ${target.name}`,
        note: note.trim(),
        at: new Date().toISOString(),
      },
    ],
  };
}
export function releaseSurveyorAssignments(
  reports: Report[],
  surveyorId: string,
  admin: AccountIdentity,
): Report[] {
  if (!isActiveAdmin(admin)) return reports;
  return reports.map((report) =>
    report.assignee === surveyorId &&
    ['Ditugaskan', 'Dalam survei', 'Perlu revisi'].includes(report.status)
      ? {
          ...report,
          assignee: undefined,
          appointment: undefined,
          status: 'Siap disurvei',
          activity: [
            ...(report.activity ?? []),
            {
              by: admin.name,
              role: 'admin' as const,
              action: 'Penugasan dikembalikan',
              note: 'Akses pesurvei dinonaktifkan. Menunggu penugasan ulang; catatan sebelumnya dipertahankan.',
              at: new Date().toISOString(),
            },
          ],
        }
      : report,
  );
}
