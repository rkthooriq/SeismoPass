import { localToday } from './ownerProgress.ts';
import type { Report } from './reportDemo.ts';

// What the assignment form starts from: the reporter's own chosen visit
// time when there is one that is still ahead and no schedule is settled.
export function scheduleChoice(report: Report, today = localToday()) {
  const availability = report.ownerProgress?.availability;
  const rescheduleRequested =
    report.appointment?.response === 'change-requested';
  // A proposal still waiting for an answer although it is exactly the
  // reporter's own choice (assigned before choices existed) counts as the
  // choice: keeping it agrees the schedule.
  const proposalIsChoice =
    report.appointment?.response === 'proposed' &&
    report.appointment.date === availability?.date &&
    report.appointment.slot === availability?.slot;
  const useChoice =
    !!availability &&
    availability.date >= today &&
    (!report.appointment || rescheduleRequested || proposalIsChoice);
  return { availability, rescheduleRequested, proposalIsChoice, useChoice };
}
