import test from 'node:test';
import assert from 'node:assert/strict';
import { parseWorkspaceRoute } from '../src/lib/workspaceRoute.ts';
test('supported pages and profile/edit links resolve consistently', () => {
  for (const page of [
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
  ])
    assert.equal(parseWorkspaceRoute(page).section, page);
  assert.deepEqual(parseWorkspaceRoute('profile/DEMO-001/edit'), {
    section: 'profile',
    id: 'DEMO-001',
    isEdit: true,
  });
  assert.deepEqual(parseWorkspaceRoute('profile/DEMO-001/'), {
    section: 'profile',
    id: 'DEMO-001',
    isEdit: false,
  });
});
test('unknown routes cannot accidentally open a form or expose a profile', () => {
  for (const path of [
    'dashboard/edit',
    'new/anything',
    'profile',
    'profile/DEMO-001/extra',
    'profile/../../edit',
    'profile/%3Cscript%3E',
    'data/extra',
  ])
    assert.equal(parseWorkspaceRoute(path).section, 'not-found');
});
