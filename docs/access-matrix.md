# Matriks Peran dan Hak Akses SeismoPass

## Status keputusan

Enam aktor berasal dari `SeismoPass App Flow.md`. Pengguna meminta UI untuk semua aktor. Pembagian dashboard dan akses berikut adalah **usulan implementasi demo**, bukan ketentuan sumber atau kebijakan produksi yang telah disahkan. Tidak ada tambahan akun admin operasional.

Implementasi sekarang: pemilihan peran tanpa email/kata sandi, pembatasan navigasi dan URL di frontend, data bangunan fiktif hanya diberikan ke tampilan pemilik, serta keluar demo. Pilihan peran hanya di memori aplikasi dan hilang saat refresh. Setiap orang dapat memilih peran; ini bukan autentikasi atau verifikasi kewenangan.

## Ruang kerja demonstrasi

| Aktor | Halaman yang tersedia selain dashboard/panduan/matriks | Batas usulan layanan nyata |
| --- | --- | --- |
| Pemilik/pengelola | Daftar, tambah/ubah bangunan, profil, informasi enam tahap, data demo dan pratinjau publik | Hanya bangunan sendiri; persetujuan berbagi dan keputusan retrofit oleh pemilik |
| Petugas penilai | Informasi screening | Bangunan penugasan, metode resmi dan supervisi ahli; tidak membuat rencana retrofit atau keputusan pendanaan |
| Ahli struktur | Informasi screening, rujukan dan retrofit | Kasus penugasan, validasi dan kewenangan yang diverifikasi; bukan akses bebas ke seluruh bangunan |
| Pemerintah daerah | Informasi dukungan dan evaluasi | Ringkasan sesuai kewenangan; data rinci/identitas tidak otomatis dibuka |
| Penyedia retrofit | Informasi retrofit | Pekerjaan yang ditugaskan berdasarkan rencana ahli; tidak menilai screening atau memvalidasi pekerjaan sendiri |
| Mitra keuangan | Informasi dukungan dan evaluasi | Data minimum berdasarkan persetujuan dan kesepakatan; tidak membuat penawaran atau keputusan otomatis |

Halaman profesional belum memuat penugasan, hasil teknis, dokumen, pengajuan, atau data operasional. Nilai “belum ada” bukan hasil screening. Tombol unduh/reset data demo hanya tersedia untuk simulasi pemilik. Ini tidak memberikan akses produksi.

## Sebelum backend login nyata

**BELUM DIPUTUSKAN:** penyedia identitas, backend/database, model organisasi, akses ganda satu pengguna, verifikasi aktor profesional, persetujuan berbagi, masa simpan data dan penanggung jawab operasional.

Rancangan berikut perlu diwujudkan dan diuji sebelum memakai data nyata:

1. Identitas pengguna diverifikasi; pengguna tidak boleh menaikkan perannya sendiri melalui pilihan peran UI.
2. Server menentukan hak akses dari keanggotaan/peran yang disahkan, kepemilikan, penugasan, dan persetujuan yang masih berlaku.
3. Setiap operasi baca/tulis/ekspor diperiksa di server pada objek yang diminta; ID bangunan dan peran dari browser tidak dipercaya.
4. Login, logout, pencabutan sesi, kegagalan masuk, pembatasan percobaan, serta pemulihan akun memiliki prosedur yang diuji. Tidak menyimpan kata sandi/token sesi dalam source atau sessionStorage frontend.
5. Akses lintas pengguna, lintas organisasi dan perubahan penugasan diuji lewat API. Log audit memuat aktor/tindakan/waktu tanpa mengekspos rahasia atau data pribadi yang tidak perlu.
6. Data QR dipisahkan dari profil privat, menggunakan cakupan publik minimum yang telah disetujui. QR bukan sertifikat aman.
7. Validasi/hasil RVS menunggu protokol ahli; insentif dan dukungan menunggu kebijakan atau kesepakatan. Pemilihan peran tidak mengaktifkan fitur tersebut.

Keamanan backend, penerimaan pengguna, dan persetujuan kebijakan akses produksi belum selesai hanya karena tes frontend lulus.
