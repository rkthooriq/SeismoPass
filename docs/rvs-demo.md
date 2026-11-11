# Input RVS, hasil simulasi, dan QR

Permintaan pengguna pada 11 November 2026 menambahkan input dan hasil berdasarkan gambar formulir FEMA P-154. Implementasi berupa **simulasi pendidikan**, terpisah dari penilaian resmi yang tetap menunggu protokol lokal dan validasi ahli. Pilihan HIGH tidak merupakan penetapan seismisitas Bandung Raya.

## Sumber dan aturan yang diterapkan

- [FEMA P-154 Appendix B, formulir HIGH Level 1, B-4](https://www.atcouncil.org/images/FEMA%20P-154DataCollectionFormsThirdEdition.pdf), sesuai gambar pengguna. Semua 17 kolom skor dasar, modifier, dan Smin ditranskripsi; NA disimpan sebagai `null`, bukan nol.
- [FEMA P-154 Handbook, §§3.15–3.16](https://www.atcouncil.org/docman/fema/27-fema-p-154-full-report-508-2016/file): modifier vertikal severe dipakai ketika ada severe; moderate hanya tanpa severe. Keduanya tidak dijumlahkan. SL1 adalah maksimum dari jumlah basic + modifier dan Smin.
- Tanah A/B memakai modifier yang sama; C/D tanpa modifier; DNK memakai asumsi D dengan peringatan. Tanah E dibedakan pada batas tiga lantai. Tanah F menghentikan perhitungan pada demo. Tipe bangunan DNK dan kombinasi modifier NA tidak diberi skor.
- Tidak ada ambang otomatis, kategori aman/berbahaya, probabilitas keruntuhan, atau keputusan rujukan. Smin **bukan** cut-off rujukan. Bahaya geologi, benturan, elemen jatuh, dan kerusakan tetap dicatat terpisah dan tidak dihapus oleh skor tinggi.
- Pre-code dan post-benchmark dipilih pengguna dengan catatan dasar. Tidak ada tahun kode Indonesia yang ditebak dari tahun pembangunan. Pilihan kode/ketidakberaturan belum diketahui menghalangi angka hasil; data tetap dapat disimpan sebagai input simulasi.

## Mencoba langsung

Jalankan `npm ci` lalu `npm run dev` dengan Node.js sesuai `.nvmrc`. Buka `http://localhost:5173/#/rvs-lab`, atau pilih **Latihan RVS & QR** dari beranda.

1. Pilih tipe FEMA, jumlah lantai, tanah, ketidakberaturan, dan status kode. Lengkapi tanda bahaya dengan Ya/Tidak/DNK.
2. Isikan catatan tambahan bila ada. Nilai Ss/S1, koordinat, kode tahun, dan cakupan pemeriksaan adalah catatan, bukan masukan tambahan pada rumus tabel HIGH.
3. Konfirmasi data fiktif dan batas simulasi, lalu **Hitung simulasi RVS**. Angka beserta rinciannya muncul jika seluruh pilihan perhitungan dapat dipakai; jika tidak, tampil alasan tanpa angka rekaan.
4. Pilih **Buat QR demo**, lalu buka, salin, atau unduh SVG. Halaman latihan tidak menyimpan data setelah refresh/keluar.

Foto/sketsa dan kalkulator Level 2 belum termasuk modul ini. Referensi lampiran atau hasil ahli dapat dicatat di komentar; tidak menjadi pengesahan otomatis.

## Menyimpan pada laporan

Pelapor membuat laporan → admin memasukkan ke antrean → admin menugaskan laporan kepada pesurvei, lalu pesurvei memulai survei. Buka detail saat status **Dalam survei** atau **Perlu revisi**, isi formulir RVS, lalu **Simpan input dan lihat hasil simulasi**. Data disimpan pada laporan; hanya pesurvei yang ditugaskan boleh mengubahnya pada status tersebut. Formulir catatan kunjungan tetap terpisah.

Admin dan pelapor dapat membaca hasil simulasi serta catatan survei pada profil laporan yang boleh mereka lihat. Penutupan administrasi tidak mengesahkan skor. Profil tetap menandai **belum divalidasi ahli**. Sesi memulihkan input yang tervalidasi dan menghitung ulang hasil; skor tambahan dari cache tidak dipercaya. Data akun pelapor contoh mengikuti sessionStorage sebelumnya; akun baru juga tersimpan sebagai metadata sesi tanpa password pengguna.

## QR dan jaringan lokal

QR dibuat di browser memakai `qrcode` 1.5.4; tidak mengirim data ke layanan pembuat QR. Tautan `#/rvs-demo` membuka contoh tanpa hasil. Tautan berparameter membawa hanya pilihan perhitungan, jumlah lantai, dan tanda bahaya dalam fragment, tanpa ID laporan, identitas, alamat, koordinat, foto, atau komentar. Halaman tujuan menghitung ulang dan selalu menampilkan label simulasi serta disclaimer. Tautan bukan dokumen bertanda tangan dan dapat diubah siapa saja.

Untuk HP, gunakan alamat **Network** yang dicetak Vite dengan Wi-Fi yang sama, lalu buat ulang QR dari alamat tersebut. `localhost` pada HP menunjuk ke HP itu sendiri. Berkas contoh `output/qr/seismopass-qr-demo.png` dan `.svg` memakai alamat jaringan laptop saat pengujian; perlu dibuat ulang bila IP atau port berubah. Server hanya untuk demo pengembangan, belum deployment.

## Verifikasi

- Node.js 24.11.0: 33 tes lulus (7 tes RVS/QR baru), lint, typecheck, dan build lulus.
- Kasus mencakup seluruh skor dasar/Smin, contoh C3 pada handbook (jumlah 0,2 dibatasi menjadi 0,3), batas tiga lantai, DNK/F/NA, peran/penugasan, cache, dan round-trip tautan seluruh tipe bangunan tanpa identitas.
- Instalasi dependensi dan audit npm: 0 kerentanan dilaporkan; manifest dan lockfile diperbarui bersama.
- HTTP localhost dan alamat jaringan laptop mengembalikan 200. Koneksi HP dan UAT belum diuji.
- Pemeriksaan visual/interaksi browser belum terverifikasi karena browser access host tidak tersedia.

- Berkas QR PNG berhasil dibaca ulang oleh decoder macOS Vision dan cocok dengan URL tujuan. QR juga diperiksa secara visual; tersedia margin putih empat modul.
- Render React statis lulus untuk halaman latihan, QR valid/tidak valid, catatan tersimpan, dan pembatasan formulir pesurvei. Ini tidak menggantikan tes interaksi browser.
