import { proposeAppointment } from './ownerProgress.ts';
import { advanceReport, assignReport } from './reportDemo.ts';
import type { AccountIdentity, DemoAccount, Report } from './reportDemo.ts';

export interface AssignmentInput {
  note: string;
  date: string;
  slot: string;
}

export interface AssignmentPlan {
  report: Report;
  /** Same surveyor and time as before: the reporter's answer is kept. */
  unchanged: boolean;
  /** The reporter's own chosen time was kept, so it is agreed at once. */
  agreed: boolean;
}

// Assign a surveyor and set the visit time. Keeping the reporter's chosen
// time agrees the schedule; any other time is a proposal they confirm.
export function planAssignment(
  report: Report,
  admin: AccountIdentity,
  target: DemoAccount | undefined,
  input: AssignmentInput,
): AssignmentPlan | null {
  if (!target) return null;
  let next = assignReport(report, admin, target, input.note);
  if (!next) return null;
  const current = next.appointment;
  const choice = report.ownerProgress?.availability;
  // A pending proposal equal to the reporter's own choice is not
  // "unchanged": saving it agrees the schedule.
  const pendingChoice =
    current?.response === 'proposed' &&
    choice?.date === input.date &&
    choice.slot === input.slot;
  const unchanged =
    !!current &&
    current.date === input.date &&
    current.slot === input.slot &&
    current.response !== 'change-requested' &&
    !pendingChoice;
  if (!unchanged)
    next =
      input.date && input.slot
        ? proposeAppointment(next, admin, input.date, input.slot)
        : null;
  if (!next) return null;
  const agreed =
    next.appointment?.response === 'confirmed' &&
    next.appointment.confirmedBy === 'owner' &&
    !unchanged;
  return { report: next, unchanged, agreed };
}

// "Data lengkap" and the assignment in one step. All or nothing: if the
// assignment cannot be made, the report is not marked complete either.
export function verifyAndAssign(
  report: Report,
  admin: AccountIdentity,
  target: DemoAccount | undefined,
  input: AssignmentInput,
): AssignmentPlan | null {
  const verified = advanceReport(report, admin, 'verify');
  return verified ? planAssignment(verified, admin, target, input) : null;
}
