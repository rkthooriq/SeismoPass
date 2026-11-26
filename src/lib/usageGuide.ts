import type { ActorRole } from './actorAccess';
import type { WorkflowPage } from './workflowNavigation';

interface GuideStep {
  title: string;
  text: string;
  action: string;
  page: WorkflowPage;
}

interface GuideQuestion {
  question: string;
  answer: string;
}

interface UsageGuide {
  steps: GuideStep[];
  questions: GuideQuestion[];
}

export const usageGuides: Record<ActorRole, UsageGuide> = {
  owner: {
    steps: [
      {
        title: 'Catat bangunan dan pilih waktu kunjungan',
        text: 'Pilih Buat laporan, lalu isi data bangunan, lokasi dan akses, serta waktu kunjungan. Material atau struktur boleh Belum diketahui. Simpan draf jika belum lengkap; periksa data dan persetujuan sebelum mengirim.',
        action: 'Buat laporan',
        page: 'new',
      },
      {
        title: 'Baca catatan pemeriksaan dari admin',
        text: 'Buka laporan dari Laporan saya. Jika admin meminta perbaikan, pilih Lengkapi data, baca catatannya, lalu kirim ulang setelah diperbaiki.',
        action: 'Buka laporan saya',
        page: 'reports',
      },
      {
        title: 'Sepakati jadwal dengan pesurvei',
        text: 'Waktu pilihanmu langsung disepakati jika dipakai admin. Untuk waktu berbeda, pilih Jadwal ini cocok atau Minta jadwal lain dan kirim waktu pengganti. Pesurvei mulai setelah jadwal disepakati.',
        action: 'Periksa jadwal di laporan',
        page: 'reports',
      },
      {
        title: 'Pantau catatan dan tindak lanjut',
        text: 'Buka detail laporan untuk membaca Riwayat dan catatan yang telah dikirim. Setelah administrasi selesai, baca hasil yang tersedia dan catat kebutuhan tindak lanjut. Selesai tidak menyatakan bangunan aman.',
        action: 'Lihat perkembangan laporan',
        page: 'reports',
      },
    ],
    questions: [
      {
        question: 'Apa bedanya Perlu dilengkapi dan Perlu revisi?',
        answer:
          'Perlu dilengkapi berarti kamu perlu memperbaiki laporan sesuai catatan admin. Perlu revisi berarti pesurvei sedang diminta memperbaiki hasil survei; kamu cukup mengikuti perkembangannya.',
      },
      {
        question: 'Bagaimana meminta waktu kunjungan lain?',
        answer:
          'Sebelum survei dimulai, buka detail laporan dan pilih Minta jadwal lain. Isi tanggal serta rentang waktu pengganti, lalu Kirim permintaan jadwal. Jika admin memakai waktu itu, jadwal langsung disepakati. Batal menutup formulir tanpa mengubah jadwal.',
      },
    ],
  },
  admin: {
    steps: [
      {
        title: 'Siapkan akun pesurvei',
        text: 'Buka Kelola pesurvei untuk menambah akun satuan atau mengimpor Excel/CSV. Catat sandi sementara yang tampil sekali dan sampaikan ke pesurvei. Akun baru dapat ditugaskan setelah pesurvei mengganti sandi awal.',
        action: 'Kelola pesurvei',
        page: 'surveyors',
      },
      {
        title: 'Periksa kelengkapan laporan',
        text: 'Buka Laporan masuk dan baca Data laporan. Pada Keputusan, pilih Perlu perbaikan beserta catatannya, atau Data lengkap. Pilih pesurvei, catatan penugasan, dan jadwal untuk Setujui dan tugaskan.',
        action: 'Buka laporan masuk',
        page: 'incoming',
      },
      {
        title: 'Atur penugasan dan jadwal',
        text: 'Penugasan survei memuat laporan yang siap ditugaskan dan yang menunggu kunjungan. Waktu pilihan pelapor yang dipakai langsung disepakati. Waktu berbeda perlu konfirmasi; jika persetujuan lewat telepon atau pesan, catat konfirmasi pelapor beserta keterangannya.',
        action: 'Buka penugasan survei',
        page: 'assignments',
      },
      {
        title: 'Tinjau catatan yang telah dikirim',
        text: 'Buka Tinjauan catatan, baca hasil kunjungan, dan isi catatan tinjauan. Pilih Minta revisi jika perlu dilengkapi, atau Tutup administrasi laporan dan konfirmasi. Penutupan ini hanya menyatakan proses administrasi selesai.',
        action: 'Buka tinjauan catatan',
        page: 'review',
      },
    ],
    questions: [
      {
        question: 'Apa yang diperiksa dalam tinjauan?',
        answer:
          'Periksa kelengkapan catatan kunjungan dan data yang disampaikan. Persetujuan admin bukan validasi metode, skor simulasi, atau keamanan bangunan. Penilaian teknis tetap memerlukan ahli struktur.',
      },
      {
        question: 'Apa yang terjadi jika akses pesurvei dinonaktifkan?',
        answer:
          'Pesurvei tidak dapat membuka ruang kerja laporan. Tugas yang masih Ditugaskan, Dalam survei, atau Perlu revisi kembali ke antrean penugasan. Catatan sebelumnya dipertahankan agar dapat dibaca pesurvei pengganti; laporan yang telah Ditinjau atau Selesai tetap sebagai riwayat.',
      },
    ],
  },
  surveyor: {
    steps: [
      {
        title: 'Pastikan akun siap digunakan',
        text: 'Gunakan akun yang dibuat admin dan ganti sandi sementara saat masuk pertama. Buka profil untuk memeriksa identitas serta catatan kompetensi. Jika akun dinonaktifkan atau sandi awal perlu diterbitkan ulang, hubungi admin.',
        action: 'Buka profil saya',
        page: 'profile',
      },
      {
        title: 'Buka tugas dan periksa jadwal',
        text: 'Penugasan saya hanya memuat laporan yang diberikan kepadamu. Periksa catatan penugasan dan jadwal. Tekan Mulai survei saat tiba di lokasi setelah jadwal disepakati dengan pelapor.',
        action: 'Buka penugasan saya',
        page: 'tasks',
      },
      {
        title: 'Isi kunjungan dan input RVS',
        text: 'Halaman survei memiliki langkah Kunjungan, Input RVS, dan Periksa & kirim. Isi tanggal kunjungan yang tidak melewati hari ini dan catatan pengamatan. Input simulasi RVS bersifat opsional dan disimpan melalui Simpan input.',
        action: 'Lanjutkan tugas survei',
        page: 'tasks',
      },
      {
        title: 'Kirim catatan dan ikuti tinjauannya',
        text: 'Periksa ringkasan, lalu Kirim hasil survei untuk ditinjau. Laporan berpindah ke Riwayat survei. Jika admin meminta revisi, buka Penugasan saya, pilih Perbaiki hasil survei, lalu kirim ulang setelah diperbaiki.',
        action: 'Buka riwayat survei',
        page: 'history',
      },
    ],
    questions: [
      {
        question: 'Mengapa survei belum bisa dimulai?',
        answer:
          'Survei hanya dapat dimulai untuk tugasmu setelah jadwal disepakati. Jika jadwal masih menunggu konfirmasi atau pelapor meminta waktu lain, tunggu koordinasi admin dan pelapor. Jangan berkunjung sebelum jadwal disepakati.',
      },
      {
        question: 'Apakah input RVS tersimpan otomatis?',
        answer:
          'Tanggal dan catatan kunjungan disimpan otomatis sebagai draf di tab ini; statusnya tampil pada halaman survei. Jika gagal, pilih Coba simpan draf atau salin catatan sebelum meninggalkan halaman. Input RVS disimpan terpisah melalui Simpan input; pilihan yang belum disimpan tidak ikut terkirim.',
      },
    ],
  },
};

export const commonGuideQuestions: GuideQuestion[] = [
  {
    question: 'Apa arti status Selesai?',
    answer:
      'Selesai berarti admin telah menutup administrasi laporan. Status ini bukan sertifikat aman, pengesahan hasil simulasi, atau bukti perkuatan bangunan telah diverifikasi. Periksa catatan yang tersedia dan ikuti pemeriksaan ahli bila diperlukan.',
  },
  {
    question: 'Apakah laporan tetap ada setelah keluar?',
    answer:
      'Keluar mengakhiri login. Laporan dan akun tetap tersedia selama sesi tab jika penyimpanan browser tersedia. Menutup tab atau menghapus data situs dapat menghapus catatan sesi. Belum ada penyimpanan di server atau sinkronisasi antarperangkat; gunakan data contoh tanpa identitas pribadi.',
  },
];
