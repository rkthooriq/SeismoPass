const pages = [
  'dashboard',
  'buildings',
  'new',
  'screening',
  'referrals',
  'retrofit',
  'support',
  'guide',
  'qr',
  'data',
  'access',
];
export function parseWorkspaceRoute(route: string): {
  section: string;
  id?: string;
  isEdit: boolean;
} {
  const path = route.replace(/\/$/, '');
  if (pages.includes(path)) return { section: path, isEdit: false };
  const match = /^profile\/(DEMO-[\w-]+)(\/edit)?$/.exec(path);
  if (match)
    return { section: 'profile', id: match[1], isEdit: Boolean(match[2]) };
  return { section: 'not-found', isEdit: false };
}
