import { useId, useRef } from 'react';
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
  reportTitle,
}: {
  activity: ReportActivity[] | undefined;
  accounts: DemoAccount[];
  reportTitle: string;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  if (!activity?.length) return null;
  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="report-history-trigger"
        aria-haspopup="dialog"
        aria-controls={`${id}-history`}
        aria-label={`Riwayat laporan ${reportTitle}, ${activity.length} aktivitas`}
        onClick={() => {
          const position = { top: window.scrollY, left: window.scrollX };
          dialogRef.current?.showModal();
          bodyRef.current?.scrollTo({ top: 0, behavior: 'instant' });
          headingRef.current?.focus({ preventScroll: true });
          window.scrollTo({ ...position, behavior: 'instant' });
        }}
      >
        <svg
          className="report-thread-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 11a9 9 0 1 1 2.6 7M3 5v6h6" />
          <path d="M12 7v5l3 2" />
        </svg>
        <span className="report-history-label">Riwayat</span>
        <span
          className="filter-menu-badge report-history-count"
          aria-hidden="true"
        >
          {activity.length}
        </span>
      </button>
      <dialog
        id={`${id}-history`}
        ref={dialogRef}
        className="report-thread report-history-dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onClose={() => triggerRef.current?.focus({ preventScroll: true })}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            event.currentTarget.close();
        }}
      >
        <div className="report-history-heading">
          <div>
            <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1}>
              Riwayat laporan
            </h2>
            <p id={`${id}-description`}>{reportTitle}</p>
            <span className="report-thread-count">
              {activity.length} aktivitas
            </span>
          </div>
          <button
            className="ws-secondary"
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            Tutup
          </button>
        </div>
        <div ref={bodyRef} className="report-thread-body">
          <p className="report-thread-order">
            Aktivitas terbaru ditampilkan lebih dulu.
          </p>
          <ol>
            {[...activity].reverse().map((event, index) => {
              const role =
                event.role ??
                accounts.find((person) => person.name === event.by)?.role;
              return (
                <li key={`${event.at}-${index}`}>
                  <span className="report-thread-dot" aria-hidden="true" />
                  <div>
                    <strong className="report-thread-action">
                      {event.action}
                    </strong>
                    <div className="report-thread-head">
                      {role && (
                        <span className={`ws-badge ${roleTone[role]}`}>
                          {roleLabel[role]}
                        </span>
                      )}
                      <span>{event.by}</span>
                    </div>
                    {event.note && (
                      <p className="report-thread-note">{event.note}</p>
                    )}
                    <time
                      dateTime={
                        Number.isNaN(new Date(event.at).getTime())
                          ? undefined
                          : event.at
                      }
                    >
                      {formatTime(event.at)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </dialog>
    </>
  );
}
