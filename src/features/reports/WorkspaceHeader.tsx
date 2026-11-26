import Brand from '../../components/Brand';
import AccountProfileLink from '../profile/AccountProfileLink';
import type { AccountIdentity } from '../../lib/reportDemo';

export default function WorkspaceHeader({
  account,
  profileActive,
  onLeave,
}: {
  account: AccountIdentity;
  profileActive: boolean;
  onLeave: () => void;
}) {
  return (
    <header className="workspace-header">
      <div className="workspace-header-inner">
        <Brand />
        <div className="workspace-account">
          <AccountProfileLink account={account} active={profileActive} />
          <button className="ws-secondary" onClick={onLeave}>
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
