/** FEMA P-154 (2015), Appendix B, HIGH seismicity Level 1; §§3.15–3.16.
 * Educational arithmetic only. Not a validated Indonesian screening protocol.
 */
export const rvsSource =
  'https://www.atcouncil.org/images/FEMA%20P-154DataCollectionFormsThirdEdition.pdf';
export const rvsHandbook =
  'https://www.atcouncil.org/docman/fema/27-fema-p-154-full-report-508-2016/file';
export const buildingTypes = [
  'W1',
  'W1A',
  'W2',
  'S1',
  'S2',
  'S3',
  'S4',
  'S5',
  'C1',
  'C2',
  'C3',
  'PC1',
  'PC2',
  'RM1',
  'RM2',
  'URM',
  'MH',
] as const;
export type FemaType = (typeof buildingTypes)[number];
// Columns: basic, severe vertical, moderate vertical, plan, pre-code,
// post-benchmark, soil A/B, soil E 1–3 stories, soil E >3 stories, minimum.
// null preserves NA; it must never be interpreted as a zero modifier.
export const highScores: Record<FemaType, readonly (number | null)[]> = {
  W1: [3.6, -1.2, -0.7, -1.1, -1.1, 1.6, 0.1, 0.2, -0.3, 1.1],
  W1A: [3.2, -1.2, -0.7, -1.0, -1.0, 1.9, 0.3, 0.2, -0.6, 0.9],
  W2: [2.9, -1.2, -0.7, -1.0, -0.9, 2.2, 0.5, 0.1, -0.9, 0.7],
  S1: [2.1, -1.0, -0.6, -0.8, -0.6, 1.4, 0.4, -0.2, -0.6, 0.5],
  S2: [2.0, -1.0, -0.6, -0.7, -0.6, 1.4, 0.6, -0.4, -0.6, 0.5],
  S3: [2.6, -1.1, -0.7, -0.9, -0.8, 1.1, 0.1, 0.2, null, 0.6],
  S4: [2.0, -1.0, -0.6, -0.7, -0.6, 1.9, 0.6, -0.1, -0.6, 0.5],
  S5: [1.7, -0.8, -0.5, -0.6, -0.2, null, 0.5, -0.4, -0.4, 0.5],
  C1: [1.5, -0.9, -0.5, -0.6, -0.4, 1.9, 0.4, 0.0, -0.5, 0.3],
  C2: [2.0, -1.0, -0.6, -0.8, -0.7, 2.1, 0.5, 0.0, -0.7, 0.3],
  C3: [1.2, -0.7, -0.4, -0.5, -0.1, null, 0.3, -0.2, -0.3, 0.3],
  PC1: [1.6, -1.0, -0.6, -0.7, -0.5, 2.0, 0.6, -0.3, null, 0.2],
  PC2: [1.4, -0.9, -0.5, -0.6, -0.3, 2.4, 0.4, -0.1, -0.4, 0.2],
  RM1: [1.7, -0.9, -0.5, -0.7, -0.5, 2.1, 0.5, -0.1, -0.5, 0.3],
  RM2: [1.7, -0.9, -0.5, -0.7, -0.5, 2.1, 0.5, -0.1, -0.6, 0.3],
  URM: [1.0, -0.7, -0.4, -0.4, 0.0, null, 0.3, -0.2, -0.2, 0.2],
  MH: [1.5, null, null, null, -0.1, 1.2, 0.3, -0.4, null, 1.0],
};
export const scoringOptions = {
  buildingType: ['DNK', ...buildingTypes],
  soil: ['DNK', 'A', 'B', 'C', 'D', 'E', 'F'],
  vertical: ['DNK', 'none', 'moderate', 'severe'],
  plan: ['DNK', 'no', 'yes'],
  code: ['DNK', 'neither', 'pre', 'post'],
} as const;
export const hazardFields = [
  ['liquefaction', 'Potensi likuefaksi'],
  ['landslide', 'Potensi longsor'],
  ['surfaceRupture', 'Ruptur permukaan'],
  ['pounding', 'Benturan antarbangunan'],
  ['adjacentFalling', 'Bahaya jatuh dari bangunan tetangga yang lebih tinggi'],
  ['damage', 'Kerusakan / deteriorasi struktur signifikan'],
  ['chimney', 'Cerobong tanpa pengaku'],
  ['parapet', 'Parapet'],
  ['cladding', 'Cladding / veneer berat'],
  ['appendages', 'Elemen tambahan eksterior'],
] as const;
export type HazardKey = (typeof hazardFields)[number][0];
export type RvsInputs = {
  [K in keyof typeof scoringOptions]: (typeof scoringOptions)[K][number];
} & { stories: string } & Record<HazardKey, 'DNK' | 'yes' | 'no'>;
export const observationFields = [
  ['dateTime', 'Tanggal / waktu survei', 'datetime-local'],
  ['zip', 'Kode pos contoh', 'text'],
  ['otherId', 'Identifikasi tambahan', 'text'],
  ['latitude', 'Lintang (derajat)', 'text'],
  ['longitude', 'Bujur (derajat)', 'text'],
  ['ss', 'Ss (g)', 'text'],
  ['s1', 'S1 (g)', 'text'],
  ['belowGrade', 'Jumlah lantai bawah tanah', 'text'],
  ['floorArea', 'Luas lantai total (sq. ft.)', 'text'],
  ['codeYear', 'Tahun kode acuan', 'text'],
  ['additionYears', 'Penambahan bangunan: tahun / tidak ada / DNK', 'text'],
  [
    'occupancy',
    'Okupansi (assembly, commercial, school, residential, dll.)',
    'text',
  ],
  ['specialUse', 'Historic / government / shelter, jika ada', 'text'],
  ['units', 'Jumlah unit hunian', 'text'],
  ['verticalNote', 'Jenis ketidakberaturan vertikal', 'text'],
  ['planNote', 'Jenis ketidakberaturan denah', 'text'],
  ['otherFalling', 'Bahaya jatuh lainnya', 'text'],
  ['soilSource', 'Sumber informasi tanah', 'text'],
  ['geologySource', 'Sumber informasi geologi', 'text'],
  ['codeSource', 'Dasar pemilihan pre-code / post-benchmark', 'text'],
  [
    'exterior',
    'Cakupan eksterior: sebagian sisi / semua sisi / foto udara',
    'text',
  ],
  [
    'interior',
    'Cakupan interior: tidak masuk / terlihat dari luar / masuk ke dalam',
    'text',
  ],
  ['drawings', 'Gambar ditinjau: yes / no / DNK', 'text'],
  ['contact', 'Kontak (opsional)', 'text'],
  ['level2', 'Level 2: belum dilakukan / referensi hasil ahli', 'text'],
  [
    'action',
    'Catatan kebutuhan evaluasi struktur / nonstruktur dari pemeriksa',
    'text',
  ],
  ['comments', 'Komentar, EST (estimasi), DNK (belum diketahui)', 'textarea'],
] as const;
export type ObservationKey = (typeof observationFields)[number][0];
export interface RvsRecord {
  version: 1;
  form: 'FEMA-P154-2015-HIGH';
  inputs: RvsInputs;
  observations: Record<ObservationKey, string>;
  recordedBy: string;
  savedAt: string;
  demoAcknowledged: true;
}
export function emptyRvsInputs(stories = ''): RvsInputs {
  return {
    buildingType: 'DNK',
    soil: 'DNK',
    vertical: 'DNK',
    plan: 'DNK',
    code: 'DNK',
    stories,
    ...Object.fromEntries(hazardFields.map(([key]) => [key, 'DNK'])),
  } as RvsInputs;
}
export function emptyObservations(): RvsRecord['observations'] {
  return Object.fromEntries(
    observationFields.map(([key]) => [key, '']),
  ) as RvsRecord['observations'];
}
export function isRvsInputs(value: unknown): value is RvsInputs {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    Object.entries(scoringOptions).every(([key, options]) =>
      (options as readonly unknown[]).includes(r[key]),
    ) &&
    typeof r.stories === 'string' &&
    (r.stories === '' ||
      (/^\d{1,3}$/.test(r.stories) &&
        Number(r.stories) >= 1 &&
        Number(r.stories) <= 200)) &&
    hazardFields.every(([key]) =>
      ['DNK', 'yes', 'no'].includes(r[key] as string),
    )
  );
}
export function parseRvsRecord(value: unknown): RvsRecord | null {
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  if (
    r.version !== 1 ||
    r.form !== 'FEMA-P154-2015-HIGH' ||
    r.demoAcknowledged !== true ||
    !isRvsInputs(r.inputs) ||
    typeof r.recordedBy !== 'string' ||
    r.recordedBy.length > 100 ||
    typeof r.savedAt !== 'string' ||
    r.savedAt.length > 40 ||
    !Number.isFinite(Date.parse(r.savedAt)) ||
    !r.observations ||
    typeof r.observations !== 'object'
  )
    return null;
  const observations = r.observations as Record<string, unknown>;
  if (
    !observationFields.every(
      ([key]) =>
        typeof observations[key] === 'string' &&
        observations[key].length <= 1000,
    )
  )
    return null;
  // Allowlist all restored properties, so cached results or injected extra fields are ignored.
  return {
    version: 1,
    form: 'FEMA-P154-2015-HIGH',
    inputs: Object.fromEntries(
      [
        ...Object.keys(scoringOptions),
        'stories',
        ...hazardFields.map(([key]) => key),
      ].map((key) => [key, (r.inputs as Record<string, string>)[key]]),
    ) as RvsInputs,
    observations: Object.fromEntries(
      observationFields.map(([key]) => [key, observations[key]]),
    ) as RvsRecord['observations'],
    recordedBy: r.recordedBy,
    savedAt: r.savedAt,
    demoAcknowledged: true,
  };
}
export function calculateRvs(input: RvsInputs) {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const terms: { label: string; value: number }[] = [];
  if (!isRvsInputs(input))
    return {
      score: null,
      raw: null,
      minimum: null,
      terms,
      blockers: ['Isian simulasi tidak valid.'],
      warnings,
    };
  if (input.buildingType === 'DNK')
    blockers.push('Tipe bangunan belum diketahui; SL1 tidak dihitung.');
  if (!input.stories) blockers.push('Jumlah lantai di atas tanah belum diisi.');
  if (input.vertical === 'DNK' || input.plan === 'DNK' || input.code === 'DNK')
    blockers.push(
      'Lengkapi ketidakberaturan vertikal, denah, dan status kode sebelum menghitung.',
    );
  if (input.soil === 'F')
    blockers.push(
      'Tanah F tidak dapat dinilai efektif dengan RVS; diperlukan evaluasi ahli.',
    );
  if (input.soil === 'DNK')
    warnings.push(
      'Tanah belum diketahui: asumsi D digunakan sesuai formulir. Asumsi ini harus diverifikasi.',
    );
  const otherHazards = hazardFields
    .slice(0, 6)
    .filter(([key]) => input[key] === 'yes');
  if (otherHazards.length)
    warnings.push(
      `Bahaya di luar skor teridentifikasi: ${otherHazards.map(([, label]) => label).join(', ')}. Tinjauan ahli diperlukan; skor tidak meniadakan bahaya ini.`,
    );
  if (hazardFields.some(([key]) => input[key] === 'DNK'))
    warnings.push(
      'Sebagian bahaya belum diketahui; tidak boleh dianggap tidak ada.',
    );
  if (hazardFields.slice(6).some(([key]) => input[key] === 'yes'))
    warnings.push(
      'Bahaya nonstruktur dicatat untuk evaluasi terpisah dari skor SL1.',
    );
  if (blockers.length || input.buildingType === 'DNK')
    return { score: null, raw: null, minimum: null, terms, blockers, warnings };
  const row = highScores[input.buildingType];
  const add = (label: string, index: number) => {
    const value = row[index];
    if (value === null)
      blockers.push(
        `${label}: NA untuk tipe ${input.buildingType}; kombinasi ini perlu diperiksa ahli.`,
      );
    else terms.push({ label, value });
  };
  add('Basic score', 0);
  if (input.vertical === 'severe') add('Severe vertical irregularity', 1);
  if (input.vertical === 'moderate') add('Moderate vertical irregularity', 2);
  if (input.plan === 'yes') add('Plan irregularity', 3);
  if (input.code === 'pre') add('Pre-code', 4);
  if (input.code === 'post') add('Post-benchmark', 5);
  if (['A', 'B'].includes(input.soil)) add('Soil A / B', 6);
  if (input.soil === 'E')
    add(
      Number(input.stories) <= 3 ? 'Soil E · 1–3 lantai' : 'Soil E · >3 lantai',
      Number(input.stories) <= 3 ? 7 : 8,
    );
  if (blockers.length)
    return {
      score: null,
      raw: null,
      minimum: row[9],
      terms,
      blockers,
      warnings,
    };
  const raw =
    Math.round(terms.reduce((sum, item) => sum + item.value, 0) * 10) / 10;
  const minimum = row[9]!;
  return {
    score: Math.max(raw, minimum),
    raw,
    minimum,
    terms,
    blockers,
    warnings,
  };
}
