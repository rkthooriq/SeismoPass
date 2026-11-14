import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { LiquidNavbar } from '../components/ui/liquid-glass-navbar';
import type { LiquidNavItem } from '../components/ui/liquid-glass-navbar';
import EarthScene from '../components/EarthScene';
import DisasterBoard from '../features/disaster/DisasterData';
import LatestEarthquake from '../features/disaster/LatestEarthquake';
import './landing.css';

const icon = (path: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {path}
  </svg>
);

const navigation: LiquidNavItem[] = [
  {
    label: 'Data',
    href: '#data-bencana',
    fx: 'pop',
    icon: icon(<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />),
  },
  {
    label: 'Tentang',
    href: '#tentang',
    fx: 'spin',
    icon: icon(
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 11v5M12 8h.01" />
      </>,
    ),
  },
  {
    label: 'Cara kerja',
    href: '#alur',
    fx: 'wave',
    icon: icon(
      <path d="M5 6h9a3 3 0 0 1 0 6H10a3 3 0 0 0 0 6h9M5 6l2-2M5 6l2 2M19 18l-2-2M19 18l-2 2" />,
    ),
  },
  {
    label: 'Bantuan',
    href: '#pertanyaan',
    fx: 'pop',
    icon: icon(
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9.5 9.5a2.5 2.5 0 0 1 4.6 1.3c0 1.7-2.1 2-2.1 3.4M12 17h.01" />
      </>,
    ),
  },
];

function currentSection() {
  const index = navigation.findIndex(
    (item) => item.href === window.location.hash,
  );
  return index < 0 ? 0 : index;
}

const steps = [
  [
    'Registrasi bangunan',
    'Catat lokasi, fungsi, tahun pembangunan, lantai, dan struktur.',
  ],
  [
    'Screening awal RVS',
    'Penyaringan oleh petugas terlatih mengikuti protokol dan supervisi ahli.',
  ],
  [
    'Profil digital',
    'Satukan data bangunan dan catatan pemeriksaan yang telah divalidasi.',
  ],
  [
    'Rujukan ahli',
    'Pemeriksaan lanjutan mengikuti hasil dan protokol yang disahkan.',
  ],
  [
    'Rencana retrofit',
    'Ahli menyusun rencana perkuatan untuk dipertimbangkan pemilik.',
  ],
  [
    'Dukungan & evaluasi',
    'Catat pelaksanaan, verifikasi, dan dukungan sesuai program yang tersedia.',
  ],
];

// Person icons for the three role cards.
const roleIcon = (extra: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
    {extra}
  </svg>
);

const roles = [
  {
    name: 'Pelapor',
    action: 'Catat bangunanmu.',
    description:
      'Buat laporan, lengkapi data bangunan, dan pantau catatan serta langkah berikutnya.',
    detail: 'Daftar mandiri sebagai pemilik atau pengelola',
    // Person with a house: the owner reporting a building.
    icon: roleIcon(<path d="M16 20v-5.5l3-2.5 3 2.5V20Zm2.2 0v-2.4h1.6V20" />),
  },
  {
    name: 'Admin',
    action: 'Atur tindak lanjutnya.',
    description:
      'Periksa laporan masuk, kelola akun pesurvei, tetapkan penugasan, dan tinjau catatan.',
    detail: 'Akses melalui akun admin',
    // Person with a checked clipboard: reviewing and assigning.
    icon: roleIcon(
      <>
        <rect x="16" y="10.5" width="6" height="9" rx="1.2" />
        <path d="m17.4 15.2 1.3 1.3 2-2.4" />
      </>,
    ),
  },
  {
    name: 'Pesurvei',
    action: 'Catat kunjungannya.',
    description:
      'Buka penugasan dari admin, catat kunjungan, dan kirim catatan untuk ditinjau.',
    detail: 'Akun dan penugasan disiapkan admin',
    // Person beside a survey tripod: the field visit.
    icon: roleIcon(
      <>
        <rect x="17" y="7" width="3.6" height="2.6" rx=".6" />
        <path d="M18.8 9.6 16.4 20M18.8 9.6V20M18.8 9.6l2.4 10.4" />
      </>,
    ),
  },
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState(currentSection);
  // While a nav click scrolls the page, ignore scroll-spy so the drop does not
  // stop at every section on the way.
  const lockUntil = useRef(0);

  useEffect(() => {
    let frame = 0;
    const spy = () => {
      frame = 0;
      if (Date.now() < lockUntil.current) return;
      // The last section whose top has passed ~35% of the screen; Data at the top.
      const line = window.innerHeight * 0.35;
      let next = 0;
      navigation.forEach((item, index) => {
        const target = item.href ? document.querySelector(item.href) : null;
        if (index > 0 && target && target.getBoundingClientRect().top <= line)
          next = index;
      });
      // At the very bottom the last short section may never reach the line.
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      )
        next = navigation.length - 1;
      setActiveSection(next);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(spy);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    spy();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Phone header: slide away while scrolling down so it does not cover the
  // content, and come back on scroll up or near the top. CSS limits the
  // effect to phone widths.
  const [headerHidden, setHeaderHidden] = useState(false);
  // Give the navigation a denser surface when content scrolls beneath it.
  const [headerRaised, setHeaderRaised] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.max(window.scrollY, 0);
      setHeaderRaised(y > 16);
      const delta = y - lastY;
      if (y < 80) setHeaderHidden(false);
      else if (delta > 8) setHeaderHidden(true);
      else if (delta < -8) setHeaderHidden(false);
      if (Math.abs(delta) > 8 || y < 80) lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (index: number) => {
    lockUntil.current = Date.now() + 900;
    setActiveSection(index);
  };

  return (
    <div className="sp-landing">
      <EarthScene />
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <header
        id="beranda"
        className={`sp-header sp-shell${headerHidden ? ' is-hidden' : ''}${headerRaised ? ' is-raised' : ''}`}
      >
        <span className="sp-wordmark">SeismoPass</span>
        <LiquidNavbar
          className="sp-liquid-nav"
          material="subtle"
          tone="light"
          items={navigation}
          active={activeSection}
          onChange={goTo}
        />
        <div className="sp-nav-account" role="group" aria-label="Akses akun">
          <a className="sp-account-action sp-account-signin" href="#/login">
            Masuk
          </a>
          <a
            className="sp-account-action sp-account-register"
            href="#/register"
          >
            Daftar
          </a>
        </div>
      </header>
      <main id="main">
        <section className="sp-hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="sp-page-title">
            SeismoPass untuk Bandung Raya dan Sesar Lembang
          </h1>
          <div className="sp-shell sp-hero-grid">
            <LatestEarthquake />
            <DisasterBoard />
          </div>
        </section>

        <section
          id="tentang"
          className="sp-roles-section"
          aria-labelledby="roles-title"
        >
          <div className="sp-shell">
            <div className="sp-section-heading">
              <h2 id="roles-title">
                Satu alur kerja.
                <br />
                Peran yang jelas.
              </h2>
              <p>
                SeismoPass menghubungkan pelapor, admin, dan pesurvei. Setiap
                akun memiliki tugas dan tampilan sesuai perannya.
              </p>
            </div>
            <div className="sp-roles">
              {roles.map((role) => (
                <article key={role.name}>
                  <div className="sp-role-heading">
                    <span aria-hidden="true">{role.icon}</span>
                    <h3>{role.name}</h3>
                  </div>
                  <h4>{role.action}</h4>
                  <p>{role.description}</p>
                  <span className="sp-role-detail">{role.detail}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="alur"
          className="sp-workflow sp-shell"
          aria-labelledby="workflow-title"
        >
          <div className="sp-section-heading">
            <h2 id="workflow-title">
              Dari pencatatan
              <br />
              ke tindak lanjut.
            </h2>
            <p>
              Enam tahap dari pencatatan hingga evaluasi. Rujukan, retrofit, dan
              dukungan bergantung pada mitra dan program yang tersedia.
            </p>
          </div>
          <ol className="sp-steps">
            {steps.map(([title, description], index) => (
              <li key={title}>
                <span className="sp-step-number">0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="sp-development-note">
            <strong>Yang masih disiapkan</strong>
            <p>
              Penilaian resmi menunggu protokol dan validasi ahli struktur.
              Rujukan, retrofit, dan dukungan program belum menjadi layanan
              aktif.
            </p>
          </div>
        </section>

        <section
          id="batasan"
          className="sp-safety sp-shell"
          aria-labelledby="safety-title"
        >
          <div>
            <span className="sp-safety-label">Pahami batas RVS</span>
            <h2 id="safety-title">
              Penyaringan awal.
              <br />
              Bukan sertifikat aman.
            </h2>
          </div>
          <div>
            <p>
              Rapid Visual Screening membantu penyaringan awal kerentanan
              bangunan. Hasilnya tidak menjamin keamanan dan tidak menggantikan
              evaluasi teknis ahli struktur.
            </p>
            <p className="sp-safety-note">
              Simulasi FEMA P-154 dan QR di dalam aplikasi bersifat pendidikan,
              belum divalidasi ahli, serta tidak menetapkan kategori risiko atau
              rujukan otomatis.
            </p>
          </div>
        </section>

        <section
          id="pertanyaan"
          className="sp-faq sp-shell"
          aria-labelledby="faq-title"
        >
          <div>
            <h2 id="faq-title">Sebelum mulai.</h2>
            <p>
              Beberapa hal yang perlu kamu ketahui sebelum memakai SeismoPass.
            </p>
          </div>
          <div className="sp-faq-items">
            <details>
              <summary>Bagaimana cara mencoba pencatatan bangunan?</summary>
              <p>
                Daftar sebagai pelapor, lalu tambahkan bangunan dari ruang
                kerjamu. Contoh profil bangunan juga dapat dibuka dari halaman
                masuk. Untuk saat ini catatan tersimpan di browser selama tab
                terbuka.
              </p>
            </details>
            <details>
              <summary>Bagaimana pesurvei mendapatkan akses?</summary>
              <p>
                Admin membuat akun pesurvei dan memberikan sandi sementara.
                Pesurvei mengganti sandi pada saat masuk pertama, lalu
                mengerjakan laporan yang ditugaskan admin.
              </p>
            </details>
            <details>
              <summary>Apakah QR menyatakan bangunan aman?</summary>
              <p>
                Tidak. QR latihan membuka ringkasan simulasi dengan informasi
                terbatas, bukan sertifikat aman. QR publik untuk layanan nyata
                masih memerlukan keputusan privasi dan validasi.
              </p>
            </details>
            <details>
              <summary>Apakah bantuan retrofit otomatis didapatkan?</summary>
              <p>
                Tidak. Insentif fiskal, pembiayaan, dan asuransi bergantung pada
                ketentuan program serta kerja sama yang disepakati. SeismoPass
                tidak menjanjikan bantuan tersebut.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="sp-footer sp-shell">
        <span className="sp-wordmark">SeismoPass</span>
        <p>Mengenal bangunan. Menyiapkan langkah.</p>
        <span>© 2026 SeismoPass</span>
      </footer>
    </div>
  );
}
