import { useState } from 'react';
import { canSurvey } from '../../lib/surveyorAccess';
import { formatDate } from '../../lib/dateFormat';
import { localToday, timeSlots } from '../../lib/ownerProgress';
import { scheduleChoice } from '../../lib/scheduleChoice';
import type { DemoAccount, Report } from '../../lib/reportDemo';

// The fields of an assignment: surveyor, note, and visit time. Used by the
// "Tugaskan pesurvei" form and, right after "Data lengkap", by the
// completeness check, so both read and submit the same field names.
export default function AssignmentFields({
  report,
  accounts,
}: {
  report: Report;
  accounts: DemoAccount[];
}) {
  const { availability, rescheduleRequested, useChoice } =
    scheduleChoice(report);
  // With the reporter's own time available the admin just keeps it; the date
  // fields only appear after "Ganti jadwal" (e.g. the surveyor cannot come).
  const [changing, setChanging] = useState(false);
  const showChoice = useChoice && !changing;
  const proposedDate = useChoice
    ? availability?.date
    : report.appointment?.date;
  const proposedSlot = useChoice
    ? availability?.slot
    : (report.appointment?.slot ?? '');
  return (
    <>
      <label>
        Pesurvei aktif
        <select name="surveyorId" required defaultValue={report.assignee ?? ''}>
          <option value="">Pilih pesurvei yang disetujui</option>
          {accounts
            .filter((person) => canSurvey(person) && person.emailVerified)
            .map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} · {person.organization || person.email}
              </option>
            ))}
        </select>
      </label>
      <label>
        Catatan penugasan
        <textarea
          name="assignmentNote"
          maxLength={1000}
          required
          defaultValue={report.assignmentNote}
          placeholder="Lingkup kunjungan dan koordinasi supervisi"
        />
      </label>
      <fieldset className="report-visit-fields">
        <legend>
          {rescheduleRequested && !showChoice
            ? 'Usulkan jadwal baru'
            : 'Jadwal kunjungan'}
        </legend>
        {showChoice && availability ? (
          <div className="schedule-choice">
            <div>
              <strong>
                {formatDate(availability.date)} · {availability.slot}
              </strong>
              <p className="ws-muted">
                Pilihan pelapor. Langsung disepakati saat disimpan.
              </p>
            </div>
            <input
              type="hidden"
              name="appointmentDate"
              value={availability.date}
            />
            <input
              type="hidden"
              name="appointmentSlot"
              value={availability.slot}
            />
            <button
              type="button"
              className="ws-secondary"
              onClick={() => setChanging(true)}
            >
              Ganti jadwal
            </button>
          </div>
        ) : (
          <>
            <label>
              Tanggal usulan
              <input
                name="appointmentDate"
                type="date"
                min={localToday()}
                required
                defaultValue={proposedDate}
              />
            </label>
            <label>
              Rentang waktu
              <select
                name="appointmentSlot"
                required
                defaultValue={proposedSlot}
              >
                <option value="" disabled>
                  Pilih rentang waktu
                </option>
                {timeSlots.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
            </label>
            <p className="ws-muted">
              {useChoice
                ? 'Jadwal selain pilihan pelapor perlu dikonfirmasi pelapor sebelum pesurvei bisa mulai.'
                : 'Wajib. Pesurvei baru bisa memulai survei setelah pelapor mengonfirmasi jadwal ini. Pelapor juga dapat meminta jadwal lain.'}
            </p>
            {useChoice && (
              <div className="report-actions">
                <button
                  type="button"
                  className="ws-secondary"
                  onClick={() => setChanging(false)}
                >
                  Pakai pilihan pelapor
                </button>
              </div>
            )}
          </>
        )}
      </fieldset>
    </>
  );
}
