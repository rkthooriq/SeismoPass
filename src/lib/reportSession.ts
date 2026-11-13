import { parseRvsRecord } from './rvs.ts';
import type { Report, ReportStatus } from './reportDemo';

const statuses: ReportStatus[] = [
  'Draf',
  'Dikirim',
  'Perlu dilengkapi',
  'Siap disurvei',
  'Ditugaskan',
  'Dalam survei',
  'Ditinjau',
  'Perlu revisi',
  'Selesai',
];
const required = [
  'id',
  'reporterId',
  'title',
  'location',
  'description',
] as const;
const optional = [
  'address',
  'landmark',
  'contactPhone',
  'function',
  'year',
  'floors',
  'material',
  'structure',
  'assignee',
  'assignedBy',
  'assignmentNote',
  'visitDate',
  'visitNote',
  'reviewNote',
] as const;

// Read old demo sessions without inventing missing building data or consent.
export function restoreReports(
  raw: string | null,
  fallback: Report[],
  ownerIds: readonly string[] = ['owner-demo'],
): Report[] {
  if (raw === null || raw.length > 1_000_000) return fallback;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data) || data.length > 500) return fallback;
    const reports: Report[] = [];
    for (const item of data) {
      if (!item || typeof item !== 'object' || Array.isArray(item))
        return fallback;
      const record = item as Record<string, unknown>;
      if (
        !required.every(
          (key) =>
            typeof record[key] === 'string' && record[key].length <= 1000,
        )
      )
        return fallback;
      if (
        !optional.every(
          (key) =>
            record[key] === undefined ||
            (typeof record[key] === 'string' && record[key].length <= 1000),
        )
      )
        return fallback;
      if (
        !['demoConsent', 'understandsRvs'].every(
          (key) =>
            record[key] === undefined || typeof record[key] === 'boolean',
        )
      )
        return fallback;
      if (
        !ownerIds.includes(record.reporterId as string) ||
        typeof record.id !== 'string' ||
        !/^LAP-[\w-]+$/.test(record.id)
      )
        return fallback;
      const status =
        record.status === 'Ditugaskan' && !record.assignee
          ? 'Siap disurvei'
          : record.status;
      if (!statuses.includes(status as ReportStatus)) return fallback;
      const report: Report = {
        id: record.id,
        reporterId: record.reporterId as string,
        title: record.title as string,
        location: record.location as string,
        description: record.description as string,
        status: status as ReportStatus,
      };
      for (const key of optional)
        if (typeof record[key] === 'string') report[key] = record[key];
      for (const key of ['demoConsent', 'understandsRvs'] as const)
        if (typeof record[key] === 'boolean') report[key] = record[key];
      if (record.rvs !== undefined) {
        const rvs = parseRvsRecord(record.rvs);
        if (rvs) report.rvs = rvs;
      }
      if (record.activity !== undefined) {
        if (
          !Array.isArray(record.activity) ||
          record.activity.length > 500 ||
          !record.activity.every(
            (event) =>
              event &&
              typeof event === 'object' &&
              ['by', 'action', 'note', 'at'].every(
                (key) =>
                  typeof event[key] === 'string' && event[key].length <= 1000,
              ),
          )
        )
          return fallback;
        report.activity = record.activity.map((event) => ({
          by: event.by,
          action: event.action,
          note: event.note,
          at: event.at,
        }));
      }
      reports.push(report);
    }
    return new Set(reports.map((report) => report.id)).size === reports.length
      ? reports
      : fallback;
  } catch {
    return fallback;
  }
}
