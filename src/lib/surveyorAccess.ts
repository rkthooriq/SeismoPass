import type { AccountIdentity, DemoAccount } from './reportDemo';

export type AccountStatus =
  | 'pending-email'
  | 'must-change-password'
  | 'pending'
  | 'changes-requested'
  | 'rejected'
  | 'active'
  | 'suspended';
export const accountStatusLabels: Record<AccountStatus, string> = {
  'pending-email': 'Menunggu verifikasi email',
  'must-change-password': 'Wajib membuat kata sandi baru',
  pending: 'Menunggu tinjauan admin',
  'changes-requested': 'Perlu perbaikan',
  rejected: 'Ditolak',
  active: 'Aktif',
  suspended: 'Dinonaktifkan',
};
export interface AccessDecision {
  action:
    | 'submitted'
    | 'created-by-admin'
    | 'temp-password-issued'
    | 'password-changed'
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

export const minPasswordLength = 12;
// Tanpa karakter yang mudah tertukar (I, l, O, o, 0, 1).
const temporaryAlphabet =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
export function generateTemporaryPassword(
  fill: (bytes: Uint8Array) => void = (bytes) => {
    crypto.getRandomValues(bytes);
  },
  length = 14,
): string {
  // Menolak byte di atas batas agar setiap karakter peluangnya sama.
  const limit = 256 - (256 % temporaryAlphabet.length);
  let result = '';
  for (let round = 0; result.length < length; round += 1) {
    if (round > 100) throw new Error('Sumber acak tidak menghasilkan data.');
    const bytes = new Uint8Array(32);
    fill(bytes);
    for (const byte of bytes)
      if (byte < limit && result.length < length)
        result += temporaryAlphabet[byte % temporaryAlphabet.length];
  }
  return result;
}
export interface NewSurveyorInput {
  name: string;
  email: string;
  organization: string;
  qualification: string;
}
export function createManagedSurveyor(
  admin: AccountIdentity,
  input: NewSurveyorInput,
  existing: DemoAccount[],
  id: string,
  temporaryPassword: string,
  now = new Date(),
): { account: DemoAccount } | { error: string } {
  if (!isActiveAdmin(admin))
    return { error: 'Hanya admin aktif yang dapat menambah pesurvei.' };
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const organization = input.organization.trim();
  const qualification = input.qualification.trim();
  if (!name || name.length > 200)
    return { error: 'Isi nama pesurvei (maksimal 200 karakter).' };
  if (!/^[^\s@]+@example\.com$/.test(email) || email.length > 254)
    return { error: 'Gunakan alamat fiktif dengan domain example.com.' };
  if (!organization || organization.length > 200)
    return { error: 'Isi organisasi (maksimal 200 karakter).' };
  if (!qualification || qualification.length > 1000)
    return {
      error: 'Isi catatan pelatihan atau kompetensi (maksimal 1000 karakter).',
    };
  if (existing.some((person) => person.email === email))
    return { error: 'Email ini sudah terdaftar.' };
  if (existing.length >= 500)
    return { error: 'Batas akun demo sesi ini tercapai.' };
  if (temporaryPassword.length < minPasswordLength)
    return { error: 'Sandi sementara terlalu pendek.' };
  return {
    account: {
      id,
      name,
      email,
      role: 'surveyor',
      password: temporaryPassword,
      status: 'must-change-password',
      emailVerified: true,
      managed: true,
      organization,
      qualification,
      history: [
        {
          action: 'created-by-admin',
          by: admin.id,
          note: 'Akun dibuat admin dengan sandi sementara. Pesurvei wajib membuat kata sandi baru saat masuk pertama.',
          at: now.toISOString(),
        },
      ],
    },
  };
}
export function issueTemporaryPassword(
  admin: AccountIdentity,
  candidate: DemoAccount,
  temporaryPassword: string,
  now = new Date(),
): DemoAccount | null {
  if (
    !isActiveAdmin(admin) ||
    candidate.role !== 'surveyor' ||
    !candidate.managed ||
    !['active', 'must-change-password'].includes(candidate.status) ||
    temporaryPassword.length < minPasswordLength
  )
    return null;
  return {
    ...candidate,
    password: temporaryPassword,
    status: 'must-change-password',
    history: [
      ...(candidate.history ?? []),
      {
        action: 'temp-password-issued',
        by: admin.id,
        note: 'Admin menerbitkan sandi sementara baru. Pesurvei wajib membuat kata sandi baru.',
        at: now.toISOString(),
      },
    ],
  };
}
export function changeInitialPassword(
  account: DemoAccount,
  current: string,
  next: string,
  confirm: string,
  now = new Date(),
): { account: DemoAccount } | { error: string } {
  if (account.status !== 'must-change-password')
    return { error: 'Akun ini tidak sedang menunggu kata sandi baru.' };
  if (!account.password || current !== account.password)
    return { error: 'Sandi sementara tidak cocok.' };
  if (next.length < minPasswordLength)
    return { error: `Kata sandi baru minimal ${minPasswordLength} karakter.` };
  if (next.length > 200)
    return { error: 'Kata sandi baru maksimal 200 karakter.' };
  if (next === current)
    return { error: 'Kata sandi baru harus berbeda dari sandi sementara.' };
  if (next !== confirm) return { error: 'Konfirmasi kata sandi belum sama.' };
  return {
    account: {
      ...account,
      password: next,
      status: 'active',
      history: [
        ...(account.history ?? []),
        {
          action: 'password-changed',
          by: account.id,
          note: 'Pesurvei membuat kata sandi baru. Admin tidak mengetahui kata sandi ini.',
          at: now.toISOString(),
        },
      ],
    },
  };
}
