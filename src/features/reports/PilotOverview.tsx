const phases = [
  [
    'Bulan 1',
    'Persiapan',
    'Membentuk tim lintas disiplin dan berkoordinasi dengan pemerintah daerah, ahli, kampus, serta perangkat desa.',
    'Kesepakatan awal dan daftar bangunan prioritas.',
  ],
  [
    'Bulan 2',
    'Protokol',
    'Menyusun instrumen, melatih petugas, serta menetapkan supervisi, tata kelola data, dan prosedur rujukan.',
    'Protokol tertulis dan petugas terlatih.',
  ],
  [
    'Bulan 3–5',
    'Uji coba',
    'Screening bangunan prioritas: pendidikan, kesehatan, hunian sewa, lalu rumah tinggal; disertai verifikasi sampel dan rujukan.',
    'Profil risiko dan daftar rujukan yang sah.',
  ],
  [
    'Bulan 6',
    'Evaluasi',
    'Mengukur indikator, biaya, dan hambatan serta mengkaji opsi insentif.',
    'Laporan dan rekomendasi.',
  ],
  [
    'Setelah evaluasi',
    'Replikasi',
    'Perluasan hanya dipertimbangkan jika mutu, kapasitas, dan pendanaan terbukti.',
    'Keputusan perluasan.',
  ],
];
const indicators = [
  [
    'Cakupan screening',
    '≥90% · 225 dari 250 bangunan',
    'Uji coba',
    'Jumlah bangunan prioritas yang sudah menjalani screening.',
  ],
  [
    'Mutu screening',
    '≥80% kesesuaian · sampel 10%',
    'Evaluasi',
    'Kesesuaian hasil screening dengan verifikasi sampel ahli.',
  ],
  [
    'Rujukan ditindaklanjuti',
    '≥50% dalam 3 bulan',
    'Evaluasi',
    'Bangunan prioritas tinggi yang menerima evaluasi lanjutan ahli.',
  ],
  [
    'Pemahaman pemilik',
    '≥90% memahami batas RVS',
    'Uji coba',
    'Pemilik memahami bahwa hasil screening bukan sertifikat aman.',
  ],
];

export default function PilotOverview() {
  return (
    <div className="pilot-overview">
      <section className="ws-panel pilot-intro">
        <span className="ws-badge">USULAN DALAM ESAI · BELUM BERJALAN</span>
        <h2>Pilot di Desa Jambudipa</h2>
        <p>
          Kecamatan Cisarua, Kabupaten Bandung Barat. Esai mengusulkan uji coba
          enam bulan dengan target 250 bangunan prioritas. Waktu dan kapasitas
          perlu dikonfirmasi bersama ahli serta mitra.
        </p>
        <p className="ws-muted">
          Sumber: esai SeismoPass, IYEEA 2026, bagian D dan Tabel 2–3 (halaman
          10–13). Target berikut adalah usulan evaluasi program, bukan kategori
          risiko bangunan.
        </p>
      </section>
      <section className="ws-panel">
        <h2>Lima fase pelaksanaan</h2>
        <ol className="pilot-phases">
          {phases.map(([time, title, description, output]) => (
            <li key={title}>
              <span className="ws-badge">{time}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <p>
                <strong>Keluaran: </strong>
                {output}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section className="ws-panel">
        <h2>Indikator keberhasilan pilot</h2>
        <p className="ws-muted">
          Target ditetapkan ulang pada fase protokol. Laporan dan kunjungan demo
          tidak dihitung sebagai capaian screening.
        </p>
        <div className="pilot-indicators">
          {indicators.map(([title, target, phase, description]) => (
            <article key={title}>
              <h3>{title}</h3>
              <strong>{target}</strong>
              <p>{description}</p>
              <p>Fase ukur: {phase}</p>
              <span className="ws-badge">Capaian: belum diukur</span>
            </article>
          ))}
        </div>
      </section>
      <section className="ws-panel">
        <h2>Prasyarat sebelum pilot</h2>
        <ul className="pilot-prerequisites">
          <li>
            Validasi instrumen dan ambang oleh ahli, pelatihan petugas,
            supervisi, serta audit sampel.
          </li>
          <li>
            Persetujuan pemilik, minimisasi data, dan pembatasan akses sesuai
            kewenangan.
          </li>
          <li>
            Pemisahan penilai dan penyedia retrofit, serta transparansi
            pemilihan vendor.
          </li>
          <li>
            Kesepakatan konsultasi dan pendampingan; kajian dukungan fiskal
            bersama pemerintah daerah, serta kemitraan pembiayaan dan asuransi.
          </li>
          <li>
            Pencatatan biaya dan hambatan setempat. Esai tidak menetapkan biaya
            retrofit Bandung Raya.
          </li>
        </ul>
        <p className="ws-disclaimer">
          RVS adalah penyaringan awal, bukan sertifikat aman. Belum ada insentif
          fiskal, pembiayaan, atau asuransi yang dapat diajukan melalui demo.
        </p>
      </section>
    </div>
  );
}
