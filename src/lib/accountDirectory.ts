import type { DemoAccount } from './reportDemo';
import type { AccountStatus } from './surveyorAccess';

export interface DirectoryFilters {
  query: string;
  role: 'all' | 'admin' | 'surveyor';
  status: 'all' | AccountStatus;
}

export function accountDirectory(
  accounts: DemoAccount[],
  filters: DirectoryFilters,
  mode: 'surveyors' | 'applications' = 'surveyors',
): DemoAccount[] {
  const query = filters.query.trim().toLocaleLowerCase('id-ID');
  return accounts.filter((account) => {
    const listed =
      mode === 'applications'
        ? account.role === 'surveyor' &&
          !['active', 'suspended', 'must-change-password'].includes(
            account.status,
          )
        : account.role === 'surveyor' || account.role === 'admin';
    return (
      listed &&
      (filters.role === 'all' || account.role === filters.role) &&
      (filters.status === 'all' || account.status === filters.status) &&
      (!query ||
        [account.name, account.email, account.organization ?? ''].some(
          (value) => value.toLocaleLowerCase('id-ID').includes(query),
        ))
    );
  });
}
