# SeismoPass

**Prototipe web paspor ketahanan gempa bangunan untuk Bandung Raya.**

SeismoPass menghubungkan pencatatan bangunan, penyaringan awal RVS (_Rapid Visual Screening_), profil digital/QR, serta tindak lanjut bersama ahli. Proyek ini dikembangkan sebagai pendukung esai IYEEA 2026 untuk memperagakan alur layanan dalam konteks Bandung Raya dan Sesar Lembang.

**Status:** prototipe frontend dengan data contoh dan tiga peran: pelapor, admin, dan pesurvei. Backend dan autentikasi produksi belum tersedia. Tautan website publik belum dicantumkan; aplikasi dapat dicoba secara lokal mengikuti petunjuk di bawah.

> **RVS bukan sertifikat aman.** Perhitungan yang tersedia adalah simulasi pendidikan tabel FEMA P-154 HIGH Level 1, tanpa kategori risiko atau ambang rujukan otomatis. Hasilnya tidak menggantikan evaluasi ahli struktur. Penilaian resmi memerlukan protokol dan validasi ahli.

## Fitur

| Bagian              | Kemampuan saat ini                                                                  |
| ------------------- | ----------------------------------------------------------------------------------- |
| Halaman depan       | Informasi gempa BMKG, peta pusat gempa, dan statistik dengan sumber data.           |
| Pelapor             | Mencatat bangunan, mengirim laporan, melihat profil, dan memantau status.           |
| Admin               | Memeriksa laporan, menugaskan pesurvei, meninjau catatan, dan mengelola pesurvei.   |
| Pesurvei            | Membuka penugasan, mencatat survei, dan mengirim catatan untuk ditinjau.            |
| Impor pesurvei      | Membaca CSV/Excel secara lokal, memvalidasi data, dan menampilkan pratinjau.        |
| Simulasi pendidikan | Input FEMA P-154 HIGH Level 1, hasil simulasi, dan QR untuk membuka input simulasi. |
| Profil akun         | Melihat dan memperbarui nama serta organisasi pengguna.                             |

### Batas prototipe

- Metadata akun dan laporan disimpan dalam `sessionStorage` selama sesi tab jika tersedia, tanpa sinkronisasi antarperangkat.
- Sesi masuk dan kata sandi pengguna berada di memori tab. Setelah refresh, pengguna perlu masuk kembali. Pemulihan akun mandiri belum tersedia.
- Pendaftaran hanya menerima alamat `@example.com`, dan verifikasi email disimulasikan.
- Pembatasan akses frontend memperagakan alur peran; autentikasi dan otorisasi server belum tersedia.
- Gunakan identitas serta data bangunan fiktif ketika mencoba. Akun bawaan adalah akun uji dengan kredensial yang sengaja dibagikan.
- Layanan ahli, pelaksanaan retrofit, pembiayaan, asuransi, dan insentif belum beroperasi. Konsep tersebut memerlukan validasi atau kerja sama lebih lanjut.

## Teknologi

- **React, TypeScript, dan Vite** untuk antarmuka, logika, serta build frontend.
- **CSS** untuk layout responsif, tema warna tanah, efek kaca, dan dukungan reduced motion.
- **Leaflet dan OpenStreetMap** untuk peta pusat gempa.
- **Papa Parse dan read-excel-file** untuk impor CSV/Excel; **qrcode** untuk QR.
- **ESLint, Prettier, dan Node.js test runner** untuk pemeriksaan kode.

## Jalankan lokal

Siapkan Git serta Node.js **24.11.0** sesuai [`.nvmrc`](.nvmrc). npm tersedia bersama Node.js. Jika menggunakan nvm, jalankan `nvm install` dan `nvm use` dari folder proyek. Kemudian jalankan:

```bash
git clone https://github.com/rkthooriq/SeismoPass.git
cd SeismoPass
npm ci
npm run dev
```

Jika proyek sudah ada, cukup jalankan `npm ci` dan `npm run dev` dari folder proyek. Buka alamat yang ditampilkan terminal, biasanya **http://localhost:5173**. Vite dapat memilih port lain jika port tersebut sudah dipakai. Hentikan server dengan **Ctrl+C**.

Instalasi standar saat ini tidak memerlukan konfigurasi `.env`. Data BMKG dan peta memerlukan koneksi internet.

## Build dan hosting

```bash
npm run build
npm run preview
```

Pada hosting statis yang dipilih, gunakan Node.js **24.11.0**, perintah instalasi **`npm ci`**, perintah build **`npm run build`**, dan direktori publikasi **`dist`**. `npm run preview` hanya untuk memeriksa build secara lokal.

Navigasi aplikasi menggunakan hash (`/#/...`). Publikasi frontend mempertahankan batas prototipe di atas; backend tidak otomatis tersedia setelah deploy. Layanan hosting belum ditetapkan dalam dokumentasi ini.

## Akun bawaan

Buka `/#/login` pada alamat server lokal. Tiga akun bawaan berikut memakai kata sandi **`SeismoDemo123!`**. Kredensial ini khusus prototipe dan bukan rahasia produksi.

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

Status administratif seperti **Selesai** tidak menyatakan bangunan aman.

Untuk mencoba pesurvei baru: admin membuka **Kelola pesurvei → Tambah pesurvei**, lalu mencatat email `@example.com` dan sandi sementara yang dibuat sistem. Pesurvei masuk dengan sandi tersebut dan wajib menggantinya dengan sandi baru sebelum menerima tugas. Sandi akun buatan admin tidak dipulihkan setelah refresh; admin dapat menerbitkan sandi sementara baru.

Alamat lain yang dapat dibuka pada server lokal:

| Alamat        | Kegunaan                                |
| ------------- | --------------------------------------- |
| `/`           | Halaman depan.                          |
| `/#/register` | Pendaftaran pelapor dengan data fiktif. |
| `/#/contoh`   | Ruang kerja contoh pemilik bangunan.    |
| `/#/rvs-lab`  | Simulasi pendidikan RVS dan QR.         |

## Data gempa dan sumber

Panel **Gempa Bandung Raya** menyaring [15 laporan gempa dirasakan terbaru BMKG](https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json) berdasarkan nama wilayah pada kolom `Dirasakan`. Aplikasi memeriksa pembaruan setiap menit ketika tab terlihat, dengan cache dalam tab.

Pusat gempa dapat berada di luar Bandung Raya. Tidak ditemukannya laporan yang sesuai bukan berarti tidak terjadi gempa atau kawasan dinyatakan aman. Feed ini bukan katalog lengkap gempa lokal dan tidak menentukan sesar penyebab.

Peta menggunakan Leaflet dengan tile OpenStreetMap dan penanda koordinat BMKG. Peta menunjukkan pusat gempa, bukan intensitas guncangan atau radius dampak. Kartu statistik di sebelahnya membuka tab **Statistik** secara default; data historis terpisah dari laporan terbaru dan penilaian bangunan.

- [Data Gempabumi Terbuka BMKG](https://data.bmkg.go.id/gempabumi/).
- [Atribusi OpenStreetMap](https://www.openstreetmap.org/copyright).
- Angka statistik dan rujukan esai: [`src/lib/disasterData.ts`](src/lib/disasterData.ts).
- Penyaringan laporan dan validasi koordinat: [`src/lib/bmkg.ts`](src/lib/bmkg.ts).
- Acuan dan tabel simulasi FEMA: [`src/lib/rvs.ts`](src/lib/rvs.ts).

## Perintah pengembangan

| Perintah            | Fungsi                                             |
| ------------------- | -------------------------------------------------- |
| `npm ci`            | Memasang dependensi sesuai lockfile.               |
| `npm run dev`       | Menjalankan server pengembangan.                   |
| `npm run typecheck` | Memeriksa tipe TypeScript.                         |
| `npm run lint`      | Memeriksa aturan kode.                             |
| `npm test`          | Menjalankan tes logika aplikasi.                   |
| `npm run build`     | Memeriksa tipe dan membuat build di `dist/`.       |
| `npm run preview`   | Memeriksa hasil build secara lokal.                |
| `npm run format`    | Memformat file proyek; perintah ini mengubah file. |

## Struktur proyek

```text
src/
  assets/       Gambar, ilustrasi, dan font
  components/   Komponen tampilan bersama
  features/     Akun, laporan, profil, RVS, dan informasi gempa
  lib/          Validasi, data contoh, integrasi, dan logika alur
  pages/        Halaman depan
  types/        Tipe data bersama
  App.tsx       Pengaturan halaman dan state aplikasi
  main.tsx      Titik masuk React
public/         File publik dan template impor pesurvei
tests/          Pengujian logika aplikasi
```

## Menelusuri kode

- Mulai dari [`src/main.tsx`](src/main.tsx) dan [`src/App.tsx`](src/App.tsx) untuk memahami titik masuk dan pengaturan halaman.
- Halaman publik disusun di [`src/pages/LandingPage.tsx`](src/pages/LandingPage.tsx).
- Data contoh dan alur laporan ada di [`src/lib/reportDemo.ts`](src/lib/reportDemo.ts).
- Penyimpanan sesi dan akun bawaan diatur di [`src/lib/demoDirectory.ts`](src/lib/demoDirectory.ts).
- Pengujian logika tersedia di [`tests/`](tests/).

## Kolaborasi GitHub

Baca cakupan dan batas prototipe pada README ini sebelum mengubah fitur. Diskusikan perubahan besar melalui issue atau pull request, khususnya yang menyangkut penilaian struktur dan alur peran.

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
- Jangan membuat kategori risiko, ambang rujukan, atau hasil screening tanpa protokol yang disahkan.

## Lisensi

Lisensi penggunaan ulang kode proyek belum ditetapkan; berkas `LICENSE` belum tersedia. Hubungi pengelola melalui GitHub sebelum menggunakan kembali kode di luar izin yang berlaku. Font dan dependensi pihak ketiga mengikuti lisensinya masing-masing; lisensi font tersedia di [`src/assets/fonts/`](src/assets/fonts/).

Komponen [`liquid-glass-navbar.tsx`](src/components/ui/liquid-glass-navbar.tsx) diadaptasi dari Nimbus UI Liquid Navbar “Waterline” oleh guglielmogiannattasio.it. Atribusi asal dipertahankan dalam kode; ketentuan penggunaan komponen asal perlu dipastikan sebelum memberikan lisensi menyeluruh pada proyek ini.
