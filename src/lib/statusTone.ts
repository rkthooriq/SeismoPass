import type { ReportStatus } from './reportDemo';

// A status colour says who holds the report now. The label stays beside it,
// so the colour is never the only cue.
export type StatusTone = 'draft' | 'admin' | 'field' | 'action' | 'done';

const tones: Record<ReportStatus, StatusTone> = {
  Draf: 'draft',
  Dikirim: 'admin',
  'Perlu dilengkapi': 'action',
  'Siap disurvei': 'field',
  Ditugaskan: 'field',
  'Dalam survei': 'field',
  Ditinjau: 'admin',
  'Perlu revisi': 'action',
  Selesai: 'done',
};

// The owner has nothing to do while the surveyor corrects their notes, so for
// the owner that stage reads as field work, not as a request for action.
export function statusTone(
  status: ReportStatus,
  viewer: 'owner' | 'staff' = 'staff',
): StatusTone {
  if (viewer === 'owner' && status === 'Perlu revisi') return 'field';
  return tones[status];
}

export function statusToneClass(
  status: ReportStatus,
  viewer: 'owner' | 'staff' = 'staff',
): string {
  return `status-${statusTone(status, viewer)}`;
}
