// Sumber resmi: https://data.bmkg.go.id/gempabumi/
// Feed nasional disaring menurut wilayah dirasakan, bukan dugaan sesar penyebab.
export const bmkgFeedUrl =
  'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json';
export const bmkgPageUrl = 'https://www.bmkg.go.id/gempabumi';
export const bmkgRefreshMs = 60_000;

export type BmkgCoordinates = { latitude: number; longitude: number };

export function parseBmkgCoordinates(value: unknown): BmkgCoordinates | null {
  if (typeof value !== 'string') return null;
  const parts = value.split(',').map((part) => part.trim());
  if (
    parts.length !== 2 ||
    parts.some((part) => !/^-?\d+(?:\.\d+)?$/.test(part))
  )
    return null;
  const [latitude, longitude] = parts.map(Number);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  )
    return null;
  return { latitude, longitude };
}

export type EarthquakeMapView = {
  center: [latitude: number, longitude: number];
  /** [[south, west], [north, east]] around the epicenter. */
  bounds: [[number, number], [number, number]];
  /** The same point on openstreetmap.org, for the "Perbesar peta" link. */
  full: string;
};

export function earthquakeMapView(
  point: BmkgCoordinates | null,
): EarthquakeMapView | null {
  if (
    !point ||
    !Number.isFinite(point.latitude) ||
    !Number.isFinite(point.longitude) ||
    Math.abs(point.latitude) > 85.0511 ||
    Math.abs(point.longitude) > 180
  )
    return null;
  const { latitude, longitude } = point;
  // Luas tampilan peta saja, bukan radius dampak/risiko gempa.
  return {
    center: [latitude, longitude],
    bounds: [
      [Math.max(-85.0511, latitude - 0.45), Math.max(-180, longitude - 0.85)],
      [Math.min(85.0511, latitude + 0.45), Math.min(180, longitude + 0.85)],
    ],
    full: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=9/${latitude}/${longitude}`,
  };
}

export type BmkgEarthquake = {
  date: string;
  time: string;
  dateTime: string;
  magnitude: string;
  depth: string;
  latitude: string;
  longitude: string;
  coordinates: BmkgCoordinates | null;
  region: string;
  felt: string;
  localFelt: string[];
};

// Pencocokan konservatif nama wilayah Bandung Raya. Cisarua saja ambigu
// (juga ada di Bogor), sehingga tidak menjadi kata kunci tersendiri.
const bandungArea =
  /\b(?:bandung(?:\s*barat)?|cimahi|lembang|parongpong|parompong|padalarang|ngamprah|batujajar|cileunyi|soreang|ciwidey|pangalengan|baleendah)\b/i;

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Format data BMKG tidak sesuai.');
  return value as Record<string, unknown>;
}

function required(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  if (typeof value !== 'string' || !value.trim())
    throw new Error(`Parameter BMKG tidak tersedia: ${key}`);
  return value.trim();
}

export function parseBandungEarthquakes(payload: unknown): BmkgEarthquake[] {
  const entries = record(record(payload).Infogempa).gempa;
  if (!Array.isArray(entries))
    throw new Error('Daftar gempa BMKG tidak valid.');
  return entries
    .map((entry): BmkgEarthquake => {
      const data = record(entry);
      const dateTime = required(data, 'DateTime');
      if (!Number.isFinite(Date.parse(dateTime)))
        throw new Error('Waktu kejadian BMKG tidak valid.');
      const felt = required(data, 'Dirasakan');
      return {
        date: required(data, 'Tanggal'),
        time: required(data, 'Jam'),
        dateTime,
        magnitude: required(data, 'Magnitude'),
        depth: required(data, 'Kedalaman'),
        latitude: required(data, 'Lintang'),
        longitude: required(data, 'Bujur'),
        coordinates: parseBmkgCoordinates(data.Coordinates ?? data.coordinates),
        region: required(data, 'Wilayah'),
        felt,
        localFelt: felt
          .split(',')
          .map((area) => area.trim())
          .filter((area) => bandungArea.test(area)),
      };
    })
    .filter((event) => event.localFelt.length > 0)
    .sort((a, b) => Date.parse(b.dateTime) - Date.parse(a.dateTime));
}

type BmkgResult = { earthquakes: BmkgEarthquake[]; checkedAt: number };
let cached: BmkgResult | null = null;
let pending: Promise<BmkgResult> | null = null;

// Cache dan berbagi permintaan dalam tab, termasuk saat React StrictMode mount ulang.
export function loadBandungEarthquakes(): Promise<BmkgResult> {
  if (cached && Date.now() - cached.checkedAt < bmkgRefreshMs)
    return Promise.resolve(cached);
  if (pending) return pending;
  pending = (async () => {
    const response = await fetch(bmkgFeedUrl, {
      signal: AbortSignal.timeout(10_000),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    });
    if (!response.ok) throw new Error('Data BMKG belum dapat dimuat.');
    const payload: unknown = await response.json();
    const result = {
      earthquakes: parseBandungEarthquakes(payload),
      checkedAt: Date.now(),
    };
    cached = result;
    return result;
  })().finally(() => {
    pending = null;
  });
  return pending;
}
