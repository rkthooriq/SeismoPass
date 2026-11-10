# Repository Guidelines

## Tujuan dan Sumber Kebutuhan

SeismoPass adalah web untuk pencatatan bangunan, penyaringan awal RVS, profil digital, rujukan ahli, rencana retrofit, serta insentif dan evaluasi. Baca `docs/SeismoPass App Flow.md` sebagai sumber kebutuhan dan `docs/plan.md` sebagai rencana implementasi. Bedakan ketentuan sumber, usulan teknis, dan hal **BELUM DIPUTUSKAN**.

## Batasan Domain

RVS merupakan penyaringan awal, **bukan sertifikat aman**. Jangan menciptakan rumus, skor, kategori risiko, ambang rujukan, atau hasil screening. Implementasi penilaian menunggu protokol dan validasi ahli struktur. Tampilkan penjelasan keterbatasan RVS pada profil dan halaman QR. Jangan menjanjikan insentif fiskal, pembiayaan, atau asuransi yang belum disepakati.

## Struktur Proyek

Saat ini ada dokumentasi dan kerangka folder; aplikasi belum dibuat. Stack yang dipilih adalah React, TypeScript, dan Vite. Struktur yang tersedia: `src/components/` untuk UI bersama, `src/features/` untuk fitur, `src/pages/` untuk halaman, `src/types/` untuk tipe data, `src/lib/` untuk utilitas, `src/assets/` untuk aset, dan `tests/` untuk pengujian lintas fitur. Buat folder ketika diperlukan.

## Perintah Pengembangan

Belum ada `package.json` atau perintah yang dapat dijalankan. Saat setup, sediakan dan verifikasi `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, serta `npm test`. Dokumentasikan kebutuhan Node.js dan cara instalasi di README. Commit manifest dan lockfile bersama.

## Gaya Kode dan Pengujian

Gunakan TypeScript strict, komponen fungsi React, indentasi dua spasi, PascalCase untuk komponen, dan camelCase untuk fungsi serta variabel. Rencanakan ESLint dan Prettier; konfigurasinya belum tersedia. Hindari `any` tanpa alasan. Gunakan Vitest dan React Testing Library saat implementasi, dengan nama `*.test.ts` atau `*.test.tsx`. Uji validasi formulir, alur status, pembatasan akses, dan disclaimer. Target cakupan belum ditetapkan. Uji keamanan sejak pengembangan dan sebelum rilis, termasuk otorisasi server serta privasi QR. Lakukan UAT berbasis tugas dan pengujian eksploratif bersama perwakilan pengguna di staging. Uji pemahaman panduan pengguna dan batas RVS. Catat hasil, perbaiki penghambat, dan uji ulang sebelum publikasi; lihat kriteria rilis di `docs/plan.md`.

## Kontribusi dan Keamanan

Belum ada riwayat Git. Gunakan subjek commit singkat berbentuk tindakan. PR menjelaskan tujuan, perubahan, pengujian, isu terkait, dan tangkapan layar untuk perubahan UI. Jelaskan langkah secara sederhana untuk kontributor pemula. Jangan commit rahasia atau data pribadi. Gunakan data demonstrasi berlabel, tanpa hasil RVS rekaan. Akses produksi harus ditegakkan di server. Pengguna mengizinkan penyiapan repositori GitHub; owner dan visibilitas masih perlu ditentukan. Ikuti alur clone, branch, PR, dan rencana Docker di README. Docker disiapkan saat setup aplikasi, dengan runtime/image terkunci dan lockfile. Belum ada izin menulis aplikasi atau menerbitkan website.
