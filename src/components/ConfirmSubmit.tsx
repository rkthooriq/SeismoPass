import { useId, useRef } from 'react';
import type { ReactNode } from 'react';
import './confirm-submit.css';

/**
 * A submit button for a final action. It checks the form first, then asks
 * once in a small dialog; only "confirm" submits the form, with the same
 * button value as before, so the form handler stays unchanged.
 */
export default function ConfirmSubmit({
  label,
  value,
  className = 'ws-primary',
  title,
  description,
  confirmLabel,
}: {
  label: string;
  value: string;
  className?: string;
  title: string;
  description: ReactNode;
  confirmLabel: string;
}) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className}
        aria-haspopup="dialog"
        aria-controls={id}
        onClick={(event) => {
          // Required fields are checked before asking, so the dialog never
          // hides a validation message.
          if (!event.currentTarget.form?.reportValidity()) return;
          dialogRef.current?.showModal();
          headingRef.current?.focus({ preventScroll: true });
        }}
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        id={id}
        className="rvs-saved-dialog rvs-section-dialog confirm-dialog"
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
        <div className="rvs-saved-heading">
          <div>
            <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1}>
              {title}
            </h2>
            <p id={`${id}-description`}>{description}</p>
          </div>
        </div>
        <div className="report-actions rvs-section-actions">
          <button
            type="button"
            className="ws-secondary"
            onClick={() => dialogRef.current?.close()}
          >
            Batal
          </button>
          <button
            type="submit"
            className="ws-primary"
            value={value}
            onClick={() =>
              // Close after the form has handled the submit.
              requestAnimationFrame(() => dialogRef.current?.close())
            }
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
