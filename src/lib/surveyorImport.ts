import Papa from 'papaparse';
import {
  createManagedSurveyor,
  validateSurveyorInput,
} from './surveyorAccess.ts';
import type { NewSurveyorInput } from './surveyorAccess.ts';
import type { AccountIdentity, DemoAccount } from './reportDemo';

export const importColumns = [
  'nama',
  'email',
  'organisasi',
  'catatan_kompetensi',
];
export const maxImportRows = 100;
export const maxImportBytes = 2 * 1024 * 1024;
export interface ImportRow {
  row: number;
  input: NewSurveyorInput;
  errors: string[];
}
export interface ImportPreview {
  rows: ImportRow[];
  errors: string[];
}

export function parseSurveyorCsv(text: string): unknown[][] {
  const result = Papa.parse<string[]>(text.replace(/^\uFEFF/, ''), {
    delimitersToGuess: [',', ';', '\t'],
    skipEmptyLines: false,
  });
  if (result.errors.length)
    throw new Error(
      'CSV tidak terbaca. Periksa pemisah kolom dan tanda kutip, atau gunakan template.',
    );
  return result.data;
}

export function previewSurveyorImport(
  matrix: unknown[][],
  existing: DemoAccount[],
): ImportPreview {
  const errors: string[] = [];
  const headers =
    matrix[0]?.map((value) =>
      String(value ?? '')
        .trim()
        .toLowerCase(),
    ) ?? [];
  if (
    headers.length !== importColumns.length ||
    new Set(headers).size !== headers.length ||
    importColumns.some((column) => !headers.includes(column))
  )
    return {
      rows: [],
      errors: [
        'Kolom tidak sesuai. Gunakan tepat empat kolom pada template: nama, email, organisasi, catatan_kompetensi.',
      ],
    };
  const data = matrix
    .slice(1)
    .map((cells, index) => ({ cells, row: index + 2 }))
    .filter(({ cells }) =>
      cells.some(
        (value) =>
          value !== null && value !== undefined && String(value).trim() !== '',
      ),
    );
  if (!data.length)
    errors.push('File belum berisi data pesurvei. Isi minimal satu baris.');
  if (data.length > maxImportRows)
    return {
      rows: [],
      errors: [
        `Maksimal ${maxImportRows} akun per impor. Pisahkan file menjadi beberapa bagian.`,
      ],
    };
  if (existing.length + data.length > 500)
    errors.push(
      `Sisa kapasitas sesi: ${Math.max(0, 500 - existing.length)} akun. Kurangi jumlah baris.`,
    );
  const emails = new Set(
    existing.map((account) => account.email.trim().toLowerCase()),
  );
  const rows = data.map(({ cells, row }) => {
    const get = (column: string) =>
      String(cells[headers.indexOf(column)] ?? '').trim();
    const input = {
      name: get('nama'),
      email: get('email').toLowerCase(),
      organization: get('organisasi'),
      qualification: get('catatan_kompetensi'),
    };
    const rowErrors = validateSurveyorInput(input);
    if (
      cells.length > headers.length ||
      cells.some((value) => value != null && typeof value !== 'string')
    )
      rowErrors.push('Gunakan teks biasa pada empat kolom template.');
    if (Object.values(input).some((value) => /^[=+@-]/.test(value)))
      rowErrors.push('Gunakan teks biasa, tanpa rumus atau awalan =, +, -, @.');
    if (emails.has(input.email)) rowErrors.push('Email sudah terdaftar.');
    if (
      input.email &&
      data.filter(
        ({ cells: other }) =>
          String(other[headers.indexOf('email')] ?? '')
            .trim()
            .toLowerCase() === input.email,
      ).length > 1
    )
      rowErrors.push('Email berulang di dalam file.');
    return { row, input, errors: rowErrors };
  });
  return { rows, errors };
}

// Validate again against current accounts, then return one atomic update.
export function createSurveyorBatch(
  admin: AccountIdentity,
  inputs: NewSurveyorInput[],
  existing: DemoAccount[],
  credentials: () => { id: string; password: string },
):
  | {
      accounts: DemoAccount[];
      issued: { name: string; email: string; password: string }[];
    }
  | { error: string } {
  if (admin.role !== 'admin' || admin.status !== 'active')
    return { error: 'Hanya admin aktif yang dapat mengimpor akun.' };
  const preview = previewSurveyorImport(
    [
      importColumns,
      ...inputs.map((input) => [
        input.name,
        input.email,
        input.organization,
        input.qualification,
      ]),
    ],
    existing,
  );
  const error =
    preview.errors[0] ??
    preview.rows.find((row) => row.errors.length)?.errors[0];
  if (error) return { error };
  const accounts = [...existing];
  const issued = [];
  for (const { input } of preview.rows) {
    const { id, password } = credentials();
    if (accounts.some((account) => account.id === id))
      return { error: 'ID akun bertabrakan. Coba impor ulang.' };
    const result = createManagedSurveyor(admin, input, accounts, id, password);
    if ('error' in result) return result;
    accounts.push(result.account);
    issued.push({
      name: result.account.name,
      email: result.account.email,
      password,
    });
  }
  return { accounts, issued };
}

export function credentialsCsv(
  accounts: { name: string; email: string; password: string }[],
): string {
  return (
    '\uFEFF' +
    Papa.unparse(
      {
        fields: ['nama', 'email', 'sandi_sementara'],
        data: accounts.map((account) => [
          account.name,
          account.email,
          account.password,
        ]),
      },
      { escapeFormulae: true },
    )
  );
}
