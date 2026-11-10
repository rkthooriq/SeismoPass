# SeismoPass

Web untuk pencatatan bangunan dan tindak lanjut penyaringan awal RVS. **RVS bukan sertifikat aman**; metode dan hasil penilaian harus berasal dari protokol yang divalidasi ahli.

## Status

Kerangka folder dan dokumentasi telah disiapkan. Stack pilihan adalah React, TypeScript, dan Vite, tetapi belum ada kode aplikasi atau dependensi. Belum tersedia perintah instalasi, pengembangan, build, maupun pengujian. Backend, database, dan hosting belum dipilih.

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

**Status:** repositori GitHub belum dibuat; owner dan visibilitas Public/Private belum ditentukan. Git lokal belum terinisialisasi karena lingkungan agen melarang penulisan `.git`. Integrasi GitHub belum terhubung. Semua perintah berikut adalah panduan, bukan tindakan yang sudah dilakukan.

### Unggah Pertama oleh Pemilik

1. Masuk ke GitHub, buat repositori bernama `SeismoPass`, pilih owner dan visibilitas sesuai keputusan tim.
2. Buat repositori kosong: jangan tambahkan README, `.gitignore`, atau lisensi otomatis karena berkas lokal sudah tersedia dan lisensi belum diputuskan.
3. Di terminal lokal, jalankan perintah berikut dari folder proyek. Ganti `OWNER` dengan akun/organisasi sebenarnya. Perintah ini untuk kondisi awal yang belum memiliki repositori Git dan remote.

```bash
cd /Users/kemal/Documents/Project/SeismoPass
git init -b main
git status --short
git add README.md AGENTS.md .gitignore docs/ src/ public/ tests/
git diff --cached --stat
git diff --cached
git commit -m "Add project structure and contributor documentation"
git remote add origin https://github.com/OWNER/SeismoPass.git
git push -u origin main
```

Periksa isi staged sebelum commit; jangan sertakan rahasia atau data pribadi. Jika Git meminta identitas, atur `git config user.name "Nama Kamu"` dan `git config user.email "EMAIL_GIT_KAMU"` pada repositori ini. Autentikasi GitHub menggunakan credential manager/GitHub CLI atau SSH yang telah dikonfigurasi; jangan menaruh token di URL atau README. Bila repositori atau remote sudah ada, periksa `git status` dan `git remote -v` sebelum melanjutkan, jangan menginisialisasi atau menimpa remote secara sembarang.

### Clone untuk Anggota Tim

Pemilik memberi akses kolaborator sesuai kebutuhan; repositori Private memerlukan akses sebelum bisa di-clone. Dari folder induk tempat proyek akan disimpan:

```bash
git clone https://github.com/OWNER/SeismoPass.git
cd SeismoPass
git status
```

Clone dilakukan sekali per salinan kerja. Untuk pembaruan berikutnya gunakan pull, bukan clone ulang. Baca `AGENTS.md` dan `docs/plan.md` sebelum mengubah proyek. Saat ini cukup membaca/mengedit dokumentasi; belum ada `package.json`, jadi jangan menjalankan `npm install` atau perintah aplikasi.

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

**Rencana:** mulai Docker di tahap 3, bersamaan setup React, TypeScript, dan Vite, sebelum tim mulai menjalankan aplikasi. Saat ini belum diperlukan untuk mengedit dokumentasi. Docker CLI ditemukan pada komputer ini, tetapi daemon, Compose, dan kemampuan menjalankan container belum diperiksa.

| Tahap | Pemakaian |
| --- | --- |
| Sekarang: dokumentasi | Belum membuat atau menjalankan container |
| Setup frontend | Tambahkan Dockerfile pengembangan, `compose.yaml`, `.dockerignore`, dan panduan; verifikasi dari clone bersih |
| Backend/database | Tambahkan service dan volume setelah arsitektur dipilih; jangan memilih database secara tersirat |
| Pengujian otomatis | Jalankan pemeriksaan dengan runtime dan dependensi yang sama; konfigurasi CI dibuat saat perintah tes tersedia |
| Staging/produksi | Putuskan menurut hosting; frontend statis bisa dihosting tanpa container produksi |

### Agar Lingkungan Tim Konsisten

- Gunakan commit kode yang sama, versi Node.js/npm yang ditetapkan, dan base image dengan versi spesifik serta digest; jangan memakai `latest` sebagai patokan bersama.
- Commit `package.json` dan `package-lock.json` bersama. Gunakan `npm ci` di container/CI agar instalasi mengikuti lockfile. Perubahan dependensi dilakukan secara sengaja dan direview.
- Simpan konfigurasi build/Compose dalam Git. Jangan menyalin `node_modules` dari host ke container; rencanakan volume dependensi terpisah jika source menggunakan bind mount.
- Rahasia tetap di luar image dan Git. Sediakan `.env.example` yang disanitasi bila diperlukan. Jangan menganggap variabel frontend `VITE_*` sebagai tempat rahasia karena nilainya dapat masuk bundle browser.
- Catat kebutuhan platform Mac/Windows/Linux dan ARM/AMD64. Container mengurangi perbedaan lingkungan, tetapi bukan jaminan hasil identik untuk semua arsitektur dan konfigurasi.
- Pembaruan image/dependensi melalui PR dan pengujian; versi yang dikunci tetap perlu diperbarui untuk perbaikan keamanan.

Contoh alur **setelah** `compose.yaml` dibuat dengan service bernama `web` dan script aplikasi tersedia; belum bisa dijalankan sekarang:

```bash
docker compose up --build
docker compose exec web npm run lint
docker compose exec web npm test
docker compose exec web npm run build
docker compose down
```

Alamat dan port lokal akan dicatat setelah konfigurasi diuji. Setelah pull perubahan Dockerfile atau dependensi, ikuti langkah rebuild yang ditetapkan saat implementasi. `docker compose down` menghentikan lingkungan; jangan menambahkan `--volumes` tanpa memahami bahwa volume database dapat terhapus.

## Referensi Resmi

- [Membuat repositori GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)
- [Alur pull request](https://docs.github.com/en/pull-requests/get-started/pull-request-quickstart)
- [Praktik build Docker dan penguncian image](https://docs.docker.com/build/building/best-practices/)
- [Instalasi dependensi dengan npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/)
# SeismoPass
