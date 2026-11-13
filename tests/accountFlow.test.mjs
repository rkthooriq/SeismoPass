import test from 'node:test';
import assert from 'node:assert/strict';
import { isAccountPage, validateAccountForm } from '../src/lib/accountFlow.ts';
const input = {
  name: 'Nama Contoh',
  email: 'contoh@example.com',
  password: 'contoh-fiktif-123',
  confirmPassword: 'contoh-fiktif-123',
  reference: 'UNDANGAN-CONTOH',
  consent: true,
};
test('account routes are explicit and do not treat actor names as login pages', () => {
  for (const page of ['login', 'register', 'forgot-password', 'invitation'])
    assert.equal(isAccountPage(page), true);
  // Pesurvei tidak mendaftar sendiri; akunnya dibuat admin.
  for (const page of [
    'expert',
    'admin',
    'login/expert',
    'register/owner',
    'request-access',
  ])
    assert.equal(isAccountPage(page), false);
});
test('a single login form requires email and password without a role choice', () => {
  assert.deepEqual(
    validateAccountForm('login', { ...input, reference: '' }),
    {},
  );
  const errors = validateAccountForm('login', {
    ...input,
    email: 'bad',
    password: '',
  });
  assert.ok(errors.email);
  assert.ok(errors.password);
});
test('owner registration requires a name and a matching password of at least 12 characters, without a consent box', () => {
  assert.deepEqual(validateAccountForm('register', input), {});
  const errors = validateAccountForm('register', {
    ...input,
    name: '  ',
    password: 'short',
    confirmPassword: 'different',
    consent: false,
  });
  for (const field of ['name', 'password', 'confirmPassword'])
    assert.ok(errors[field]);
  assert.equal(errors.consent, undefined);
});
test('invitation preview requires an email and a code but never returns an account or role', () => {
  assert.deepEqual(validateAccountForm('invitation', input), {});
  assert.ok(
    validateAccountForm('invitation', { ...input, reference: '' }).reference,
  );
  assert.ok(
    validateAccountForm('invitation', { ...input, consent: false }).consent,
  );
});
test('recovery requires only an email without making registration-status assertions', () => {
  assert.deepEqual(
    validateAccountForm('forgot-password', {
      ...input,
      name: '',
      password: '',
      consent: false,
    }),
    {},
  );
  assert.ok(
    validateAccountForm('forgot-password', { ...input, email: 'bad' }).email,
  );
});
