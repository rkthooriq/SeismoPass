import type React from 'react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './filter-menu.css';

export interface FilterMenuOption {
  value: string;
  label: string;
  count: number;
  // Detailed choices inside a group. Selection always holds leaf values;
  // the group checkbox ticks or clears all of its children at once.
  children?: FilterMenuOption[];
}

const leaves = (option: FilterMenuOption): string[] =>
  option.children
    ? option.children.map((child) => child.value)
    : [option.value];

// A pill button that opens a small panel of checkboxes. Choices apply as soon
// as they are ticked (the lists are short), and "Hapus pilihan" clears them.
// Nothing selected means everything is shown.
export default function FilterMenu({
  label,
  options,
  selected,
  onChange,
  icon = true,
  count,
  align = 'end',
  summarize = true,
}: {
  label: string;
  options: FilterMenuOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  // Chip variant: no funnel icon, a count badge, panel opening under the
  // pill's left edge (as in a row of filter chips).
  icon?: boolean;
  count?: number;
  align?: 'start' | 'end';
  // Chips keep a fixed name (no ": Draf" suffix) so they never grow or clip;
  // the active fill and the count show that the chip is filtering.
  summarize?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  // Keep the panel inside the screen: shift it left when the pill sits near
  // the right edge (e.g. a chip at the end of a row on a phone).
  const panel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = panel.current;
    if (!open || !node) return;
    node.style.transform = '';
    const rect = node.getBoundingClientRect();
    const gutter = 16;
    const over = rect.right - (window.innerWidth - gutter);
    const under = gutter - rect.left;
    const shift = over > 0 ? -over : under > 0 ? under : 0;
    if (shift) node.style.transform = `translateX(${shift}px)`;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const first = root.current?.querySelector<HTMLInputElement>(
      '.filter-menu-panel input',
    );
    first?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // A click on a row's text would otherwise move focus to the page's
  // focusable <main> and close the panel; keep focus on that row's checkbox.
  const keepFocus = (event: React.MouseEvent<HTMLLabelElement>) => {
    if ((event.target as HTMLElement).tagName === 'INPUT') return;
    event.preventDefault();
    event.currentTarget.querySelector('input')?.focus();
  };
  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  const toggleGroup = (option: FilterMenuOption) => {
    const values = leaves(option);
    const all = values.every((value) => selected.includes(value));
    onChange(
      all
        ? selected.filter((value) => !values.includes(value))
        : [...selected, ...values.filter((value) => !selected.includes(value))],
    );
  };
  const allLeaves = options.flatMap((option) =>
    option.children ? option.children : [option],
  );
  // A selection that is exactly one whole group reads as that group's name.
  const wholeGroup = options.find(
    (option) =>
      option.children &&
      leaves(option).length === selected.length &&
      leaves(option).every((value) => selected.includes(value)),
  );
  const summary = wholeGroup
    ? wholeGroup.label
    : selected.length === 1
      ? allLeaves.find((option) => option.value === selected[0])?.label
      : selected.length > 1
        ? `${selected.length} dipilih`
        : '';

  return (
    <div
      className="filter-menu"
      ref={root}
      onBlur={(event) => {
        // Close only when focus lands on something outside (e.g. Tab away).
        // A mouse click on a row label blurs with no target; outside clicks
        // are handled by the pointerdown listener instead.
        const next = event.relatedTarget as Node | null;
        if (next && !root.current?.contains(next)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={`filter-menu-trigger${selected.length ? ' is-active' : ''}`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen(!open)}
      >
        {icon && (
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 5h16l-6 7.5V19l-4-2v-4.5Z" />
          </svg>
        )}
        <span className="filter-menu-label">
          {label}
          {summarize && summary && (
            <span className="filter-menu-summary">: {summary}</span>
          )}
        </span>
        {count !== undefined && (
          <span className="filter-menu-badge">{count}</span>
        )}
        <span className="filter-menu-caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div
          ref={panel}
          className={`filter-menu-panel${align === 'start' ? ' is-start' : ''}`}
          id={`${id}-panel`}
        >
          <fieldset>
            <legend>{label}</legend>
            {options.map((option) =>
              option.children ? (
                <div className="filter-menu-group" key={option.value}>
                  <label
                    className="filter-menu-option is-group"
                    onMouseDown={keepFocus}
                  >
                    <input
                      type="checkbox"
                      checked={leaves(option).every((value) =>
                        selected.includes(value),
                      )}
                      ref={(input) => {
                        if (!input) return;
                        const some = leaves(option).some((value) =>
                          selected.includes(value),
                        );
                        input.indeterminate = some && !input.checked;
                      }}
                      onChange={() => toggleGroup(option)}
                    />
                    <span>{option.label}</span>
                    <span className="filter-menu-count">{option.count}</span>
                  </label>
                  {option.children.map((child) => (
                    <label
                      key={child.value}
                      className="filter-menu-option is-child"
                      onMouseDown={keepFocus}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(child.value)}
                        onChange={() => toggle(child.value)}
                      />
                      <span>{child.label}</span>
                      <span className="filter-menu-count">{child.count}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <label
                  key={option.value}
                  className="filter-menu-option"
                  onMouseDown={keepFocus}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={() => toggle(option.value)}
                  />
                  <span>{option.label}</span>
                  <span className="filter-menu-count">{option.count}</span>
                </label>
              ),
            )}
          </fieldset>
          <div className="filter-menu-footer">
            <button
              type="button"
              className="filter-menu-clear"
              disabled={!selected.length}
              onClick={() => onChange([])}
            >
              Hapus pilihan
            </button>
            <button
              type="button"
              className="filter-menu-done"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
