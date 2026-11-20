// Who is signed in, kept for this browser tab only so a refresh does not sign
// the person out. Only the account id and demo flag are stored, never a
// password; the session ends on "Keluar" or when the tab is closed.
export const activeSessionKey = 'seismopass.activeSession.v1';

type SessionStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface ActiveSession {
  accountId: string;
  demoMode: boolean;
}

export function readActiveSession(
  storage: () => SessionStore,
): ActiveSession | null {
  try {
    const raw = storage().getItem(activeSessionKey);
    if (!raw || raw.length > 500) return null;
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== 'object' ||
      typeof (value as ActiveSession).accountId !== 'string' ||
      !(value as ActiveSession).accountId ||
      typeof (value as ActiveSession).demoMode !== 'boolean'
    )
      return null;
    const { accountId, demoMode } = value as ActiveSession;
    return { accountId, demoMode };
  } catch {
    return null;
  }
}

export function writeActiveSession(
  storage: () => SessionStore,
  session: ActiveSession | null,
): void {
  try {
    if (session) storage().setItem(activeSessionKey, JSON.stringify(session));
    else storage().removeItem(activeSessionKey);
  } catch {
    // Without storage the session simply lasts until the next refresh.
  }
}

// Workspace routes need a signed-in account; everything else is public.
export function isProtectedRoute(path: string): boolean {
  return path === 'dashboard' || path.startsWith('dashboard/');
}
