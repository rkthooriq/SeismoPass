import type { ReactNode } from 'react';
import './notice.css';

export type NoticeTone = 'warning' | 'info' | 'error' | 'success';

export default function Notice({
  tone,
  title,
  children,
  className = '',
  role,
}: {
  tone: NoticeTone;
  /** Optional: a one-sentence status message needs no heading. */
  title?: string;
  children: ReactNode;
  className?: string;
  role?: 'status' | 'alert';
}) {
  return (
    <div className={`feedback-notice notice-${tone} ${className}`} role={role}>
      <svg
        className="notice-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {tone === 'warning' ? (
          <>
            <path d="M10.3 4.2 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4m0 4h.01" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="9" />
            {tone === 'success' ? (
              <path d="m8 12 3 3 5-6" />
            ) : tone === 'error' ? (
              <path d="m9 9 6 6m0-6-6 6" />
            ) : (
              <path d="M12 11v5m0-9h.01" />
            )}
          </>
        )}
      </svg>
      <div className="notice-content">
        {title && <strong className="notice-title">{title}</strong>}
        {children}
      </div>
    </div>
  );
}
