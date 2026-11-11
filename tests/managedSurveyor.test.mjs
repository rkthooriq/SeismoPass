import assert from 'node:assert/strict';
import test from 'node:test';
import {
  changeInitialPassword,
  createManagedSurveyor,
  generateTemporaryPassword,
  issueTemporaryPassword,
  canSurvey,
  reviewSurveyor,
} from '../src/lib/surveyorAccess.ts';
import {
  initialDirectory,
  restoreDirectory,
  restoreDemoSession,
  serializeDemoSession,
} from '../src/lib/demoDirectory.ts';
import { demoPassword, sampleReports } from '../src/lib/reportDemo.ts';

const admin = initialDirectory().find((person) => person.role === 'admin');
const owner = initialDirectory().find((person) => person.role === 'owner');
const input = {
  name: 'Pesurvei Baru',
  email: 'Baru@Example.com ',
  organization: 'Tim Lapangan Contoh',
  qualification: 'Contoh catatan pelatihan RVS.',
};
const temp = 'Abcdefghjk2345';
const clone = (value) => JSON.parse(JSON.stringify(value));
const make = () =>
  createManagedSurveyor(admin, input, initialDirectory(), 'new-1', temp);

test('only the seeded accounts exist at the start: reporter, admin and one active surveyor', () => {
  assert.deepEqual(
    initialDirectory()
      .map((person) => person.role)
      .sort(),
    ['admin', 'owner', 'surveyor'],
  );
});

test('temporary password is random, long enough and avoids look-alike characters', () => {
  const values = new Set();
  for (let i = 0; i < 50; i += 1) {
    const password = generateTemporaryPassword();
    assert.equal(password.length, 14);
    assert.ok(!/[IlOo01]/.test(password), password);
    values.add(password);
  }
  assert.equal(values.size, 50);
  // Sumber acak yang hanya menghasilkan byte tertolak tidak boleh membuat loop tanpa akhir.
  assert.throws(
    () => generateTemporaryPassword((bytes) => bytes.fill(255), 14),
    /acak/,
  );
});

test('temporary password rejects bytes that would favour some characters', () => {
  // 56 karakter: byte 224 ke atas ditolak. 0, 1, 2 dan 223 diterima (A, B, C, 9).
  const given = [255, 254, 253, 0, 1, 2, 223, 224];
  const password = generateTemporaryPassword((buffer) => {
    buffer.fill(255);
    given.forEach((value, index) => {
      buffer[index] = value;
    });
  }, 6);
  assert.equal(password, 'ABC9AB');
});

test('admin creates a surveyor that cannot work until a new password is set', () => {
  const made = make();
  assert.ok('account' in made);
  const account = made.account;
  assert.equal(account.email, 'baru@example.com');
  assert.equal(account.status, 'must-change-password');
  assert.equal(account.managed, true);
  assert.equal(account.role, 'surveyor');
  assert.equal(canSurvey(account), false);
  assert.equal(account.history.at(0).action, 'created-by-admin');
});

test('only an active admin can create surveyors, with a valid and unique demo email', () => {
  const directory = initialDirectory();
  const create = (who, data) =>
    createManagedSurveyor(who, data, directory, 'x', temp);
  assert.ok('error' in create(owner, input));
  assert.ok('error' in create({ ...admin, status: 'suspended' }, input));
  assert.ok('error' in create(admin, { ...input, email: 'a@gmail.com' }));
  assert.ok('error' in create(admin, { ...input, email: 'admin@example.com' }));
  assert.ok('error' in create(admin, { ...input, name: '  ' }));
  assert.ok('error' in create(admin, { ...input, organization: '' }));
  assert.ok('error' in create(admin, { ...input, qualification: '' }));
  assert.ok(
    'error' in createManagedSurveyor(admin, input, directory, 'x', 'pendek'),
  );
});

test('first login must replace the temporary password', () => {
  const account = make().account;
  const bad = (current, next, confirm) =>
    changeInitialPassword(account, current, next, confirm);
  assert.ok('error' in bad('salah', 'KataSandiBaru-123', 'KataSandiBaru-123'));
  assert.ok('error' in bad(temp, 'pendek', 'pendek'));
  assert.ok('error' in bad(temp, temp, temp));
  assert.ok('error' in bad(temp, 'KataSandiBaru-123', 'beda-sekali-123'));
  const done = bad(temp, 'KataSandiBaru-123', 'KataSandiBaru-123');
  assert.ok('account' in done);
  assert.equal(done.account.status, 'active');
  assert.equal(done.account.password, 'KataSandiBaru-123');
  assert.equal(canSurvey(done.account), true);
  assert.equal(done.account.history.at(-1).action, 'password-changed');
  // Riwayat tidak pernah memuat kata sandi, baik sementara maupun baru.
  assert.ok(
    !JSON.stringify(done.account.history).includes('KataSandiBaru-123'),
  );
  assert.ok(!JSON.stringify(done.account.history).includes(temp));
  // Setelah aktif, ganti-sandi-pertama tidak bisa dipakai ulang.
  assert.ok(
    'error' in
      changeInitialPassword(
        done.account,
        'KataSandiBaru-123',
        'LainLagi-12345',
        'LainLagi-12345',
      ),
  );
});

test('admin can issue a new temporary password, which locks the account again', () => {
  const active = changeInitialPassword(
    make().account,
    temp,
    'KataSandiBaru-123',
    'KataSandiBaru-123',
  ).account;
  const next = issueTemporaryPassword(admin, active, 'Zyxwvutsrq9876');
  assert.equal(next.status, 'must-change-password');
  assert.equal(next.password, 'Zyxwvutsrq9876');
  assert.equal(canSurvey(next), false);
  assert.equal(next.history.at(-1).action, 'temp-password-issued');
  assert.equal(issueTemporaryPassword(owner, active, 'Zyxwvutsrq9876'), null);
  assert.equal(issueTemporaryPassword(admin, active, 'pendek'), null);
  // Akun bawaan (bukan buatan admin) tidak bisa diberi sandi sementara.
  const seeded = initialDirectory().find(
    (person) => person.role === 'surveyor',
  );
  assert.equal(issueTemporaryPassword(admin, seeded, 'Zyxwvutsrq9876'), null);
});

test('a locked surveyor cannot be reviewed into an active account by skipping the password step', () => {
  const account = make().account;
  for (const action of ['approve', 'reactivate', 'suspend'])
    assert.equal(reviewSurveyor(admin, account, action, 'Catatan', true), null);
});

test('passwords are never written to the session and managed accounts need a new temporary password after reload', () => {
  const account = make().account;
  const accounts = [...initialDirectory(), account];
  const raw = serializeDemoSession(accounts, sampleReports);
  assert.ok(!raw.includes(temp));
  assert.ok(!raw.includes(demoPassword));
  const restored = restoreDemoSession(raw, sampleReports);
  assert.equal(restored.invalid, false);
  const back = restored.accounts.find((person) => person.id === 'new-1');
  assert.equal(back.status, 'must-change-password');
  assert.equal(back.managed, true);
  assert.equal(back.password, '');
  // Akun bawaan tetap memakai kata sandi demo bersama.
  assert.equal(
    restored.accounts.find((person) => person.id === 'survey-demo').password,
    demoPassword,
  );
});

test('a tampered session cannot lock a non-managed account or mark a reporter as managed', () => {
  const accounts = JSON.parse(
    JSON.stringify([...initialDirectory(), make().account]),
  );
  assert.ok(restoreDirectory(accounts));
  const unmanaged = clone(accounts);
  unmanaged.find((person) => person.id === 'new-1').managed = false;
  assert.equal(restoreDirectory(unmanaged), null);
  const reporter = clone(accounts);
  reporter.find((person) => person.role === 'owner').managed = true;
  assert.equal(restoreDirectory(reporter), null);
  const badType = clone(accounts);
  badType.find((person) => person.id === 'new-1').managed = 'ya';
  assert.equal(restoreDirectory(badType), null);
});
