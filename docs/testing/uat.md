# Rencana UAT Demo Multiaktor

Status: **BELUM DIJALANKAN**. Gunakan hanya data fiktif. Isi tanggal, commit, browser/perangkat, peserta, hasil aktual, temuan, perbaikan, dan hasil uji ulang saat pelaksanaan. Jumlah peserta dan penanggung jawab penerimaan belum diputuskan.

| Skenario | Hasil yang diharapkan | Hasil aktual |
| --- | --- | --- |
| Buka halaman masuk, daftar, pengajuan akses, undangan dan pemulihan dengan keyboard | Formulir berlabel dan dapat dijangkau; tidak ada pemilih peran pada halaman masuk; pratinjau meminta data fiktif | Belum diuji |
| Kirim formulir dengan isian tidak valid | Pesan kesalahan tampil dan fokus menuju ringkasan kesalahan | Belum diuji |
| Buka Jelajahi contoh bangunan, catat lalu ubah bangunan fiktif | Data dapat dicari dan dibuka di profil; status belum dinilai dan disclaimer terlihat | Belum diuji |
| Keluar lalu gunakan tombol kembali browser atau URL profil langsung | Halaman masuk tampil sampai pengguna membuka jelajah demo atau layanan akun tersedia | Belum diuji |
| Masuk sebagai petugas | Dashboard petugas dan informasi screening tersedia; URL tambah/ubah/detail/data demo ditolak | Belum diuji |
| Masuk sebagai ahli | Screening/rujukan/retrofit tersedia sebagai informasi; daftar bangunan pemilik tidak dibuka | Belum diuji |
| Masuk sebagai pemerintah daerah | Ruang koordinasi/dukungan tersedia; tidak ada identitas atau detail bangunan | Belum diuji |
| Masuk sebagai penyedia retrofit | Halaman retrofit tersedia; screening dan rujukan tidak tersedia untuk peran ini | Belum diuji |
| Masuk sebagai mitra keuangan | Halaman dukungan tersedia; tidak ada data pemilik atau penawaran pendanaan otomatis | Belum diuji |
| Refresh workspace, lalu buka jelajah contoh lagi | Sesi jelajah direset; catatan pemilik tetap tersedia selama penyimpanan sesi browser tersedia | Belum diuji |
| Buka matriks akses dari setiap peran | Batas peran aktif, status usulan dan batas frontend dijelaskan | Belum diuji |
| Lebar 320/390/768/1440 px, keyboard, zoom 200%, reduced motion | Konten terbaca, menu dan fokus dapat dijangkau, tidak ada scroll horizontal layout utama | Belum diuji |
| Peserta menjelaskan kembali demo | Memahami pratinjau akun bukan autentikasi nyata; RVS bukan sertifikat aman; tidak ada insentif otomatis | Belum diuji |

Tes otomatis logika tidak menggantikan skenario interaksi ini. Pengujian otorisasi API dan data nyata dilakukan setelah backend tersedia.

Koreksi alur: pemilih peran publik sudah dihapus. Skenario masuk aktor profesional di tabel merupakan rencana uji setelah backend dan akun uji terverifikasi tersedia; belum dapat dijalankan lewat formulir publik. Uji pratinjau daftar/pengajuan/undangan/pemulihan harus memastikan tidak ada klaim akun dibuat, email terkirim, undangan valid, atau peran diaktifkan. Lihat `../account-flow.md`.


## Skenario tambahan dari esai (belum dijalankan bersama pengguna)

- Pelapor menyimpan draf dengan nama dan konfirmasi demo; pengiriman ditolak sampai data dasar dan pemahaman RVS lengkap.
- Pesan kesalahan mengarahkan keyboard ke isian; tahun kosong dan material/struktur belum diketahui diterima.
- Admin mengembalikan laporan lama tanpa data tambahan; pelapor melengkapi dan mengirim ulang.
- Pesurvei mengambil laporan tanpa diminta tanggal kunjungan terlebih dahulu, lalu mengisi tanggal dan catatan.
- Setelah admin menutup administrasi, profil tetap belum dinilai; tidak muncul kategori risiko, rujukan, atau manfaat aktif.
- Pemilik menjelaskan perbedaan penutupan administratif dan hasil RVS, serta mengetahui bahwa QR belum aktif.
- Rencana pilot memperlihatkan target usulan dan capaian belum diukur; data demo tidak dihitung sebagai hasil screening.
- Periksa formulir, profil, dan pilot pada lebar 360, 768, dan 1440 piksel serta navigasi keyboard. Pemeriksaan browser agen terhambat infrastruktur; belum ada hasil visual atau UAT untuk fitur ini.


## Skenario terbaru: persetujuan dan penugasan oleh admin

Skenario berikut menggantikan rencana pengambilan mandiri dari antrean. Seluruhnya masih **belum diuji bersama pengguna**; tes logika dan render statis tidak menjadi hasil UAT.

| Tugas | Hasil yang diharapkan | Status |
| --- | --- | --- |
| Daftar pelapor / ajukan pesurvei baru | Portal menunggu email; tombol simulasi jelas tidak mengirim email | Belum diuji |
| Verifikasi email pesurvei demo | Beralih ke menunggu admin; laporan belum tersedia | Belum diuji |
| Tinjau pemohon tanpa verifikasi, lalu setelah verifikasi | Persetujuan sebelum verifikasi ditolak; sesudahnya memerlukan catatan dan konfirmasi pemeriksaan | Belum diuji |
| Minta perbaikan/tolak lalu masuk sebagai pemohon | Alasan terbaca; perbaikan dapat dikirim ulang tanpa mengaktifkan peran sendiri | Belum diuji |
| Admin menugaskan laporan siap survei | Pilihan hanya pesurvei aktif; penugasan muncul pada akun terpilih | Belum diuji |
| Masuk sebagai pesurvei lain atau buka URL admin langsung | Laporan di luar penugasan tidak terlihat; halaman admin ditolak | Belum diuji |
| Pesurvei mulai, isi simulasi/kunjungan, kirim, lalu revisi | Perubahan hanya saat Dalam survei/Perlu revisi; catatan ditinjau admin | Belum diuji |
| Nonaktifkan pesurvei saat ada tugas berjalan | Workspace akun berhenti; tugas kembali untuk ditugaskan ulang; riwayat lama tetap ada | Belum diuji |
| Refresh, masuk ulang, lalu berganti tiga akun di tab yang sama | Akun, pengajuan, keputusan, dan laporan tetap tersedia; password tidak ada pada data sesi | Belum diuji |
| Jelajah sidebar pada 360/768/1440 px, keyboard, zoom | Menu sesuai peran; menu HP dapat dibuka/tutup dan semua kontrol terjangkau | Belum diuji |
| Baca panduan tiga peran | Pengguna menjelaskan perbedaan persetujuan akses, penugasan, penutupan administrasi, dan validasi RVS | Belum diuji |

Verifikasi agen: Node.js 24.11.0, 40 tes lulus, lint/typecheck/build lulus; render statis tiga dashboard dan halaman terkait lulus. HTTP dev server 200. Pemeriksaan visual/interaksi terhalang browser access host tidak tersedia dan izin kontrol komputer belum diberikan.
