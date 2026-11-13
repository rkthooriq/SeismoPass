export const accountPages = [
  'login',
  'register',
  'forgot-password',
  'invitation',
] as const;
export type AccountPage = (typeof accountPages)[number];
export function isAccountPage(value: string): value is AccountPage {
  return (accountPages as readonly string[]).includes(value);
}
export interface AccountForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  reference: string;
  consent: boolean;
}
export function validateAccountForm(
  page: AccountPage,
  data: AccountForm,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) ||
    data.email.length > 254
  )
    errors.email = 'Masukkan alamat email yang valid.';
  if (page === 'login' && !data.password)
    errors.password = 'Masukkan kata sandi.';
  if (page === 'register') {
    if (!data.name.trim()) errors.name = 'Isi nama untuk akunmu.';
    if (data.password.length < 12)
      errors.password = 'Gunakan setidaknya 12 karakter.';
    if (data.confirmPassword !== data.password)
      errors.confirmPassword = 'Konfirmasi kata sandi belum sama.';
  }
  if (page === 'invitation' && !data.reference.trim())
    errors.reference = 'Isi kode undangan.';
  if (page === 'invitation' && !data.consent)
    errors.consent = 'Centang persetujuan untuk melanjutkan.';
  for (const key of ['name', 'reference'] as const)
    if (data[key].length > 1000) errors[key] = 'Maksimal 1000 karakter.';
  return errors;
}
