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

export interface FilterOption<T extends string> {
  value: T;
  count: number;
}

// Role and status choices for the directory: only values that the listed
// accounts actually have, with counts. A filter with fewer than two choices
// cannot narrow the list, so it is left out.
export function directoryFilterOptions(
  accounts: DemoAccount[],
  mode: 'surveyors' | 'applications' = 'surveyors',
): {
  roles: FilterOption<'admin' | 'surveyor'>[];
  statuses: FilterOption<AccountStatus>[];
} {
  const listed = accountDirectory(
    accounts,
    { query: '', role: 'all', status: 'all' },
    mode,
  );
  const tally = <T extends string>(values: T[]): FilterOption<T>[] => {
    const counts = new Map<T, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    const options = [...counts].map(([value, count]) => ({ value, count }));
    return options.length < 2 ? [] : options;
  };
  return {
    roles: tally(
      listed.map((account) => account.role as 'admin' | 'surveyor'),
    ).sort((a, b) =>
      a.value === 'surveyor' ? -1 : b.value === 'surveyor' ? 1 : 0,
    ),
    statuses: tally(listed.map((account) => account.status)),
  };
}
