# SeismoPass

SeismoPass adalah web pencatatan bangunan, penyaringan awal RVS (_Rapid Visual Screening_), profil digital/QR, serta tindak lanjut bersama ahli. Dibangun dengan React, TypeScript, dan Vite.

Saat ini berupa **demo frontend** dengan tiga peran: pelapor, admin, dan pesurvei. Data fiktif disimpan selama sesi tab; verifikasi email dan akses akun masih simulasi tanpa backend.

> **RVS bukan sertifikat aman.** Perhitungan yang tersedia adalah simulasi tabel FEMA; penilaian resmi memerlukan protokol dan validasi ahli. Insentif belum tersedia.

## Jalankan lokal

Install Git serta Node.js **24.11.0** sesuai [`.nvmrc`](.nvmrc), lalu jalankan:

```bash
git clone https://github.com/rkthooriq/SeismoPass.git
cd SeismoPass
npm ci
npm run dev
```

Jika proyek sudah ada, cukup jalankan `npm ci` dan `npm run dev` dari folder proyek. Buka **http://localhost:5173**; hentikan server dengan **Ctrl+C**.

Untuk menyiapkan demo di hosting, jalankan `npm run build`. Gunakan perintah build **`npm run build`** dan direktori hasil **`dist`** pada layanan hosting yang nanti dipilih. `npm run preview` hanya untuk memeriksa build secara lokal. Website belum dipublikasikan.

## Coba demo

Buka **http://localhost:5173/#/login**. Tiga akun bawaan berikut memakai kata sandi **`SeismoDemo123!`**.

| Peran                 | Email                  |
| --------------------- | ---------------------- |
| Pelapor               | `pelapor@example.com`  |
| Admin                 | `admin@example.com`    |
| Pesurvei aktif contoh | `pesurvei@example.com` |

Urutan singkat—gunakan **satu tab yang sama**, lalu keluar/masuk saat berganti akun:

1. **Pelapor:** buat laporan bangunan fiktif dan kirim.
2. **Admin:** periksa di **Laporan masuk**, lalu tentukan pesurvei di **Penugasan survei**.
3. **Pesurvei:** buka **Penugasan saya**, mulai survei, isi catatan/input simulasi RVS, lalu kirim ke admin.
4. **Admin:** tinjau catatan; minta revisi atau tutup administrasi. Pelapor dapat memantau statusnya.

Untuk mencoba pesurvei baru: admin membuka **Kelola pesurvei → Tambah pesurvei**, lalu mencatat email `@example.com` dan sandi sementara yang dibuat sistem. Pesurvei masuk dengan sandi tersebut dan wajib menggantinya dengan sandi fiktif baru sebelum menerima tugas. Sandi akun buatan admin tidak dipulihkan setelah refresh; admin dapat menerbitkan sandi sementara baru.

Panduan flow: **http://localhost:5173/#/flows**. Latihan RVS dan QR: **http://localhost:5173/#/rvs-lab**. Setelah refresh, masuk lagi; data bertahan selama sesi tab jika penyimpanan browser tersedia, tanpa sinkronisasi antarperangkat.

## Kolaborasi GitHub

Alur kerja: **ambil perubahan terbaru → buat branch → kerjakan → uji → commit/push → pull request → review → merge**.

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/nama-fitur
```

- Sebelum PR, jalankan pemeriksaan berikut dari folder proyek:

```bash
npm run lint
npm test
npm run build
```

- Commit berkas yang memang diubah, beri pesan singkat, lalu push branch dan buat PR ke `main`. PR menjelaskan tujuan, perubahan, hasil pemeriksaan, dan screenshot untuk perubahan UI.
- Minta review sebelum merge. Jangan force-push branch bersama atau menimpa pekerjaan orang lain.
- Jangan commit rahasia/data pribadi. Jika dependensi berubah, sertakan `package.json` dan `package-lock.json` bersama.

