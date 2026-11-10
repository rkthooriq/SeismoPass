# Catatan Verifikasi Landing Page Awal

## Ruang Lingkup

Landing page lokal, tanpa backend, login, data nyata, QR aktif, atau perhitungan RVS. Desain terinspirasi Spline; tidak menggunakan aset atau embed dari situs tersebut. SVG ilustrasi dibuat khusus di source. Tidak ada klaim pengujian produksi.

## Pemeriksaan yang Dilakukan

- JSON `package.json` dan `tsconfig.json` berhasil diparse.
- `node --check eslint.config.js` berhasil; ini hanya pemeriksaan sintaks konfigurasi, bukan lint aplikasi.
- `docker compose config --quiet` berhasil; ini validasi konfigurasi, bukan menjalankan container.
- `git diff --check` tidak melaporkan masalah pada perubahan tracked saat pemeriksaan.
- Tinjauan source: layout utama memakai Grid/Flexbox, SVG memiliki viewBox, menu memiliki aria-expanded, fokus keyboard dan skip link tersedia, preferensi reduced motion ditangani.

## Batas Lingkungan dan Pekerjaan Tertunda

Pada pemeriksaan awal, akses registry dan socket Docker dibatasi. Pada 11 November 2026, pemeriksaan dengan akses Docker yang disetujui berhasil: lockfile cocok dengan manifest, `npm audit` melaporkan 0 kerentanan, `npm run lint` lulus, dan `npm run build` (termasuk typecheck) lulus dengan Vite 7.3.8. Build menghasilkan `dist/`, yang diabaikan Git.

Dev server, verifikasi browser lintas perangkat, aksesibilitas nyata, dan UAT belum diverifikasi oleh agen. Kunci digest base image dan lakukan pemeriksaan manual berikut sebelum publikasi. Catat versi commit, perangkat/browser, hasil aktual, temuan, dan uji ulang.

## Skenario Responsif dan Fungsi (Belum Dijalankan)

| Pemeriksaan | Hasil yang diharapkan |
| --- | --- |
| Lebar 320, 375, 390, 768, 1024, 1440, 1920 px | Tidak ada scroll horizontal, konten bertumpuk sesuai ruang, tidak saling menutupi |
| HP portrait/landscape dan zoom 200% | Teks dan tombol tetap terbaca serta dapat dijangkau |
| Navigasi HP | Menu dapat dibuka/ditutup, tautan menuju bagian dan menutup menu |
| Ilustrasi/contoh profil | Kedua tombol mengganti konten dan aria-pressed sesuai pilihan |
| FAQ | Pertanyaan dapat dibuka/ditutup melalui sentuhan dan keyboard |
| Keyboard | Skip link, fokus terlihat, urutan fokus masuk akal, tidak ada focus trap |
| Reduced motion | Gulir halus dan transform dekoratif dinonaktifkan |
| Chrome, Firefox, Safari | Alur dan layout diperiksa pada tiap browser yang tersedia |

## Keamanan dan UAT (Belum Dijalankan)

Setelah instalasi, lakukan audit dependensi dan tinjau temuan, bundle, serta konfigurasi. Docker hanya mempublikasikan port pada loopback host dan tidak memerlukan privileged mode. Pengujian otorisasi server dilakukan saat backend tersedia, bukan diklaim lulus pada landing page.

Skenario UAT: peserta menemukan pengantar, melihat profil contoh, membuka FAQ, serta menjelaskan bahwa RVS bukan sertifikat aman dan “belum dinilai” bukan hasil pemeriksaan. Gunakan `docs/user-manual.md` tanpa arahan pengembang, lalu lakukan eksplorasi bebas dalam cakupan demo. Peserta, kriteria penerimaan terukur, dan penanggung jawab belum ditentukan. Publikasi tetap mengikuti kriteria rilis di `docs/plan.md`.


## Tindak Lanjut Audit Dependensi

Instalasi dalam container berhasil menurut laporan pengguna dan `package-lock.json` kini tersedia. Audit pengguna menemukan 8 temuan: 7 moderate pada rantai typescript-eslint/minimatch dan 1 high pada Vite. Jumlah tersebut mencakup paket induk yang terdampak, bukan delapan kerentanan independen yang sudah dianalisis.

Perubahan kandidat pada manifest:

- Vite `7.2.2` → `7.3.8`, sesuai rilis resmi dan saran audit pengguna.
- Override terbatas `@typescript-eslint/typescript-estree` → `minimatch: 11.0.1`. Advisory GHSA-g3hv-75wg-m249 menyebut versi perbaikan 11.0.1. Override ini melompati rentang mayor minimatch 9 yang diminta induk; kompatibilitas belum dibuktikan. Tidak mengubah minimatch untuk semua paket dan tidak menurunkan typescript-eslint secara otomatis.

Sumber: https://github.com/vitejs/vite/releases/tag/v7.3.8 dan https://github.com/advisories/GHSA-g3hv-75wg-m249.

**Pembaruan 11 November 2026:** lockfile sudah sinkron dengan manifest; Vite terkunci pada 7.3.8 dan minimatch di bawah typescript-estree pada 11.0.1. Audit aktual di container melaporkan 0 kerentanan; lint dan build termasuk typecheck lulus. Ini tidak menggantikan pengujian browser/UAT atau membuktikan kompatibilitas semua perilaku. Perintah di bawah merupakan riwayat langkah remediasi; kolaborator mengikuti lockfile dengan `npm ci`.

```bash
docker compose down
docker compose run --rm web npm install
docker compose run --rm web npm audit
docker compose run --rm web npm run lint
docker compose run --rm web npm run build
```

Hentikan urutan jika instalasi, lint, atau build gagal dan simpan laporan. Tidak perlu menghapus volume atau lockfile. `npm audit` dapat keluar dengan status nonnol karena temuan; pesan tambahan Compose tidak berarti konfigurasi Docker rusak. Setelah pemeriksaan lulus, jalankan `docker compose up --build` dan periksa fungsi halaman.
