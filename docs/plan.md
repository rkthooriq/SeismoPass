# Rencana Pengembangan SeismoPass

## Tujuan dan Status

SeismoPass membantu pemilik mencatat bangunan dan mengikuti proses pemeriksaan serta tindak lanjutnya. Bayangkan satu berkas digital bangunan: data awal, hasil screening yang sah, rujukan ahli, rencana perkuatan, dan catatan pelaksanaan berada dalam alur yang terhubung.

**RVS adalah penyaringan awal, bukan sertifikat aman.** Website tidak menggantikan pemeriksaan ahli. Tidak dirujuk juga tidak boleh ditampilkan sebagai pernyataan aman.

Sumber kebutuhan adalah [SeismoPass App Flow](SeismoPass%20App%20Flow.md), bukan `docs/app-flow.md` yang belum tersedia. Esai asli yang dirujuk sumber belum tersedia di repositori. Ketentuan domain di sini mengikuti ringkasan tersebut, bukan verifikasi mandiri terhadap esai atau pedoman RVS.

Saat ini tersedia Git lokal, dokumentasi, kode landing page awal, dan konfigurasi Docker. Remote adalah `rkthooriq/SeismoPass`. Lockfile cocok dengan manifest; audit container menemukan 0 kerentanan dan lint/typecheck/build lulus pada 11 November 2026. Pengujian visual dan UAT belum dilakukan. Backend, database, dan deployment belum tersedia. Rencana sampai publikasi di bawah tetap memerlukan pemenuhan kriteria tiap tahap; implementasi awal tidak berarti semua tahap selesai.

## Alasan Stack

Stack pilihan pengguna adalah **React + TypeScript + Vite**:

- **React** menyusun tampilan menjadi komponen yang bisa dipakai ulang, misalnya formulir bangunan dan kartu profil. Cocok untuk beberapa halaman dengan interaksi dan status.
- **TypeScript** membantu menemukan kesalahan bentuk data ketika menulis kode, misalnya jumlah lantai tertukar dengan teks. Tetap perlu validasi input dan pemeriksaan server.
- **Vite** menyediakan lingkungan pengembangan dan menghasilkan berkas untuk hosting. Ini memudahkan memulai frontend tanpa merangkai alat build sendiri.

Ketiganya menangani sisi tampilan. Akun, penyimpanan bersama, otorisasi, dan audit memerlukan backend serta database yang belum dipilih. Mulai dengan frontend demonstrasi agar konsep mudah dipelajari, lalu bangun layanan data setelah kebutuhan akses jelas. Pelajari dasar HTML, CSS, JavaScript, lalu TypeScript dan React sambil mengerjakan langkah kecil.

## Aktor dan Usulan Hak Akses

Aktor berasal dari sumber; pembagian akun berikut adalah **USULAN, BELUM DIPUTUSKAN**.

| Aktor sumber | Tanggung jawab | Usulan akses aplikasi |
| --- | --- | --- |
| Pemilik/pengelola | Persetujuan, data bangunan, keputusan retrofit | Bangunan miliknya dan tindak lanjut |
| Petugas terlatih | Screening dengan supervisi | Bangunan penugasan dan pencatatan protokol resmi |
| Ahli struktur/perguruan tinggi | Validasi metode, supervisi, evaluasi dan rencana retrofit | Kasus penugasan dan validasi sesuai kewenangan |
| Pemerintah daerah | Koordinasi data dan dukungan sesuai kewenangan | Ringkasan terbatas sesuai kebutuhan |
| Penyedia retrofit | Pelaksanaan perkuatan | Pekerjaan yang ditugaskan, terpisah dari fungsi penilaian |
| Mitra keuangan | Dukungan berdasarkan kesepakatan | Data minimum dengan persetujuan yang sesuai |

Kebutuhan admin operasional adalah usulan tambahan, bukan aktor yang ditetapkan sumber. Tidak semua aktor harus memperoleh akun pada versi pertama. Hak melihat, membuat, mengubah, dan memvalidasi data harus disepakati sebelum backend dibuat.

## Fitur dan Batas Versi Pertama

Alur sumber memuat enam tahap:

1. Registrasi: lokasi, fungsi, tahun pembangunan, jumlah lantai, material, dan sistem struktur.
2. Screening RVS oleh petugas terlatih dengan supervisi ahli.
3. Profil digital melalui dashboard atau QR, memuat hasil dan rekomendasi yang sah.
4. Rujukan ahli hanya sesuai hasil/protokol yang telah disahkan.
5. Rencana retrofit dari ahli: metode, estimasi biaya, material, dan prioritas; keputusan ada pada pemilik.
6. Pencatatan dukungan, pelaksanaan perkuatan, verifikasi, dan evaluasi.

**Usulan versi demonstrasi:** halaman pengantar, registrasi bangunan, daftar/detail bangunan, dan kerangka profil dengan keterangan “belum dinilai”. Gunakan data bangunan fiktif berlabel demonstrasi; jangan membuat hasil screening, skor, kategori risiko, atau rekomendasi teknis rekaan. Status proses seperti “draf” adalah usulan status administratif, bukan kategori risiko.

Fitur penilaian dan rujukan otomatis menunggu protokol ahli. QR tidak boleh langsung membuka seluruh data bangunan; tentukan dulu data publik dan data terbatas. Insentif ditampilkan berdasarkan program yang benar-benar tersedia, bukan hak yang dijanjikan.

## Struktur Proyek yang Diusulkan

```text
AGENTS.md               panduan kontribusi
README.md               panduan setup, dibuat saat implementasi
docs/                   kebutuhan dan rencana
src/
  components/           komponen tampilan bersama
  features/             buildings, screening, referrals, retrofit
  pages/                halaman aplikasi
  types/                tipe data bersama
  lib/                  utilitas dan integrasi layanan
  assets/               gambar dan ikon
public/                 berkas statis publik, tanpa data pribadi
tests/                  pengujian lintas fitur
```

Kerangka folder di atas sudah tersedia; landing page ada di `src/App.tsx`, sedangkan modul fitur operasional belum dibuat. Tambahkan fitur dan folder lanjutan secara bertahap. Lokasi kode backend ditentukan setelah arsitekturnya dipilih.

## Urutan Pengerjaan sampai Publikasi

| Tahap | Pekerjaan | Syarat selesai |
| --- | --- | --- |
| 1. Klarifikasi | Sepakati sasaran demo/pilot, data, akses, dan batas domain | Keputusan tercatat; hal terbuka tetap diberi label |
| 2. Rancangan layar | Gambar alur pemilik dan petugas, formulir, profil, disclaimer | Tim memahami alur; tidak ada klaim aman |
| 3. Setup frontend dan container | React, TypeScript strict, Vite, lint, format, Dockerfile dan Compose pengembangan | Clone bersih dapat menjalankan aplikasi dengan runtime/image terkunci dan lockfile; petunjuk teruji |
| 4. Demo bertahap | Registrasi, daftar/detail, profil belum dinilai | Validasi formulir, tampilan seluler, dan navigasi berfungsi |
| 5. Layanan data | Pilih backend/database, akun, persetujuan, otorisasi dan audit | Pengguna hanya mengakses data yang diizinkan |
| 6. Alur profesional | Terapkan protokol yang disahkan, rujukan, retrofit dan verifikasi | Ahli memvalidasi metode dan keluaran sebelum dipakai |
| 7. Pengujian internal dan keamanan | Uji komponen, alur, akses server, privasi QR, aksesibilitas, dan keamanan | Temuan penghambat rilis diperbaiki dan diuji ulang |
| 8. Pratinjau, UAT dan panduan | Siapkan staging, uji pengguna berbasis tugas dan eksploratif, periksa panduan pengguna | Skenario penerimaan lulus, pengguna memahami panduan, hasil ditinjau bersama |
| 9. Publikasi | Tinjau kesiapan bersama, lalu terbitkan sesuai instruksi pengguna | URL berfungsi; versi demo diberi label jelas |
| 10. Operasional | Pantau masalah, cadangan data, pembaruan dan evaluasi pilot | Penanggung jawab serta prosedur pemulihan tersedia |

Demo publik dapat diterbitkan setelah tahap 4, 7, dan 8 yang relevan selesai, dengan penandaan demonstrasi yang jelas. Penggunaan nyata memerlukan backend, kontrol akses, tata kelola data, dan validasi ahli. Publikasi demo tidak berarti platform siap melakukan screening operasional.

Perintah yang direncanakan setelah setup: `npm run dev` untuk pengembangan, `npm run build` untuk build, `npm run preview` untuk memeriksa build lokal, `npm run lint` untuk pemeriksaan kode, dan `npm test` untuk pengujian. Belum ada perintah tersebut saat ini. Usulan alat uji: Vitest dan React Testing Library; pengujian alur browser ditambahkan saat alur utama tersedia.

## Pengujian Keamanan, UAT, dan Panduan Pengguna

Pengujian dilakukan sepanjang pengembangan, bukan hanya menjelang rilis. Seluruh pengujian pra-rilis menggunakan data sintetis tanpa hasil RVS rekaan. Uji keamanan aktif hanya pada lingkungan milik proyek yang diizinkan, bukan layanan pihak lain.

| Kegiatan | Kapan | Tujuan dan bukti |
| --- | --- | --- |
| Uji kegunaan awal | Tahap 2 dan 4 | Calon pengguna mencoba rancangan/demo; catat kebingungan dan perbaiki sebelum fitur berkembang |
| Pengujian teknis | Setiap fitur, dirangkum tahap 7 | Pastikan formulir, status, integrasi dan alur utama sesuai kebutuhan; simpan hasil tes |
| Pengujian keamanan | Mulai tahap 3–5, pemeriksaan menyeluruh tahap 7, verifikasi konfigurasi tahap 8 | Catat ruang lingkup, temuan, tingkat keparahan keamanan, perbaikan dan hasil uji ulang |
| User manual | Draf saat tahap 4; diperbarui tahap 5–6; diuji tahap 8 | Panduan berdasarkan layar yang benar-benar tersedia, per peran yang disepakati |
| UAT berbasis skenario | Tahap 8, setelah pengujian internal dan perbaikan keamanan | Perwakilan pengguna menjalankan tugas nyata yang disepakati; catat lulus/gagal dan penerimaan |
| Pengujian pengguna bebas/eksploratif | Mulai tahap 4, diulang tahap 8 | Pengguna menjelajah di luar skenario; catat langkah, harapan, hasil aktual dan kebingungan |
| Pemantauan dan uji ulang | Tahap 10 dan setiap perubahan relevan | Tindak lanjuti laporan pengguna dan periksa regresi sebelum rilis pembaruan |

“Bebas” berarti bebas mengeksplorasi fitur dalam ruang lingkup uji, bukan bebas mengakses data orang lain atau menyerang sistem. Pengujian eksploratif melengkapi UAT terstruktur; keduanya tidak saling menggantikan.

### Cakupan Keamanan

Periksa kebocoran rahasia pada repositori/build, dependensi, validasi input, dan penanganan konten berbahaya. Setelah backend tersedia, uji sesi/login, akses antarperan dan antarbangunan, serta upaya membaca/mengubah data lewat API tanpa izin. Menyembunyikan tombol di frontend tidak cukup. Periksa juga informasi pada QR, log, penyimpanan browser, HTTPS, konfigurasi hosting, serta pemulihan cadangan bila penyimpanan tersedia. Tambahkan pengujian unggahan bila fitur unggahan dipilih.

Tidak boleh rilis dengan temuan keamanan kritis/tinggi yang belum ditangani, akses tanpa izin, atau kebocoran data pribadi. Temuan lain harus memiliki keputusan penanganan yang tercatat. Kategori keparahan di sini hanya untuk temuan keamanan perangkat lunak, bukan kategori risiko bangunan. Pengujian tidak menjamin sistem bebas kerentanan.

### Skenario UAT dan Pemahaman Panduan

UAT (User Acceptance Testing) memeriksa apakah aplikasi memenuhi kebutuhan pengguna. Libatkan perwakilan peran yang sudah masuk cakupan rilis. Untuk demo awal, contoh tugasnya: mendaftarkan bangunan fiktif, memperbaiki input yang ditolak, menemukan detail bangunan, dan menjelaskan arti “belum dinilai” serta batas RVS. Alur profesional baru diuji setelah protokol ahli tersedia, tanpa membuat hasil screening sendiri.

Rencanakan `docs/user-manual.md` untuk langkah per peran, istilah, tangkapan layar, penanganan kesalahan, privasi/QR, batasan RVS, dan bantuan. Dokumen ini baru dibuat ketika tampilan tersedia agar tidak mengarang petunjuk. Saat uji, minta peserta menyelesaikan tugas memakai panduan tanpa dituntun pengembang, lalu menjelaskan kembali bahwa RVS bukan sertifikat aman. Catat bagian yang tidak dipahami dan perbaiki panduan maupun tampilan.

Rencanakan `docs/testing/uat.md` untuk skenario, hasil yang diharapkan, hasil aktual, versi aplikasi, peran peserta, masalah dan hasil uji ulang; `docs/testing/security.md` untuk bukti keamanan dengan akses terbatas bila memuat rincian sensitif. Hindari data pribadi dan rahasia dalam catatan pengujian. Jumlah peserta, target keberhasilan, jadwal, serta penanggung jawab penerimaan **BELUM DIPUTUSKAN** dan harus disepakati sebelum UAT.

### Syarat Publikasi

Sebelum tahap 9, semua skenario UAT wajib yang disepakati harus lulus, masalah penghambat harus ditutup dan diuji ulang, panduan harus sesuai versi rilis, dan temuan keamanan harus memenuhi syarat di atas. Ringkasan pengujian serta batasan ditinjau bersama penanggung jawab penerimaan. Pemahaman pengguna tentang RVS tidak menggantikan validasi metode oleh ahli struktur. Ketentuan ini berlaku sesuai cakupan demo atau operasional; fitur yang belum tersedia tidak boleh diklaim sudah diuji.

## Keputusan yang Masih Terbuka

**Dari sumber — belum dijelaskan:** formulir dan adaptasi RVS, rumus/skor, nama/jumlah kategori risiko, ambang rujukan, tampilan layar, akun/hak akses, langkah bagi bangunan yang tidak dirujuk, dan kebutuhan offline. Web merupakan keputusan tim; sumber tidak menetapkan platform teknis.

**Dari implementasi — perlu diputuskan:** cakupan demo pertama, backend/database, autentikasi, data pada QR publik, persetujuan dan masa simpan data, mekanisme koreksi, kewenangan validasi, administrasi sistem, hosting/domain, biaya, serta penanggung jawab operasional. Tidak ada keputusan tersirat hanya karena suatu opsi disebut dalam rencana.

**Bergantung pihak berwenang/mitra:** protokol dan ambang oleh ahli, program fiskal oleh pemerintah daerah, serta pembiayaan/asuransi melalui kesepakatan yang tersedia. Jangan mengaktifkan klaim atau otomatisasi terkait sebelum dasar tersebut jelas.


## Pembaruan Persiapan Kolaborasi

Git lokal dan remote `https://github.com/rkthooriq/SeismoPass.git` telah tersedia; visibilitas serta keadaan daring belum diverifikasi. Panduan unggah awal, clone, branch, PR, review, serta container tersedia di `README.md`. Docker dimulai pada tahap 3; konfigurasinya telah ditulis bersama landing page sesuai permintaan berikutnya. Publikasi website belum diizinkan pada tahap ini.


## Progres Tampilan Awal

Pengguna meminta tampilan pertama terinspirasi `https://spline.design/` dengan layout otomatis untuk HP, tablet, dan laptop. Kode landing page kini tersedia: judul besar, warna lembut, ilustrasi bangunan SVG orisinal bergaya isometrik, Grid/Flexbox responsif, menu HP, pergantian ilustrasi/profil, dan FAQ. Tidak memakai embed Spline atau hasil RVS rekaan.

Tahap 2–3 baru parsial: belum ada persetujuan desain final atau verifikasi tampilan browser. Lockfile tersedia dan pemeriksaan container (audit/lint/typecheck/build) lulus. Tahap 4 hanya mencakup halaman pengantar dan contoh profil, belum formulir registrasi. Panduan Docker di README sudah disesuaikan dengan konfigurasi aktual beserta batas verifikasinya. Lihat `docs/testing/landing-page.md` untuk pemeriksaan tertunda. Publikasi website belum dilakukan.
