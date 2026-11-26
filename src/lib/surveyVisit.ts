import { localToday, validDate } from './ownerProgress.ts';

export interface SurveyVisitErrors {
  date?: string;
  note?: string;
}

export function validateSurveyVisit(
  date: string,
  note: string,
  today = localToday(),
): SurveyVisitErrors {
  const errors: SurveyVisitErrors = {};
  if (!date) errors.date = 'Isi tanggal kunjungan.';
  else if (!validDate(date))
    errors.date = 'Pilih tanggal kunjungan yang valid.';
  else if (date > today)
    errors.date = 'Tanggal kunjungan tidak boleh setelah hari ini.';
  if (!note.trim()) errors.note = 'Tulis catatan kunjungan.';
  else if (note.length > 1000)
    errors.note = 'Catatan kunjungan maksimal 1000 karakter.';
  return errors;
}
