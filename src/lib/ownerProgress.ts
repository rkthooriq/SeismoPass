import type { AccountIdentity, Report } from './reportDemo';

export type BuildingPoint = { latitude: number; longitude: number };
export const timeSlots = [
  'Pagi (08.00–11.00)',
  'Siang (11.00–14.00)',
  'Sore (14.00–17.00)',
] as const;
export type TimeSlot = (typeof timeSlots)[number];
export interface SurveyAppointment {
  date: string;
  slot: TimeSlot;
  response: 'proposed' | 'confirmed' | 'change-requested';
}
export interface OwnerProgress {
  point?: BuildingPoint;
  availability?: { date: string; slot: TimeSlot; note: string; at: string };
  followUp?: {
    choice: 'consultation' | 'explanation' | 'later';
    note: string;
    at: string;
  };
  support?: {
    need: 'consultation' | 'cost-information' | 'funding-information';
    note: string;
    at: string;
  };
  work?: {
    stage: 'preparing' | 'ongoing' | 'reported-complete';
    note: string;
    at: string;
  };
}
export type OwnerAction =
  | { type: 'location'; point?: BuildingPoint }
  | { type: 'availability'; date: string; slot: string; note: string }
  | { type: 'appointment'; response: 'confirmed' | 'change-requested' }
  | { type: 'follow-up'; choice: string; note: string }
  | { type: 'support'; need: string; note: string }
  | { type: 'work'; stage: string; note: string };

const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const validText = (value: unknown, max = 1000): value is string =>
  typeof value === 'string' && value.length <= max;
export function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function validPoint(value: unknown): value is BuildingPoint {
  return (
    object(value) &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    Math.abs(value.latitude) <= 85 &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude) &&
    Math.abs(value.longitude) <= 180
  );
}
const timestamp = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= 40 &&
  Number.isFinite(Date.parse(value));
export function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function parseAppointment(
  value: unknown,
): SurveyAppointment | undefined {
  if (
    !object(value) ||
    !validDate(value.date) ||
    !timeSlots.includes(value.slot as TimeSlot) ||
    !['proposed', 'confirmed', 'change-requested'].includes(
      String(value.response),
    )
  )
    return undefined;
  return {
    date: value.date,
    slot: value.slot as TimeSlot,
    response: value.response as SurveyAppointment['response'],
  };
}
export function parseOwnerProgress(value: unknown): OwnerProgress | undefined {
  if (!object(value)) return undefined;
  const result: OwnerProgress = {};
  if (validPoint(value.point))
    result.point = {
      latitude: value.point.latitude,
      longitude: value.point.longitude,
    };
  const availability = value.availability;
  if (
    object(availability) &&
    validDate(availability.date) &&
    timeSlots.includes(availability.slot as TimeSlot) &&
    validText(availability.note) &&
    timestamp(availability.at)
  ) {
    result.availability = {
      date: availability.date,
      slot: availability.slot as TimeSlot,
      note: availability.note,
      at: availability.at,
    };
  }
  for (const key of ['followUp', 'support', 'work'] as const) {
    const entry = value[key];
    if (!object(entry) || !validText(entry.note) || !timestamp(entry.at))
      continue;
    if (
      key === 'followUp' &&
      ['consultation', 'explanation', 'later'].includes(String(entry.choice))
    )
      result.followUp = {
        choice: entry.choice as NonNullable<
          OwnerProgress['followUp']
        >['choice'],
        note: entry.note,
        at: entry.at,
      };
    if (
      key === 'support' &&
      ['consultation', 'cost-information', 'funding-information'].includes(
        String(entry.need),
      )
    )
      result.support = {
        need: entry.need as NonNullable<OwnerProgress['support']>['need'],
        note: entry.note,
        at: entry.at,
      };
    if (
      key === 'work' &&
      ['preparing', 'ongoing', 'reported-complete'].includes(
        String(entry.stage),
      )
    )
      result.work = {
        stage: entry.stage as NonNullable<OwnerProgress['work']>['stage'],
        note: entry.note,
        at: entry.at,
      };
  }
  return Object.keys(result).length ? result : undefined;
}

export function updateOwnerProgress(
  report: Report,
  account: AccountIdentity,
  action: OwnerAction,
  today = localToday(),
): Report | null {
  if (
    account.role !== 'owner' ||
    account.status !== 'active' ||
    report.reporterId !== account.id
  )
    return null;
  const progress = { ...report.ownerProgress };
  const at = new Date().toISOString();
  let description = '';
  let appointment = report.appointment;
  if (action.type === 'location') {
    if (action.point !== undefined && !validPoint(action.point)) return null;
    progress.point = action.point;
    description = action.point
      ? 'Lokasi bangunan diperbarui oleh pelapor.'
      : 'Titik lokasi bangunan dihapus oleh pelapor.';
  } else if (action.type === 'availability') {
    if (
      !['Dikirim', 'Siap disurvei', 'Ditugaskan'].includes(report.status) ||
      !validDate(action.date) ||
      action.date < today ||
      !timeSlots.includes(action.slot as TimeSlot) ||
      !validText(action.note)
    )
      return null;
    progress.availability = {
      date: action.date,
      slot: action.slot as TimeSlot,
      note: action.note.trim(),
      at,
    };
    if (appointment)
      appointment = { ...appointment, response: 'change-requested' };
    description =
      'Pelapor mencatat waktu yang tersedia; menunggu koordinasi admin.';
  } else if (action.type === 'appointment') {
    if (
      report.status !== 'Ditugaskan' ||
      !appointment ||
      appointment.response !== 'proposed' ||
      appointment.date < today ||
      !['confirmed', 'change-requested'].includes(action.response)
    )
      return null;
    appointment = { ...appointment, response: action.response };
    description =
      action.response === 'confirmed'
        ? 'Pelapor mengonfirmasi jadwal yang diusulkan admin.'
        : 'Pelapor meminta perubahan jadwal survei.';
  } else {
    if (!validText(action.note) || !action.note.trim()) return null;
    if (action.type === 'follow-up') {
      if (
        report.status !== 'Selesai' ||
        !['consultation', 'explanation', 'later'].includes(action.choice)
      )
        return null;
      progress.followUp = {
        choice: action.choice as NonNullable<
          OwnerProgress['followUp']
        >['choice'],
        note: action.note.trim(),
        at,
      };
      description =
        'Pilihan tindak lanjut dicatat oleh pelapor; belum menjadi keputusan ahli.';
    } else if (action.type === 'support') {
      if (
        report.status === 'Draf' ||
        !['consultation', 'cost-information', 'funding-information'].includes(
          action.need,
        )
      )
        return null;
      progress.support = {
        need: action.need as NonNullable<OwnerProgress['support']>['need'],
        note: action.note.trim(),
        at,
      };
      description =
        'Kebutuhan dukungan dicatat; belum menjadi pengajuan atau persetujuan program.';
    } else if (action.type === 'work') {
      if (
        report.status !== 'Selesai' ||
        !['preparing', 'ongoing', 'reported-complete'].includes(action.stage)
      )
        return null;
      progress.work = {
        stage: action.stage as NonNullable<OwnerProgress['work']>['stage'],
        note: action.note.trim(),
        at,
      };
      description =
        'Catatan pekerjaan dari pelapor diperbarui; belum diverifikasi ahli.';
    } else return null;
  }
  return {
    ...report,
    ownerProgress: progress,
    ...(appointment ? { appointment } : {}),
    activity: [
      ...(report.activity ?? []),
      { by: account.name, action: description, note: '', at },
    ].slice(-500),
  };
}

export function proposeAppointment(
  report: Report,
  account: AccountIdentity,
  date: string,
  slot: string,
  today = localToday(),
): Report | null {
  if (
    account.role !== 'admin' ||
    account.status !== 'active' ||
    report.status !== 'Ditugaskan' ||
    !report.assignee ||
    !validDate(date) ||
    date < today ||
    !timeSlots.includes(slot as TimeSlot)
  )
    return null;
  return {
    ...report,
    appointment: { date, slot: slot as TimeSlot, response: 'proposed' },
  };
}
