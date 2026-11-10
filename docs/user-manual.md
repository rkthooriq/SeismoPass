# Panduan Demo SeismoPass

## Membuka aplikasi

Nyalakan Docker Desktop, jalankan `docker compose up --build` dari folder proyek, lalu buka http://localhost:5173. Pilih **Masuk demo / Jelajahi SeismoPass** atau buka http://localhost:5173/#/login. Pilih peran, centang pemahaman simulasi, lalu tekan **Masuk sebagai …**. Tidak ada email/kata sandi atau akun nyata.

Seluruh catatan merupakan data fiktif demonstrasi. Data baru disimpan lokal di sesi tab browser dan tidak dikirim ke server. Catatan bertahan saat refresh atau kembali ke landing page jika penyimpanan browser tersedia. Menutup tab biasanya mengakhiri sesi, tetapi pemulihan tab oleh browser dapat memulihkan catatan. Jika penyimpanan ditolak atau penuh, pemberitahuan menjelaskan bahwa catatan hanya ada dalam memori. Jangan gunakan data pribadi. Tidak ada akun atau layanan registrasi nyata.

## Mencatat bangunan

1. Pilih **Tambah bangunan** di Ringkasan atau Bangunan saya.
2. Isi nama, lokasi fiktif, fungsi, jumlah lantai, material, dan sistem struktur. Tahun boleh kosong; pilih **Belum diketahui** jika tidak yakin mengenai material atau struktur.
3. Centang konfirmasi penggunaan data fiktif.
4. Pilih **Simpan draf** untuk catatan belum lengkap (nama dan konfirmasi tetap wajib), atau **Simpan data bangunan** untuk data dasar lengkap.
5. Jika ada kesalahan, pilih pesan kesalahan untuk menuju kolom terkait. Formulir tetap menyimpan isian selama belum ditinggalkan.
6. Profil digital terbuka setelah disimpan. Pilih **Ubah data bangunan** untuk memperbarui catatan. **Batal** meninggalkan formulir tanpa menyimpan perubahan.

## Menemukan catatan

Buka **Bangunan saya**, cari nama, ID atau lokasi, dan pilih filter **Draf** atau **Data tercatat**. Pilih **Buka** untuk profil. Hasil pencarian kosong memiliki tombol reset.

Draf dan Data tercatat adalah status administratif usulan UI. Keduanya bukan kategori risiko. Semua bangunan demo berstatus screening **Belum dinilai**.

## Halaman lanjutan

- **Screening RVS:** informasi tahapan dan keadaan belum ada screening. Tidak ada perhitungan atau formulir penilaian rekaan.
- **Rujukan ahli:** informasi dasar rujukan resmi; belum ada ahli, penugasan, atau evaluasi.
- **Rencana retrofit:** alur rencana, keputusan pemilik, pelaksanaan, dan verifikasi. Tidak ada metode teknis atau estimasi biaya rekaan.
- **Dukungan & evaluasi:** jenis dukungan yang masih menunggu kebijakan/kerja sama. Tidak tersedia pengajuan atau manfaat otomatis.
- **Profil → Lihat pratinjau terbatas:** contoh informasi publik tanpa identitas pemilik atau alamat rinci. QR dan tautan publik belum aktif.
- **Pusat bantuan:** panduan alur dan pertanyaan umum.

Pada layar kecil, buka tombol **Menu** untuk berpindah halaman. Navigasi dan formulir dapat diakses dengan keyboard; kesalahan formulir diumumkan dan diarahkan ke ringkasan kesalahan.

**RVS adalah penyaringan awal, bukan sertifikat aman.** Status belum dinilai tidak menjamin keamanan dan bukan hasil pemeriksaan. Pemeriksaan harus dilakukan petugas terlatih dengan supervisi ahli menggunakan protokol yang disahkan.

## Mengelola data demo

Buka **Data demo** dari navigasi workspace.

1. Pilih **Unduh data demo** untuk menyimpan berkas JSON berlabel demonstrasi. Berkas memuat seluruh isian bangunan, tanpa hasil RVS. Fitur impor belum tersedia.
2. Pilih **Reset data demo** jika ingin mulai ulang. Periksa konfirmasi lalu pilih **Batal** atau **Ya, reset ke data contoh**. Reset mengganti catatan dengan tiga bangunan awal; unduh dulu bila ingin menyimpan salinan.
3. Jika data sesi rusak atau versinya tidak didukung, aplikasi menampilkan pemberitahuan dan memakai data contoh. Catatan lama belum ditimpa sampai perubahan baru disimpan atau reset dilakukan.

Batas kapasitas demo adalah 500 catatan per sesi (batas teknis UI, bukan ketentuan domain). Penyimpanan browser bukan autentikasi, perlindungan akses, atau cadangan permanen.

## Masuk, keluar dan mencoba peran

Enam peran tersedia: pemilik/pengelola, petugas penilai, ahli struktur, pemerintah daerah, penyedia retrofit, dan mitra keuangan. Dashboard serta navigasi menyesuaikan peran; menu **Peran & hak akses** menjelaskan seluruh usulan pembagian.

Pemilik dapat menjalankan alur pencatatan di atas. Peran profesional hanya melihat informasi yang relevan dan keadaan belum ada penugasan/layanan. Data bangunan pemilik tidak diberikan ke tampilan profesional. Pembatasan ini hanya simulasi di browser dan bukan kontrol keamanan layanan nyata.

Pilih **Keluar demo** di bagian atas untuk mengakhiri peran. Untuk berganti peran, keluar lalu pilih peran lain. Refresh juga mengakhiri pilihan peran; pilih pemilik lagi untuk melanjutkan catatan fiktif yang tersimpan di sesi tab. Keluar demo tidak menghapus catatan fiktif; gunakan **Data demo → Reset** jika ingin mengembalikannya ke data contoh.

Jika membuka URL halaman yang tidak termasuk peranmu, aplikasi menampilkan penjelasan batas peran dan tautan kembali ke dashboard. Halaman login tidak memverifikasi identitas siapa pun; jangan gunakan demo untuk data atau layanan nyata.
