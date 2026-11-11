# PRD SeismoPass (untuk Pengembang)

Dokumen ini merangkum **apa yang dibangun, batasnya, dan apa yang belum boleh dibangun**. Dokumen ini tidak menggantikan sumber lain; ia hanya menunjuk ke sana.

- Sumber kebutuhan: [SeismoPass App Flow](SeismoPass%20App%20Flow.md) (ringkasan esai IYEEA 2026; esai aslinya belum ada di repo).
- Rencana dan urutan kerja: [plan.md](plan.md).
- Hak akses: [access-matrix.md](access-matrix.md) dan [account-flow.md](account-flow.md).
- Pengujian: [testing/uat.md](testing/uat.md).

Jika dokumen ini bertentangan dengan sumber kebutuhan, **sumber kebutuhan yang menang**; perbaiki dokumen ini.

**Label yang dipakai:** `SUMBER` = tertulis di laporan. `KEPUTUSAN` = sudah diputuskan pengguna/tim. `USULAN` = usulan teknis, belum disepakati. `BELUM DIPUTUSKAN` = jangan diimplementasikan atas tebakan sendiri.

---

## 1. Ringkasan

SeismoPass adalah sistem paspor ketahanan gempa bangunan berbasis Rapid Visual Screening (RVS). Ia menghubungkan enam hal dalam satu alur: registrasi bangunan, screening awal, profil risiko digital, rujukan ahli, rencana retrofit, serta insentif dan evaluasi. `SUMBER`

Nilai produk ada pada **keterhubungan alur**, bukan pada label atau kode QR. `SUMBER`

**Konteks:** pilot yang direncanakan laporan berlangsung 6 bulan di Desa Jambudipa (Kec. Cisarua, Kab. Bandung Barat) dengan target 250 bangunan prioritas. Ini konteks, bukan target rilis pengembangan. `SUMBER`

## 2. Masalah

- Pemilik bangunan belum tentu punya informasi ketahanan gempa yang mudah dipahami (asimetri informasi). `SUMBER`
- Retrofit membutuhkan biaya, sehingga pemilik perlu dukungan agar mau memperkuat bangunan. `SUMBER`

## 3. Batasan domain (wajib dipatuhi)

Ini aturan keras. Pelanggaran berarti fitur ditolak saat review.

1. **RVS bukan sertifikat aman.** Tampilkan penjelasan batas RVS di profil dan halaman QR. "Tidak dirujuk" juga tidak boleh ditampilkan sebagai pernyataan aman.
2. **Jangan menciptakan** rumus, skor, kategori risiko, ambang rujukan, atau hasil screening. Semuanya menunggu protokol dan validasi ahli struktur. Data demo tidak boleh memuat hasil RVS rekaan.
3. **Jangan menjanjikan** insentif fiskal, pembiayaan, atau asuransi yang belum disepakati. Insentif fiskal bergantung keputusan daerah; hanya insentif nonfiskal yang menjadi fondasi pilot. `SUMBER`
4. **Pisahkan fungsi penilai dan penyedia retrofit** untuk mencegah konflik kepentingan. `SUMBER`
5. **QR tidak boleh membuka seluruh data bangunan.** Data publik dan data terbatas harus dipisah. `USULAN`
6. **Akses produksi ditegakkan di server.** Menyembunyikan tombol di frontend bukan kontrol akses.

## 4. Pengguna

### 4.1 Tiga peran yang dikerjakan sekarang `KEPUTUSAN`

Pengguna memutuskan fokus pada **tiga peran dulu**. Hanya ketiganya yang dibuatkan alur, halaman, dan tes pada tahap ini.

| Peran | Tugas | Batas akses |
| --- | --- | --- |
| **Pelapor** | Membuat draf dan mengirim laporan bangunan; mengikuti statusnya. Menu hanya Laporan saya, Buat laporan, Panduan alur (tanpa Ringkasan); tiap laporan menampilkan kartu "Langkah berikutnya" | Hanya laporan miliknya sendiri |
| **Admin** | Menyetujui akses pesurvei, menentukan penugasan, memeriksa kelengkapan dan meninjau catatan | Pengajuan akses dan laporan yang sudah dikirim (bukan draf) |
| **Pesurvei** | Mengajukan akses; setelah disetujui, memulai tugas dari admin dan mencatat kunjungan | Hanya laporan yang ditugaskan admin, selama akses aktif |

Catatan:
- Pelapor, admin, dan pesurvei adalah **peran demo**. Ketiganya tidak sama persis dengan aktor di laporan (lihat 4.2) dan belum menjadi kebijakan akses produksi.
- Pesurvei mencatat kunjungan, **bukan** hasil RVS. Pencatatan hasil/skor RVS tetap menunggu protokol ahli.
- Peran produksi harus ditentukan server dari akun terverifikasi, bukan dipilih pengguna di UI.

### 4.2 Aktor di laporan (ditunda) `SUMBER`

Enam aktor dari laporan. Aktor di laporan **tidak otomatis berarti akun aplikasi**; pembagian akun masih `BELUM DIPUTUSKAN`. Daftar ini disimpan sebagai acuan, **belum dikerjakan**.

| Aktor | Peran di laporan | Usulan akses (`USULAN`) | Kaitan dengan 3 peran demo |
| --- | --- | --- | --- |
| Pemilik/pengelola | Persetujuan, data bangunan, keputusan retrofit | Bangunan miliknya | Paling dekat dengan pelapor; belum tentu sama |
| Petugas penilai | Screening RVS di bawah supervisi ahli | Bangunan penugasan | Paling dekat dengan pesurvei; belum tentu sama |
| Ahli struktur/perguruan tinggi | Validasi metode, evaluasi, rencana retrofit | Kasus penugasan | Ditunda |
| Pemerintah daerah | Koordinasi data, dukungan sesuai kewenangan | Ringkasan terbatas | Ditunda |
| Penyedia retrofit | Pelaksanaan perkuatan | Pekerjaan yang ditugaskan | Ditunda |
| Mitra keuangan | Pembiayaan/asuransi jika disepakati | Data minimum dengan persetujuan | Ditunda |

Admin operasional adalah usulan tambahan, bukan aktor sumber.

## 5. Alur produk dan kebutuhan fungsional

Enam tahap dari laporan. `SUMBER` Satu-satunya percabangan ada di tahap 4: hanya bangunan yang hasil screening-nya menunjukkan prioritas pemeriksaan lanjutan yang dirujuk. Langkah untuk bangunan yang tidak dirujuk tidak dijelaskan laporan (`BELUM DIPUTUSKAN`).

| # | Tahap | Kebutuhan | Status implementasi |
| --- | --- | --- | --- |
| 1 | Registrasi | Pemilik/instansi mengisi lokasi, fungsi, tahun bangun, jumlah lantai, material, sistem struktur | Demo ada: formulir, validasi, draf, daftar, ubah |
| 2 | Screening RVS | Petugas terlatih, protokol resmi, supervisi ahli | **Tidak diimplementasikan** (menunggu protokol ahli); hanya keadaan kosong |
| 3 | Profil risiko digital | Hasil, kategori risiko, rekomendasi lewat dashboard atau QR, dengan disclaimer | Kerangka profil "belum dinilai" |
| 4 | Rujukan ahli | Evaluasi teknis untuk bangunan prioritas | **Tidak diimplementasikan**; keadaan kosong |
| 5 | Rencana retrofit | Metode, estimasi biaya, material, prioritas; keputusan di pemilik | **Tidak diimplementasikan**; keadaan kosong |
| 6 | Insentif dan evaluasi | Pencatatan dukungan, verifikasi perkuatan, evaluasi | **Tidak diimplementasikan**; keadaan kosong |

### 5.1 Cakupan versi ini: tiga peran `KEPUTUSAN`

Hanya **pelapor, admin, pesurvei**. Alur laporan yang dikerjakan:

1. Pelapor membuat **draf**, lalu **mengirim** laporan. Pengiriman hanya lolos bila data dasar valid.
2. Admin memeriksa kelengkapan: **memasukkan ke antrean** ("Siap disurvei") atau **mengembalikan** dengan catatan ("Perlu dilengkapi").
3. Admin **menugaskan** pesurvei aktif ("Ditugaskan"). Pesurvei memulai tugas ("Dalam survei") lalu **mencatat kunjungan** (tanggal valid dan catatan wajib).
4. Admin **meninjau** ("Ditinjau"), lalu **meminta revisi** ("Perlu revisi") atau **menutup** ("Selesai"), keduanya dengan catatan.

Sembilan status: Draf, Dikirim, Perlu dilengkapi, Siap disurvei, Ditugaskan, Dalam survei, Ditinjau, Perlu revisi, Selesai. Semuanya status administratif, **bukan** kategori risiko. "Selesai" tidak menghasilkan hasil screening; hasil tetap "Belum dinilai". Sumber: `src/lib/reportDemo.ts`.

Acuan teknis: [access-matrix.md](access-matrix.md). Alur tahap 2 dan 4–6 untuk peran lain tidak dikerjakan di versi ini.

Demo berjalan sepenuhnya di browser dengan data fiktif berlabel (sessionStorage, fallback memori). Tidak ada backend, kredensial nyata, atau otorisasi server. **Lulusnya tes frontend bukan bukti keamanan.**

Akun: satu formulir masuk tanpa pilihan peran. Peran produksi harus ditentukan server dari akun terverifikasi. Pengajuan pesurvei melewati simulasi verifikasi email dan peninjauan admin. Pemohon tidak dapat mengaktifkan aksesnya sendiri. Tombol jelajah demo hanya membuka contoh pemilik. Detail di [account-flow.md](account-flow.md).

## 6. Kebutuhan non-fungsional

| Area | Kebutuhan |
| --- | --- |
| Platform | Web. `KEPUTUSAN` tim; laporan tidak menyebut web/mobile/offline |
| Stack | React 19, TypeScript strict, Vite. `KEPUTUSAN` pengguna |
| Layout | Responsif (HP, tablet, laptop); Grid/Flexbox, bukan koordinat tetap. Hormati reduced motion |
| Tampilan awal | Terinspirasi Spline. Tidak memakai embed Spline |
| Privasi | Minimisasi data, persetujuan pemilik, pembatasan hak akses. `SUMBER` |
| Keamanan | Tanpa rahasia/token di source atau sessionStorage; validasi input; audit log tanpa data pribadi berlebih |
| Runtime | Node.js sesuai `.nvmrc`; Docker opsional untuk lingkungan seragam |
| Kualitas kode | Lint, typecheck, build, dan `npm test` harus lulus; hindari `any` tanpa alasan |

## 7. Di luar lingkup (saat ini)

- Akun dan dashboard untuk ahli struktur, pemerintah daerah, penyedia retrofit, dan mitra keuangan.
- Akses ganda satu pengguna dan peran gabungan.
- Logika penilaian RVS, skor, kategori risiko, dan rujukan otomatis.
- Backend, database, autentikasi nyata, dan hosting.
- Insentif aktif, penawaran pembiayaan atau asuransi.
- Mode offline dan aplikasi mobile.
- Publikasi website. Belum diizinkan.

## 8. Kriteria selesai

Ukuran angka seperti jumlah peserta UAT dan target keberhasilan **belum ditetapkan**; jangan mengisinya sendiri.

**Demo dianggap siap bila** (mengikuti [plan.md](plan.md), tahap 4, 7, 8):
- Validasi formulir, tampilan seluler, dan navigasi berfungsi.
- Semua skenario UAT wajib yang disepakati lulus; masalah penghambat ditutup dan diuji ulang.
- Pengguna dapat memakai panduan tanpa dituntun dan menjelaskan kembali bahwa RVS bukan sertifikat aman.
- Tidak ada temuan keamanan kritis/tinggi yang terbuka, tidak ada akses tanpa izin, dan tidak ada kebocoran data pribadi.
- Demo diberi label demonstrasi yang jelas.

**Penggunaan nyata** memerlukan tambahan: backend, kontrol akses server, tata kelola data, dan validasi ahli. Publikasi demo tidak berarti platform siap melakukan screening operasional.

## 9. Status saat ini

| Item | Keadaan |
| --- | --- |
| Landing page, workspace demo, alur laporan tiga peran | Ada |
| Lint, typecheck, build, audit (container, 11 Nov 2026) | Lulus; 0 kerentanan |
| `npm test` | Tes Node.js untuk validasi, sesi, rute, akses, alur akun |
| Dev server dan tampilan browser | Belum diverifikasi agen |
| Uji lintas perangkat dan UAT | Belum dilakukan |
| Digest image Docker | Belum dikunci |
| Publikasi | Belum dilakukan |

## 10. Keputusan terbuka

Kolom "pihak penentu" adalah `USULAN`, bukan penugasan. Untuk fokus tiga peran, baris yang paling relevan adalah backend/identitas, hak akses, QR publik, persetujuan data, dan UAT. Baris tentang ahli, insentif, dan pembiayaan baru berlaku saat peran terkait dikerjakan.

| Keputusan | Pihak penentu (usulan) | Memblokir |
| --- | --- | --- |
| Formulir/protokol RVS, rumus, skor, kategori, ambang rujukan | Ahli struktur | Tahap 2, 3 (isi hasil), 4 |
| Nama dan jumlah kategori risiko | Ahli struktur | Tahap 3 |
| Backend, database, penyedia identitas | Tim pengembang | Tahap 5 |
| Pembagian akun dan hak akses produksi; akses ganda | Tim + pemangku kepentingan | Tahap 5 |
| Verifikasi aktor profesional | Tim + ahli/pemda | Akun profesional |
| Data yang tampil di QR publik | Tim + pemilik/pemda | Halaman QR |
| Persetujuan berbagi, masa simpan data, mekanisme koreksi | Tim + pemangku kepentingan | Data nyata |
| Langkah untuk bangunan yang tidak dirujuk | Tim + ahli | Tahap 3–4 |
| Kebutuhan offline | Tim | Arsitektur |
| Hosting/domain, biaya, penanggung jawab operasional | Tim | Tahap 9–10 |
| Insentif fiskal | Pemerintah daerah | Tahap 6 |
| Pembiayaan/asuransi | Mitra keuangan | Tahap 6 |
| Jumlah peserta UAT, target keberhasilan, jadwal, penanggung jawab penerimaan | Tim | Tahap 8 |
| Lisensi repo | Pemilik | Publikasi repo |

## 11. Risiko yang harus dikendalikan oleh produk

Diambil dari Tabel 4 laporan. `SUMBER`

| Risiko | Mitigasi di produk |
| --- | --- |
| Label/QR disangka sertifikat aman | Disclaimer di profil dan halaman QR, edukasi pemilik, jalur rujukan |
| Hasil tidak konsisten antarpetugas | Protokol terstandar, supervisi ahli, audit sampel (butuh protokol ahli) |
| Data disalahgunakan | Minimisasi data, persetujuan, pembatasan akses |
| Konflik kepentingan penilai dan vendor | Pisahkan fungsi, vendor transparan, tanpa kewajiban memakai vendor tertentu |
| Insentif fiskal tidak tersedia | Mulai dari insentif nonfiskal; jangan tampilkan sebagai hak |

## 12. Cara memakai dokumen ini saat bekerja

1. Sebelum membuat fitur, cek tahap dan label statusnya di tabel bagian 5 dan 10.
2. Jika fitur menyentuh penilaian, kategori, atau insentif, **berhenti dan tanyakan**, jangan mengisi sendiri.
3. Jika menambah layar, pastikan disclaimer RVS tampil di profil dan QR.
4. Setelah mengubah perilaku, perbarui tes, lalu dokumen terkait (`plan.md`, `access-matrix.md`, `user-manual.md`).
5. Gunakan data demo berlabel; jangan commit rahasia atau data pribadi.


## Pembaruan permintaan RVS dan QR

Pengguna kemudian meminta input serta hasil dari gambar FEMA P-154 dan contoh QR. Cakupan demo diperluas dengan **simulasi pendidikan tabel HIGH Level 1**, bukan penilaian resmi. Tidak ada ambang lokal, kategori risiko, atau pengesahan otomatis. Simulasi dapat dicoba di `#/rvs-lab`; input pada laporan hanya diubah pesurvei yang ditugaskan. QR berisi data minimum tanpa identitas. Aturan sebelumnya yang menyebut demo tidak memiliki perhitungan diperbarui oleh cakupan ini; batas penilaian resmi tetap berlaku. Lihat [panduan dan sumber RVS](rvs-demo.md).


## Keputusan terbaru: persetujuan dan penugasan oleh admin

Tersedia dashboard sidebar, pengajuan pesurvei, persetujuan/perbaikan/penolakan admin, penugasan terbatas, penonaktifan, dan riwayat keputusan. Metadata akun dan laporan tersimpan bersama tanpa password pengguna. Verifikasi email disimulasikan; backend dan otorisasi produksi belum tersedia. Acuan alur aktual: [alur tiga peran](role-flows.md), [alur akun](account-flow.md), dan [matriks akses](access-matrix.md).
