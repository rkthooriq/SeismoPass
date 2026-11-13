import WorkspaceHeader from './WorkspaceHeader';
import { LiquidNavbar } from '../../components/ui/liquid-glass-navbar';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getActor } from '../../lib/actorAccess';
import { workflowMenus } from '../../lib/workflowNavigation';
import type { WorkflowPage } from '../../lib/workflowNavigation';
import type { AccountIdentity } from '../../lib/reportDemo';

function NavigationIcon({ page }: { page: WorkflowPage }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {page === 'new' ? (
        <path d="M12 5v14M5 12h14" />
      ) : page === 'overview' ? (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      ) : page === 'history' ? (
        <>
          <path d="M3 11a9 9 0 1 1 2.6 7.4M3 5v6h6" />
          <path d="M12 7v5l3 2" />
        </>
      ) : (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path
            d={page === 'tasks' ? 'm9 12 2 2 4-5' : 'M9 8h6M9 12h6M9 16h4'}
          />
        </>
      )}
    </svg>
  );
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const role = getActor(account.role);
  const menus = workflowMenus[account.role];
  const isAdmin = account.role === 'admin';
  const title =
    page === 'profile'
      ? 'Profil saya'
      : (menus.find(([id]) => id === page)?.[1] ?? 'Halaman tidak tersedia');
  const intro =
    page === 'profile'
      ? 'Lihat informasi akun dan perbarui identitasmu.'
      : isAdmin
        ? 'Kelola akses pesurvei, atur penugasan, dan pantau tindak lanjut bangunan.'
        : account.role === 'surveyor'
          ? 'Kerjakan penugasan dari admin dan catat hasil kunjungan secara tertata.'
          : 'Catat bangunanmu dan ikuti setiap langkah tindak lanjutnya.';
  const heading = (
    <>
      <div className="role-page-heading">
        <div>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </div>
    </>
  );
  const footer = (
    <footer className="role-footer workspace-footer">
      <span>RVS adalah penyaringan awal, bukan sertifikat aman.</span>
      <a href="#">Kembali ke beranda</a>
    </footer>
  );

  return (
    <div
      className={`workspace role-workspace ${isAdmin ? 'admin-workspace' : `topnav-workspace ${account.role}-workspace`}`}
    >
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
      <WorkspaceHeader
        account={account}
        profileActive={page === 'profile'}
        onLeave={onLeave}
      />
      {isAdmin ? (
        <div className="role-layout">
          <aside className={`role-sidebar ${menuOpen ? 'is-open' : ''}`}>
            <div className="role-context">
              <span className="role-context-icon">{role.symbol}</span>
              <div>
                <strong>Ruang {role.shortName}</strong>
                <small>SeismoPass</small>
              </div>
            </div>
            <button
              className="role-mobile-menu"
              aria-expanded={menuOpen}
              aria-controls="role-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? 'Tutup menu admin' : 'Buka menu admin'}{' '}
              <span aria-hidden="true">☰</span>
            </button>
            <nav id="role-navigation" aria-label="Menu Admin">
              <span className="role-nav-label">Ruang kerja</span>
              {menus.map(([id, label, icon]) => (
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
              <span className="role-nav-label">Akun</span>
              <a
                href="#/dashboard/profile"
                aria-current={page === 'profile' ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span aria-hidden="true">◎</span>
                <span>Profil saya</span>
              </a>
            </nav>
          </aside>
          <div className="role-content">
            <main id="role-main" className="role-main" tabIndex={-1}>
              {heading}
              {children}
              {footer}
            </main>
          </div>
        </div>
      ) : (
        <main id="role-main" className="topnav-main" tabIndex={-1}>
          {heading}
          {(page !== 'profile' || account.role === 'surveyor') && (
            <div className="workspace-section-nav">
              {page !== 'profile' && (
                <div className="workspace-nav-scroll" ref={scrollRef}>
                  <LiquidNavbar
                    className="workspace-liquid-nav"
                    ariaLabel={`Menu ${role.shortName}`}
                    compact={false}
                    active={menus.findIndex(([id]) => id === page)}
                    scrollContainerRef={scrollRef}
                    items={menus.map(([id, label]) => ({
                      label,
                      href: `#/dashboard/${id}`,
                      badge: counts[id],
                      fx: 'none',
                      icon: <NavigationIcon page={id} />,
                    }))}
                  />
                </div>
              )}
              {account.role === 'surveyor' && (
                <a className="ws-secondary workspace-training" href="#/rvs-lab">
                  Latihan RVS & QR <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          )}
          {children}
          {footer}
        </main>
      )}
    </div>
  );
}
