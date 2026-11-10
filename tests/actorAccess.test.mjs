import test from 'node:test';
import assert from 'node:assert/strict';
import {
  actorRoles,
  isActorRole,
  canOpenPage,
  canManageBuildings,
} from '../src/lib/actorAccess.ts';

test('all six source actors have separate demo identities and shared help/access pages', () => {
  assert.deepEqual(
    actorRoles.map((actor) => actor.id),
    ['owner', 'assessor', 'expert', 'government', 'provider', 'finance'],
  );
  for (const role of actorRoles) {
    for (const page of ['dashboard', 'guide', 'access'])
      assert.equal(canOpenPage(role.id, page), true);
    for (const [page] of role.actions)
      assert.equal(canOpenPage(role.id, page), true);
  }
});
test('only the owner can manage, export, reset or open building details in this demo', () => {
  for (const actor of actorRoles) {
    assert.equal(canManageBuildings(actor.id), actor.id === 'owner');
    for (const page of ['buildings', 'new', 'profile', 'data', 'qr'])
      assert.equal(canOpenPage(actor.id, page), actor.id === 'owner');
    assert.equal(canOpenPage(actor.id, 'profile', true), actor.id === 'owner');
  }
});
test('assessors and experts have distinct professional areas', () => {
  assert.equal(canOpenPage('assessor', 'screening'), true);
  assert.equal(canOpenPage('assessor', 'retrofit'), false);
  assert.equal(canOpenPage('assessor', 'referrals'), false);
  for (const page of ['screening', 'referrals', 'retrofit'])
    assert.equal(canOpenPage('expert', page), true);
});
test('retrofit providers cannot assess screening or access financing pages', () => {
  assert.equal(canOpenPage('provider', 'retrofit'), true);
  for (const page of ['screening', 'referrals', 'support'])
    assert.equal(canOpenPage('provider', page), false);
});
test('government and financial partners receive only the coordination/support area', () => {
  for (const role of ['government', 'finance']) {
    assert.equal(canOpenPage(role, 'support'), true);
    for (const page of ['screening', 'referrals', 'retrofit', 'buildings'])
      assert.equal(canOpenPage(role, page), false);
  }
});
test('unknown actors, unknown pages and invalid edit actions are rejected', () => {
  for (const actor of [null, undefined, '', 'admin', '__proto__']) {
    assert.equal(isActorRole(actor), false);
    assert.equal(canOpenPage(actor, 'dashboard'), false);
    assert.equal(canManageBuildings(actor), false);
  }
  for (const actor of actorRoles) {
    assert.equal(canOpenPage(actor.id, 'not-found'), false);
    assert.equal(canOpenPage(actor.id, 'dashboard', true), false);
  }
});
