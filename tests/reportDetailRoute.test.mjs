import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isReportDetailPage,
  parseReportDetailRoute,
  reportDetailRoute,
  resolveWorkflowPage,
  surveyRoute,
} from '../src/lib/workflowNavigation.ts';

test('report detail preserves the source list and round-trips the report id', () => {
  for (const page of [
    'overview',
    'incoming',
    'assignments',
    'review',
    'reports',
    'tasks',
    'history',
  ]) {
    const href = reportDetailRoute(page, 'LAP-FOCUS-1');
    assert.deepEqual(parseReportDetailRoute(href.slice(2)), {
      page,
      reportId: 'LAP-FOCUS-1',
    });
  }
});

test('detail routes retain the menu permissions of their source list', () => {
  for (const page of [
    'overview',
    'incoming',
    'assignments',
    'review',
    'reports',
  ])
    assert.equal(
      resolveWorkflowPage('admin', reportDetailRoute(page, 'LAP-1').slice(2)),
      page,
    );
  for (const page of ['overview', 'tasks', 'history'])
    assert.equal(
      resolveWorkflowPage(
        'surveyor',
        reportDetailRoute(page, 'LAP-1').slice(2),
      ),
      page,
    );
  for (const page of ['incoming', 'assignments', 'review', 'reports'])
    assert.equal(
      resolveWorkflowPage(
        'surveyor',
        reportDetailRoute(page, 'LAP-1').slice(2),
      ),
      null,
    );
  for (const page of ['tasks', 'history'])
    assert.equal(
      resolveWorkflowPage('admin', reportDetailRoute(page, 'LAP-1').slice(2)),
      null,
    );
  // The reporter's own report detail has an address under "Laporan saya";
  // staff detail pages stay closed to the reporter.
  assert.equal(
    resolveWorkflowPage('owner', 'dashboard/reports/LAP-1'),
    'reports',
  );
  for (const page of ['incoming', 'assignments', 'review', 'tasks'])
    assert.equal(
      resolveWorkflowPage('owner', reportDetailRoute(page, 'LAP-1').slice(2)),
      null,
    );
});

test('detail parsing excludes forms, profile links, traversal and unknown routes', () => {
  for (const route of [
    'dashboard/reports',
    'dashboard/profile/LAP-1',
    'dashboard/new/LAP-1',
    'dashboard/surveyors/LAP-1',
    'dashboard/reports/../profile',
    'dashboard/reports/LAP%2F1',
    'dashboard/tasks/LAP-1/other',
    surveyRoute('LAP-1').slice(2),
  ])
    assert.equal(parseReportDetailRoute(route), null, route);
  assert.equal(isReportDetailPage(null), false);
  assert.equal(isReportDetailPage('profile'), false);
});
