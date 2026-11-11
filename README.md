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


Akun uji tampil di halaman masuk: `http://localhost:5173/#/login`. Gunakan satu tab saat berganti akun.


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
