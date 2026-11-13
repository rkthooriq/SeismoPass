import { getActor } from '../../lib/actorAccess';
import type { AccountIdentity } from '../../lib/reportDemo';

export default function AccountProfileLink({
  account,
  active,
}: {
  account: AccountIdentity;
  active: boolean;
}) {
  return (
    <a
      className="account-profile-link"
      href="#/dashboard/profile"
      aria-label={`Profil saya: ${account.name}`}
      aria-current={active ? 'page' : undefined}
    >
      <span className="role-avatar" aria-hidden="true">
        {account.name.trim().slice(0, 1).toLocaleUpperCase('id-ID')}
      </span>
      <span className="account-profile-name">
        <strong>{account.name}</strong>
        <small>
          {active ? 'Profil saya' : getActor(account.role).shortName}
        </small>
      </span>
    </a>
  );
}
