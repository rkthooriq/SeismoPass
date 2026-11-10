import { useState } from 'react';
import BuildingScene from '../components/BuildingScene';

const steps = [
  [
    'Registrasi bangunan',
    'Mulai dari data dasar: lokasi, fungsi, tahun pembangunan, lantai, dan struktur.',
  ],
  [
    'Screening awal RVS',
    'Petugas terlatih melakukan penyaringan sesuai protokol, dengan supervisi ahli.',
  ],
  [
    'Profil digital',
    'Data dan hasil yang sah terhubung dalam satu profil melalui dashboard atau QR.',
  ],
  [
    'Rujukan ahli',
    'Bangunan yang menjadi prioritas pemeriksaan lanjutan dirujuk sesuai protokol.',
  ],
  [
    'Rencana retrofit',
    'Ahli menyusun rencana perkuatan. Pemilik menentukan langkah selanjutnya.',
  ],
  [
    'Dukungan & evaluasi',
    'Dukungan sesuai program yang tersedia, pelaksanaan, dan verifikasi dicatat.',
  ],
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function Brand() {
  return (
    <>
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <rect width="36" height="36" rx="11" fill="currentColor" />
        <path
          d="M7 19h7l3-9 5 17 3-8h4"
          fill="none"
          stroke="#d4e7b2"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        seismo<span className="brand-light">pass</span>
        <span className="brand-dot">.</span>
      </span>
    </>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<'ilustrasi' | 'profil'>('ilustrasi');
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <header className="header shell">
        <a
          className="brand"
          href="#"
          aria-label="SeismoPass, beranda"
          onClick={closeMenu}
        >
          <Brand />
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? 'Tutup' : 'Menu'}{' '}
          <span aria-hidden="true">{menuOpen ? '−' : '+'}</span>
        </button>
        <nav
          id="navigation"
          className={`navigation ${menuOpen ? 'is-open' : ''}`}
          aria-label="Navigasi utama"
        >
          <a href="#tentang" onClick={closeMenu}>
            Tentang SeismoPass
          </a>
          <a href="#alur" onClick={closeMenu}>
            Cara kerja
          </a>
          <a href="#pertanyaan" onClick={closeMenu}>
            Pertanyaan
          </a>
          <a className="button button-small" href="#/login" onClick={closeMenu}>
            Masuk demo <Arrow />
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="hero shell" aria-labelledby="hero-title">
          <a className="announcement" href="#tentang">
            <span className="status-dot" /> Langkah kecil untuk kesiapsiagaan{' '}
            <Arrow />
          </a>
          <h1 id="hero-title">
            Kenali bangunanmu.
            <br />
            <span>Mulai langkahmu.</span>
          </h1>
          <p className="hero-description">
            Satu paspor digital untuk mengenal bangunan,
            <br className="desktop-break" /> memahami screening awal, dan
            terhubung dengan ahli.
          </p>
          <div className="hero-actions">
            <a className="button" href="#/login">
              Jelajahi SeismoPass <Arrow />
            </a>
            <a className="text-link" href="#alur">
              Lihat cara kerjanya <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="hero-note">
            Dalam pengembangan <span aria-hidden="true">·</span> Demo
            pengenalan, bukan layanan penilaian
          </p>

          <div className="showcase" id="jelajahi">
            <div className="showcase-toolbar">
              <span className="scene-label">
                <span className="status-dot" /> Ruang kenal bangunan
              </span>
              <div
                className="view-switch"
                role="group"
                aria-label="Pilih tampilan demo"
              >
                <button
                  type="button"
                  aria-pressed={view === 'ilustrasi'}
                  onClick={() => setView('ilustrasi')}
                >
                  Ilustrasi
                </button>
                <button
                  type="button"
                  aria-pressed={view === 'profil'}
                  onClick={() => setView('profil')}
                >
                  Contoh profil
                </button>
              </div>
              <span className="demo-tag">DEMO</span>
            </div>
            {view === 'ilustrasi' ? (
              <div className="scene-content">
                <div className="scene-copy">
                  <span className="eyebrow">SETIAP BANGUNAN PUNYA CERITA</span>
                  <h2>
                    Awali dengan
                    <br />
                    mengenalnya.
                  </h2>
                  <p>
                    Data yang tercatat adalah awal dari tindak lanjut yang lebih
                    terarah.
                  </p>
                  <button
                    className="round-link"
                    type="button"
                    onClick={() => setView('profil')}
                  >
                    Buka contoh profil <Arrow />
                  </button>
                </div>
                <div className="scene-art">
                  <BuildingScene />
                  <span className="scene-caption">
                    LINGKUNGAN ILUSTRATIF / BUKAN DATA LAPANGAN
                  </span>
                </div>
                <div className="floating-note">
                  <span className="note-icon" aria-hidden="true">
                    ⌂
                  </span>
                  <div>
                    <strong>Bangunan, lebih dikenal.</strong>
                    <span>Langkah awal, bukan kesimpulan aman.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-demo">
                <div>
                  <span className="eyebrow">CONTOH TAMPILAN PROFIL</span>
                  <h2>Rumah Contoh A</h2>
                  <p>
                    Data fiktif untuk mengenal tampilan. Tidak mewakili bangunan
                    nyata.
                  </p>
                </div>
                <div className="profile-card">
                  <div className="profile-card-heading">
                    <span>Profil bangunan</span>
                    <span className="profile-status">Belum dinilai</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Fungsi</dt>
                      <dd>Rumah tinggal (contoh)</dd>
                    </div>
                    <div>
                      <dt>Lokasi</dt>
                      <dd>Tidak ditampilkan pada demo</dd>
                    </div>
                    <div>
                      <dt>Hasil screening</dt>
                      <dd>Belum tersedia</dd>
                    </div>
                  </dl>
                  <p>
                    Belum ada pemeriksaan atau rekomendasi teknis. Status ini
                    bukan kategori risiko.
                  </p>
                </div>
              </div>
            )}
            <div className="showcase-bottom">
              <span>
                <span className="tiny-cross" aria-hidden="true">
                  ✳
                </span>{' '}
                Dibangun untuk langkah yang lebih terarah.
              </span>
              <a href="#batasan">
                Pahami batas screening <Arrow />
              </a>
            </div>
          </div>
        </section>

        <section
          className="intro shell section-space"
          id="tentang"
          aria-labelledby="intro-title"
        >
          <div>
            <span className="eyebrow">KENAL DULU, BARU MELANGKAH</span>
            <h2 id="intro-title">
              Bukan sekadar data.
              <br />
              Sebuah awal untuk <em>peduli.</em>
            </h2>
          </div>
          <div className="intro-text">
            <p>
              Memahami kondisi bangunan bisa terasa rumit. SeismoPass dirancang
              untuk menghubungkan data bangunan, screening awal, dan tindak
              lanjut bersama ahli dalam satu alur.
            </p>
            <p>
              Mulai dari mengenali bangunan yang kita gunakan setiap hari.
              Lanjutkan dengan pemeriksaan yang tepat, oleh pihak yang tepat.
            </p>
          </div>
        </section>

        <section
          className="workflow shell section-space"
          id="alur"
          aria-labelledby="workflow-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">DARI DATA KE TINDAK LANJUT</span>
              <h2 id="workflow-title">Satu alur. Langkah demi langkah.</h2>
            </div>
            <span className="section-aside">Alur produk yang direncanakan</span>
          </div>
          <ol className="steps">
            {steps.map(([title, description], index) => (
              <li key={title}>
                <span className="step-number">
                  0{index + 1}
                  <span aria-hidden="true">↗</span>
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
          <p className="workflow-note">
            Rujukan ahli mengikuti hasil dan protokol yang disahkan. Jalur bagi
            bangunan yang tidak dirujuk masih perlu ditetapkan. Insentif
            bergantung pada ketentuan dan kerja sama yang tersedia.
          </p>
        </section>

        <section
          className="safety shell"
          id="batasan"
          aria-labelledby="safety-title"
        >
          <span className="safety-symbol" aria-hidden="true">
            i
          </span>
          <div>
            <span className="eyebrow">PENTING UNTUK DIPAHAMI</span>
            <h2 id="safety-title">
              Screening awal.
              <br />
              Bukan sertifikat aman.
            </h2>
            <p>
              Rapid Visual Screening (RVS) adalah penyaringan awal kerentanan
              bangunan. Hasilnya tidak menjamin keamanan bangunan dan tidak
              menggantikan evaluasi teknis oleh ahli struktur.
            </p>
            <p className="safety-footnote">
              Demo ini tidak menghitung skor, menentukan kategori risiko, atau
              menghasilkan hasil RVS.
            </p>
          </div>
          <span className="safety-art" aria-hidden="true">
            ↗
          </span>
        </section>

        <section
          className="faq shell section-space"
          id="pertanyaan"
          aria-labelledby="faq-title"
        >
          <div>
            <span className="eyebrow">MARI KENAL LEBIH DEKAT</span>
            <h2 id="faq-title">
              Mungkin kamu
              <br />
              bertanya-tanya.
            </h2>
          </div>
          <div className="faq-items">
            <details>
              <summary>
                Apakah saya bisa mendaftarkan bangunan sekarang?
              </summary>
              <p>
                Kamu bisa mencoba pencatatan bangunan fiktif di dashboard demo.
                Data hanya disimpan selama tab terbuka; akun nyata dan
                penyimpanan server belum tersedia. Pilih peran demo untuk
                menjelajahi alurnya.
              </p>
            </details>
            <details>
              <summary>Siapa yang melakukan screening RVS?</summary>
              <p>
                Petugas terlatih dengan supervisi ahli, menggunakan protokol
                yang telah disahkan. Website tidak melakukan penilaian secara
                mandiri.
              </p>
            </details>
            <details>
              <summary>Apakah QR berarti bangunan dinyatakan aman?</summary>
              <p>
                Tidak. QR adalah cara mengakses informasi yang diizinkan, bukan
                sertifikat aman. Fitur QR belum tersedia pada demo ini.
              </p>
            </details>
            <details>
              <summary>Apakah bantuan retrofit otomatis didapatkan?</summary>
              <p>
                Tidak. Dukungan fiskal, pembiayaan, atau asuransi bergantung
                pada ketentuan program dan kerja sama yang tersedia.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="footer shell">
        <a className="brand" href="#" aria-label="SeismoPass, kembali ke atas">
          <Brand />
        </a>
        <p>Mengenal bangunan. Menyiapkan langkah.</p>
        <span>
          Demo pengembangan <span aria-hidden="true">↗</span>
        </span>
      </footer>
    </>
  );
}
