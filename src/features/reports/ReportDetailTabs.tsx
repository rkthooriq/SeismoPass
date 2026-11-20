import type { KeyboardEvent } from 'react';

export interface DetailTab<T extends string> {
  id: T;
  label: string;
}

/**
 * Two-part switcher for a long detail page (WAI-ARIA tabs): arrow keys,
 * Home and End move between tabs, and only the active tab is in the tab
 * order. The caller renders the panels with matching `*-panel-<id>` ids.
 */
export default function ReportDetailTabs<T extends string>({
  idPrefix,
  label,
  tabs,
  active,
  onChange,
}: {
  idPrefix: string;
  label: string;
  tabs: readonly DetailTab<T>[];
  active: T;
  onChange: (id: T) => void;
}) {
  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1;
    if (next < 0) return;
    event.preventDefault();
    onChange(tabs[next].id);
    document.getElementById(`${idPrefix}-tab-${tabs[next].id}`)?.focus();
  }
  return (
    <div
      id={`${idPrefix}-tabs`}
      className="report-tabs"
      role="tablist"
      aria-label={label}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          id={`${idPrefix}-tab-${tab.id}`}
          type="button"
          role="tab"
          className="report-tab"
          aria-selected={active === tab.id}
          aria-controls={`${idPrefix}-panel-${tab.id}`}
          tabIndex={active === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => move(event, index)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
