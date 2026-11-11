# Repository Guidelines

## Tujuan dan Sumber Kebutuhan

SeismoPass adalah web untuk pencatatan bangunan, penyaringan awal RVS, profil digital, rujukan ahli, rencana retrofit, serta insentif dan evaluasi. Baca `docs/SeismoPass App Flow.md` sebagai sumber kebutuhan dan `docs/plan.md` sebagai rencana implementasi. Bedakan ketentuan sumber, usulan teknis, dan hal **BELUM DIPUTUSKAN**.

## Batasan Domain

RVS merupakan penyaringan awal, **bukan sertifikat aman**. Jangan menciptakan rumus, skor, kategori risiko, ambang rujukan, atau hasil screening. Implementasi penilaian resmi menunggu protokol dan validasi ahli struktur. Atas permintaan pengguna tersedia simulasi pendidikan tabel FEMA P-154 HIGH Level 1, tanpa kategori risiko atau ambang otomatis; lihat `docs/rvs-demo.md`. Tampilkan penjelasan keterbatasan RVS pada profil dan halaman QR. Jangan menjanjikan insentif fiskal, pembiayaan, atau asuransi yang belum disepakati.

## Struktur Proyek

Saat ini tersedia landing page, UI workspace demonstrasi (formulir, daftar, profil, dan kerangka alur lanjutan), dokumentasi, dan konfigurasi container yang sudah digunakan untuk audit/lint/build. Stack yang dipilih adalah React, TypeScript, dan Vite. Struktur yang tersedia: `src/components/` untuk UI bersama, `src/features/` untuk fitur, `src/pages/` untuk halaman, `src/types/` untuk tipe data, `src/lib/` untuk utilitas, `src/assets/` untuk aset, dan `tests/` untuk pengujian lintas fitur. Buat folder ketika diperlukan.

## Perintah Pengembangan

Lihat README untuk bootstrap Docker dan lockfile. Script tersedia: `npm run dev`, `npm run typecheck`, `npm run build`, `npm run preview`, dan `npm run lint`. Lockfile sudah sinkron dengan manifest. Audit container pada 11 November 2026 menemukan 0 kerentanan; lint/typecheck/build lulus. Gunakan `npm ci` untuk mengikuti lockfile. `npm test` menjalankan 45 tes Node.js untuk validasi formulir, sesi demo, alur laporan, ekspor/reset, navigasi, dan batas akses tiga peran demo (pelapor, admin, pesurvei). Lihat `docs/prd.md`. UI akun tanpa backend: satu login, pendaftaran pelapor dan pengajuan pesurvei dengan simulasi verifikasi email, persetujuan admin, penugasan oleh admin, serta penonaktifan. Metadata akun/laporan disimpan bersama tanpa password pengguna; semua akun demo memakai kredensial uji bersama. Undangan/pemulihan masih pratinjau; demo jelajah hanya pemilik. Lihat `docs/role-flows.md`. Lihat `docs/account-flow.md`; lihat `docs/access-matrix.md`. Catatan UI tersimpan lokal di sessionStorage selama sesi tab jika tersedia; backend dan autentikasi belum tersedia. Gunakan Node.js sesuai `.nvmrc`; commit manifest dan lockfile bersama setelah instalasi berhasil.

## Gaya Kode dan Pengujian

Gunakan TypeScript strict, komponen fungsi React, indentasi dua spasi, PascalCase untuk komponen, dan camelCase untuk fungsi serta variabel. Konfigurasi ESLint dan Prettier tersedia; lint dan typecheck telah lulus. Hindari `any` tanpa alasan. Rencanakan Vitest dan React Testing Library untuk pengujian perilaku berikutnya, dengan nama `*.test.ts` atau `*.test.tsx`. Uji validasi formulir, alur status, pembatasan akses, dan disclaimer. Target cakupan belum ditetapkan. Uji keamanan sejak pengembangan dan sebelum rilis, termasuk otorisasi server serta privasi QR. Lakukan UAT berbasis tugas dan pengujian eksploratif bersama perwakilan pengguna di staging. Uji pemahaman panduan pengguna dan batas RVS. Catat hasil, perbaiki penghambat, dan uji ulang sebelum publikasi; lihat kriteria rilis di `docs/plan.md`.

## Kontribusi dan Keamanan

Git lokal dan commit dokumentasi awal tersedia. Gunakan subjek commit singkat berbentuk tindakan. PR menjelaskan tujuan, perubahan, pengujian, isu terkait, dan tangkapan layar untuk perubahan UI. Jelaskan langkah secara sederhana untuk kontributor pemula. Jangan commit rahasia atau data pribadi. Gunakan data demonstrasi berlabel, tanpa hasil RVS rekaan. Akses produksi harus ditegakkan di server. Remote GitHub adalah `rkthooriq/SeismoPass`. Pengguna mengizinkan tampilan awal terinspirasi Spline dengan layout responsif; publikasi website belum dilakukan. Gunakan Grid/Flexbox dan konten fleksibel, bukan koordinat tetap untuk layout utama. Hormati reduced motion. Ikuti README untuk Docker; penguncian digest masih tertunda.
