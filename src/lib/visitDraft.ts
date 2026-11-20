// Unsent visit notes, kept per surveyor and report for this browser tab so
// leaving the survey page (or refreshing it) never loses what was typed.
// The draft is private to the surveyor until it is sent for review.
type DraftStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface VisitDraft {
  date: string;
  note: string;
}

export function visitDraftKey(accountId: string, reportId: string): string {
  return `seismopass.visitDraft.v1.${accountId}.${reportId}`;
}

export function readVisitDraft(
  storage: () => DraftStore,
  key: string,
): VisitDraft | null {
  try {
    const raw = storage().getItem(key);
    if (!raw || raw.length > 4000) return null;
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== 'object' ||
      typeof (value as VisitDraft).date !== 'string' ||
      typeof (value as VisitDraft).note !== 'string'
    )
      return null;
    const { date, note } = value as VisitDraft;
    return { date: date.slice(0, 10), note: note.slice(0, 1000) };
  } catch {
    return null;
  }
}

export function writeVisitDraft(
  storage: () => DraftStore,
  key: string,
  draft: VisitDraft | null,
): void {
  try {
    if (draft && (draft.note.trim() || draft.date))
      storage().setItem(key, JSON.stringify(draft));
    else storage().removeItem(key);
  } catch {
    // Without storage the note lasts while the page stays open.
  }
}
