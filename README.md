# SeismoPass

Web untuk pencatatan bangunan dan tindak lanjut penyaringan awal RVS. **RVS bukan sertifikat aman**; metode dan hasil penilaian harus berasal dari protokol yang divalidasi ahli.

## Status

Frontend demonstrasi tersedia dengan landing page dan workspace: ringkasan, daftar/pencarian/filter bangunan, formulir tambah/ubah dan draf, profil digital, halaman screening, rujukan, retrofit, dukungan/evaluasi, panduan, serta pratinjau informasi publik. Buka `http://localhost:5173/#/login` setelah server berjalan, pilih salah satu dari enam peran demo dan konfirmasi simulasi. Registrasi hanya mencatat data fiktif pada sesi tab browser (`sessionStorage`); refresh dan kembali ke landing page mempertahankan catatan jika penyimpanan tersedia. Menu **Data demo** menyediakan unduhan JSON dan reset dengan konfirmasi. Data tidak disinkronkan ke server; penutupan tab biasanya mengakhiri sesi, namun browser dapat memulihkannya bersama tab. UI masuk/keluar dan dashboard enam peran tersedia sebagai simulasi; belum ada akun nyata, backend, database, QR aktif, atau penilaian RVS. Peran demo direset saat refresh. Lihat [matriks hak akses](docs/access-matrix.md). Halaman profesional menampilkan keadaan belum tersedia, bukan hasil rekaan.

**Status verifikasi (11 November 2026):** instalasi pengguna menghasilkan lockfile yang cocok dengan manifest. Audit di container menemukan 0 kerentanan; lint, typecheck, dan build produksi lulus. Pengujian tampilan lintas perangkat dan UAT belum dilakukan. Halaman belum diterbitkan. Lihat [catatan verifikasi](docs/testing/landing-page.md).

## Struktur Folder

| Lokasi | Fungsi |
| --- | --- |
| `src/components/` | Komponen tampilan bersama |
| `src/features/` | Modul fitur, ditambahkan saat dikerjakan |
| `src/pages/` | Halaman aplikasi |
| `src/types/` | Tipe data bersama |
| `src/lib/` | Utilitas dan integrasi layanan |
| `src/assets/` | Gambar dan ikon yang diproses aplikasi |
| `public/` | Berkas publik; jangan menyimpan data pribadi |
| `tests/` | Pengujian lintas fitur |
| `docs/` | Kebutuhan, rencana, dan panduan |
| `docs/testing/` | Catatan UAT dan pengujian; belum ada hasil uji |

Berkas `.gitkeep` mempertahankan folder kosong dalam Git dan bukan kode aplikasi.

## Dokumen Acuan

- [Panduan kontribusi](AGENTS.md)
- [Alur produk](docs/SeismoPass%20App%20Flow.md)
- [Rencana hingga publikasi](docs/plan.md), termasuk keamanan, UAT, pengujian eksploratif, dan panduan pengguna

## Git dan GitHub: Lokal dan Daring

Git mencatat riwayat perubahan. GitHub menyimpan repositori daring untuk kolaborasi. Mengunggah repositori **tidak otomatis menerbitkan website**.

**Status:** Git lokal tersedia dan remote `origin` mengarah ke `https://github.com/rkthooriq/SeismoPass.git`. Ada commit dokumentasi awal. Visibilitas dan keadaan terbaru di GitHub belum diverifikasi. Perubahan landing page belum di-commit atau di-push oleh agen. Bagian unggah pertama di bawah hanya referensi untuk setup baru; jangan diulang pada repositori yang sudah terhubung.

### Unggah Pertama oleh Pemilik

1. Masuk ke GitHub, buat repositori bernama `SeismoPass`, pilih owner dan visibilitas sesuai keputusan tim.
2. Buat repositori kosong: jangan tambahkan README, `.gitignore`, atau lisensi otomatis karena berkas lokal sudah tersedia dan lisensi belum diputuskan.
3. Di terminal lokal, jalankan perintah berikut dari folder proyek. Perintah ini untuk kondisi awal yang belum memiliki repositori Git dan remote.

```bash
cd /Users/kemal/Documents/Project/SeismoPass
git init -b main
git status --short
git add README.md AGENTS.md .gitignore docs/ src/ public/ tests/
git diff --cached --stat
git diff --cached
git commit -m "Add project structure and contributor documentation"
git remote add origin https://github.com/rkthooriq/SeismoPass.git
git push -u origin main
```

Periksa isi staged sebelum commit; jangan sertakan rahasia atau data pribadi. Jika Git meminta identitas, atur `git config user.name "Nama Kamu"` dan `git config user.email "EMAIL_GIT_KAMU"` pada repositori ini. Autentikasi GitHub menggunakan credential manager/GitHub CLI atau SSH yang telah dikonfigurasi; jangan menaruh token di URL atau README. Bila repositori atau remote sudah ada, periksa `git status` dan `git remote -v` sebelum melanjutkan, jangan menginisialisasi atau menimpa remote secara sembarang.

### Clone untuk Anggota Tim

Pemilik memberi akses kolaborator sesuai kebutuhan; repositori Private memerlukan akses sebelum bisa di-clone. Dari folder induk tempat proyek akan disimpan:

```bash
git clone https://github.com/rkthooriq/SeismoPass.git
cd SeismoPass
git status
```

Clone dilakukan sekali per salinan kerja. Untuk pembaruan berikutnya gunakan pull, bukan clone ulang. Baca `AGENTS.md` dan `docs/plan.md` sebelum mengubah proyek. Setelah clone, ikuti bagian **Setelah Clone atau Pull oleh Tim** di bawah. Pemilik harus menyertakan `package.json`, `package-lock.json`, `Dockerfile`, dan `compose.yaml` dalam commit yang dibagikan. Kolaborator menggunakan lockfile tersebut; container menjalankan `npm ci` secara otomatis.

### Alur Kolaborasi Harian

Alur tim: **issue → branch → perubahan → pengujian → commit → push → pull request → review → merge**. Satu branch untuk satu pekerjaan; misalnya `docs/update-guide`, `feat/building-registration`, atau `fix/form-validation`.

Mulai ketika working tree bersih; commit pekerjaan sebelumnya atau simpan sementara dengan stash jika memang diperlukan.

```bash
git switch main
git pull --ff-only origin main
git switch -c docs/update-guide
```

Edit berkas dan jalankan pemeriksaan yang tersedia. Contoh commit untuk perubahan README saja:

```bash
git status
git diff
git add README.md
git diff --cached
git commit -m "Document collaboration workflow"
git push -u origin docs/update-guide
```

Di GitHub, buka PR dari branch tersebut ke `main`. Jelaskan tujuan, perubahan, cara pengujian dan hasilnya, hubungkan issue, serta tambahkan screenshot untuk UI. Minta rekan melakukan review; perbaikan berikutnya di-commit dan di-push ke branch yang sama. Setelah review dan pemeriksaan lulus, maintainer melakukan merge. Pada awal proyek belum ada pemeriksaan otomatis; jangan mengklaim CI sudah berjalan.

Setelah PR digabung dan tidak ada perubahan lokal yang belum disimpan:

```bash
git switch main
git pull --ff-only origin main
git fetch --prune origin
```

Branch kerja berikutnya dibuat dari `main` terbaru. Jika branch lama tertinggal, jalankan `git fetch origin` lalu `git merge origin/main` dari branch kerja yang bersih; selesaikan konflik, periksa ulang, commit jika diperlukan, dan push. Jika bingung saat konflik, `git merge --abort` membatalkan proses merge yang sedang berlangsung. Jangan force-push branch bersama atau menimpa pekerjaan rekan.

Usulan kebijakan tim: perubahan harian melalui PR, minimal satu reviewer jika ada rekan, dan perlindungan `main` serta pemeriksaan wajib jika pengaturan akun/repositori mendukungnya. Pengaturan ini belum diaktifkan.

## Kapan Menggunakan Docker / Container?

Container adalah lingkungan menjalankan aplikasi yang disusun dari sebuah image. GitHub menyamakan **kode dan riwayat**, sedangkan Docker membantu menyamakan **runtime dan dependensi**. Keduanya dipakai bersama.

### Konfigurasi yang Sudah Ditulis

- `Dockerfile`: lingkungan pengembangan Node.js `24.11.0-bookworm-slim`, berjalan sebagai pengguna `node`, bukan root.
- `compose.yaml`: service `web`, source bind mount untuk pengembangan, volume dependensi terpisah, port dibatasi ke komputer lokal.
- `.dockerignore`: mengecualikan metadata Git, dependensi lokal, hasil build, dan konfigurasi rahasia dari build context.
- `.nvmrc`: Node.js `24.11.0` untuk jalur pengembangan tanpa container.

**Container pemeriksaan berhasil dijalankan.** Audit, lint, typecheck, dan build lulus di container. Dev server dan tampilan browser belum diverifikasi oleh agen. Base image memakai tag versi tertentu; digest belum dikunci. `package-lock.json` sudah tersedia dan cocok dengan manifest. Kolaborator dapat mengikuti bagian **Setelah Clone atau Pull oleh Tim**.

### Pertama Kali Menjalankan (Pemilik / Penyusun Lockfile)

1. Jalankan Docker Desktop dan tunggu engine siap, atau gunakan Docker Engine + Compose yang sudah berjalan.
2. Dari folder proyek, buat lockfile dan instal dependensi dalam container:

```bash
docker compose config --quiet
docker compose run --build --rm web npm install
```

3. Periksa dan commit `package-lock.json` bersama `package.json` setelah instalasi, pemeriksaan, dan peninjauan dependensi berhasil. Jangan menjalankan `npm install` pada setiap clone jika lockfile sudah tersedia.
4. Jalankan lingkungan:

```bash
docker compose up --build
```

Alamat yang **dikonfigurasi** adalah `http://localhost:5173`; keberhasilan menyajikan halaman belum diverifikasi di lingkungan agen. Perubahan source dipantau Vite. Container menjalankan `npm ci` sebelum dev server agar mengikuti lockfile; perintah ini akan gagal jika lockfile belum dibuat.

### Setelah Clone atau Pull oleh Tim

Prasyarat: Git dan Docker Desktop (atau Docker Engine dengan Compose) sudah terpasang. Jalankan Docker Desktop dan tunggu engine siap. Node.js/npm tidak perlu dipasang di komputer host untuk jalur Docker.

1. Clone repositori jika belum memiliki salinan lokal, lalu masuk ke foldernya. Repositori Private memerlukan akses dari pemilik terlebih dahulu.

```bash
git clone https://github.com/rkthooriq/SeismoPass.git
cd SeismoPass
```

Jika sudah pernah clone, gunakan salinan yang ada. Ikuti alur Git di atas untuk mengambil perubahan tanpa menimpa pekerjaan lokal.

2. Pastikan branch berisi `package-lock.json`, lalu validasi konfigurasi dan jalankan web:

```bash
docker compose config --quiet
docker compose up --build
```

Container otomatis menjalankan `npm ci` dari lockfile, lalu dev server. Instalasi pertama dapat memerlukan waktu untuk mengunduh image dan dependensi. Biarkan terminal ini berjalan. Setelah Vite menampilkan bahwa server siap, buka **http://localhost:5173**. Perubahan source akan dipantau Vite.

3. Untuk memeriksa dependensi dan kode, buka terminal kedua di folder `SeismoPass` saat service `web` berjalan. Jalankan satu per satu dan periksa hasilnya:

```bash
docker compose exec web npm audit
docker compose exec web npm run typecheck
docker compose exec web npm run lint
docker compose exec web npm run build
```

Jika service belum berjalan, gunakan pemeriksaan sekali jalan berikut:

```bash
docker compose run --rm web npm audit
docker compose run --rm web npm run typecheck
docker compose run --rm web npm run lint
docker compose run --rm web npm run build
```

Perintah sekali jalan memerlukan dependensi yang sudah terinstal di volume container. Jika belum, jalankan `docker compose run --build --rm web npm ci` terlebih dahulu.

4. Untuk berhenti, tekan **Ctrl+C** pada terminal dev server, lalu:

```bash
docker compose down
```

Setelah pull perubahan dependensi atau Dockerfile, hentikan dengan `docker compose down`, lalu jalankan kembali `docker compose up --build` untuk mengulang instalasi dari lockfile. Jangan memakai `--volumes` sebagai langkah rutin; nantinya opsi itu juga dapat menghapus volume database.

### Jika Instalasi Menampilkan Pesan

- `npm notice New minor version of npm available` hanya pemberitahuan, bukan kegagalan instalasi. Tidak perlu menjalankan `npm install -g npm@...`; lanjutkan setelah perintah selesai dan prompt terminal kembali.
- Jika Docker tidak dapat terhubung ke daemon, pastikan Docker Desktop sudah berjalan dan engine siap, lalu ulangi perintah.
- Jika `npm ci` melaporkan ketidaksesuaian manifest dan lockfile, penyusun perubahan dependensi perlu menjalankan `docker compose run --build --rm web npm install`, memeriksa audit/lint/build, lalu menyertakan `package.json` dan `package-lock.json` bersama dalam commit. Kolaborator mengambil perbaikan tersebut.
- Jika audit, lint, atau build gagal, simpan output error untuk ditindaklanjuti. Jangan menganggap pemeriksaan lulus hanya karena ada pemberitahuan npm, dan jangan menjalankan `npm audit fix --force` tanpa meninjau dampak perubahan dependensi.

### Pilihan Tanpa Container

Gunakan Node.js sesuai `.nvmrc`. Jika lockfile sudah ada:

```bash
npm ci
npm run dev
```

Hanya penyusun lockfile pertama yang menggunakan `npm install` ketika lockfile belum ada. Jalur ini belum teruji di lingkungan agen. Host saat pemeriksaan menggunakan Node.js 26, berbeda dari versi proyek, sehingga container menjadi jalur yang diutamakan.

### Perintah dan Batas Pengujian

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan dev server Vite di port 5173 |
| `npm run typecheck` | Memeriksa tipe TypeScript |
| `npm run lint` | Memeriksa kode dengan ESLint |
| `npm run build` | Memeriksa tipe lalu membuat build produksi di `dist/` |
| `npm run preview` | Pratinjau build secara lokal; bukan server produksi |
| `npm run format` | Memformat source/dokumentasi dengan Prettier |

Jalankan `docker compose run --rm web npm test` untuk tes validasi formulir, penyimpanan sesi, ekspor/reset, navigasi, dan batas halaman enam peran (17 tes lulus pada 11 November 2026). Pengujian interaksi browser dan UAT belum dilakukan. Prosedur pemeriksaan manual tersedia di [catatan pengujian landing page](docs/testing/landing-page.md) dan [panduan pengguna awal](docs/user-manual.md).

### Agar Lingkungan Tim Konsisten

Gunakan commit kode yang sama, lockfile yang sama, dan runtime/image yang disepakati. Setelah akses registry tersedia, kunci base image dengan digest dan verifikasi Node.js/npm di dalamnya. Jangan memakai `latest` sebagai patokan tim. Node_modules host tidak dibagikan ke container.

Jangan menyimpan rahasia di image, Git, atau variabel frontend `VITE_*`; variabel tersebut dapat terlihat di browser. Konfigurasi container tidak menggantikan pengujian keamanan. Mac/Windows/Linux dan ARM/AMD64 tetap perlu diperiksa; container tidak menjamin hasil identik di semua arsitektur. Pembaruan image/dependensi melalui PR dan pengujian.

Backend/database ditambahkan ke Compose setelah arsitektur dipilih. CI belum tersedia. Docker produksi diputuskan sesuai hosting; frontend statis tidak selalu memerlukan container produksi.

## Referensi Resmi

- [Membuat repositori GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)
- [Alur pull request](https://docs.github.com/en/pull-requests/get-started/pull-request-quickstart)
- [Praktik build Docker dan penguncian image](https://docs.docker.com/build/building/best-practices/)
- [Instalasi dependensi dengan npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/)
