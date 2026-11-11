# Panduan Demo SeismoPass

Buka `http://localhost:5173/#/login`. Semua akun demo menggunakan `SeismoDemo123!`. Gunakan tab yang sama saat berganti akun agar pengajuan, keputusan, dan laporan yang disimpan pada sessionStorage tetap tersedia.

| Akun                  | Email                  | Kondisi awal                                            |
| --------------------- | ---------------------- | ------------------------------------------------------- |
| Admin                 | `admin@example.com`    | Aktif; tinjau akses dan tentukan penugasan              |
| Pelapor               | `pelapor@example.com`  | Aktif; mencatat laporan bangunan                        |
| Pesurvei              | `pesurvei@example.com` | Aktif; menunggu penugasan admin                         |
| Calon pesurvei contoh | `calon@example.com`    | Menunggu tinjauan; verifikasi email hanya disimulasikan |

Pada layar laptop, navigasi berada di sidebar kiri. Pada layar kecil gunakan **Buka menu**. Panduan visual tersedia di `#/flows` atau **Panduan alur** dalam sidebar. Diagram dan skenario lengkap ada di [alur tiga peran](role-flows.md).

## Admin

1. Masuk, lihat hitungan pengajuan, laporan masuk, tugas yang menunggu penugasan, dan catatan yang perlu ditinjau.
2. Buka **Pengajuan pesurvei**. Periksa informasi contoh; isi catatan, centang konfirmasi peninjauan untuk menyetujui, atau minta perbaikan/tolak dengan alasan.
3. Buka **Laporan masuk**. Pilih **Data lengkap, siap ditugaskan** atau **Minta kelengkapan** dengan catatan.
4. Buka **Penugasan survei**, buka laporan, pilih pesurvei aktif, isi catatan, dan **Simpan penugasan**. Sebelum pesurvei mulai, penugasan dapat diubah.
5. Setelah pesurvei mengirim catatan, buka **Tinjauan catatan**. Beri catatan lalu **Minta revisi** atau **Tutup administrasi laporan**.
6. **Kelola pesurvei** menyediakan penonaktifan dan pengaktifan kembali. Penonaktifan mengembalikan tugas yang masih berjalan ke penugasan; catatan lama tetap tersimpan.
7. Cari/filter/unduh daftar melalui **Semua laporan**. Unduhan berlabel demonstrasi dan bukan hasil teknis yang disahkan.

## Pelapor

1. Pakai akun contoh atau daftar dengan email fiktif `@example.com`. Akun baru memakai kata sandi demo bersama. Setelah daftar pilih **Simulasikan verifikasi email demo**.
2. **Buat laporan**: isi nama, lokasi fiktif, fungsi, tahun jika diketahui, lantai, material, struktur, dan catatan. Material/struktur boleh **Belum diketahui**.
3. Simpan draf bila belum lengkap; nama dan konfirmasi data fiktif tetap wajib. Pengiriman membutuhkan seluruh data dasar serta konfirmasi batas RVS.
4. Buka **Laporan saya**. Jika dikembalikan, baca catatan, pilih **Ubah draf**, lengkapi dan kirim ulang.
5. Pantau status. Buka bagian **Profil bangunan, simulasi RVS, dan QR** untuk melihat data yang tersedia. Selesai hanya berarti proses administrasi ditutup.

## Pesurvei

1. Di halaman masuk, pilih **Calon pesurvei? Ajukan akses**. Isi identitas, organisasi, dan ringkasan kompetensi contoh; konfirmasi data fiktif.
2. Simulasikan verifikasi email. Tunggu tinjauan admin; hanya halaman status yang tersedia. Perbaiki pengajuan jika diminta/ditolak lalu kirim ulang.
3. Setelah disetujui, masuk dan buka **Penugasan saya**. Laporan yang belum ditugaskan kepadamu tidak terlihat.
4. Pilih **Mulai survei**, lalu isi tanggal/catatan kunjungan. Input RVS tersedia pada bagian tersendiri; lihat [panduan simulasi RVS](rvs-demo.md).
5. **Kirim catatan ke admin**. Catatan hanya bisa diperbarui lagi setelah admin meminta revisi.
6. Pantau **Riwayat survei**. Jika akses dinonaktifkan, workspace laporan tidak dapat dibuka.

## Data, QR, dan batas

Akun/pengajuan/laporan bertahan setelah refresh selama sesi tab dan penyimpanan tersedia. Refresh meminta login lagi. Tidak ada sinkronisasi antar-tab atau perangkat. Demo menyimpan metadata tanpa password pengguna; semua kredensial uji bersifat bersama dan terbuka. Verifikasi email adalah simulasi tanpa email terkirim. Akun admin tidak tersedia melalui pendaftaran publik.

Latihan mandiri RVS ada di `#/rvs-lab`. QR hanya membawa data minimum simulasi dan tidak membuka identitas atau catatan privat. Untuk HP, gunakan alamat Network dari Vite di Wi-Fi yang sama dan buat ulang QR. Informasi dalam tautan demo dapat diubah dan tidak bertanda tangan digital.

Menu lama pencatatan bangunan masih dapat dibuka melalui URL pemilik contoh; ia terpisah dari alur laporan. Ekspor/reset pada halaman Data demo lama hanya berlaku untuk catatan bangunan lama, bukan direktori akun dan laporan baru.

**RVS adalah penyaringan awal, bukan sertifikat aman.** Persetujuan admin, skor simulasi, QR, dan penutupan administrasi tidak menggantikan protokol, pelatihan/supervisi, atau validasi ahli. Backend, autentikasi/otorisasi server, verifikasi email nyata, dan kebijakan operasional belum tersedia.
