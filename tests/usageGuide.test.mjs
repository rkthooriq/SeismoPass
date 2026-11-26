import assert from 'node:assert/strict';
import test from 'node:test';
import { actorRoles } from '../src/lib/actorAccess.ts';
import { isProtectedRoute } from '../src/lib/activeSession.ts';
import { usageGuides } from '../src/lib/usageGuide.ts';
import {
  parseReportDetailRoute,
  resolveWorkflowPage,
  workflowMenus,
  workflowPageTitle,
} from '../src/lib/workflowNavigation.ts';

test('each role can reach its own guide from one menu entry', () => {
  for (const { id } of actorRoles) {
    assert.equal(
      workflowMenus[id].filter(([page]) => page === 'help').length,
      1,
    );
    assert.equal(resolveWorkflowPage(id, 'dashboard/help'), 'help');
    assert.equal(workflowPageTitle(id, 'help'), 'Panduan penggunaan');
  }
  assert.equal(isProtectedRoute('dashboard/help'), true);
});

test('guide actions resolve only to pages allowed to the active role', () => {
  for (const { id } of actorRoles) {
    for (const { page } of usageGuides[id].steps) {
      assert.equal(
        resolveWorkflowPage(id, `dashboard/${page}`),
        page,
        `${id}: ${page}`,
      );
      assert.notEqual(page, 'help');
    }
  }
});

test('help routing does not accept role selectors or report ids', () => {
  for (const { id } of actorRoles) {
    for (const route of [
      'dashboard/help/admin',
      'dashboard/help/LAP-1',
      'dashboard/help/../profile',
    ])
      assert.equal(resolveWorkflowPage(id, route), null);
  }
  assert.equal(resolveWorkflowPage('expert', 'dashboard/help'), null);
  assert.equal(parseReportDetailRoute('dashboard/help/LAP-1'), null);
});
