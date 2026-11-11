const flows = [
  {
    role: 'Admin',
    intro: 'Mendata pesurvei, menugaskan laporan, dan meninjau administrasi.',
    steps: [
      [
        'Tambah pesurvei',
        'Isi nama, email, organisasi, dan catatan kompetensi. Sistem membuat akun dengan sandi sementara acak.',
      ],
      [
        'Sampaikan sandi sementara',
        'Sandi tampil sekali. Sampaikan lewat jalur terpisah; admin tidak pernah tahu sandi baru pesurvei.',
      ],
      [
        'Periksa laporan masuk',
        'Minta pelapor melengkapi data atau nyatakan siap untuk ditugaskan.',
      ],
      [
        'Tugaskan pesurvei aktif',
        'Pilih akun yang telah disetujui; pesurvei hanya melihat tugasnya sendiri.',
      ],
      [
        'Tinjau catatan survei',
        'Minta revisi atau tutup administrasi. Simulasi RVS tetap belum divalidasi ahli.',
      ],
      [
        'Kelola akses berkelanjutan',
        'Nonaktifkan bila perlu; tugas yang masih berjalan kembali untuk ditugaskan ulang.',
      ],
    ],
  },
  {
    role: 'Pelapor',
    intro: 'Mendaftarkan bangunan dan mengikuti prosesnya.',
    steps: [
      [
        'Daftar dan verifikasi email demo',
        'Gunakan data fiktif. Verifikasi disimulasikan tanpa pengiriman email.',
      ],
      [
        'Buat laporan bangunan',
        'Isi data dasar dan konfirmasi pemahaman batas RVS. Simpan draf bila belum lengkap.',
      ],
      ['Kirim ke admin', 'Laporan masuk ke pemeriksaan kelengkapan.'],
      [
        'Lengkapi jika diminta',
        'Baca catatan admin, ubah draf, lalu kirim ulang.',
      ],
      [
        'Pantau status dan profil',
        'Lihat penugasan, kunjungan, catatan tinjauan, serta simulasi yang dicatat pesurvei.',
      ],
      [
        'Pahami hasil dan QR',
        'Skor simulasi dan QR bukan sertifikat aman; tindak lanjut teknis memerlukan ahli.',
      ],
    ],
  },
  {
    role: 'Pesurvei',
    intro: 'Akunnya dibuat admin, lalu mengerjakan penugasan dari admin.',
    steps: [
      [
        'Masuk dengan sandi sementara',
        'Gunakan email dan sandi sementara dari admin di halaman masuk yang sama dengan peran lain.',
      ],
      [
        'Buat kata sandi baru',
        'Wajib pada masuk pertama (minimal 12 karakter). Sebelum itu akun belum bisa membuka laporan.',
      ],
      [
        'Buka penugasan admin',
        'Setelah sandi baru dibuat, hanya laporan yang ditugaskan kepadamu terlihat. Pilih Mulai survei.',
      ],
      [
        'Catat kunjungan dan input RVS',
        'Simpan input simulasi, isi tanggal/catatan kunjungan, lalu kirim catatan ke admin.',
      ],
      [
        'Perbaiki bila diminta',
        'Kirim ulang revisi. Setelah ditinjau/ditutup, data survei tidak dapat diubah dari formulir ini.',
      ],
    ],
  },
];
export default function RoleFlowGuide() {
  return (
    <section className="role-flow-guide">
      <div className="role-section-title">
        <span className="ws-badge">PANDUAN ALUR</span>
        <h2>Tiga peran, satu proses yang terhubung.</h2>
        <p>
          Pelapor mencatat. Admin memeriksa dan menugaskan. Pesurvei menjalankan
          tugas.
        </p>
      </div>
      <div className="role-flow-grid">
        {flows.map((flow) => (
          <article key={flow.role}>
            <h3>{flow.role}</h3>
            <p>{flow.intro}</p>
            <ol>
              {flow.steps.map(([title, text], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h4>{title}</h4>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
      <p className="ws-disclaimer">
        Demo menggunakan penyimpanan sesi browser. Verifikasi email, kontrol
        akses server, dan validasi ahli belum tersedia. RVS adalah penyaringan
        awal, bukan sertifikat aman.
      </p>
    </section>
  );
}
