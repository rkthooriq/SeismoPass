import type { Building } from '../types/building';

export function validateBuilding(
  data: Building,
  consent: boolean,
  draft: boolean,
  currentYear = new Date().getFullYear(),
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = 'Isi nama bangunan.';
  if (!draft)
    for (const key of [
      'location',
      'function',
      'floors',
      'material',
      'structure',
    ] as const) {
      if (!data[key].trim()) errors[key] = 'Lengkapi bagian ini.';
    }
  if (
    data.year &&
    (!/^\d{4}$/.test(data.year) ||
      Number(data.year) < 1000 ||
      Number(data.year) > currentYear)
  ) {
    errors.year =
      'Masukkan tahun antara 1000 dan tahun berjalan, atau kosongkan.';
  }
  if (
    data.floors &&
    (!/^\d+$/.test(data.floors) ||
      Number(data.floors) < 1 ||
      Number(data.floors) > 200)
  ) {
    errors.floors = 'Masukkan jumlah lantai bulat antara 1–200.';
  }
  if (!consent)
    errors.consent = 'Konfirmasi bahwa kamu menggunakan data demonstrasi.';
  return errors;
}
