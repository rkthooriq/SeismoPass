import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseSurveyRoute,
  resolveWorkflowPage,
  surveyRoute,
} from '../src/lib/workflowNavigation.ts';

test('survey page route round-trips the report id', () => {
  const href = surveyRoute('LAP-CONTOH-3');
  assert.equal(href, '#/dashboard/tasks/LAP-CONTOH-3/survey');
  assert.equal(parseSurveyRoute(href.slice(2)), 'LAP-CONTOH-3');
});

test('survey page sits under Penugasan saya for surveyors only', () => {
  const route = 'dashboard/tasks/LAP-CONTOH-3/survey';
  assert.equal(resolveWorkflowPage('surveyor', route), 'tasks');
  assert.equal(resolveWorkflowPage('admin', route), null);
  assert.equal(resolveWorkflowPage('owner', route), null);
});

test('other nested task routes are not survey pages', () => {
  assert.equal(parseSurveyRoute('dashboard/tasks'), null);
  assert.equal(parseSurveyRoute('dashboard/tasks/LAP-1/edit'), null);
  assert.equal(parseSurveyRoute('dashboard/tasks/../survey'), null);
});
