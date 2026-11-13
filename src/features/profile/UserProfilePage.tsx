import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { getActor } from '../../lib/actorAccess';
import { accountStatusLabels } from '../../lib/surveyorAccess';
import { validateProfile } from '../../lib/userProfile';
import type {
  ProfileErrors,
  ProfileInput,
  UserProfile,
} from '../../lib/userProfile';

export default function UserProfilePage({
  profile,
  onSave,
  storageFailed,
}: {
  profile: UserProfile;
  onSave: (input: ProfileInput) => string;
  storageFailed: boolean;
}) {
  const baseId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const organizationRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile.name);
  const [organization, setOrganization] = useState(profile.organization ?? '');
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const role = getActor(profile.role);
  const changed =
    name !== profile.name || organization !== (profile.organization ?? '');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setError('');
    const input = { name, organization };
    const nextErrors = validateProfile(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      (nextErrors.name ? nameRef : organizationRef).current?.focus();
      return;
    }
    const result = onSave(input);
    if (result) {
      setError(result);
      return;
    }
    setName(name.trim());
    setOrganization(organization.trim());
    setSaved(true);
  }
  function reset() {
    setName(profile.name);
    setOrganization(profile.organization ?? '');
    setErrors({});
    setError('');
    setSaved(false);
  }

  return (
    <div className="user-profile">
      <section
        className="ws-panel profile-identity"
        aria-labelledby={`${baseId}-identity`}
      >
        <span className="profile-monogram" aria-hidden="true">
          {profile.name.trim().slice(0, 1).toLocaleUpperCase('id-ID')}
        </span>
        <h2 id={`${baseId}-identity`}>{profile.name}</h2>
        <p className="profile-role">{role.shortName}</p>
        <dl className="profile-facts">
          <div>
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div>
            <dt>Status akun</dt>
            <dd>{accountStatusLabels[profile.status]}</dd>
          </div>
          <div>
            <dt>Konfirmasi email</dt>
            <dd>
              {profile.emailVerified
                ? 'Sudah dikonfirmasi (simulasi)'
                : 'Belum dikonfirmasi'}
            </dd>
          </div>
        </dl>
        <div className="profile-scope">
          <h3>Aksesmu</h3>
          <p>{role.description}</p>
          <p>{role.boundary}</p>
        </div>
        <a className="ws-secondary" href="#/dashboard">
          Kembali ke ruang kerja
        </a>
        <p className="profile-note profile-rvs-note">
          RVS adalah penyaringan awal, bukan sertifikat aman dan tidak
          menggantikan pemeriksaan ahli struktur.
        </p>
      </section>
      <section
        className="ws-panel profile-editor"
        aria-labelledby={`${baseId}-details`}
      >
        <div className="profile-section-heading">
          <h2 id={`${baseId}-details`}>Informasi pribadi</h2>
          <p>
            Nama ini ditampilkan pada akun dan laporan yang terhubung denganmu.
          </p>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="profile-field">
            <label htmlFor={`${baseId}-name`}>Nama lengkap</label>
            <input
              id={`${baseId}-name`}
              ref={nameRef}
              value={name}
              autoComplete="name"
              required
              maxLength={100}
              aria-invalid={!!errors.name}
              aria-describedby={
                errors.name ? `${baseId}-name-error` : undefined
              }
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
            />
            {errors.name && (
              <p className="ws-error" id={`${baseId}-name-error`}>
                {errors.name}
              </p>
            )}
          </div>
          <div className="profile-field">
            <label htmlFor={`${baseId}-organization`}>
              Organisasi <span>(opsional)</span>
            </label>
            <input
              id={`${baseId}-organization`}
              ref={organizationRef}
              value={organization}
              autoComplete="organization"
              maxLength={150}
              aria-invalid={!!errors.organization}
              aria-describedby={
                errors.organization ? `${baseId}-organization-error` : undefined
              }
              onChange={(event) => {
                setOrganization(event.target.value);
                setSaved(false);
              }}
            />
            {errors.organization && (
              <p className="ws-error" id={`${baseId}-organization-error`}>
                {errors.organization}
              </p>
            )}
          </div>
          <p className="profile-note">
            Email, peran, dan status akun ditampilkan sebagai informasi dan
            tidak diubah melalui halaman ini.
          </p>
          {profile.role === 'surveyor' && (
            <div className="profile-qualification">
              <h3>Catatan kompetensi</h3>
              <p>
                {profile.qualification ||
                  'Belum ada catatan kompetensi dari admin.'}
              </p>
              <small>
                Catatan administrasi dari admin, bukan sertifikasi keahlian.
              </small>
            </div>
          )}
          <div className="profile-actions">
            <button type="submit" className="ws-primary" disabled={!changed}>
              Simpan perubahan
            </button>
            <button
              type="button"
              className="ws-secondary"
              disabled={!changed}
              onClick={reset}
            >
              Batalkan
            </button>
          </div>
          {error && (
            <p role="alert" className="ws-error">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="profile-save-status">
              {storageFailed
                ? 'Profil diperbarui, tetapi penyimpanan browser tidak tersedia. Perubahan akan hilang saat halaman dimuat ulang.'
                : 'Profil tersimpan untuk sesi tab ini.'}
            </p>
          )}
          <p className="profile-note">
            Perubahan profil disimpan selama sesi tab browser ini.
          </p>
        </form>
      </section>
    </div>
  );
}
