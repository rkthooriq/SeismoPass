import type { ActorRole } from '../../lib/actorAccess';
import type { DemoAccount, ReportActivity } from '../../lib/reportDemo';

const roleLabel: Record<ActorRole, string> = {
  owner: 'Pelapor',
  admin: 'Admin',
  surveyor: 'Pesurvei',
};
// Same tones as report statuses: neutral for the reporter, blue for admin,
// ochre for the field. The role name is always written out beside the colour.
const roleTone: Record<ActorRole, string> = {
  owner: 'status-draft',
  admin: 'status-admin',
  surveyor: 'status-field',
};

function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

// One thread for the whole journey: reporter → admin → surveyor → admin →
// reporter. Every role reads the same entries, so nobody has to guess what the
// last hand-over said.
export default function ReportTimeline({
  activity,
  accounts,
  heading = 'Riwayat dan catatan antar peran',
  defaultOpen = false,
}: {
  activity: ReportActivity[] | undefined;
  accounts: DemoAccount[];
  heading?: string;
  defaultOpen?: boolean;
}) {
  if (!activity?.length) return null;
  return (
    <details className="report-thread" open={defaultOpen}>
      <summary>
        {heading} ({activity.length})
      </summary>
      <ol>
        {activity.map((event, index) => {
          const role =
            event.role ??
            accounts.find((person) => person.name === event.by)?.role;
          return (
            <li key={index}>
              <span className="report-thread-dot" aria-hidden="true" />
              <div>
                <p className="report-thread-head">
                  {role && (
                    <span className={`ws-badge ${roleTone[role]}`}>
                      {roleLabel[role]}
                    </span>
                  )}
                  <strong>{event.action}</strong>
                </p>
                {event.note && (
                  <p className="report-thread-note">{event.note}</p>
                )}
                <small>
                  {event.by} · {formatTime(event.at)}
                </small>
              </div>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
