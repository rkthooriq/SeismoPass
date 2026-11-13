import assert from 'node:assert/strict';
import test from 'node:test';
import {
  initialDirectory,
  restoreDemoSession,
  serializeDemoSession,
} from '../src/lib/demoDirectory.ts';
import { resolveWorkflowPage } from '../src/lib/workflowNavigation.ts';
import {
  toUserProfile,
  updateOwnProfile,
  validateProfile,
} from '../src/lib/userProfile.ts';

const input = {
  name: '  Nama Contoh  ',
  organization: '  Organisasi Contoh  ',
};

test('all three roles can open their own profile, not an arbitrary account URL', () => {
  assert.equal(resolveWorkflowPage('unknown', 'dashboard/profile'), null);
  for (const role of ['owner', 'admin', 'surveyor']) {
    assert.equal(resolveWorkflowPage(role, 'dashboard/profile'), 'profile');
    assert.equal(
      resolveWorkflowPage(role, 'dashboard/profile/admin-demo'),
      null,
    );
    assert.equal(
      resolveWorkflowPage(role, 'dashboard/profile/owner-demo'),
      null,
    );
  }
});

test('profile updates change only the active account display fields', () => {
  const accounts = initialDirectory();
  for (const current of accounts) {
    const before = structuredClone(current);
    const result = updateOwnProfile(current, {
      ...input,
      id: 'someone-else',
      role: 'admin',
      status: 'suspended',
      email: 'changed@example.com',
      emailVerified: false,
      password: 'injected',
      qualification: 'Injected credential',
    });
    assert.deepEqual(result.account, {
      ...before,
      name: 'Nama Contoh',
      organization: 'Organisasi Contoh',
    });
    assert.deepEqual(current, before);
  }
});

test('inactive and missing sessions cannot update profile metadata', () => {
  const current = initialDirectory()[0];
  assert.ok(updateOwnProfile(null, input).error);
  for (const status of [
    'pending',
    'pending-email',
    'suspended',
    'rejected',
    'changes-requested',
    'must-change-password',
  ]) {
    assert.ok(updateOwnProfile({ ...current, status }, input).error);
  }
  assert.ok(
    updateOwnProfile({ ...current, emailVerified: false }, input).error,
  );
});

test('profile fields validate required name and length before saving', () => {
  const current = initialDirectory()[0];
  for (const name of ['', '  ', 'A', 'a'.repeat(101), null, 12]) {
    assert.ok(validateProfile({ ...input, name }).name);
    assert.ok(updateOwnProfile(current, { ...input, name }).error);
  }
  for (const organization of ['x'.repeat(151), null, 12]) {
    assert.ok(validateProfile({ ...input, organization }).organization);
  }
  assert.deepEqual(validateProfile({ name: 'Ab', organization: '' }), {});
  assert.equal(
    updateOwnProfile(current, { ...input, organization: '  ' }).account
      .organization,
    undefined,
  );
});

test('profile view excludes secrets and administration history', () => {
  const current = {
    ...initialDirectory()[2],
    organization: 'Contoh',
    qualification: 'Catatan dari admin',
    reviewNote: 'Internal note',
    history: [
      {
        action: 'approved',
        by: 'admin-demo',
        at: '2026-11-12',
        note: 'Internal',
      },
    ],
  };
  const view = toUserProfile(current);
  assert.deepEqual(
    Object.keys(view).sort(),
    [
      'name',
      'email',
      'role',
      'status',
      'emailVerified',
      'organization',
      'qualification',
    ].sort(),
  );
  assert.equal(view.qualification, current.qualification);
  assert.equal('password' in view, false);
  assert.equal('reviewNote' in view, false);
  assert.equal('history' in view, false);
});

test('saved profile round trips in the existing session without changing other users or storing passwords', () => {
  const accounts = initialDirectory();
  const result = updateOwnProfile(accounts[2], input);
  const next = accounts.map((account) =>
    account.id === result.account.id ? result.account : account,
  );
  const raw = serializeDemoSession(next, []);
  const stored = JSON.parse(raw);
  assert.ok(stored.accounts.every((account) => !('password' in account)));
  const restored = restoreDemoSession(raw, []);
  assert.equal(restored.invalid, false);
  assert.equal(restored.accounts[2].name, 'Nama Contoh');
  assert.equal(restored.accounts[2].organization, 'Organisasi Contoh');
  assert.equal(restored.accounts[0].name, accounts[0].name);
  assert.equal(restored.accounts[1].name, accounts[1].name);
});
