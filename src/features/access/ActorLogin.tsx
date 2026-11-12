import Brand from '../../components/Brand';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import BuildingScene from '../../components/BuildingScene';
import { validateAccountForm } from '../../lib/accountFlow';
import type { AccountForm, AccountPage } from '../../lib/accountFlow';
import { demoPassword } from '../../lib/reportDemo';
import './access.css';

const copy: Record<
  AccountPage,
  { title: string; subtitle: string; button: string }
> = {
  login: {
    title: 'Selamat datang kembali.',
    subtitle:
      'Satu akun untuk ruang kerjamu. Akses mengikuti peran yang telah diaktifkan pada akun.',
    button: 'Masuk',
  },
  register: {
    title: 'Awali cerita bangunanmu.',
    subtitle: 'Gunakan alamat @example.com untuk membuat akun pelapor demo.',
    button: 'Buat akun demo',
  },
  'forgot-password': {
    title: 'Kembali ke ruang kerjamu.',
    subtitle:
      'Pada layanan nyata, pemulihan akun dilakukan melalui email yang terdaftar.',
    button: 'Lihat alur pemulihan',
  },
  invitation: {
    title: 'Satu undangan. Peran yang tepat.',
    subtitle:
      'Undangan perlu cocok dengan email penerima, masih berlaku, dan diverifikasi oleh layanan.',
    button: 'Tinjau alur undangan',
  },
};
const empty: AccountForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  reference: '',
  consent: false,
};

export default function ActorLogin({
  page = 'login',
  onExplore,
  onSignIn,
  onRegister,
}: {
  page?: AccountPage;
  onExplore: () => void;
  onSignIn: (data: AccountForm) => string;
  onRegister: (data: AccountForm) => string;
}) {
  const [data, setData] = useState<AccountForm>({
    ...empty,
    ...(page === 'register'
      ? { password: demoPassword, confirmPassword: demoPassword }
      : {}),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountError, setAccountError] = useState('');
  const [preview, setPreview] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const result = useRef<HTMLDivElement>(null);
  const details = copy[page];
  function submit(event: FormEvent) {
    event.preventDefault();
    const next = validateAccountForm(page, data);
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    if (page === 'login' || page === 'register') {
      const error = page === 'login' ? onSignIn(data) : onRegister(data);
      setAccountError(error);
      if (error) requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    setData((previous) => ({
      ...previous,
      password: '',
      confirmPassword: '',
      reference: '',
    }));
    setPreview(true);
    requestAnimationFrame(() => result.current?.focus());
  }
  function field(
    key: keyof Omit<AccountForm, 'consent'>,
    label: string,
    type = 'text',
    placeholder = '',
  ) {
    return (
      <label className="account-field" htmlFor={`account-${key}`}>
        {label}
        <input
          id={`account-${key}`}
          type={type}
          value={data[key]}
          placeholder={placeholder}
          autoComplete="off"
          readOnly={
            page === 'register' && ['password', 'confirmPassword'].includes(key)
          }
          maxLength={key === 'email' ? 254 : 200}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? `account-error-${key}` : undefined}
          onChange={(event) =>
            setData((previous) => ({ ...previous, [key]: event.target.value }))
          }
        />
        {errors[key] && (
          <small id={`account-error-${key}`} className="actor-error">
            {errors[key]}
          </small>
        )}
      </label>
    );
  }
  return (
    <main className="actor-login">
      <section className="actor-intro">
        <a className="actor-brand" href="#">
          <Brand />
        </a>
        <div>
          <span className="actor-eyebrow">
            Catatan bangunan, langkah yang terarah.
          </span>
          <h1>
            Bangunan punya cerita.
            <br />
            Mulai dari milikmu.
          </h1>
          <p>
            Satu paspor digital untuk menghubungkan catatan bangunan,
            pemeriksaan awal, dan tindak lanjut bersama ahli.
          </p>
        </div>
        <div className="actor-art">
          <BuildingScene />
        </div>
        <p className="actor-intro-note">
          RVS adalah penyaringan awal, bukan sertifikat aman.
        </p>
      </section>
      <section className="actor-entry account-entry">
        <a href="#" className="actor-back">
          ← Kembali ke beranda
        </a>
        <span className="actor-demo-label">
          Akun demo — gunakan data fiktif
        </span>
        <h2>{details.title}</h2>
        <p className="actor-subtitle">{details.subtitle}</p>
        {preview ? (
          <div
            ref={result}
            tabIndex={-1}
            className="account-result"
            role="status"
          >
            <span className="actor-symbol" aria-hidden="true">
              {page === 'login' ? '◎' : '↗'}
            </span>
            <h3>
              {page === 'login'
                ? 'Layanan masuk belum terhubung.'
                : 'Begini langkah berikutnya.'}
            </h3>
            <p>
              {page === 'login'
                ? 'Kredensial tidak diverifikasi dan kamu belum masuk. Login nyata membutuhkan layanan akun.'
                : page === 'register'
                  ? 'Pada layanan nyata: periksa keunikan email → kirim verifikasi → pengguna memverifikasi email → aktifkan akun pemilik. Pendaftaran ini belum membuat akun atau mengirim email.'
                  : page === 'invitation'
                    ? 'Pada layanan nyata: verifikasi token undangan, penerima dan masa berlaku → verifikasi email → aktifkan peran dari undangan. Kode belum diperiksa dan akses belum diberikan.'
                    : 'Pada layanan nyata, tampilkan respons umum lalu kirim tautan pemulihan hanya jika akun memenuhi syarat. Di pratinjau ini, email belum dikirim.'}
            </p>
            <p className="actor-entry-note">
              Isian hanya diproses di memori tampilan, tanpa dikirim atau
              disimpan sebagai akun. Contoh kata sandi dan kode sudah
              dibersihkan.
            </p>
            <button className="actor-enter" onClick={() => setPreview(false)}>
              Kembali ke formulir ←
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            {accountError && (
              <div
                ref={summary}
                tabIndex={-1}
                className="account-errors"
                role="alert"
              >
                {accountError}
              </div>
            )}
            {Object.keys(errors).length > 0 && (
              <div
                className="account-errors"
                role="alert"
                ref={summary}
                tabIndex={-1}
              >
                <strong>Periksa kembali isian.</strong>
                <ul>
                  {Object.entries(errors).map(([key, value]) => (
                    <li key={key}>
                      <a
                        href={`#account-${key}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(`account-${key}`)?.focus();
                        }}
                      >
                        {value}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {page === 'register' &&
              field('name', 'Nama (contoh)', 'text', 'Nama fiktif')}
            {field('email', 'Alamat email', 'email', 'nama@example.com')}
            {['login', 'register'].includes(page) &&
              field(
                'password',
                page === 'register'
                  ? 'Kata sandi demo bersama (tetap)'
                  : 'Kata sandi contoh',
                'password',
                'Jangan gunakan kata sandi asli',
              )}
            {page === 'register' && (
              <>
                {field(
                  'confirmPassword',
                  'Ulangi kata sandi contoh',
                  'password',
                )}
                <p className="actor-entry-note">
                  Untuk demonstrasi, semua akun memakai SeismoDemo123!. Tidak
                  ada kata sandi pengguna yang disimpan di sesi browser.
                </p>
              </>
            )}
            {page === 'invitation' &&
              field(
                'reference',
                'Kode undangan contoh',
                'text',
                'Kode dari undangan organisasi',
              )}
            {page === 'login' && (
              <a className="account-forgot" href="#/forgot-password">
                Lupa kata sandi?
              </a>
            )}
            {page === 'login' && (
              <p className="actor-entry-note">
                Pesurvei: akunmu dibuat oleh admin. Masuk dengan sandi sementara
                dari admin, lalu buat kata sandi barumu sendiri.
              </p>
            )}
            {!['login', 'forgot-password'].includes(page) && (
              <label className="actor-consent">
                <input
                  id="account-consent"
                  type="checkbox"
                  checked={data.consent}
                  onChange={(e) =>
                    setData((previous) => ({
                      ...previous,
                      consent: e.target.checked,
                    }))
                  }
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={
                    errors.consent ? 'account-error-consent' : undefined
                  }
                />
                <span>
                  Saya menggunakan data fiktif untuk mencoba alur demo.
                </span>
              </label>
            )}
            {errors.consent && (
              <p id="account-error-consent" className="actor-error">
                {errors.consent}
              </p>
            )}
            <button className="actor-enter" type="submit">
              {details.button} <span aria-hidden="true">→</span>
            </button>
            <p className="actor-entry-note">
              Akun demo bertahan selama sesi tab. Akun contoh memakai kata sandi
              uji bersama SeismoDemo123!. Verifikasi email disimulasikan; tidak
              ada email dikirim.
            </p>
          </form>
        )}
        <nav className="account-links" aria-label="Navigasi akun">
          {page !== 'login' && <a href="#/login">Sudah punya akun? Masuk →</a>}
          {page !== 'register' && (
            <a href="#/register">Pemilik / pengelola baru? Daftar →</a>
          )}
          {page !== 'invitation' && (
            <a href="#/invitation">Punya undangan organisasi? →</a>
          )}
        </nav>
        <div className="account-explore">
          <span>Ingin mengenal aplikasinya dulu?</span>
          <button type="button" onClick={onExplore}>
            Jelajahi contoh bangunan ↗
          </button>
          <small>Demo pemilik dengan data fiktif, tanpa membuat akun.</small>
        </div>
      </section>
    </main>
  );
}
