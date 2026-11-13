// Data publik untuk konteks risiko gempa di landing page.
// Semua angka berasal dari sumber yang dikutip esai SeismoPass (IYEEA 2026).
// Ini bukan hasil screening SeismoPass dan tidak menilai bangunan tertentu.

export type Source = { label: string; url?: string };

export type SeismicEvent = {
  date: string; // ISO yyyy-mm-dd
  magnitude: number;
};

// Kejadian gempa di sekitar Sesar Lembang 2010–2025, disalin dari label
// peta seismisitas BMKG (2025) pada Lampiran Gambar 2 esai.
export const lembangEvents: SeismicEvent[] = [
  { date: '2010-04-22', magnitude: 3.2 },
  { date: '2011-07-22', magnitude: 3.0 },
  { date: '2011-08-10', magnitude: 1.6 },
  { date: '2011-08-28', magnitude: 3.3 },
  { date: '2011-09-04', magnitude: 1.6 },
  { date: '2011-09-04', magnitude: 1.4 },
  { date: '2011-09-23', magnitude: 0.3 },
  { date: '2011-09-28', magnitude: 0.4 },
  { date: '2011-09-29', magnitude: 1.0 },
  { date: '2011-10-03', magnitude: 1.8 },
  { date: '2014-08-22', magnitude: 3.0 },
  { date: '2017-05-14', magnitude: 2.8 },
  { date: '2017-05-18', magnitude: 2.9 },
  { date: '2025-07-24', magnitude: 1.8 },
  { date: '2025-07-28', magnitude: 2.1 },
  { date: '2025-08-14', magnitude: 1.9 },
  { date: '2025-08-15', magnitude: 1.8 },
];

export const lembangFacts = [
  { value: '29–30 km', label: 'panjang jalur Sesar Lembang' },
  { value: 'Mw 6,5–7,0', label: 'potensi gempa maksimum' },
  { value: 'VII–VIII MMI', label: 'perkiraan guncangan skenario M6,8' },
  { value: '8,76 juta', label: 'penduduk Bandung Raya pada 2024' },
];

export const lembangSources: Source[] = [
  {
    label: 'BMKG (2017, 2025)',
    url: 'https://www.bmkg.go.id/siaran-pers/penjelasan-bmkg-terkait-hasil-kajian-sesar-lembang-yang-berpotensi-memicu-gempa-berkekuatan-m6-8',
  },
  {
    label: 'Daryono dkk. (2019)',
    url: 'https://doi.org/10.1016/j.tecto.2018.12.014',
  },
  { label: 'BPS (2024)' },
];

// Gempa Cianjur M5,6, 21 November 2022. Data BNPB per 24 November 2022.
export const cianjurImpact = [
  { value: 272, label: 'korban meninggal dunia' },
  { value: 62545, label: 'pengungsi' },
  { value: 56311, label: 'rumah rusak' },
];

export const cianjurDamage = [
  { label: 'Rusak berat', value: 22267, tone: 3 },
  { label: 'Rusak sedang', value: 11836, tone: 2 },
  { label: 'Rusak ringan', value: 22208, tone: 1 },
];

export const cianjurSources: Source[] = [
  {
    label: 'BNPB (2022)',
    url: 'https://www.bnpb.go.id/berita/kerusakan-bangunan-akibat-gempabumi-m5-6-cianjur',
  },
];

// Paparan risiko gempa, menyempit dari Jawa Barat ke lokasi pilot di jalur
// Sesar Lembang. Ukuran tiap tingkat berbeda, jadi jangan dibandingkan sebagai
// satu grafik batang.
export const westJavaExposure = [
  {
    label: 'Jawa Barat',
    value: '47,5 juta jiwa',
    detail: 'Penduduk terpapar risiko gempa bumi, terbanyak di Pulau Jawa.',
    source: 'BNPB (2023)',
  },
  {
    label: 'Bandung Raya',
    value: '8,76 juta jiwa',
    detail:
      'Penduduk Kabupaten Bandung, Kabupaten Bandung Barat, Kota Bandung, dan Kota Cimahi pada 2024.',
    source: 'BPS (2024)',
  },
  {
    label: 'Metropolitan Bandung',
    value: '1,9–2,7 juta jiwa',
    detail:
      'Terpapar guncangan di atas 0,3 g pada skenario gempa Sesar Lembang Mw 6,6–7,0.',
    source: 'Hussain dkk. (2023)',
  },
  {
    label: 'Desa Jambudipa, Kecamatan Cisarua',
    value: 'Desa prioritas pilot',
    detail:
      'Dilalui langsung garis sesar; zona dengan tipologi kerentanan tertinggi dalam studi terkonsentrasi di desa ini.',
    source: 'Pamungkas dkk. (2024)',
  },
];

export const exposureSources: Source[] = [
  {
    label: 'BNPB (2023)',
    url: 'https://inarisk.bnpb.go.id/pdf/BUKU%20RBI%202023.pdf',
  },
  { label: 'BPS (2024)' },
  {
    label: 'Hussain dkk. (2023)',
    url: 'https://nhess.copernicus.org/articles/23/3185/2023/',
  },
  {
    label: 'Pamungkas dkk. (2024)',
    url: 'https://doi.org/10.22146/jgise.101944',
  },
];

// Kualitas konstruksi rumah pada program BSPS dan BP2BT, persen sampel.
export const constructionQuality = [
  {
    label: 'BP2BT (rumah pengembang, 2019)',
    segments: [
      { label: 'Memenuhi standar minimum', value: 16, tone: 3 },
      { label: 'Sebagian aman', value: 37, tone: 2 },
      { label: 'Tidak aman', value: 47, tone: 1 },
    ],
  },
  {
    label: 'BSPS (rumah swadaya)',
    segments: [
      { label: 'Memenuhi standar minimum', value: 11, tone: 3 },
      { label: 'Tidak memenuhi', value: 89, tone: 0 },
    ],
  },
];

export const qualitySources: Source[] = [
  {
    label: 'World Bank (2025), Annex 4',
    url: 'https://documents1.worldbank.org/curated/en/099101325100013767/pdf/P179408-c33e1738-daf8-4a3d-b9b2-c4498769b980.pdf',
  },
];

// Bantuan stimulan perbaikan rumah pascabencana, Rp juta per rumah.
export const recoveryAid = [
  { label: 'Rusak berat', current: 50, proposed: 60 },
  { label: 'Rusak sedang', current: 25, proposed: 30 },
  { label: 'Rusak ringan', current: 10, proposed: 15 },
];

export const recoverySources: Source[] = [
  {
    label: 'Kemenko PMK (2023)',
    url: 'https://www.kemenkopmk.go.id/pemerintah-tambah-standar-biaya-bantuan-rumah-rusak-pasca-bencana',
  },
];
