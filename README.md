# SeismoPass

Web untuk pencatatan bangunan dan tindak lanjut penyaringan awal RVS (Rapid Visual Screening).

> **RVS bukan sertifikat aman.** Metode dan hasil penilaian harus berasal dari protokol yang divalidasi ahli struktur.


## Status

Demo front-end tanpa backend. Semua data fiktif dan tersimpan di `sessionStorage` browser (hilang saat tab ditutup).

Tiga peran demo:

| Peran | Tugas |
| --- | --- |
| Pelapor | Membuat draf dan mengirim laporan bangunan |
| Admin | Menyetujui akses pesurvei, menentukan penugasan, memeriksa dan meninjau laporan |
| Pesurvei | Mengajukan akses, mengerjakan penugasan admin, dan mencatat kunjungan |



## Cara Masuk untuk Demo

Setelah aplikasi berjalan, buka **http://localhost:5173/#/login**. Semua akun di bawah **fiktif**, memakai satu kata sandi bersama: `SeismoDemo123!`. Jangan pakai kata sandi ini untuk akun sungguhan.

| Peran | Email | Kondisi awal |
| --- | --- | --- |
| Admin | `admin@example.com` | Aktif; menyetujui pesurvei dan menugaskan laporan |
| Pelapor | `pelapor@example.com` | Aktif; punya satu laporan contoh |
| Pesurvei | `pesurvei@example.com` | Aktif; menunggu penugasan |
| Calon pesurvei | `calon@example.com` | Menunggu tinjauan admin |

Halaman masuk sengaja tidak menampilkan daftar akun dan tidak punya pilihan peran. Ketik email dan kata sandi di atas. Pelapor baru mendaftar lewat **Daftar**, calon pesurvei lewat **Ajukan akses** (email harus berakhiran `@example.com`).

**Urutan demo 5 menit** (pakai satu tab yang sama; keluar lalu masuk saat berganti akun):

1. **Pelapor:** masuk sebagai `pelapor@example.com`, klik **Buat laporan**, isi data bangunan, kirim. Lihat kartu **Langkah berikutnya** di Laporan saya.
2. **Admin:** masuk sebagai `admin@example.com`. Buka **Pengajuan pesurvei**, setujui `calon@example.com`. Lalu **Laporan masuk**, periksa kelengkapan, dan **Penugasan survei**: pilih pesurvei dan isi catatan.
3. **Pesurvei:** masuk sebagai `pesurvei@example.com`, buka **Penugasan saya**, mulai, isi simulasi RVS bila perlu, kirim catatan kunjungan.
4. **Admin:** buka **Tinjauan catatan**, minta revisi atau tutup administrasi.
5. **Pelapor:** masuk lagi, lihat status di **Laporan saya**. Hasil tetap "Belum dinilai"; RVS bukan sertifikat aman.

**Alur pesurvei dari awal:** buka **Ajukan akses** di halaman masuk, isi email baru `@example.com`, simulasikan verifikasi email, keluar, lalu masuk admin untuk menyetujuinya.

Catatan:
- Data tersimpan di `sessionStorage` tab itu: tetap ada setelah refresh, hilang saat tab ditutup. Tidak tersinkron antartab atau perangkat. Setelah refresh, **masuk lagi**.
- Mau mengulang dari awal: tutup tab, buka lagi.

## Menjalankan

Pilih salah satu. Butuh Docker **atau** Node.js sesuai `.nvmrc` (24.11.0).

**Docker** (Node tidak perlu dipasang):

```bash
docker compose up --build
```

**Tanpa Docker:**

```bash
npm ci
npm run dev
```

Buka `http://localhost:5173`. Jika `npm ci` gagal karena lockfile tidak cocok, jangan `npm audit fix --force`; minta penyusun dependensi memperbaiki `package.json` dan `package-lock.json` bersama.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Dev server Vite (port 5173) |
| `npm test` | Tes Node.js untuk logika (validasi, sesi, rute, akses, alur laporan) |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm run lint` | Cek kode dengan ESLint |
| `npm run build` | Typecheck lalu build produksi ke `dist/` |
| `npm run preview` | Pratinjau build lokal |
| `npm run format` | Format dengan Prettier |

Dengan Docker, awali dengan `docker compose run --rm web`, misalnya `docker compose run --rm web npm test`.

## Struktur

| Lokasi | Isi |
| --- | --- |
| `src/App.tsx` | Pengatur utama: routing berbasis hash dan state |
| `src/pages/` | Halaman utuh (landing page) |
| `src/features/` | Fitur: `access/` (masuk), `reports/` (alur laporan), `workspace/` (bangunan) |
| `src/components/` | Komponen bersama |
| `src/lib/` | Logika murni tanpa React (validasi, aturan akses, status laporan, sesi) |
| `src/types/` | Tipe data bersama |
| `src/assets/`, `public/` | Aset gambar; berkas publik (tanpa data pribadi) |
| `tests/` | Pengujian |

## Dokumen


## Berkontribusi

Remote: `https://github.com/rkthooriq/SeismoPass.git`. Alur: **branch → perubahan → tes → commit → push → pull request → review → merge**.

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/nama-pekerjaan
# ... edit, lalu jalankan: npm run lint && npm run typecheck && npm test
git add <berkas>
git commit -m "Tambah ..."
git push -u origin feat/nama-pekerjaan
```

- Satu branch untuk satu pekerjaan. Jangan force-push branch bersama.
- PR berisi tujuan, perubahan, hasil tes, dan screenshot untuk perubahan UI.
- Jangan commit rahasia atau data pribadi. Gunakan data fiktif berlabel.
- Perubahan dependensi: commit `package.json` dan `package-lock.json` bersama.
- CI belum tersedia; jangan mengklaim sudah berjalan.

## Aturan penting

- Jangan membuat rumus, skor, atau kategori risiko sendiri. Menunggu protokol ahli.
- Jangan menjanjikan insentif, pembiayaan, atau asuransi.
- Tampilkan batas RVS di profil dan halaman QR.
- Kontrol akses produksi harus ditegakkan di server, bukan hanya di UI.
- Jangan menaruh rahasia di variabel `VITE_*`; nilainya terlihat di browser.
