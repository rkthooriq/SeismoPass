# Implementasi berdasarkan esai IYEEA 2026

## Sumber yang diperiksa

Pada 11 November 2026, PDF pengguna `IYEEA2026_404 Not Found_SeismoPass.pdf` dibaca seluruhnya (24 halaman). Diagram Gambar 7 dan Tabel 2–3 diperiksa secara visual. Nomor halaman di bawah mengikuti halaman PDF, karena daftar isi masih mencantumkan nomor yang berbeda. Berkas sumber tetap di perangkat pengguna dan tidak disalin ke aset publik.

Esai merupakan sumber kebutuhan produk, bukan izin untuk menghubungi mitra, menerbitkan website, atau menjalankan penilaian struktur. Tidak ada perubahan protokol, rumus, skor, kategori risiko, atau kebijakan insentif yang disimpulkan sendiri dari lampiran FEMA.

## Pemetaan kebutuhan ke implementasi

| Ketentuan sumber                                                           | Lokasi sumber                         | Implementasi demo                                                                                                                                                                           |
| -------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registrasi memuat lokasi, fungsi, tahun, lantai, material, sistem struktur | Hal. 7, tahap 1                       | Formulir laporan kini memuat seluruh data dasar; tahun boleh belum diketahui. Draf dapat disimpan sebelum lengkap. Pengiriman dan penerusan ke antrean memerlukan data lengkap.             |
| Screening oleh petugas terlatih, sesuai protokol dan supervisi ahli        | Hal. 7, tahap 2; hal. 13, Tabel 4     | Pesurvei mencatat kunjungan setelah mengambil laporan. Catatan kunjungan tidak menjadi hasil screening. Profil menjelaskan prasyarat penilaian.                                             |
| Profil memuat hasil yang sah dan akses dashboard/QR                        | Hal. 7, tahap 3                       | Setiap laporan memiliki profil enam tahap. Hasil selalu “Belum dinilai”; QR hanya pratinjau informasi minimum, tanpa tautan publik.                                                         |
| Rujukan hanya untuk bangunan prioritas menurut hasil screening             | Hal. 7, tahap 4                       | Status rujukan “Belum ditentukan”. Belum dirujuk tidak diartikan aman. Tidak ada rujukan otomatis.                                                                                          |
| Rencana ahli memuat metode, biaya, material, prioritas; pemilik memutuskan | Hal. 8, tahap 5; hal. 10, Tabel 1     | Profil menjelaskan keluaran dan penanggung jawabnya. Tidak mengarang rencana atau estimasi.                                                                                                 |
| Dukungan bersyarat dan verifikasi pelaksanaan                              | Hal. 8–9, tahap 6 dan bagian C        | Informasi dukungan dan evaluasi ditampilkan dengan status belum tersedia. Penutupan admin tidak menjadi verifikasi perkuatan.                                                               |
| Persetujuan, minimisasi data, edukasi batas RVS, pemisahan vendor          | Hal. 10, Tabel 1; hal. 13–14, Tabel 4 | Konfirmasi data fiktif dan pemahaman RVS saat pengiriman; disclaimer profil/QR; penjelasan pemilihan penyedia tanpa kewajiban. Tidak menganggap checkbox demo sebagai persetujuan produksi. |
| Pilot Jambudipa, enam bulan, target 250 bangunan                           | Hal. 10–11 dan 15                     | Tab **Rencana pilot**, berlabel usulan belum berjalan.                                                                                                                                      |
| Lima fase pilot                                                            | Hal. 11, Tabel 2                      | Persiapan bulan 1, protokol bulan 2, uji coba bulan 3–5, evaluasi bulan 6, replikasi setelah evaluasi.                                                                                      |
| Indikator cakupan, mutu, rujukan, dan pemahaman                            | Hal. 12–13, Tabel 3                   | Target usulan ditampilkan dengan capaian **belum diukur**. Laporan demo tidak dihitung sebagai bangunan yang sudah discreening.                                                             |

## Pilihan teknis dan batas

Tiga akun demo (pelapor, admin, pesurvei) dipertahankan. Aktor ahli, pemerintah, penyedia retrofit, dan mitra tetap dijelaskan sebagai pelaku proses; esai tidak otomatis menentukan jumlah akun. Penambahan akun profesional belum dilakukan.

Validasi formulir, opsi isian, tahun opsional, batas lantai 1–200, status administratif, tombol pratinjau QR, serta penyimpanan sesi adalah pilihan teknis demo. Batas lantai bukan ambang penilaian struktur. Checkbox pemahaman bukan hasil survei indikator pilot. Kolom material dan struktur menerima “Belum diketahui”.

Laporan akun pelapor contoh bertahan dalam sessionStorage. Sesi lama tanpa data dasar/konfirmasi tidak diberi nilai rekaan; admin dapat mengembalikannya untuk dilengkapi sebelum memasukkan ke antrean. Sesi rusak memakai data contoh. Properti hasil penilaian yang tidak dikenal tidak dipulihkan dari penyimpanan. Akun pelapor yang dibuat melalui pendaftaran dan laporannya tetap hanya di memori sampai refresh, sesuai batas demo sebelumnya.

Menu **Catatan bangunan** lama dipertahankan sebagai demonstrasi pencatatan terpisah. Data baru untuk alur tiga peran dimasukkan melalui **Buat laporan**; belum ada penggabungan otomatis dengan catatan lama.

**BELUM DIPUTUSKAN:** protokol/adaptasi RVS dan ambang ahli; kebijakan QR dan persetujuan produksi; backend, autentikasi, otorisasi server, dan penyimpanan bersama; verifikasi kompetensi; operator pilot; program insentif dan kerja sama mitra. Biaya retrofit setempat tidak diisi dari ilustrasi biaya luar negeri.

## Verifikasi

- Node.js 24.11.0 sesuai `.nvmrc`; runtime sementara karena Docker tidak aktif.
- `npm test`: 26 tes lulus, termasuk 6 tes baru registrasi, status, tanggal, dan sesi laporan.
- `npm run lint`, `npm run typecheck` (melalui build), dan `npm run build`: lulus.
- Render HTML statis tiga tampilan akun, formulir registrasi, disclaimer, tombol ambil sebelum kunjungan, dan empat indikator belum diukur: lulus. Ini bukan pengujian interaksi browser.
- Dev server mengembalikan HTTP 200 pada localhost.
- Pemeriksaan interaksi dan tampilan browser **belum terverifikasi**: browser access host tidak tersedia; percobaan akses Chrome native timeout. UAT belum dilakukan.
- Tidak ada publikasi website atau perubahan layanan produksi.
