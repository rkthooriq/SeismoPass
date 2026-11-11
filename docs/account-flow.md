# Alur Akun SeismoPass

## Cakupan yang diputuskan pengguna

Satu halaman masuk digunakan untuk semua peran. Pelapor mendaftar, calon pesurvei mengajukan akses, dan admin menyetujui akun pesurvei serta menentukan penugasan bangunan. Akun admin tidak dapat dibuat melalui pendaftaran publik. Tiga peran demo dipertahankan.

Panduan langkah dan diagram: [alur tiga peran](role-flows.md). Pengaturan ini merupakan keputusan produk demo, bukan ketentuan akun yang sudah dirinci dalam esai.

## Pelapor

Daftar dengan identitas fiktif → status **Menunggu verifikasi email** → pilih **Simulasikan verifikasi email demo** → akun aktif → dashboard pelapor. Semua akun demo memakai kata sandi bersama yang terlihat jelas di UI; pengguna tidak diminta membuat kredensial nyata.

## Calon pesurvei

Ajukan nama/email contoh, organisasi, serta ringkasan pelatihan/kompetensi → menunggu verifikasi → simulasi verifikasi email → **Menunggu tinjauan admin**. Pemohon bisa masuk untuk melihat status tetapi tidak dapat membuka laporan operasional.

Admin meninjau dan memberi catatan → **Aktif**, **Perlu perbaikan**, atau **Ditolak**. Persetujuan membutuhkan konfirmasi peninjauan kompetensi. Pemohon dapat memperbaiki pengajuan yang dikembalikan atau ditolak lalu mengirim ulang; tidak mengaktifkan akses sendiri. Dokumen pribadi tidak diunggah di demo.

## Penonaktifan dan penugasan

Admin memilih pesurvei aktif dan mencatat penugasan pada laporan siap survei. Akun yang belum disetujui atau dinonaktifkan tidak dapat dipilih. Pesurvei tidak dapat mengambil laporan secara mandiri.

Admin dapat menonaktifkan akses dengan alasan. Penugasan berstatus Ditugaskan, Dalam survei, atau Perlu revisi dikembalikan ke daftar siap ditugaskan; catatan lama dipertahankan. Catatan yang sudah Ditinjau/Selesai tetap sebagai riwayat. Pengaktifan kembali membutuhkan catatan serta konfirmasi peninjauan.

## Penyimpanan dan batas

Metadata akun, status, riwayat keputusan, dan laporan disimpan bersama dalam sessionStorage, tanpa password yang dimasukkan pengguna. Kredensial demo selalu memakai konstanta uji bersama. Status sesi login tetap di memori; refresh meminta masuk lagi. Undangan dan pemulihan masih pratinjau tanpa email/token nyata.

Verifikasi email server, autentikasi, otorisasi server, verifikasi kompetensi nyata, kebijakan sesi/MFA, audit terlindungi, dan backend/database belum diimplementasikan. Pengguna layanan nyata tidak boleh bisa menyetujui dirinya sendiri lewat pilihan peran, URL, atau perubahan penyimpanan browser. Tes frontend bukan bukti keamanan produksi.
