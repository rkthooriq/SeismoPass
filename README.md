# SeismoPass

SeismoPass adalah prototipe web paspor ketahanan gempa bangunan untuk Bandung Raya, dikembangkan sebagai pendukung esai IYEEA 2026. Aplikasi ini memperagakan pencatatan bangunan, alur laporan pelapor–admin–pesurvei, profil digital, serta simulasi pendidikan RVS (_Rapid Visual Screening_).

Dibangun dengan React, TypeScript, dan Vite. Halaman depan menampilkan informasi gempa dari BMKG serta peta lokasi menggunakan Leaflet dan OpenStreetMap.

> Aplikasi masih berupa frontend dengan data contoh; backend dan autentikasi produksi belum tersedia. Data percobaan disimpan selama sesi tab browser jika tersedia. RVS adalah penyaringan awal, **bukan sertifikat aman**, dan tidak menggantikan evaluasi ahli struktur.

## Clone proyek

Siapkan Git dan Node.js **24.11.0** sesuai [`.nvmrc`](.nvmrc), lalu jalankan:

```bash
git clone https://github.com/rkthooriq/SeismoPass.git
cd SeismoPass
```

## Jalankan aplikasi

```bash
npm ci
npm run dev
```

Buka alamat yang ditampilkan terminal, biasanya **http://localhost:5173**. Jika port sudah digunakan, Vite akan memilih port lain. Hentikan aplikasi dengan **Ctrl+C**.

Tidak perlu membuat file `.env` untuk menjalankan prototipe saat ini. Informasi BMKG dan peta memerlukan koneksi internet. Gunakan data fiktif ketika mencoba.

Untuk mencoba login, gunakan `pelapor@example.com`, `admin@example.com`, atau `pesurvei@example.com` dengan kata sandi contoh **`SeismoDemo123!`**.

Untuk memeriksa build secara lokal:

```bash
npm run build
npm run preview
```
