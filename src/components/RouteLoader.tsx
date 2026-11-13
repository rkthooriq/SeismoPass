import { useEffect, useState } from 'react';

// Shown briefly right after signing in or registering, using the same soil
// animation as the first-load splash in index.html. App's enter() fires the
// event; no other navigation (menus, workspace pages, sign-out) shows it.
const VISIBLE_MS = 550;
export const signInEvent = 'seismopass:signed-in';

export default function RouteLoader() {
  const [state, setState] = useState<'hidden' | 'shown' | 'leaving'>('hidden');

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let showTimer = 0;
    let leaveTimer = 0;
    const show = () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(leaveTimer);
      setState('shown');
      showTimer = window.setTimeout(() => {
        setState('leaving');
        leaveTimer = window.setTimeout(() => setState('hidden'), 280);
      }, VISIBLE_MS);
    };
    window.addEventListener(signInEvent, show);
    return () => {
      window.removeEventListener(signInEvent, show);
      window.clearTimeout(showTimer);
      window.clearTimeout(leaveTimer);
    };
  }, []);

  if (state === 'hidden') return null;
  return (
    <div
      className={`sp-loader ${state === 'leaving' ? 'is-done' : ''}`}
      aria-hidden="true"
    >
      <span className="sp-loader-word">SeismoPass</span>
      <div className="sp-loader-core">
        <span className="sp-loader-layer" />
        <span className="sp-loader-layer" />
        <span className="sp-loader-layer" />
        <span className="sp-loader-layer" />
        <svg className="sp-loader-house" viewBox="0 0 34 30">
          <polygon points="2,14 17,2 32,14" fill="#a35f3f" />
          <rect x="6" y="13" width="22" height="16" fill="#a35f3f" />
          <rect x="14" y="19" width="6" height="10" fill="#f6ecdf" />
        </svg>
      </div>
      <span className="sp-loader-text">Menyiapkan ruang kerjamu…</span>
    </div>
  );
}
