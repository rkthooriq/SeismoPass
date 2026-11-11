import { useState } from 'react';
import type { ReactNode } from 'react';
import { getActor } from '../../lib/actorAccess';
import { workflowMenus } from '../../lib/workflowNavigation';
import type { WorkflowPage } from '../../lib/workflowNavigation';
import type { AccountIdentity } from '../../lib/reportDemo';
export default function WorkspaceShell({
  account,
  page,
  onLeave,
  children,
  counts,
}: {
  account: AccountIdentity;
  page: WorkflowPage | null;
  onLeave: () => void;
  children: ReactNode;
  counts: Partial<Record<WorkflowPage, number>>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const role = getActor(account.role);
  const title =
    workflowMenus[account.role].find(([id]) => id === page)?.[1] ??
    'Halaman tidak tersedia';
  return (
    <div className="workspace role-workspace">
      <a
        className="skip-link"
        href="#role-main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('role-main')?.focus();
        }}
      >
        Lewati navigasi
      </a>
      <div className="role-layout">
        <aside className={`role-sidebar ${menuOpen ? 'is-open' : ''}`}>
          <a className="role-brand" href="#">
            seismo<strong>pass</strong>
            <span>.</span>
          </a>
          <div className="role-context">
            <span className="role-context-icon">{role.symbol}</span>
            <div>
              <strong>Ruang {role.shortName}</strong>
              <small>SeismoPass · demonstrasi</small>
            </div>
          </div>
          <button
            className="role-mobile-menu"
            aria-expanded={menuOpen}
            aria-controls="role-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? 'Tutup menu' : 'Buka menu'} <span>☰</span>
          </button>
          <nav id="role-navigation" aria-label={`Menu ${role.shortName}`}>
            <span className="role-nav-label">RUANG KERJA</span>
            {workflowMenus[account.role].map(([id, label, icon]) => (
              <a
                key={id}
                href={`#/dashboard/${id}`}
                aria-current={page === id ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span aria-hidden="true">{icon}</span>
                <span>{label}</span>
                {!!counts[id] && <small>{counts[id]}</small>}
              </a>
            ))}
            <span className="role-nav-label">PELAJARI</span>
            <a href="#/rvs-lab">
              <span aria-hidden="true">▥</span>
              <span>Latihan RVS & QR</span>
              <span>↗</span>
            </a>
          </nav>
          <div className="role-sidebar-bottom">
            <span className="ws-badge">DATA DEMO</span>
            <p>RVS adalah penyaringan awal, bukan sertifikat aman.</p>
            <a href="#">Kembali ke beranda ↗</a>
          </div>
        </aside>
        <div className="role-content">
          <header className="role-topbar">
            <div>
              <span className="role-breadcrumb">
                Ruang {role.shortName} <span>/</span> {title}
              </span>
            </div>
            <div className="role-account">
              <span className="role-avatar">{account.name.slice(0, 1)}</span>
              <span>
                <strong>{account.name}</strong>
                <small>{role.shortName}</small>
              </span>
              <button className="ws-secondary" onClick={onLeave}>
                Keluar
              </button>
            </div>
          </header>
          <main id="role-main" className="role-main" tabIndex={-1}>
            {children}
            <footer className="role-footer">
              <span>SeismoPass · Demo pengembangan</span>
              <a href="#/flows">Alur tiga peran ↗</a>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
