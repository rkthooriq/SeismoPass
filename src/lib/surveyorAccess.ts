import type { AccountIdentity, DemoAccount } from './reportDemo';

export type AccountStatus =
  | 'pending-email'
  | 'pending'
  | 'changes-requested'
  | 'rejected'
  | 'active'
  | 'suspended';
export const accountStatusLabels: Record<AccountStatus, string> = {
  'pending-email': 'Menunggu verifikasi email',
  pending: 'Menunggu tinjauan admin',
  'changes-requested': 'Perlu perbaikan',
  rejected: 'Ditolak',
  active: 'Aktif',
  suspended: 'Dinonaktifkan',
};
export interface AccessDecision {
  action:
    | 'submitted'
    | 'email-demo'
    | 'approved'
    | 'changes-requested'
    | 'rejected'
    | 'suspended'
    | 'reactivated';
  by: string;
  note: string;
  at: string;
}
export function canSurvey(account: AccountIdentity): boolean {
  return account.role === 'surveyor' && account.status === 'active';
}
export function isActiveAdmin(account: AccountIdentity): boolean {
  return account.role === 'admin' && account.status === 'active';
}
export function verifyDemoEmail(account: DemoAccount): DemoAccount | null {
  if (account.status !== 'pending-email') return null;
  return {
    ...account,
    emailVerified: true,
    status: account.role === 'surveyor' ? 'pending' : 'active',
    history: [
      ...(account.history ?? []),
      {
        action: 'email-demo',
        by: account.id,
        note: 'Verifikasi email disimulasikan di demo; tidak ada email yang dikirim.',
        at: new Date().toISOString(),
      },
    ],
  };
}
export function reviewSurveyor(
  admin: AccountIdentity,
  candidate: DemoAccount,
  action: 'approve' | 'request-changes' | 'reject' | 'suspend' | 'reactivate',
  note: string,
  competencyChecked = false,
): DemoAccount | null {
  if (
    !isActiveAdmin(admin) ||
    admin.id === candidate.id ||
    candidate.role !== 'surveyor' ||
    !note.trim() ||
    note.length > 1000
  )
    return null;
  let status: AccountStatus;
  let event: AccessDecision['action'];
  if (
    ['pending', 'changes-requested'].includes(candidate.status) &&
    candidate.emailVerified
  ) {
    if (
      action === 'approve' &&
      competencyChecked &&
      candidate.organization?.trim() &&
      candidate.qualification?.trim()
    ) {
      status = 'active';
      event = 'approved';
    } else if (action === 'request-changes') {
      status = 'changes-requested';
      event = 'changes-requested';
    } else if (action === 'reject') {
      status = 'rejected';
      event = 'rejected';
    } else return null;
  } else if (action === 'suspend' && candidate.status === 'active') {
    status = 'suspended';
    event = 'suspended';
  } else if (
    action === 'reactivate' &&
    candidate.status === 'suspended' &&
    competencyChecked &&
    candidate.emailVerified
  ) {
    status = 'active';
    event = 'reactivated';
  } else return null;
  return {
    ...candidate,
    status,
    reviewNote: note.trim(),
    history: [
      ...(candidate.history ?? []),
      {
        action: event,
        by: admin.id,
        note: note.trim(),
        at: new Date().toISOString(),
      },
    ],
  };
}
export function resubmitSurveyor(
  account: DemoAccount,
  organization: string,
  qualification: string,
): DemoAccount | null {
  if (
    account.role !== 'surveyor' ||
    !['changes-requested', 'rejected'].includes(account.status) ||
    !organization.trim() ||
    !qualification.trim() ||
    organization.length > 200 ||
    qualification.length > 1000
  )
    return null;
  return {
    ...account,
    organization: organization.trim(),
    qualification: qualification.trim(),
    status: account.emailVerified ? 'pending' : 'pending-email',
    reviewNote: undefined,
    history: [
      ...(account.history ?? []),
      {
        action: 'submitted',
        by: account.id,
        note: 'Pengajuan diperbaiki dan dikirim ulang.',
        at: new Date().toISOString(),
      },
    ],
  };
}
