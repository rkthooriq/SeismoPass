# Rencana UAT Demo Multiaktor

Status: **BELUM DIJALANKAN**. Gunakan hanya data fiktif. Isi tanggal, commit, browser/perangkat, peserta, hasil aktual, temuan, perbaikan, dan hasil uji ulang saat pelaksanaan. Jumlah peserta dan penanggung jawab penerimaan belum diputuskan.

| Skenario | Hasil yang diharapkan | Hasil aktual |
| --- | --- | --- |
| Buka halaman masuk; gunakan keyboard memilih enam peran | Seluruh pilihan dapat dijangkau dan memiliki label; tidak meminta kredensial nyata | Belum diuji |
| Coba masuk tanpa konfirmasi demo | Pesan kesalahan tampil dan fokus menuju konfirmasi | Belum diuji |
| Masuk sebagai pemilik, catat lalu ubah bangunan fiktif | Data dapat dicari dan dibuka di profil; status belum dinilai dan disclaimer terlihat | Belum diuji |
| Keluar lalu gunakan tombol kembali browser atau URL profil langsung | Halaman masuk tampil sampai peran demo dipilih lagi | Belum diuji |
| Masuk sebagai petugas | Dashboard petugas dan informasi screening tersedia; URL tambah/ubah/detail/data demo ditolak | Belum diuji |
| Masuk sebagai ahli | Screening/rujukan/retrofit tersedia sebagai informasi; daftar bangunan pemilik tidak dibuka | Belum diuji |
| Masuk sebagai pemerintah daerah | Ruang koordinasi/dukungan tersedia; tidak ada identitas atau detail bangunan | Belum diuji |
| Masuk sebagai penyedia retrofit | Halaman retrofit tersedia; screening dan rujukan tidak tersedia untuk peran ini | Belum diuji |
| Masuk sebagai mitra keuangan | Halaman dukungan tersedia; tidak ada data pemilik atau penawaran pendanaan otomatis | Belum diuji |
| Refresh workspace, lalu pilih peran lagi | Pilihan peran direset; catatan pemilik tetap tersedia selama penyimpanan sesi browser tersedia | Belum diuji |
| Buka matriks akses dari setiap peran | Batas peran aktif, status usulan dan batas frontend dijelaskan | Belum diuji |
| Lebar 320/390/768/1440 px, keyboard, zoom 200%, reduced motion | Konten terbaca, menu dan fokus dapat dijangkau, tidak ada scroll horizontal layout utama | Belum diuji |
| Peserta menjelaskan kembali demo | Memahami pemilihan peran bukan autentikasi nyata; RVS bukan sertifikat aman; tidak ada insentif otomatis | Belum diuji |

Tes otomatis logika tidak menggantikan skenario interaksi ini. Pengujian otorisasi API dan data nyata dilakukan setelah backend tersedia.
