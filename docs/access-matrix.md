# Matriks Peran dan Hak Akses SeismoPass

Pengguna memutuskan tiga peran demo: pelapor, admin, pesurvei. Admin menyetujui akses pesurvei dan mengatur penugasan; pengambilan mandiri dari antrean diganti. Lihat [alur tiga peran](role-flows.md) dan [alur akun](account-flow.md).

## Matriks demo saat ini

| Operasi                              | Pelapor aktif                             | Admin aktif                                                 | Pesurvei aktif dan disetujui                      | Pemohon / nonaktif            |
| ------------------------------------ | ----------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------- | ----------------------------- |
| Membuat/mengubah laporan             | Milik sendiri, saat Draf/Perlu dilengkapi | Tidak                                                       | Tidak                                             | Tidak                         |
| Melihat laporan                      | Milik sendiri                             | Laporan yang sudah dikirim, tanpa draf pribadi              | Hanya penugasan sendiri                           | Tidak                         |
| Memeriksa kelengkapan                | Tidak                                     | Ya; dapat meminta kelengkapan                               | Tidak                                             | Tidak                         |
| Meninjau pengajuan akses             | Tidak                                     | Ya; catatan wajib, konfirmasi pemeriksaan untuk persetujuan | Tidak                                             | Status/pengajuan sendiri saja |
| Menonaktifkan/mengaktifkan pesurvei  | Tidak                                     | Ya, dengan alasan                                           | Tidak                                             | Tidak                         |
| Menugaskan laporan                   | Tidak                                     | Hanya ke pesurvei aktif dengan email demo terverifikasi     | Tidak; tidak ada ambil sendiri                    | Tidak                         |
| Memulai survei                       | Tidak                                     | Tidak                                                       | Hanya penugasan sendiri berstatus Ditugaskan      | Tidak                         |
| Input simulasi RVS/catatan kunjungan | Tidak                                     | Membaca/tinjau administrasi                                 | Penugasan sendiri, saat Dalam survei/Perlu revisi | Tidak                         |
| Menutup administrasi                 | Tidak                                     | Saat Ditinjau, catatan wajib                                | Tidak                                             | Tidak                         |
| Ekspor daftar laporan                | Tidak                                     | Daftar sesuai filter, tanpa draf                            | Tidak                                             | Tidak                         |
| Latihan RVS/halaman QR contoh        | Publik, data minimum                      | Publik, data minimum                                        | Publik, data minimum                              | Publik, data minimum          |

Sidebar dan URL dashboard dibatasi sesuai peran. Simulasi email dan status akun pemohon disediakan pada halaman status, tanpa mengirim data laporan kepadanya melalui komponen workspace. Semua data tetap merupakan data fiktif di browser, bukan kontrol akses server.

## Aktor sumber yang ditunda

Ahli struktur/perguruan tinggi, pemerintah daerah, penyedia retrofit, dan mitra keuangan tetap merupakan aktor sumber; aktor tidak otomatis berarti akun aplikasi. Pembagian akun produksi dan batas organisasi belum diputuskan. Penilai terpisah dari pelaksana retrofit. Admin tidak mengesahkan penilaian struktur melalui penutupan administrasi.

## Sebelum layanan produksi

Backend harus memeriksa identitas, status akun, peran, kepemilikan/penugasan objek, dan persetujuan pada setiap baca/tulis/ekspor. Perubahan URL, ID laporan, role, atau sessionStorage tidak boleh memberikan akses. Verifikasi email nyata, pencabutan sesi, pembatasan percobaan login, MFA admin, audit terlindungi, dan pengujian API lintas pengguna diperlukan sebelum data nyata. Ketentuan kompetensi/supervisi, privasi QR, masa simpan, serta operator persetujuan perlu disepakati.

RVS adalah penyaringan awal, bukan sertifikat aman. Hasil simulasi belum divalidasi ahli; insentif tetap menunggu program/kesepakatan yang tersedia.
