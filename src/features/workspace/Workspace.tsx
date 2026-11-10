import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import BuildingScene from '../../components/BuildingScene';
import { demoBuildings, workflow } from '../../lib/demo';
import type { Building } from '../../types/building';
import { validateBuilding } from '../../lib/buildingValidation';
import { exportBuildingDemo } from '../../lib/buildingSession';
import { parseWorkspaceRoute } from '../../lib/workspaceRoute';
import './workspace.css';
import {
  canOpenPage,
  canManageBuildings,
  getActor,
} from '../../lib/actorAccess';
import type { ActorRole } from '../../lib/actorAccess';
import { ActorDashboard, AccessMatrix } from '../access/ActorDashboard';

const navigation = [
  ['dashboard', '◫', 'Ringkasan'],
  ['buildings', '⌂', 'Bangunan saya'],
  ['screening', '◎', 'Screening RVS'],
  ['referrals', '↗', 'Rujukan ahli'],
  ['retrofit', '▧', 'Rencana retrofit'],
  ['support', '◇', 'Dukungan & evaluasi'],
  ['data', '▤', 'Data demo'],
  ['access', '⊞', 'Peran & hak akses'],
];
const emptyBuilding: Building = {
  id: '',
  name: '',
  location: '',
  function: '',
  year: '',
  floors: '',
  material: '',
  structure: '',
  status: 'Draf',
};
function Disclaimer() {
  return (
    <aside className="ws-disclaimer">
      <span aria-hidden="true">ⓘ</span>
      <p>
        <strong>RVS adalah penyaringan awal, bukan sertifikat aman.</strong>{' '}
        Hasilnya tidak menjamin keamanan bangunan dan tidak menggantikan
        evaluasi ahli struktur.
      </p>
    </aside>
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="ws-badge">{children}</span>;
}

export default function Workspace({
  route,
  buildings,
  onBuildingsChange,
  storageStatus,
  actor,
  onLeave,
}: {
  route: string;
  actor: ActorRole;
  onLeave: () => void;
  buildings: Building[];
  onBuildingsChange: (buildings: Building[]) => void;
  storageStatus: 'new' | 'restored' | 'invalid' | 'unavailable';
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua status');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const parsedRoute = parseWorkspaceRoute(route);
  const denied =
    parsedRoute.section !== 'not-found' &&
    !canOpenPage(actor, parsedRoute.section, parsedRoute.isEdit);
  const { id, isEdit } = parsedRoute;
  const section = denied ? 'denied' : parsedRoute.section;
  const actorInfo = getActor(actor);
  const selected = buildings.find((b) => b.id === id);
  const isForm = !denied && (section === 'new' || isEdit);
  const active = ['new', 'profile'].includes(section) ? 'buildings' : section;
  useEffect(() => {
    heading.current?.focus();
  }, [route]);
  const title = denied
    ? 'Halaman di luar peran demo'
    : isForm
      ? isEdit
        ? 'Perbarui bangunan'
        : 'Catat bangunan baru'
      : section === 'profile'
        ? 'Profil digital'
        : (navigation.find((n) => n[0] === section)?.[2] ??
          (section === 'guide'
            ? 'Panduan SeismoPass'
            : section === 'qr'
              ? 'Pratinjau informasi publik'
              : 'Halaman tidak ditemukan'));
  function save(building: Building) {
    if (!canManageBuildings(actor)) return;
    if (!building.id && buildings.length >= 500) {
      setNotice(
        'Batas demo 500 catatan per sesi tercapai. Unduh catatan dan reset data demo sebelum menambah catatan baru.',
      );
      return;
    }
    const entry = {
      ...building,
      id: building.id || `DEMO-${crypto.randomUUID().slice(0, 8)}`,
    };
    onBuildingsChange(
      building.id
        ? buildings.map((b) => (b.id === building.id ? entry : b))
        : [...buildings, entry],
    );
    setNotice(
      'Catatan demo diperbarui. Status penyimpanan tersedia pada halaman Data demo.',
    );
    window.location.hash = `/profile/${entry.id}`;
  }
  const visible = buildings.filter(
    (b) =>
      `${b.name} ${b.id} ${b.location}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === 'Semua status' || b.status === filter),
  );
  return (
    <div className="workspace">
      <a
        className="skip-link"
        href="#workspace-main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('workspace-main')?.focus();
        }}
      >
        Lewati ke konten
      </a>
      <aside className={`ws-sidebar ${menuOpen ? 'open' : ''}`}>
        <a className="ws-logo" href="#">
          ▥{' '}
          <span>
            seismo<strong>pass.</strong>
          </span>
        </a>
        <div className="ws-space">
          <span className="ws-avatar">S</span>
          <div>
            <strong>Ruang {actorInfo.shortName}</strong>
            <small>Workspace demonstrasi</small>
          </div>
          <span className="ws-live">DEMO</span>
        </div>
        <p className="ws-nav-label">RUANG KERJA</p>
        <nav id="workspace-navigation" aria-label="Navigasi dashboard">
          {navigation
            .filter(([page]) => canOpenPage(actor, page))
            .map(([id, icon, label]) => (
              <a
                key={id}
                href={`#/${id}`}
                aria-current={active === id ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
                {id === 'buildings' && <small>{buildings.length}</small>}
              </a>
            ))}
        </nav>
        <div className="ws-sidebar-bottom">
          <div className="ws-tip">
            <span>✳</span>
            <strong>
              Kenal bangunan,
              <br />
              siapkan langkah.
            </strong>
            <p>Mulai dari catatan kecil yang berarti.</p>
            <a href="#/guide" onClick={() => setMenuOpen(false)}>
              Baca panduan ↗
            </a>
          </div>
          <a className="ws-back" href="#">
            ← Kembali ke beranda
          </a>
          <div className="ws-user">
            <span className="ws-avatar">D</span>
            <div>
              <strong>{actorInfo.name}</strong>
              <small>Tanpa akun pribadi</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="ws-body">
        <header className="ws-topbar">
          <div>
            <button
              className="ws-menu"
              aria-expanded={menuOpen}
              aria-controls="workspace-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? 'Tutup' : 'Menu'} ☰
            </button>
            <span>
              Workspace <span className="ws-slash">/</span>{' '}
              <strong>{title}</strong>
            </span>
          </div>
          <div className="actor-session-buttons">
            <a href="#/access">Hak akses</a>
            <button onClick={onLeave}>Keluar demo</button>
          </div>
          <a href="#/guide" className="ws-help">
            ⓘ <span>Pusat bantuan</span>
          </a>
        </header>
        <main id="workspace-main" tabIndex={-1} className="ws-main">
          <div className="ws-demo-strip">
            <span>
              <span className="ws-dot" /> Mode demonstrasi
            </span>
            <p>
              Gunakan data fiktif. Catatan tersimpan lokal selama sesi tab jika
              penyimpanan browser tersedia.
            </p>
          </div>
          <div className="ws-page-heading">
            <div>
              <p className="ws-eyebrow">SEISMOPASS WORKSPACE</p>
              <h1 ref={heading} tabIndex={-1}>
                {section === 'dashboard'
                  ? actor === 'owner'
                    ? 'Langkah baik dimulai di sini.'
                    : `Ruang ${actorInfo.shortName.toLowerCase()}.`
                  : title}
              </h1>
              <p>
                {section === 'dashboard'
                  ? 'Kenali bangunanmu, catat informasinya, dan ikuti setiap langkahnya.'
                  : 'Satu tempat untuk catatan bangunan dan tindak lanjutnya.'}
              </p>
            </div>
            {actor === 'owner' &&
              ['dashboard', 'buildings'].includes(section) && (
                <a className="ws-primary" href="#/new">
                  ＋ Tambah bangunan
                </a>
              )}
          </div>
          {actor === 'owner' && storageStatus === 'unavailable' && (
            <aside role="status" className="ws-disclaimer">
              <p>
                <strong>Penyimpanan sesi tidak tersedia.</strong> Catatan hanya
                bertahan selama aplikasi terbuka dan dapat hilang saat refresh.
                Unduh salinan dari halaman Data demo.
              </p>
            </aside>
          )}
          {actor === 'owner' && storageStatus === 'invalid' && (
            <aside role="status" className="ws-disclaimer">
              <p>
                <strong>Catatan sesi tidak dapat dibaca.</strong> Data contoh
                digunakan untuk melanjutkan. Data lama belum ditimpa; simpan
                perubahan baru atau reset demo untuk menggantinya.
              </p>
            </aside>
          )}
          {notice && (
            <div role="status" className="ws-notice">
              {notice}
              <button
                aria-label="Tutup pemberitahuan"
                onClick={() => setNotice('')}
              >
                ×
              </button>
            </div>
          )}
          {section === 'dashboard' && actor !== 'owner' && (
            <>
              <ActorDashboard role={actor} />
              <Disclaimer />
            </>
          )}
          {section === 'access' && <AccessMatrix role={actor} />}
          {section === 'denied' && (
            <section className="ws-panel ws-empty">
              <h2>Halaman ini tidak termasuk peran {actorInfo.shortName}.</h2>
              <p>
                Simulasi mengikuti usulan hak akses. Data pemilik dan formulir
                bangunan tidak dibagikan ke seluruh peran.
              </p>
              <a href="#/dashboard" className="ws-primary">
                Kembali ke dashboard
              </a>
              <p>
                <a href="#/access">Lihat matriks hak akses →</a>
              </p>
            </section>
          )}
          {section === 'dashboard' && actor === 'owner' && (
            <>
              <section className="ws-welcome">
                <div>
                  <Badge>SETIAP BANGUNAN PUNYA CERITA</Badge>
                  <h2>
                    Bangunanmu.
                    <br />
                    Catatannya. Langkahnya.
                  </h2>
                  <p>
                    Mulai dengan data dasar. Informasi yang lebih baik membantu
                    mempersiapkan tindak lanjut bersama pihak yang tepat.
                  </p>
                  <a href="#/new" className="ws-primary">
                    Catat bangunan baru ＋
                  </a>
                  <a href="#/guide" className="ws-inline-link">
                    Kenali alurnya ↗
                  </a>
                </div>
                <div className="ws-illustration">
                  <BuildingScene />
                  <span>ILUSTRASI · BUKAN DATA LAPANGAN</span>
                </div>
              </section>
              <section
                className="ws-stats"
                aria-label="Ringkasan data demonstrasi"
              >
                {[
                  [
                    String(buildings.length),
                    'Bangunan tercatat',
                    'Seluruh catatan demonstrasi',
                    '⌂',
                  ],
                  [
                    String(buildings.filter((b) => b.status === 'Draf').length),
                    'Draf bangunan',
                    'Lanjutkan melengkapi data',
                    '▧',
                  ],
                  ['—', 'Screening RVS', 'Belum ada hasil penilaian', '◎'],
                  ['—', 'Tindak lanjut ahli', 'Belum ada rujukan resmi', '↗'],
                ].map(([value, label, note, icon]) => (
                  <div className="ws-stat" key={label}>
                    <span className="ws-stat-icon">{icon}</span>
                    <p>{label}</p>
                    <strong>{value}</strong>
                    <small>{note}</small>
                  </div>
                ))}
              </section>
              <div className="ws-two-col">
                <section className="ws-panel">
                  <div className="ws-section-head">
                    <div>
                      <h2>Bangunan terbaru</h2>
                      <p>Kenali kembali yang sudah kamu catat.</p>
                    </div>
                    <a href="#/buildings">Lihat semua ↗</a>
                  </div>
                  {buildings
                    .slice(-3)
                    .reverse()
                    .map((b) => (
                      <a
                        className="ws-building-row"
                        key={b.id}
                        href={`#/profile/${b.id}`}
                      >
                        <span className="ws-building-icon">⌂</span>
                        <div>
                          <strong>{b.name}</strong>
                          <small>
                            {b.function} · {b.floors || '—'} lantai
                          </small>
                        </div>
                        <Badge>{b.status}</Badge>
                        <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                </section>
                <section className="ws-panel ws-next">
                  <span className="ws-eyebrow">LANGKAH SELANJUTNYA</span>
                  <h2>
                    Lengkapi cerita
                    <br />
                    bangunanmu.
                  </h2>
                  <p>
                    Pastikan lokasi, fungsi, dan data fisik bangunan sudah
                    tercatat. Tidak yakin? Pilih “Belum diketahui”.
                  </p>
                  <a className="ws-secondary" href="#/buildings">
                    Periksa catatan bangunan →
                  </a>
                  <div className="ws-next-note">
                    ◎ Data dasar bukan hasil screening.
                  </div>
                </section>
              </div>
              <Process />
              <Disclaimer />
            </>
          )}
          {section === 'buildings' && (
            <>
              <section className="ws-panel">
                <div className="ws-toolbar">
                  <label className="ws-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                      aria-label="Cari bangunan"
                      placeholder="Cari nama, ID, atau lokasi bangunan…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <select
                    aria-label="Filter status administratif"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    {['Semua status', 'Draf', 'Data tercatat'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="ws-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Bangunan</th>
                        <th>Fungsi & lantai</th>
                        <th>Status data</th>
                        <th>Screening</th>
                        <th>
                          <span className="ws-sr">Tindakan</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <a href={`#/profile/${b.id}`}>
                              <strong>{b.name}</strong>
                              <small>
                                {b.id} · {b.location}
                              </small>
                            </a>
                          </td>
                          <td>
                            {b.function}
                            <small>{b.floors || '—'} lantai</small>
                          </td>
                          <td>
                            <Badge>{b.status}</Badge>
                          </td>
                          <td>Belum dinilai</td>
                          <td>
                            <a
                              className="ws-table-link"
                              href={`#/profile/${b.id}`}
                            >
                              Buka ↗
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {visible.length === 0 && (
                  <div className="ws-empty">
                    <h2>Belum ada yang cocok.</h2>
                    <p>Coba kata kunci lain atau ubah filter status.</p>
                    <button
                      className="ws-secondary"
                      onClick={() => {
                        setQuery('');
                        setFilter('Semua status');
                      }}
                    >
                      Reset pencarian
                    </button>
                  </div>
                )}
                <p className="ws-table-footer">
                  {visible.length} dari {buildings.length} bangunan · Seluruh
                  data berlabel demonstrasi
                </p>
              </section>
              <Disclaimer />
            </>
          )}
          {isForm &&
            (isEdit && !selected ? (
              <Empty
                title="Bangunan tidak ditemukan"
                text="Kembali ke daftar untuk memilih bangunan."
              />
            ) : (
              <BuildingForm
                key={route}
                initial={selected ?? emptyBuilding}
                onSave={save}
              />
            ))}
          {section === 'profile' &&
            !isEdit &&
            (selected ? (
              <>
                <div className="ws-profile-hero">
                  <div className="ws-profile-art">
                    <BuildingScene />
                  </div>
                  <div>
                    <Badge>DATA DEMONSTRASI · {selected.id}</Badge>
                    <h2>{selected.name}</h2>
                    <p>{selected.location}</p>
                    <div className="ws-profile-tags">
                      <Badge>{selected.status}</Badge>
                      <Badge>Belum dinilai</Badge>
                    </div>
                    <a
                      className="ws-secondary"
                      href={`#/profile/${selected.id}/edit`}
                    >
                      Ubah data bangunan ↗
                    </a>
                  </div>
                </div>
                <div className="ws-two-col">
                  <section className="ws-panel">
                    <div className="ws-section-head">
                      <h2>Identitas bangunan</h2>
                      <span className="ws-muted">Data fiktif</span>
                    </div>
                    <dl className="ws-details">
                      {[
                        ['Fungsi bangunan', selected.function],
                        ['Tahun pembangunan', selected.year],
                        ['Jumlah lantai', selected.floors],
                        ['Material utama', selected.material],
                        ['Sistem struktur', selected.structure],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{value || 'Belum diketahui'}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                  <section className="ws-panel">
                    <div className="ws-section-head">
                      <h2>Profil screening</h2>
                      <Badge>Belum dinilai</Badge>
                    </div>
                    <p className="ws-muted">
                      Hasil, kategori, dan rekomendasi belum tersedia. Status
                      ini bukan kategori risiko atau pernyataan aman.
                    </p>
                    <div className="ws-separator" />
                    <h3>Informasi publik & QR</h3>
                    <p className="ws-muted">
                      QR publik belum diaktifkan. Data publik dan persetujuan
                      berbagi masih perlu ditetapkan.
                    </p>
                    <a className="ws-secondary" href="#/qr">
                      Lihat pratinjau terbatas ↗
                    </a>
                  </section>
                </div>
                <Process />
                <Disclaimer />
              </>
            ) : (
              <Empty
                title="Bangunan tidak ditemukan"
                text="Catatan demo mungkin sudah direset. Pilih bangunan dari daftar."
              />
            ))}
          {section === 'screening' && (
            <>
              <section className="ws-feature-hero">
                <span className="ws-feature-icon">◎</span>
                <Badge>TAHAP 02</Badge>
                <h2>
                  Pemeriksaan yang tepat,
                  <br />
                  oleh pihak yang tepat.
                </h2>
                <p>
                  Screening RVS dilakukan petugas terlatih dengan supervisi ahli
                  struktur. Formulir, metode, dan hasil penilaian akan mengikuti
                  protokol yang disahkan.
                </p>
              </section>
              <div className="ws-three-col">
                {[
                  [
                    '01',
                    'Catat data dasar',
                    'Lengkapi informasi bangunan sebagai persiapan awal.',
                  ],
                  [
                    '02',
                    'Penugasan petugas',
                    'Penjadwalan dan penugasan menunggu layanan operasional.',
                  ],
                  [
                    '03',
                    'Hasil yang tervalidasi',
                    'Profil diperbarui setelah proses pemeriksaan dan validasi resmi.',
                  ],
                ].map(([num, title, text]) => (
                  <section className="ws-panel" key={num}>
                    <span className="ws-step-num">{num}</span>
                    <h3>{title}</h3>
                    <p className="ws-muted">{text}</p>
                  </section>
                ))}
              </div>
              <Empty
                title="Belum ada screening"
                text="Demo tidak melakukan perhitungan atau menghasilkan hasil RVS. Kamu dapat melengkapi data bangunan terlebih dahulu."
              />
              <Disclaimer />
            </>
          )}
          {section === 'referrals' && (
            <>
              <section className="ws-feature-hero">
                <span className="ws-feature-icon">↗</span>
                <Badge>TAHAP 04</Badge>
                <h2>
                  Terhubung dengan
                  <br />
                  keahlian yang dibutuhkan.
                </h2>
                <p>
                  Rujukan ahli struktur mengikuti hasil screening dan protokol
                  yang disahkan. Tidak semua bangunan otomatis dirujuk.
                </p>
              </section>
              <Empty
                title="Belum ada rujukan ahli"
                text="Belum ada hasil screening resmi atau penugasan ahli. Direktori, kredensial, dan alur konsultasi menunggu kerja sama operasional."
              />
              <section className="ws-panel">
                <h2>Yang akan dicatat</h2>
                <div className="ws-three-col ws-info-columns">
                  <div>
                    <h3>Dasar rujukan</h3>
                    <p>Hasil resmi yang menjadi dasar pemeriksaan lanjutan.</p>
                  </div>
                  <div>
                    <h3>Ahli yang berwenang</h3>
                    <p>Penugasan dan kewenangan yang telah diverifikasi.</p>
                  </div>
                  <div>
                    <h3>Evaluasi lanjutan</h3>
                    <p>Dokumen evaluasi teknis dari ahli struktur.</p>
                  </div>
                </div>
              </section>
              <Disclaimer />
            </>
          )}
          {section === 'retrofit' && (
            <>
              <section className="ws-feature-hero">
                <span className="ws-feature-icon">▧</span>
                <Badge>TAHAP 05</Badge>
                <h2>
                  Rencana yang terarah.
                  <br />
                  Keputusan di tangan pemilik.
                </h2>
                <p>
                  Ahli menyusun metode, estimasi biaya, kebutuhan material, dan
                  prioritas pelaksanaan berdasarkan evaluasi teknis.
                </p>
              </section>
              <Empty
                title="Rencana retrofit belum tersedia"
                text="Rekomendasi teknis harus disusun ahli struktur. Demo ini tidak membuat metode perkuatan atau estimasi biaya."
              />
              <section className="ws-panel">
                <h2>Dari rencana hingga verifikasi</h2>
                <ol className="ws-timeline">
                  {[
                    'Evaluasi dan rencana oleh ahli',
                    'Pemilik meninjau dan memutuskan',
                    'Pelaksanaan oleh penyedia yang dipilih',
                    'Verifikasi dan catatan evaluasi',
                  ].map((s, i) => (
                    <li key={s}>
                      <span>{i + 1}</span>
                      <div>
                        <strong>{s}</strong>
                        <p>Belum dimulai</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="ws-muted">
                  Penilai dan penyedia retrofit menjalankan fungsi terpisah.
                  Tidak ada kewajiban menggunakan penyedia tertentu.
                </p>
              </section>
            </>
          )}
          {section === 'support' && (
            <>
              <section className="ws-feature-hero">
                <span className="ws-feature-icon">◇</span>
                <Badge>TAHAP 06</Badge>
                <h2>
                  Dukungan untuk
                  <br />
                  langkah selanjutnya.
                </h2>
                <p>
                  Ketersediaan program mengikuti kebijakan dan kerja sama yang
                  disepakati. Belum ada program aktif atau pengajuan pada demo.
                </p>
              </section>
              <div className="ws-three-col">
                {[
                  [
                    'Pendampingan teknis',
                    'Konsultasi dan pendampingan retrofit melalui mitra yang disepakati.',
                  ],
                  [
                    'Dukungan fiskal',
                    'Usulan keringanan PBB-P2 memerlukan kebijakan daerah dan syarat resmi.',
                  ],
                  [
                    'Pembiayaan & asuransi',
                    'Ketersediaan, syarat, dan penyesuaian premi bergantung pada kesepakatan mitra.',
                  ],
                ].map(([title, text]) => (
                  <section className="ws-panel" key={title}>
                    <Badge>Belum tersedia</Badge>
                    <h3>{title}</h3>
                    <p className="ws-muted">{text}</p>
                  </section>
                ))}
              </div>
              <section className="ws-panel">
                <h2>Catatan evaluasi perkuatan</h2>
                <p className="ws-muted">
                  Belum ada pelaksanaan atau verifikasi. Catatan akan memuat
                  bukti pelaksanaan, verifikasi pihak berwenang, dan tindak
                  lanjut.
                </p>
              </section>
            </>
          )}
          {section === 'guide' && (
            <>
              <Process />
              <section className="ws-panel ws-guide">
                <h2>Mulai dari mengenal bangunan</h2>
                {[
                  [
                    'Bagaimana mencoba demo?',
                    'Buka Bangunan saya, pilih Tambah bangunan, lalu gunakan data fiktif. Simpan draf atau lengkapi semua data dasar. Catatan bertahan saat refresh selama sesi tab, jika penyimpanan browser tersedia. Kelola catatan di halaman Data demo.',
                  ],
                  [
                    'Apa arti status data?',
                    'Draf berarti catatan masih dapat dilengkapi. Data tercatat berarti formulir dasar sudah diisi. Keduanya adalah status administratif, bukan hasil atau kategori risiko.',
                  ],
                  [
                    'Siapa yang menilai bangunan?',
                    'Petugas terlatih dengan supervisi ahli, mengikuti protokol yang disahkan. Demo tidak menghasilkan penilaian.',
                  ],
                  [
                    'Apakah data saya dipublikasikan?',
                    'Demo menyimpan catatan dalam sesi tab browser, tidak mengirimnya ke server, dan tidak membuat QR aktif. Hindari data pribadi. Kebijakan berbagi data untuk layanan nyata belum diputuskan.',
                  ],
                  [
                    'Apakah bantuan otomatis tersedia?',
                    'Tidak. Insentif fiskal, pembiayaan, dan asuransi menunggu kebijakan atau kerja sama yang disepakati.',
                  ],
                ].map(([q, a]) => (
                  <details key={q}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
              </section>
              <Disclaimer />
            </>
          )}
          {section === 'data' && (
            <DemoData
              buildings={buildings}
              storageStatus={storageStatus}
              onReset={() => {
                onBuildingsChange(demoBuildings.map((b) => ({ ...b })));
                setQuery('');
                setFilter('Semua status');
                setNotice('Catatan dikembalikan ke tiga bangunan contoh.');
              }}
            />
          )}
          {section === 'qr' && (
            <>
              <section className="ws-public-preview">
                <Badge>PRATINJAU · BUKAN HALAMAN PUBLIK AKTIF</Badge>
                <span className="ws-feature-icon">▥</span>
                <h2>Profil bangunan SeismoPass</h2>
                <p>
                  Identitas pemilik, alamat rinci, dan detail catatan tidak
                  ditampilkan pada pratinjau ini.
                </p>
                <Badge>Belum dinilai</Badge>
                <p>
                  QR dan tautan berbagi belum diaktifkan. Cakupan data publik
                  serta persetujuan pemilik masih perlu ditetapkan.
                </p>
                <Disclaimer />
              </section>
            </>
          )}
          {![
            'dashboard',
            'buildings',
            'new',
            'profile',
            'screening',
            'referrals',
            'retrofit',
            'support',
            'guide',
            'qr',
            'data',
            'access',
            'denied',
          ].includes(section) && (
            <Empty
              title="Halaman tidak ditemukan"
              text="Gunakan navigasi untuk kembali ke ruang kerja."
            />
          )}
          <footer className="ws-footer">
            <span>
              seismopass. <span>Kenali bangunan. Siapkan langkah.</span>
            </span>
            <span>Demo pengembangan · Tanpa penilaian RVS</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <section className="ws-panel ws-empty">
      <span className="ws-empty-icon">⌂</span>
      <h2>{title}</h2>
      <p>{text}</p>
      <a href="#/dashboard" className="ws-secondary">
        Kembali ke dashboard →
      </a>
    </section>
  );
}
function Process() {
  return (
    <section className="ws-panel">
      <div className="ws-section-head">
        <div>
          <h2>Perjalanan bangunanmu</h2>
          <p>Enam tahap yang saling terhubung.</p>
        </div>
        <a href="#/guide">Panduan alur ↗</a>
      </div>
      <ol className="ws-process">
        {workflow.map((step, i) => (
          <li key={step}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <strong>{step}</strong>
            <small>
              {i === 0 ? 'Mulai dari data dasar' : 'Menunggu proses resmi'}
            </small>
          </li>
        ))}
      </ol>
    </section>
  );
}

function BuildingForm({
  initial,
  onSave,
}: {
  initial: Building;
  onSave: (building: Building) => void;
}) {
  const [data, setData] = useState<Building>({ ...initial });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorsRef = useRef<HTMLDivElement>(null);
  const fields: [keyof Building, string, string][] = [
    ['name', 'Nama bangunan', 'Contoh: Rumah Contoh B'],
    [
      'location',
      'Lokasi bangunan',
      'Gunakan lokasi fiktif, tanpa alamat pribadi',
    ],
    ['year', 'Tahun pembangunan', 'Kosongkan jika belum diketahui'],
    ['floors', 'Jumlah lantai', 'Contoh: 2'],
  ];
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const draft =
      submitter instanceof HTMLButtonElement && submitter.value === 'draft';
    const next = validateBuilding(data, consent, draft);
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => errorsRef.current?.focus());
      return;
    }
    onSave({
      ...data,
      name: data.name.trim(),
      location: data.location.trim(),
      status: draft ? 'Draf' : 'Data tercatat',
    });
  }
  const update = (key: keyof Building, value: string) =>
    setData((previous) => ({ ...previous, [key]: value }));
  return (
    <div className="ws-form-layout">
      <form className="ws-panel ws-form" onSubmit={submit} noValidate>
        <div className="ws-section-head">
          <div>
            <Badge>TAHAP 01 · DATA DASAR</Badge>
            <h2>Kenalkan bangunanmu.</h2>
            <p>Gunakan data fiktif untuk mencoba alur pencatatan.</p>
          </div>
        </div>
        {Object.keys(errors).length > 0 && (
          <div role="alert" tabIndex={-1} ref={errorsRef} className="ws-errors">
            <strong>Periksa kembali formulir.</strong>
            <ul>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>
                  <a
                    href={`#field-${key}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`field-${key}`)?.focus();
                    }}
                  >
                    {key === 'consent'
                      ? ''
                      : `${[...fields.map(([k, label]) => [k, label]), ['function', 'Fungsi'], ['material', 'Material'], ['structure', 'Struktur']].find(([k]) => k === key)?.[1]}: `}
                    {value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="ws-fields">
          {fields.map(([key, label, placeholder]) => (
            <label
              key={key}
              className={
                ['name', 'location'].includes(key) ? 'ws-field-wide' : ''
              }
              htmlFor={`field-${key}`}
            >
              {label}
              {key === 'year' ? ' (opsional)' : ' *'}
              <input
                id={`field-${key}`}
                value={data[key]}
                maxLength={key === 'name' ? 100 : key === 'location' ? 200 : 4}
                inputMode={
                  ['year', 'floors'].includes(key) ? 'numeric' : 'text'
                }
                placeholder={placeholder}
                aria-invalid={Boolean(errors[key])}
                aria-describedby={errors[key] ? `error-${key}` : undefined}
                onChange={(e) => update(key, e.target.value)}
              />
              {errors[key] && (
                <small className="ws-error" id={`error-${key}`}>
                  {errors[key]}
                </small>
              )}
            </label>
          ))}
          {(
            [
              [
                'function',
                'Fungsi bangunan',
                ['Rumah tinggal', 'Tempat usaha', 'Fasilitas umum', 'Lainnya'],
              ],
              [
                'material',
                'Material utama',
                [
                  'Bata',
                  'Beton',
                  'Kayu',
                  'Baja',
                  'Campuran',
                  'Belum diketahui',
                ],
              ],
              [
                'structure',
                'Sistem struktur',
                [
                  'Rangka beton',
                  'Rangka baja',
                  'Rangka kayu',
                  'Dinding pemikul',
                  'Belum diketahui',
                ],
              ],
            ] as [keyof Building, string, string[]][]
          ).map(([key, label, options]) => (
            <label key={key} htmlFor={`field-${key}`}>
              {label} *
              <select
                id={`field-${key}`}
                value={data[key]}
                aria-invalid={Boolean(errors[key])}
                aria-describedby={errors[key] ? `error-${key}` : undefined}
                onChange={(e) => update(key, e.target.value)}
              >
                <option value="">Pilih {label.toLowerCase()}</option>
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              {errors[key] && (
                <small className="ws-error" id={`error-${key}`}>
                  {errors[key]}
                </small>
              )}
            </label>
          ))}
        </div>
        <p className="ws-muted">
          * Wajib untuk mencatat data lengkap. Draf cukup berisi nama dan
          konfirmasi demo. Pilihan formulir adalah usulan UI, bukan protokol
          RVS.
        </p>
        <label className="ws-consent">
          <input
            type="checkbox"
            id="field-consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'error-consent' : undefined}
          />
          <span>
            Saya menggunakan data fiktif dan memahami bahwa catatan demo tidak
            didaftarkan ke layanan nyata.
          </span>
        </label>
        {errors.consent && (
          <small className="ws-error" id="error-consent">
            {errors.consent}
          </small>
        )}
        <div className="ws-form-actions">
          <a href="#/buildings" className="ws-inline-link">
            Batal
          </a>
          <button className="ws-secondary" type="submit" value="draft">
            Simpan draf
          </button>
          <button className="ws-primary" type="submit" value="complete">
            Simpan data bangunan →
          </button>
        </div>
      </form>
      <aside>
        <section className="ws-panel ws-form-tip">
          <span className="ws-feature-icon">✳</span>
          <h2>
            Tidak harus
            <br />
            tahu semuanya.
          </h2>
          <p>
            Untuk material dan sistem struktur, pilih “Belum diketahui” jika
            belum yakin. Ahli yang berwenang akan melakukan pemeriksaan sesuai
            protokol.
          </p>
          <div className="ws-separator" />
          <strong>Privasi dimulai di sini.</strong>
          <p>
            Jangan masukkan nama pemilik, nomor telepon, atau alamat pribadi
            pada demo.
          </p>
        </section>
        <Disclaimer />
      </aside>
    </div>
  );
}

function DemoData({
  buildings,
  storageStatus,
  onReset,
}: {
  buildings: Building[];
  storageStatus: string;
  onReset: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const confirmation = useRef<HTMLDivElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  function download() {
    try {
      const url = URL.createObjectURL(
        new Blob([exportBuildingDemo(buildings)], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'seismopass-data-demonstrasi.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadError('');
    } catch {
      setDownloadError(
        'Unduhan belum berhasil. Coba kembali melalui browser yang mendukung unduhan berkas.',
      );
    }
  }
  function closeConfirmation() {
    setConfirmReset(false);
    requestAnimationFrame(() => resetButton.current?.focus());
  }
  return (
    <>
      <section className="ws-panel">
        <Badge>PENYIMPANAN LOKAL · DATA FIKTIF</Badge>
        <h2 className="ws-data-title">Catatanmu selama sesi demo.</h2>
        <p className="ws-muted">
          {buildings.length} bangunan dalam workspace.{' '}
          {storageStatus === 'restored'
            ? 'Catatan sesi berhasil dimuat atau disimpan.'
            : storageStatus === 'new'
              ? 'Data contoh siap digunakan. Catatan baru disimpan saat kamu menyimpan formulir.'
              : 'Penyimpanan sesi membutuhkan perhatian; lihat pemberitahuan di atas.'}
        </p>
        <div className="ws-separator" />
        <div className="ws-three-col ws-info-columns">
          <div>
            <h3>Tetap ada saat refresh</h3>
            <p>
              Catatan disimpan dalam sesi tab pada browser ini dan bertahan saat
              berpindah ke beranda. Menutup tab mengakhiri sesi; browser dapat
              memulihkannya saat memulihkan tab.
            </p>
          </div>
          <div>
            <h3>Tanpa sinkronisasi</h3>
            <p>
              Catatan tidak dikirim ke server atau dibagikan ke kolaborator.
              Penyimpanan browser bukan akun atau kontrol akses. Gunakan data
              fiktif saja.
            </p>
          </div>
          <div>
            <h3>Simpan salinan demo</h3>
            <p>
              Unduh JSON untuk meninjau catatan. Berkas memuat semua isian demo,
              tanpa hasil penilaian RVS. Fitur impor belum tersedia.
            </p>
          </div>
        </div>
        <button className="ws-primary" onClick={download}>
          Unduh data demo ↓
        </button>
        {downloadError && (
          <p role="alert" className="ws-error">
            {downloadError}
          </p>
        )}
      </section>
      <section className="ws-panel">
        <h2>Mulai ulang demonstrasi</h2>
        <p className="ws-muted ws-data-description">
          Reset mengganti seluruh catatan saat ini dengan tiga bangunan contoh.
          Unduh salinan terlebih dahulu jika ingin menyimpan catatanmu.
        </p>
        {!confirmReset ? (
          <button
            ref={resetButton}
            className="ws-secondary"
            onClick={() => {
              setConfirmReset(true);
              requestAnimationFrame(() => confirmation.current?.focus());
            }}
          >
            Reset data demo
          </button>
        ) : (
          <div
            className="ws-reset-confirm"
            role="group"
            aria-labelledby="reset-title"
            tabIndex={-1}
            ref={confirmation}
          >
            <h3 id="reset-title">Ganti seluruh catatan demo?</h3>
            <p>
              Perubahan pada {buildings.length} catatan saat ini akan diganti
              dengan data contoh.
            </p>
            <div className="ws-data-actions">
              <button className="ws-secondary" onClick={closeConfirmation}>
                Batal
              </button>
              <button
                className="ws-primary"
                onClick={() => {
                  onReset();
                  closeConfirmation();
                }}
              >
                Ya, reset ke data contoh
              </button>
            </div>
          </div>
        )}
      </section>
      <Disclaimer />
    </>
  );
}
