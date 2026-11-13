# SeismoPass

SeismoPass adalah web pencatatan bangunan, penyaringan awal RVS (_Rapid Visual Screening_), profil digital/QR, serta tindak lanjut bersama ahli. Dibangun dengan React, TypeScript, dan Vite.

Saat ini berupa aplikasi frontend dengan tiga peran: pelapor, admin, dan pesurvei. Landing page memuat data bencana dan risiko gempa dari sumber resmi yang dikutip esai SeismoPass. Tampilan tidak memakai label "demo"; data bawaan diberi label "contoh".

Panel **Gempa Bandung Raya** menyaring 15 laporan gempa dirasakan terbaru dari Data Terbuka BMKG berdasarkan nama wilayah Bandung Raya, dengan atribusi serta pemeriksaan setiap menit saat tab terlihat. Ini bukan katalog lengkap gempa lokal dan tidak menentukan sesar penyebab. Peta lokasi OpenStreetMap menandai pusat gempa menggunakan koordinat BMKG dan dapat diperbesar; ini bukan peta intensitas guncangan. Kartu sejajar di sebelahnya langsung membuka konteks historis Sesar Lembang, terpisah dari data terbaru maupun penilaian bangunan.

> **Catatan teknis:** backend belum tersedia. Data disimpan di browser selama sesi tab, verifikasi email masih disimulasikan, dan pendaftaran hanya menerima alamat `@example.com`.

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

Untuk menyiapkan website di hosting, jalankan `npm run build`. Gunakan perintah build **`npm run build`** dan direktori hasil **`dist`** pada layanan hosting yang nanti dipilih. `npm run preview` hanya untuk memeriksa build secara lokal. Website belum dipublikasikan.

## Akun bawaan

Buka **http://localhost:5173/#/login**. Tiga akun bawaan berikut memakai kata sandi **`SeismoDemo123!`**.

| Peran                 | Email                  |
| --------------------- | ---------------------- |
| Pelapor               | `pelapor@example.com`  |
| Admin                 | `admin@example.com`    |
| Pesurvei aktif contoh | `pesurvei@example.com` |

Urutan singkat—gunakan **satu tab yang sama**, lalu keluar/masuk saat berganti akun:

1. **Pelapor:** buat laporan bangunan dengan data contoh (bukan data pribadi), lalu kirim.
2. **Admin:** periksa di **Laporan masuk**, lalu tentukan pesurvei di **Penugasan survei**.
3. **Pesurvei:** buka **Penugasan saya**, mulai survei, isi catatan/input simulasi RVS, lalu kirim ke admin.
4. **Admin:** tinjau catatan; minta revisi atau tutup administrasi. Pelapor dapat memantau statusnya.

Sesi baru langsung berisi delapan laporan contoh (nama dan nomor rekaan) di semua tahap, sehingga setiap peran punya sesuatu untuk dikerjakan:

| Laporan              | Status        | Dipakai untuk mendemokan                                      |
| -------------------- | ------------- | ------------------------------------------------------------- |
| Balai warga contoh   | Dikirim       | Admin memverifikasi lalu memasukkan ke antrean                |
| Rumah dua lantai     | Siap disurvei | Admin menugaskan ke pesurvei                                  |
| Kos putri Melati     | Ditugaskan    | Pesurvei menekan Mulai survei                                 |
| SDN Cisarua          | Dalam survei  | Pesurvei mengisi input RVS dan catatan kunjungan              |
| Ruko Pasar Contoh    | Ditinjau      | Admin menutup administrasi atau meminta revisi (ada simulasi) |
| Rumah Pak Dedi       | Perlu revisi  | Pesurvei memperbaiki catatan sesuai permintaan admin          |
| Pustu Cisarua        | Selesai       | Melihat profil bangunan, simulasi, dan riwayat lengkap        |
| Rumah baru di Cipada | Draf          | Pelapor melengkapi lalu mengirim                              |

Sesi lama dari versi sebelumnya diabaikan otomatis; cukup muat ulang halaman.

Untuk mencoba pesurvei baru: admin membuka **Kelola pesurvei → Tambah pesurvei**, lalu mencatat email `@example.com` dan sandi sementara yang dibuat sistem. Pesurvei masuk dengan sandi tersebut dan wajib menggantinya dengan sandi baru sebelum menerima tugas. Sandi akun buatan admin tidak dipulihkan setelah refresh; admin dapat menerbitkan sandi sementara baru.

Latihan RVS dan QR: **http://localhost:5173/#/rvs-lab** (menunya hanya ada di dashboard pesurvei; alamatnya tetap bisa dibuka langsung). Setelah refresh, masuk lagi; data bertahan selama sesi tab jika penyimpanan browser tersedia, tanpa sinkronisasi antarperangkat.

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
