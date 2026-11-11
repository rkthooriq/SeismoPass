import { demoAccounts, demoPassword } from './reportDemo.ts';
import type { DemoAccount, Report } from './reportDemo';
import { restoreReports } from './reportSession.ts';
import type { AccessDecision, AccountStatus } from './surveyorAccess';

export const demoSessionKey = 'seismopass.workflow.demo.v2';
export function initialDirectory(): DemoAccount[] {
  return [
    ...demoAccounts.map((account) => ({ ...account })),
    {
      id: 'surveyor-applicant-demo',
      name: 'Calon Pesurvei Demo',
      email: 'calon@example.com',
      password: demoPassword,
      role: 'surveyor',
      status: 'pending',
      emailVerified: true,
      organization: 'Tim Lapangan Contoh',
      qualification:
        'Contoh catatan pelatihan RVS dan supervisi; dokumen nyata tidak diunggah pada demo.',
      history: [
        {
          action: 'email-demo',
          by: 'surveyor-applicant-demo',
          note: 'Contoh verifikasi email demo; bukan verifikasi email nyata.',
          at: '2026-11-11T00:00:00.000Z',
        },
      ],
    },
  ];
}
const statuses: AccountStatus[] = [
  'pending-email',
  'pending',
  'changes-requested',
  'rejected',
  'active',
  'suspended',
];
const actions: AccessDecision['action'][] = [
  'submitted',
  'email-demo',
  'approved',
  'changes-requested',
  'rejected',
  'suspended',
  'reactivated',
];
export function restoreDirectory(value: unknown): DemoAccount[] | null {
  if (!Array.isArray(value) || value.length < 3 || value.length > 500)
    return null;
  const accounts: DemoAccount[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') return null;
    const r = item as Record<string, unknown>;
    if (
      !['id', 'name', 'email'].every(
        (key) =>
          typeof r[key] === 'string' &&
          r[key].length > 0 &&
          r[key].length <= 254,
      ) ||
      typeof r.email !== 'string' ||
      !/^[^\s@]+@example\.com$/.test(r.email) ||
      !['owner', 'admin', 'surveyor'].includes(r.role as string) ||
      !statuses.includes(r.status as AccountStatus) ||
      typeof r.emailVerified !== 'boolean'
    )
      return null;
    if (r.role === 'admin' && r.id !== 'admin-demo') return null;
    const seed = demoAccounts.find((account) => account.id === r.id);
    if (seed && (r.role !== seed.role || r.email !== seed.email)) return null;
    if (r.role === 'admin' && (r.status !== 'active' || !r.emailVerified))
      return null;
    if (r.status === 'active' && !r.emailVerified) return null;
    if (
      !['organization', 'qualification', 'reviewNote'].every(
        (key) =>
          r[key] === undefined ||
          (typeof r[key] === 'string' && r[key].length <= 1000),
      )
    )
      return null;
    const history: AccessDecision[] = [];
    if (r.history !== undefined) {
      if (!Array.isArray(r.history) || r.history.length > 500) return null;
      for (const e of r.history) {
        if (
          !e ||
          typeof e !== 'object' ||
          !actions.includes(e.action) ||
          !['by', 'note', 'at'].every(
            (key) => typeof e[key] === 'string' && e[key].length <= 1000,
          )
        )
          return null;
        history.push({ action: e.action, by: e.by, note: e.note, at: e.at });
      }
    }
    accounts.push({
      id: r.id as string,
      name: r.name as string,
      email: r.email,
      role: r.role as DemoAccount['role'],
      status: r.status as AccountStatus,
      emailVerified: r.emailVerified,
      password: demoPassword,
      organization: r.organization as string | undefined,
      qualification: r.qualification as string | undefined,
      reviewNote: r.reviewNote as string | undefined,
      history,
    });
  }
  if (
    !demoAccounts.every((seed) =>
      accounts.some((account) => account.id === seed.id),
    ) ||
    new Set(accounts.map((account) => account.id)).size !== accounts.length ||
    new Set(accounts.map((account) => account.email)).size !== accounts.length
  )
    return null;
  return accounts;
}
export function serializeDemoSession(
  accounts: DemoAccount[],
  reports: Report[],
): string {
  return JSON.stringify({
    version: 2,
    accounts: accounts.map((account) => ({ ...account, password: undefined })),
    reports,
  });
}
export function restoreDemoSession(
  raw: string | null,
  fallbackReports: Report[],
): { accounts: DemoAccount[]; reports: Report[]; invalid: boolean } {
  const fallback = {
    accounts: initialDirectory(),
    reports: fallbackReports,
    invalid: raw !== null,
  };
  if (raw === null || raw.length > 3_000_000) return fallback;
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 2) return fallback;
    const accounts = restoreDirectory(data.accounts);
    if (!accounts || !Array.isArray(data.reports)) return fallback;
    const marker: Report[] = [];
    const reports = restoreReports(
      JSON.stringify(data.reports),
      marker,
      accounts
        .filter((account) => account.role === 'owner')
        .map((account) => account.id),
    );
    if (reports === marker) return fallback;
    return { accounts, reports, invalid: false };
  } catch {
    return fallback;
  }
}
