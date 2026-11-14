import { canSurvey, isActiveAdmin } from './surveyorAccess.ts';
import type { AccountStatus, AccessDecision } from './surveyorAccess';
import { emptyObservations, emptyRvsInputs, parseRvsRecord } from './rvs.ts';
import type { RvsInputs, RvsRecord } from './rvs';
import type { ActorRole } from './actorAccess';
import type { OwnerProgress, SurveyAppointment } from './ownerProgress';

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
  activity?: { by: string; action: string; note: string; at: string }[];
  visitDate?: string;
  visitNote?: string;
  reviewNote?: string;
  rvs?: RvsRecord;
}
export const sampleReports: Report[] = [
  {
    id: 'LAP-CONTOH',
    reporterId: 'owner-demo',
    title: 'Balai warga contoh',
    location: 'Kawasan contoh, Bandung Barat',
    address: 'Jalan Contoh No. 1, RT 01/RW 02',
    landmark: 'Dekat balai warga',
    description: 'Catatan awal bangunan untuk latihan survei.',
    status: 'Dikirim',
    function: 'Fasilitas umum',
    year: '',
    floors: '1',
    material: 'Belum diketahui',
    structure: 'Belum diketahui',
    demoConsent: true,
    understandsRvs: true,
  },
  ...contohReports(),
];
// Laporan contoh untuk mencoba semua tahap. Nama, alamat, dan nomor sengaja
// rekaan (tanda "contoh"); tidak mewakili bangunan atau orang nyata.
function contohRvs(
  inputs: Partial<RvsInputs>,
  note: Partial<RvsRecord['observations']>,
  savedAt: string,
): RvsRecord {
  return {
    version: 1,
    form: 'FEMA-P154-2015-HIGH',
    inputs: { ...emptyRvsInputs(), ...inputs },
    observations: { ...emptyObservations(), ...note },
    recordedBy: 'Pesurvei Contoh',
    savedAt,
    demoAcknowledged: true,
  };
}
function contohReports(): Report[] {
  const base = {
    reporterId: 'owner-demo',
    demoConsent: true,
    understandsRvs: true,
  } as const;
  const assigned = {
    assignee: 'survey-demo',
    assignedBy: 'admin-demo',
  } as const;
  const log = (
    by: string,
    action: string,
    note: string,
    at: string,
  ): NonNullable<Report['activity']>[number] => ({ by, action, note, at });
  return [
    {
      ...base,
      id: 'LAP-CONTOH-2',
      title: 'Rumah tinggal dua lantai (contoh)',
      location: 'Desa Jambudipa, Kecamatan Cisarua',
      address: 'Kampung Contoh RT 03/RW 05, Desa Jambudipa',
      landmark: 'Seberang masjid, pagar hijau',
      contactPhone: '0812 0000 0002',
      description:
        'Rumah dibangun swadaya, dinding bata, ada retak rambut di dinding lantai dua.',
      status: 'Siap disurvei',
      function: 'Rumah tinggal',
      year: '1998',
      floors: '2',
      material: 'Beton bertulang',
      structure: 'Portal beton dengan dinding pengisi',
      activity: [
        log(
          'Admin SeismoPass',
          'Memverifikasi',
          'Data lengkap.',
          '2026-11-09T07:30:00.000Z',
        ),
      ],
    },
    {
      ...base,
      ...assigned,
      id: 'LAP-CONTOH-3',
      title: 'Kos putri Melati (contoh)',
      location: 'Desa Jambudipa, Kecamatan Cisarua',
      address: 'Gang Contoh II No. 7, RT 02/RW 03, Desa Jambudipa',
      landmark: 'Gang kedua setelah warung, tanya Bu RT',
      contactPhone: '0812 0000 0003',
      description:
        'Kos-kosan tiga lantai dengan 12 kamar, tangga di sisi luar.',
      status: 'Ditugaskan',
      assignmentNote:
        'Kunjungi Sabtu pagi. Hubungi pengelola dulu; periksa tangga luar dan sambungan kolom.',
      function: 'Hunian sewa',
      year: '2008',
      floors: '3',
      material: 'Beton bertulang',
      structure: 'Portal beton',
      activity: [
        log(
          'Admin SeismoPass',
          'Menugaskan',
          'Ditugaskan ke Pesurvei Contoh.',
          '2026-11-09T08:10:00.000Z',
        ),
      ],
    },
    {
      ...base,
      ...assigned,
      id: 'LAP-CONTOH-4',
      title: 'SDN Cisarua (contoh)',
      location: 'Kecamatan Cisarua, Kabupaten Bandung Barat',
      address: 'Jalan Pendidikan Contoh No. 12, Cisarua',
      landmark: 'Di sebelah lapangan desa',
      contactPhone: '0812 0000 0004',
      description:
        'Gedung sekolah satu lantai, enam ruang kelas, atap rangka baja ringan.',
      status: 'Dalam survei',
      assignmentNote: 'Isi input RVS di lokasi lalu kirim catatan kunjungan.',
      function: 'Fasilitas pendidikan',
      year: '1985',
      floors: '1',
      material: 'Pasangan bata',
      structure: 'Dinding pemikul',
      activity: [
        log(
          'Admin SeismoPass',
          'Menugaskan',
          'Ditugaskan ke Pesurvei Contoh.',
          '2026-11-08T09:00:00.000Z',
        ),
        log(
          'Pesurvei Contoh',
          'Memulai survei',
          'Survei dimulai.',
          '2026-11-10T01:15:00.000Z',
        ),
      ],
    },
    {
      ...base,
      ...assigned,
      id: 'LAP-CONTOH-5',
      title: 'Ruko Pasar Contoh',
      location: 'Desa Jambudipa, Kecamatan Cisarua',
      address: 'Jalan Pasar Contoh No. 21, Desa Jambudipa',
      landmark: 'Depan pasar, ruko ketiga dari pojok',
      description:
        'Rumah toko dua lantai, lantai bawah dipakai usaha, ada penambahan lantai.',
      status: 'Ditinjau',
      assignmentNote: 'Periksa penambahan lantai dua.',
      function: 'Tempat usaha',
      year: '2001',
      floors: '2',
      material: 'Beton bertulang',
      structure: 'Portal beton',
      visitDate: '2026-11-10',
      visitNote:
        'Bertemu pemilik. Lantai dua ditambah sekitar 2012 tanpa gambar. Tidak ada retak struktural terlihat dari luar.',
      rvs: contohRvs(
        {
          buildingType: 'RM1',
          stories: '2',
          soil: 'D',
          vertical: 'none',
          plan: 'no',
          code: 'pre',
          pounding: 'no',
          damage: 'no',
          parapet: 'yes',
        },
        {
          exterior: 'all sides',
          interior: 'visible',
          soilSource: 'Perkiraan pemeriksa, belum ada data tanah',
          comments:
            'Parapet di sisi depan. Penambahan lantai perlu ditinjau ahli.',
        },
        '2026-11-10T04:20:00.000Z',
      ),
      activity: [
        log(
          'Admin SeismoPass',
          'Menugaskan',
          'Ditugaskan ke Pesurvei Contoh.',
          '2026-11-08T09:20:00.000Z',
        ),
        log(
          'Pesurvei Contoh',
          'Mengirim catatan kunjungan',
          'Kunjungan 10 Nov 2026.',
          '2026-11-10T04:30:00.000Z',
        ),
      ],
    },
    {
      ...base,
      ...assigned,
      id: 'LAP-CONTOH-6',
      title: 'Rumah tinggal Pak Dedi (contoh)',
      location: 'Desa Cipada, Kecamatan Cisarua',
      address: 'Kampung Contoh RT 01/RW 01, Desa Cipada',
      landmark: 'Belakang warung bakso',
      description: 'Rumah satu lantai, dinding bata tanpa kolom praktis.',
      status: 'Perlu revisi',
      assignmentNote: 'Lengkapi cakupan pemeriksaan interior.',
      reviewNote:
        'Catatan kunjungan belum menyebut cakupan interior dan sumber informasi tanah. Mohon dilengkapi.',
      function: 'Rumah tinggal',
      year: '1990',
      floors: '1',
      material: 'Pasangan bata',
      structure: 'Dinding pemikul',
      visitDate: '2026-11-07',
      visitNote: 'Kunjungan singkat, pemilik tidak di rumah.',
      activity: [
        log(
          'Admin SeismoPass',
          'Menugaskan',
          'Ditugaskan ke Pesurvei Contoh.',
          '2026-11-05T08:00:00.000Z',
        ),
        log(
          'Pesurvei Contoh',
          'Mengirim catatan kunjungan',
          'Kunjungan 7 Nov 2026.',
          '2026-11-07T06:00:00.000Z',
        ),
        log(
          'Admin SeismoPass',
          'Meminta revisi',
          'Cakupan interior belum dicatat.',
          '2026-11-08T02:00:00.000Z',
        ),
      ],
    },
    {
      ...base,
      ...assigned,
      id: 'LAP-CONTOH-7',
      title: 'Pustu Cisarua (contoh)',
      location: 'Kecamatan Cisarua, Kabupaten Bandung Barat',
      address: 'Jalan Kesehatan Contoh No. 3, Cisarua',
      landmark: 'Samping kantor desa',
      description: 'Pos kesehatan satu lantai, bangunan tahun 2010.',
      status: 'Selesai',
      assignmentNote: 'Survei awal fasilitas kesehatan.',
      reviewNote: 'Administrasi ditutup. Hasil simulasi belum divalidasi ahli.',
      function: 'Fasilitas kesehatan',
      year: '2010',
      floors: '1',
      material: 'Beton bertulang',
      structure: 'Portal beton',
      visitDate: '2026-11-03',
      visitNote:
        'Bangunan terawat, tidak ada kerusakan terlihat. Interior dapat dimasuki sebagian.',
      rvs: contohRvs(
        {
          buildingType: 'C1',
          stories: '1',
          soil: 'C',
          vertical: 'none',
          plan: 'no',
          code: 'post',
          damage: 'no',
          pounding: 'no',
        },
        {
          exterior: 'all sides',
          interior: 'entered',
          soilSource: 'Peta microzonasi desa',
          comments: 'Tidak ada tanda bahaya jatuh yang terlihat.',
        },
        '2026-11-03T05:00:00.000Z',
      ),
      activity: [
        log(
          'Admin SeismoPass',
          'Menugaskan',
          'Ditugaskan ke Pesurvei Contoh.',
          '2026-11-01T08:00:00.000Z',
        ),
        log(
          'Pesurvei Contoh',
          'Mengirim catatan kunjungan',
          'Kunjungan 3 Nov 2026.',
          '2026-11-03T05:30:00.000Z',
        ),
        log(
          'Admin SeismoPass',
          'Menutup administrasi',
          'Selesai ditinjau.',
          '2026-11-04T03:00:00.000Z',
        ),
      ],
    },
    {
      ...base,
      id: 'LAP-CONTOH-8',
      title: 'Rumah baru di Cipada (draf)',
      location: '',
      description: '',
      status: 'Draf',
    },
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
    return { ...report, reviewNote: undefined, status: 'Dikirim' };
  }
  if (account.role === 'admin' && report.status === 'Dikirim') {
    if (
      action === 'verify' &&
      Object.keys(validateReportRegistration(report)).length === 0
    )
      return { ...report, status: 'Siap disurvei' };
    if (action === 'return' && note)
      return { ...report, reviewNote: note, status: 'Perlu dilengkapi' };
  }
  if (
    action === 'start' &&
    canSurvey(account) &&
    report.assignee === account.id &&
    report.status === 'Ditugaskan'
  )
    return { ...report, status: 'Dalam survei' };
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
    return {
      ...report,
      visitDate: values.date,
      visitNote: note,
      reviewNote: undefined,
      status: 'Ditinjau',
    };
  }
  if (account.role === 'admin' && report.status === 'Ditinjau' && note) {
    if (action === 'revise')
      return { ...report, reviewNote: note, status: 'Perlu revisi' };
    if (action === 'close')
      return { ...report, reviewNote: note, status: 'Selesai' };
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
        by: admin.id,
        action: 'Penugasan oleh admin',
        note: `${target.name}: ${note.trim()}`,
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
              by: admin.id,
              action: 'Penugasan dikembalikan',
              note: 'Akses pesurvei dinonaktifkan. Menunggu penugasan ulang; catatan sebelumnya dipertahankan.',
              at: new Date().toISOString(),
            },
          ],
        }
      : report,
  );
}
