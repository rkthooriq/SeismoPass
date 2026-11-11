export const accountPages = [
  'login',
  'register',
  'request-access',
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
  organization: string;
  requestedRole: string;
  reference: string;
  consent: boolean;
}
export const professionalRoles = [['surveyor', 'Pesurvei']] as const;
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
      errors.password =
        'Gunakan setidaknya 12 karakter untuk contoh kata sandi.';
    if (data.confirmPassword !== data.password)
      errors.confirmPassword = 'Konfirmasi kata sandi belum sama.';
  }
  if (page === 'request-access') {
    if (!data.name.trim()) errors.name = 'Isi nama pemohon.';
    if (!data.organization.trim())
      errors.organization = 'Isi nama organisasi atau instansi.';
    if (!data.reference.trim())
      errors.reference = 'Isi ringkasan pelatihan atau kompetensi contoh.';
    if (!professionalRoles.some(([role]) => role === data.requestedRole))
      errors.requestedRole = 'Pilih jenis akses yang diajukan.';
  }
  if (page === 'invitation' && !data.reference.trim())
    errors.reference = 'Isi kode undangan.';
  if (page !== 'login' && page !== 'forgot-password' && !data.consent)
    errors.consent = 'Konfirmasi penggunaan data contoh pada pratinjau ini.';
  for (const key of ['name', 'organization', 'reference'] as const)
    if (data[key].length > 1000) errors[key] = 'Maksimal 1000 karakter.';
  return errors;
}
