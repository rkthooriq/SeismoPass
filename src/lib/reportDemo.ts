import { canSurvey, isActiveAdmin } from './surveyorAccess.ts';
import type { AccountStatus, AccessDecision } from './surveyorAccess';
import { parseRvsRecord } from './rvs.ts';
import type { RvsRecord } from './rvs';
import type { ActorRole } from './actorAccess';

export interface DemoAccount {
  id: string;
  email: string;
  name: string;
  role: ActorRole;
  password: string;
  status: AccountStatus;
  emailVerified: boolean;
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
    name: 'Pelapor Demo',
    role: 'owner',
    password: demoPassword,
    status: 'active',
    emailVerified: true,
  },
  {
    id: 'admin-demo',
    email: 'admin@example.com',
    name: 'Admin Demo',
    role: 'admin',
    password: demoPassword,
    status: 'active',
    emailVerified: true,
  },
  {
    id: 'survey-demo',
    email: 'pesurvei@example.com',
    name: 'Pesurvei Demo',
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
  id: string;
  reporterId: string;
  title: string;
  location: string;
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
    location: 'Kawasan fiktif, Bandung Barat',
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
];
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
      ['location', 'Lokasi'],
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
  if (!report.demoConsent)
    errors.demoConsent = 'Konfirmasi penggunaan data fiktif dalam demo.';
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
