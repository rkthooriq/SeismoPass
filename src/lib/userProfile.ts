import type { DemoAccount } from './reportDemo';

export type UserProfile = Pick<
  DemoAccount,
  | 'name'
  | 'email'
  | 'role'
  | 'status'
  | 'emailVerified'
  | 'organization'
  | 'qualification'
>;
export interface ProfileInput {
  name: string;
  organization: string;
}
export type ProfileErrors = Partial<Record<keyof ProfileInput, string>>;

export function validateProfile(input: ProfileInput): ProfileErrors {
  const errors: ProfileErrors = {};
  if (
    typeof input.name !== 'string' ||
    input.name.trim().length < 2 ||
    input.name.trim().length > 100
  )
    errors.name = 'Isi nama dengan 2–100 karakter.';
  if (
    typeof input.organization !== 'string' ||
    input.organization.trim().length > 150
  )
    errors.organization = 'Nama organisasi maksimal 150 karakter.';
  return errors;
}

// No target ID or account patch: only the current account's display fields change.
export function updateOwnProfile(
  current: DemoAccount | null,
  input: ProfileInput,
): { account: DemoAccount } | { error: string } {
  if (!current || current.status !== 'active' || !current.emailVerified)
    return { error: 'Masuk dengan akun aktif untuk mengubah profil.' };
  const errors = validateProfile(input);
  if (Object.keys(errors).length)
    return { error: Object.values(errors).join(' ') };
  return {
    account: {
      ...current,
      name: input.name.trim(),
      organization: input.organization.trim() || undefined,
    },
  };
}

// Passwords, review notes, and access history never enter the profile component.
export function toUserProfile(account: DemoAccount): UserProfile {
  return {
    name: account.name,
    email: account.email,
    role: account.role,
    status: account.status,
    emailVerified: account.emailVerified,
    organization: account.organization,
    qualification: account.qualification,
  };
}
