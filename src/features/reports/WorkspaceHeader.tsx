import Brand from '../../components/Brand';
import AccountProfileLink from '../profile/AccountProfileLink';
import type { AccountIdentity } from '../../lib/reportDemo';

const demoRoles = [
  ['owner-demo', 'Pelapor'],
  ['admin-demo', 'Admin'],
  ['survey-demo', 'Pesurvei'],
] as const;

export default function WorkspaceHeader({
  account,
  profileActive,
  onLeave,
  onSwitchRole,
}: {
  account: AccountIdentity;
  profileActive: boolean;
  onLeave: () => void;
  onSwitchRole?: (id: string) => void;
}) {
  return (
    <header className="workspace-header">
      <div className="workspace-header-inner">
        <Brand />
        <div className="workspace-account">
          {onSwitchRole && (
            <div
              className="demo-role-switch"
              role="group"
              aria-label="Pindah peran"
            >
              {demoRoles.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={account.id === id}
                  onClick={() => onSwitchRole(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <AccountProfileLink account={account} active={profileActive} />
          <button className="ws-secondary" onClick={onLeave}>
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
