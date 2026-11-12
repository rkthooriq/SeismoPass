import { useEffect, useRef, useState } from 'react';
import Brand from '../components/Brand';
import BuildingScene from '../components/BuildingScene';
import './landing.css';

const navigation = [
  ['#beranda', 'Beranda'],
  ['#tentang', 'Tentang'],
  ['#alur', 'Cara kerja'],
  ['#/rvs-lab', 'Latihan RVS & QR'],
  ['#pertanyaan', 'Bantuan'],
];

function currentSection() {
  return navigation.some(([href]) => href === window.location.hash)
    ? window.location.hash
    : '#beranda';
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

const roles = [
  {
    name: 'Pelapor',
    action: 'Catat bangunanmu.',
    description:
      'Buat laporan, lengkapi data bangunan, dan pantau catatan serta langkah berikutnya.',
    detail: 'Daftar mandiri sebagai pemilik atau pengelola',
    icon: '⌂',
  },
  {
    name: 'Admin',
    action: 'Atur tindak lanjutnya.',
    description:
      'Periksa laporan masuk, kelola akun pesurvei, tetapkan penugasan, dan tinjau catatan.',
    detail: 'Akses melalui akun admin demo',
    icon: '▤',
  },
  {
    name: 'Pesurvei',
    action: 'Catat kunjungannya.',
    description:
      'Buka penugasan dari admin, catat kunjungan, dan kirim catatan untuk ditinjau.',
    detail: 'Akun dan penugasan disiapkan admin',
    icon: '▥',
  },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(currentSection);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const syncSection = () => {
      setActiveSection(currentSection());
      setMenuOpen(false);
    };
    window.addEventListener('hashchange', syncSection);
    return () => window.removeEventListener('hashchange', syncSection);
  }, []);

  return (
    <div className="sp-landing">
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <header id="beranda" className="sp-header sp-shell">
        <a href="#" aria-label="SeismoPass, beranda" onClick={closeMenu}>
          <Brand />
        </a>
        <button
          ref={menuButton}
          className="sp-menu"
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          aria-controls="navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Menu <span aria-hidden="true">{menuOpen ? '−' : '+'}</span>
        </button>
        <nav
          id="navigation"
          className={`sp-nav ${menuOpen ? 'is-open' : ''}`}
          aria-label="Navigasi utama"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && menuOpen) {
              closeMenu();
              menuButton.current?.focus();
            }
          }}
        >
          <div className="sp-nav-capsule">
            {navigation.map(([href, label]) => (
              <a
                key={href}
                href={href}
                aria-current={activeSection === href ? 'location' : undefined}
                onClick={closeMenu}
              >
                {label}
              </a>
            ))}
          </div>
          <div className="sp-nav-account">
            <a
              className="sp-button sp-button-outline"
              href="#/login"
              onClick={closeMenu}
            >
              Masuk
            </a>
            <a className="sp-button" href="#/register" onClick={closeMenu}>
              Daftar
            </a>
          </div>
        </nav>
      </header>
      <main id="main">
        <section className="sp-hero sp-shell" aria-labelledby="hero-title">
          <div className="sp-hero-copy">
            <span className="sp-demo-tag">
              <span aria-hidden="true" />
              Paspor digital bangunan
            </span>
            <h1 id="hero-title">
              Kenali bangunanmu.
              <br />
              Siapkan langkah berikutnya.
            </h1>
            <p>
              Mulai dari catatan yang tertata. SeismoPass menghubungkan laporan
              bangunan, penugasan survei, dan tindak lanjut dalam satu ruang
              kerja.
            </p>
            <div className="sp-actions">
              <a className="sp-button sp-button-light" href="#/register">
                Daftar sebagai pelapor
              </a>
              <a className="sp-text-link" href="#/login">
                Jelajahi demo <span aria-hidden="true">↗</span>
              </a>
            </div>
            <p className="sp-hero-note">
              Demo pengembangan dengan data fiktif.
              <br />
              RVS adalah penyaringan awal, bukan sertifikat aman.
            </p>
          </div>
          <div
            className="sp-passport-preview"
            aria-label="Ilustrasi paspor bangunan fiktif, belum dinilai"
          >
            <div className="sp-preview-heading">
              <span>Bangunan & catatannya</span>
              <span className="sp-preview-tag">Contoh demo</span>
            </div>
            <div className="sp-building-art">
              <BuildingScene />
            </div>
            <div className="sp-passport-sheet">
              <div className="sp-passport-title">
                <div>
                  <span>Profil bangunan</span>
                  <h2>Rumah Contoh A</h2>
                </div>
                <span className="sp-status">Belum dinilai</span>
              </div>
              <dl>
                <div>
                  <dt>Fungsi</dt>
                  <dd>Rumah tinggal</dd>
                </div>
                <div>
                  <dt>Hasil screening resmi</dt>
                  <dd>Belum tersedia</dd>
                </div>
              </dl>
              <a href="#/login">
                Lihat alur pencatatan <span aria-hidden="true">↗</span>
              </a>
            </div>
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
                Demo saat ini menghubungkan pelapor, admin, dan pesurvei. Setiap
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
            <a className="sp-text-link" href="#/flows">
              Lihat panduan alur tiga peran <span aria-hidden="true">↗</span>
            </a>
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
              Enam tahap arah pengembangan SeismoPass. Demo menyediakan
              pencatatan dan simulasi alur; layanan profesional masih dalam
              pengembangan.
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
              Latihan FEMA P-154 dan QR di demo bersifat pendidikan, belum
              divalidasi ahli, serta tidak menetapkan kategori risiko atau
              rujukan otomatis.
            </p>
            <a className="sp-button sp-button-light" href="#/rvs-lab">
              Buka latihan RVS & QR
            </a>
          </div>
        </section>

        <section
          id="pertanyaan"
          className="sp-faq sp-shell"
          aria-labelledby="faq-title"
        >
          <div>
            <h2 id="faq-title">Sebelum mulai.</h2>
            <p>Beberapa hal yang perlu kamu ketahui tentang demo ini.</p>
          </div>
          <div className="sp-faq-items">
            <details>
              <summary>Bagaimana cara mencoba pencatatan bangunan?</summary>
              <p>
                Daftar sebagai pelapor atau pilih “Jelajahi contoh bangunan” di
                halaman masuk. Gunakan data fiktif. Catatan disimpan selama sesi
                tab jika penyimpanan browser tersedia; layanan akun nyata dan
                penyimpanan server belum tersedia.
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
                ketentuan program serta kerja sama yang disepakati. Demo tidak
                menjanjikan bantuan tersebut.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="sp-footer sp-shell">
        <a href="#" aria-label="SeismoPass, kembali ke atas">
          <Brand />
        </a>
        <p>Mengenal bangunan. Menyiapkan langkah.</p>
        <span>Demo pengembangan</span>
      </footer>
    </div>
  );
}
