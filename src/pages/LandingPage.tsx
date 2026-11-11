import { useState } from 'react';
import landscapeImage from '../assets/landscape.png';
import './landing.css';

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
          stroke="#ffffff"
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
  const [activeTab, setActiveTab] = useState(0);
  const highlights = [
    {
      label: 'Kenali bangunan',
      eyebrow: 'PASPOR DIGITAL BANGUNAN',
      title: 'Kenali bangunanmu. Siapkan langkahmu.',
      description:
        'Mulai dari data yang tertata. Pahami penyaringan awal dan alur tindak lanjut bersama ahli.',
      action: 'Jelajahi demo',
      href: '#/login',
    },
    {
      label: 'Screening awal RVS',
      eyebrow: 'PAHAMI SEBELUM MELANGKAH',
      title: 'Langkah awal untuk lebih peduli.',
      description:
        'RVS membantu penyaringan awal kerentanan bangunan. Pemeriksaan mengikuti protokol dan supervisi ahli struktur.',
      action: 'Pahami batas RVS',
      href: '#batasan',
    },
    {
      label: 'Tindak lanjut bersama',
      eyebrow: 'DARI DATA KE TINDAKAN',
      title: 'Terhubung dalam satu alur.',
      description:
        'Kenali rencana alur dari pencatatan, rujukan ahli, hingga perkuatan dan evaluasi. Fitur profesional masih dalam pengembangan.',
      action: 'Lihat cara kerja',
      href: '#alur',
    },
  ];
  const highlight = highlights[activeTab];
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="adobe-landing">
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
          <a href="#/rvs-lab" onClick={closeMenu}>
            Latihan RVS & QR
          </a>
          <a href="#pertanyaan" onClick={closeMenu}>
            Pertanyaan
          </a>
          <a className="button button-small" href="#/login" onClick={closeMenu}>
            Masuk / Daftar <Arrow />
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="adobe-hero" aria-labelledby="hero-title">
          <div className="adobe-hero-copy shell">
            <span className="hero-kicker">{highlight.eyebrow}</span>
            <h1 id="hero-title">{highlight.title}</h1>
            <p>{highlight.description}</p>
            <div className="hero-actions">
              <a className="button" href={highlight.href}>
                {highlight.action} <Arrow />
              </a>
              <a className="hero-secondary" href="#tentang">
                Tentang SeismoPass <Arrow />
              </a>
            </div>
            <span className="hero-disclaimer">
              Demo pengembangan · Bukan layanan penilaian RVS
            </span>
          </div>
          <div className="hero-bento">
            <div className="bento-photo">
              <img
                src={landscapeImage}
                alt="Tebing dan permukiman di sekitarnya, gambar pengantar"
                width={1200}
                height={764}
              />
              <span aria-hidden="true">↗</span>
            </div>
            <div className="bento-number">
              <strong>
                06<span>↗</span>
              </strong>
              <p>
                Tahap yang terhubung.
                <br />
                Dari data ke tindak lanjut.
              </p>
              <div className="bento-rule" />
            </div>
            <a className="bento-dark" href="#batasan">
              <span>KENALI BATAS SCREENING</span>
              <strong>
                Langkah awal.
                <br />
                Bukan sertifikat aman.
              </strong>
              <span className="bento-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
          <div
            className="hero-topics"
            role="group"
            aria-label="Pilih topik pengantar"
          >
            {highlights.map((item, index) => (
              <button
                type="button"
                key={item.label}
                aria-pressed={activeTab === index}
                onClick={() => setActiveTab(index)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section
          className="feature-section shell"
          aria-labelledby="features-title"
        >
          <div className="feature-heading">
            <h2 id="features-title">
              Bangunan lebih dikenal. Langkah lebih terarah.
            </h2>
            <p>Mulai dari pencatatan, lanjutkan dengan pemahaman.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-tile tile-blue">
              <span className="tile-kicker">PENCATATAN BANGUNAN</span>
              <h3>Satu tempat untuk cerita bangunanmu.</h3>
              <p>
                Catat data dasar dan temukan kembali profil bangunan dalam
                dashboard demo.
              </p>
              <a className="tile-link" href="#/login">
                Coba pencatatan <Arrow />
              </a>
              <div
                className="mini-record"
                aria-label="Contoh profil fiktif, belum dinilai"
              >
                <span className="record-icon" aria-hidden="true">
                  ⌂
                </span>
                <div>
                  <strong>Rumah Contoh A</strong>
                  <span>Profil demonstrasi</span>
                </div>
                <span className="record-status">Belum dinilai</span>
                <div className="record-line">
                  <span>Fungsi bangunan</span>
                  <strong>Rumah tinggal</strong>
                </div>
                <div className="record-line">
                  <span>Hasil screening</span>
                  <strong>Belum tersedia</strong>
                </div>
              </div>
            </article>
            <article className="feature-tile tile-lilac">
              <span className="tile-kicker">SCREENING AWAL RVS</span>
              <h3>Kenali batasnya. Pahami prosesnya.</h3>
              <p>
                Penyaringan awal bukan sertifikat aman dan tidak menggantikan
                evaluasi ahli struktur.
              </p>
              <a className="tile-link" href="#batasan">
                Pelajari screening awal <Arrow />
              </a>
              <div className="screening-graphic" aria-hidden="true">
                <span>RVS</span>
                <span>Penyaringan awal</span>
                <span>Evaluasi ahli →</span>
              </div>
            </article>
            <article className="feature-tile tile-peach">
              <span className="tile-kicker">ALUR SEISMOPASS</span>
              <h3>Langkah berikutnya, lebih jelas.</h3>
              <p>
                Kenali enam tahap yang direncanakan, dari registrasi hingga
                dukungan dan evaluasi.
              </p>
              <a className="tile-link" href="#alur">
                Jelajahi alurnya <Arrow />
              </a>
              <ol className="tile-steps">
                <li>
                  <span>01</span> Catat bangunan
                </li>
                <li>
                  <span>02</span> Screening oleh petugas
                </li>
                <li>
                  <span>03</span> Profil digital
                </li>
              </ol>
            </article>
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
              Demo menyediakan latihan input dan simulasi aritmetika tabel FEMA.
              Hasil belum divalidasi ahli dan tidak menentukan kategori risiko
              atau menyatakan bangunan aman.
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
                penyimpanan server belum tersedia. Masuk dengan akun demo
                pelapor untuk mencoba alurnya.
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
    </div>
  );
}
