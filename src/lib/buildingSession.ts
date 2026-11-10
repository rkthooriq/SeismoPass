import type { Building } from '../types/building';

type SessionStore = Pick<Storage, 'getItem' | 'setItem'>;
export type SessionAccess = () => SessionStore;
export const sessionKey = 'seismopass.demo.buildings.v1';
const fields = [
  'id',
  'name',
  'location',
  'function',
  'year',
  'floors',
  'material',
  'structure',
] as const;

function isBuilding(value: unknown): value is Building {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    fields.every(
      (key) => typeof record[key] === 'string' && record[key].length <= 200,
    ) &&
    typeof record.id === 'string' &&
    /^DEMO-[\w-]+$/.test(record.id) &&
    typeof record.name === 'string' &&
    record.name.trim().length > 0 &&
    (record.status === 'Draf' || record.status === 'Data tercatat')
  );
}

export function loadBuildingSession(
  access: SessionAccess,
  fallback: Building[],
): {
  buildings: Building[];
  status: 'new' | 'restored' | 'invalid' | 'unavailable';
} {
  let raw: string | null;
  try {
    raw = access().getItem(sessionKey);
  } catch {
    return { buildings: fallback, status: 'unavailable' };
  }
  if (raw === null) return { buildings: fallback, status: 'new' };
  try {
    if (raw.length > 1_000_000) throw new Error('Session too large');
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object')
      throw new Error('Invalid session');
    const { version, buildings } = parsed as Record<string, unknown>;
    if (
      version !== 1 ||
      !Array.isArray(buildings) ||
      buildings.length > 500 ||
      !buildings.every(isBuilding) ||
      new Set(buildings.map((b) => b.id)).size !== buildings.length
    )
      throw new Error('Invalid records');
    return { buildings, status: 'restored' };
  } catch {
    return { buildings: fallback, status: 'invalid' };
  }
}

export function saveBuildingSession(
  access: SessionAccess,
  buildings: Building[],
): boolean {
  try {
    access().setItem(sessionKey, JSON.stringify({ version: 1, buildings }));
    return true;
  } catch {
    return false;
  }
}

export function exportBuildingDemo(buildings: Building[]): string {
  return JSON.stringify(
    {
      mode: 'DEMONSTRASI',
      description:
        'Data fiktif. Bukan hasil screening RVS atau sertifikat aman.',
      version: 1,
      buildings,
    },
    null,
    2,
  );
}
