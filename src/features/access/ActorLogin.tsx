import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import SurveyorScene from '../../components/SurveyorScene';
import { validateAccountForm } from '../../lib/accountFlow';
import type { AccountForm, AccountPage } from '../../lib/accountFlow';
import './access.css';

const copy: Record<
  AccountPage,
  { title: string; subtitle: string; button: string }
> = {
  login: {
    title: 'SeismoPass',
    subtitle: 'Selamat datang kembali. Masukkan detail akunmu.',
    button: 'Masuk',
  },
  register: {
    title: 'Buat akun',
    subtitle: 'Daftar sebagai pemilik atau pengelola bangunan.',
    button: 'Daftar',
  },
  'forgot-password': {
    title: 'Lupa kata sandi',
    subtitle: 'Masukkan email yang terdaftar pada akunmu.',
    button: 'Kirim tautan pemulihan',
  },
  invitation: {
    title: 'Terima undangan',
    subtitle: 'Masukkan email dan kode undangan dari organisasimu.',
    button: 'Lanjutkan',
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
  onSignIn,
  onRegister,
}: {
  page?: AccountPage;
  onSignIn: (data: AccountForm) => string;
  onRegister: (data: AccountForm) => string;
}) {
  const [data, setData] = useState<AccountForm>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountError, setAccountError] = useState('');
  const [preview, setPreview] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
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
    const isPassword = type === 'password';
    const revealed = isPassword && visible[key];
    const input = (
      <input
        id={`account-${key}`}
        type={revealed ? 'text' : type}
        value={data[key]}
        placeholder={placeholder}
        autoComplete={
          key === 'email'
            ? 'email'
            : key === 'name'
              ? 'name'
              : key === 'password' || key === 'confirmPassword'
                ? page === 'register'
                  ? 'new-password'
                  : 'current-password'
                : 'off'
        }
        maxLength={key === 'email' ? 254 : 200}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `account-error-${key}` : undefined}
        onChange={(event) =>
          setData((previous) => ({ ...previous, [key]: event.target.value }))
        }
      />
    );
    return (
      <div className="account-field">
        <label htmlFor={`account-${key}`}>{label}</label>
        {isPassword ? (
          <div className="account-password">
            {input}
            <button
              type="button"
              className="account-eye"
              aria-label={
                revealed ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
              }
              aria-pressed={Boolean(revealed)}
              onClick={() =>
                setVisible((previous) => ({
                  ...previous,
                  [key]: !previous[key],
                }))
              }
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
              >
                <path
                  d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                {revealed && (
                  <path
                    d="M4 20 20 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        ) : (
          input
        )}
        {errors[key] && (
          <small id={`account-error-${key}`} className="actor-error">
            {errors[key]}
          </small>
        )}
      </div>
    );
  }
  const links: Record<AccountPage, [string, string][]> = {
    login: [
      ['#/forgot-password', 'Lupa kata sandi?'],
      ['#/register', 'Daftar akun baru'],
    ],
    register: [['#/login', 'Sudah punya akun? Masuk']],
    'forgot-password': [
      ['#/login', 'Kembali ke halaman masuk'],
      ['#/register', 'Daftar akun baru'],
    ],
    invitation: [
      ['#/login', 'Kembali ke halaman masuk'],
      ['#/register', 'Daftar akun baru'],
    ],
  };
  return (
    <main className="actor-login">
      <section className="actor-intro" aria-hidden="true">
        <div className="actor-art">
          <SurveyorScene />
        </div>
      </section>
      <section className="actor-entry account-entry">
        <h1 className="account-title">{details.title}</h1>
        <p className="actor-subtitle">{details.subtitle}</p>
        {preview ? (
          <div
            ref={result}
            tabIndex={-1}
            className="account-result"
            role="status"
          >
            <h2>
              {page === 'invitation'
                ? 'Undangan belum dapat diproses.'
                : 'Pemulihan lewat email belum tersedia.'}
            </h2>
            <p>
              {page === 'invitation'
                ? 'Pemeriksaan kode undangan belum tersedia. Minta admin membuatkan akun untukmu.'
                : 'Pengiriman tautan pemulihan belum tersedia. Hubungi admin untuk bantuan masuk ke akunmu.'}
            </p>
            <button
              className="actor-enter"
              type="button"
              onClick={() => setPreview(false)}
            >
              Kembali ke formulir
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
            {page === 'register' && field('name', 'Nama lengkap')}
            {field('email', 'Email', 'email', 'nama@example.com')}
            {page === 'login' && field('password', 'Kata sandi', 'password')}
            {page === 'register' && (
              <>
                {field('password', 'Kata sandi', 'password')}
                {field('confirmPassword', 'Konfirmasi kata sandi', 'password')}
              </>
            )}

            {page === 'invitation' && field('reference', 'Kode undangan')}
            {page === 'invitation' && (
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
                  Saya setuju data yang saya isi dipakai untuk pencatatan
                  bangunan di SeismoPass.
                </span>
              </label>
            )}
            {errors.consent && (
              <p id="account-error-consent" className="actor-error">
                {errors.consent}
              </p>
            )}
            <div className="account-actions">
              <button className="actor-enter" type="submit">
                {details.button}
              </button>
            </div>
          </form>
        )}
        <nav
          className={`account-links ${links[page].length === 1 ? 'is-single' : ''}`}
          aria-label="Navigasi akun"
        >
          {links[page].map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
      </section>
    </main>
  );
}
