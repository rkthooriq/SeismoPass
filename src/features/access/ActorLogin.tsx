import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { actorRoles } from '../../lib/actorAccess';
import type { ActorRole } from '../../lib/actorAccess';
import BuildingScene from '../../components/BuildingScene';
import './access.css';

export default function ActorLogin({
  onEnter,
}: {
  onEnter: (role: ActorRole) => void;
}) {
  const [role, setRole] = useState<ActorRole>('owner');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const checkbox = useRef<HTMLInputElement>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!consent) {
      setError('Konfirmasi penggunaan simulasi sebelum melanjutkan.');
      checkbox.current?.focus();
      return;
    }
    onEnter(role);
  }
  return (
    <main className="actor-login">
      <section className="actor-intro">
        <a className="actor-brand" href="#">
          ▥ seismopass.
        </a>
        <div>
          <span className="actor-eyebrow">SATU ALUR, BERBAGAI PERAN</span>
          <h1>
            Langkah bersama.
            <br />
            Peran yang berarti.
          </h1>
          <p>
            Dari mengenal bangunan hingga menyiapkan tindak lanjut, setiap peran
            punya ruang untuk berkontribusi.
          </p>
        </div>
        <div className="actor-art">
          <BuildingScene />
        </div>
        <p className="actor-intro-note">
          RVS adalah penyaringan awal, bukan sertifikat aman.
        </p>
      </section>
      <section className="actor-entry">
        <a href="#" className="actor-back">
          ← Kembali ke beranda
        </a>
        <span className="actor-demo-label">
          SIMULASI AKSES · TANPA AKUN NYATA
        </span>
        <h2>Masuk ke ruang peranmu.</h2>
        <p className="actor-subtitle">
          Pilih aktor untuk menjelajahi usulan dashboard dan batas aksesnya.
          Tidak perlu email atau kata sandi.
        </p>
        <form onSubmit={submit}>
          <fieldset className="actor-role-picker">
            <legend>Pilih peran demo</legend>
            {actorRoles.map((actor) => (
              <label
                key={actor.id}
                className={role === actor.id ? 'selected' : ''}
              >
                <input
                  type="radio"
                  name="actor"
                  value={actor.id}
                  checked={role === actor.id}
                  onChange={() => setRole(actor.id)}
                />
                <span className="actor-symbol" aria-hidden="true">
                  {actor.symbol}
                </span>
                <span>
                  <strong>{actor.name}</strong>
                  <small>{actor.description}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <label className="actor-consent">
            <input
              ref={checkbox}
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'actor-login-error' : undefined}
            />
            <span>
              Saya memahami ini simulasi peran dengan data fiktif, bukan login
              atau otorisasi nyata.
            </span>
          </label>
          {error && (
            <p id="actor-login-error" role="alert" className="actor-error">
              {error}
            </p>
          )}
          <button className="actor-enter" type="submit">
            Masuk sebagai{' '}
            {actorRoles.find((actor) => actor.id === role)?.shortName}{' '}
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="actor-entry-note">
          Pilihan peran berlaku selama aplikasi terbuka dan berakhir saat
          refresh. Akun aktor, verifikasi kewenangan, dan hak akses produksi
          masih perlu disepakati.
        </p>
      </section>
    </main>
  );
}
