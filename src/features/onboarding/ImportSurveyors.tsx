import { useEffect, useRef, useState } from 'react';
import {
  maxImportBytes,
  maxImportRows,
  parseSurveyorCsv,
  previewSurveyorImport,
} from '../../lib/surveyorImport';
import type { DemoAccount } from '../../lib/reportDemo';
import type { NewSurveyorInput } from '../../lib/surveyorAccess';
import type { IssuedPassword } from './SurveyorManagement';

export type ImportAccounts = (
  inputs: NewSurveyorInput[],
) => { issued: IssuedPassword[] } | { error: string };

export default function ImportSurveyors({
  accounts,
  onImport,
  onSuccess,
}: {
  accounts: DemoAccount[];
  onImport: ImportAccounts;
  onSuccess: (issued: IssuedPassword[]) => void;
}) {
  const [matrix, setMatrix] = useState<unknown[][] | null>(null);
  const [filename, setFilename] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(0);
  const submitted = useRef(false);
  useEffect(
    () => () => {
      request.current += 1;
    },
    [],
  );
  const preview = matrix ? previewSurveyorImport(matrix, accounts) : null;
  const invalid = preview?.rows.filter((row) => row.errors.length).length ?? 0;
  const ready =
    !!preview?.rows.length && !preview.errors.length && !invalid && !busy;

  async function read(file?: File) {
    const token = ++request.current;
    setMatrix(null);
    setFilename(file?.name ?? '');
    setError('');
    if (!file) return;
    if (!/\.(xlsx|csv)$/i.test(file.name)) {
      setError('Pilih file Excel (.xlsx) atau CSV (.csv).');
      return;
    }
    if (file.size > maxImportBytes) {
      setError(
        'Ukuran file maksimal 2 MB. Pisahkan data menjadi beberapa file.',
      );
      return;
    }
    setBusy(true);
    try {
      let data: unknown[][];
      if (/\.csv$/i.test(file.name)) data = parseSurveyorCsv(await file.text());
      else {
        const { readSheet } = await import('read-excel-file/browser');
        data = await readSheet(file, 1);
      }
      if (request.current === token) setMatrix(data);
    } catch (cause) {
      if (request.current === token)
        setError(
          /\.csv$/i.test(file.name) && cause instanceof Error
            ? cause.message
            : 'File Excel tidak terbaca. Gunakan template .xlsx tanpa proteksi, lalu pilih ulang.',
        );
    } finally {
      if (request.current === token) setBusy(false);
    }
  }
  function submit() {
    if (!ready || !preview || submitted.current) return;
    submitted.current = true;
    const result = onImport(preview.rows.map((row) => row.input));
    if ('error' in result) {
      setError(result.error);
      submitted.current = false;
      return;
    }
    onSuccess(result.issued);
  }
  return (
    <div className="directory-import">
      <p>Isi template, periksa data, lalu buat akun pesurvei sekaligus.</p>
      <div className="directory-template-links" aria-label="Unduh template">
        <a
          className="ws-secondary"
          href={`${import.meta.env.BASE_URL}templates/template-pesurvei.xlsx`}
          download
        >
          Unduh template Excel
        </a>
        <a
          className="ws-secondary"
          href={`${import.meta.env.BASE_URL}templates/template-pesurvei.csv`}
          download
        >
          Unduh template CSV
        </a>
      </div>
      <ul className="directory-import-guide">
        <li>Ganti dua baris contoh dengan datamu. Semua kolom wajib diisi.</li>
        <li>
          Gunakan email <strong>@example.com</strong> dan data contoh pada versi
          ini.
        </li>
        <li>
          Maksimal {maxImportRows} akun, 2 MB. Excel dibaca dari lembar pertama;
          CSV boleh memakai koma atau titik koma.
        </li>
      </ul>
      <label className="directory-file">
        Pilih file Excel atau CSV
        <input
          type="file"
          accept=".xlsx,.csv"
          disabled={busy}
          onClick={(event) => {
            event.currentTarget.value = '';
          }}
          onChange={(event) => {
            void read(event.currentTarget.files?.[0]);
          }}
        />
      </label>
      {busy && <p role="status">Membaca dan memeriksa file…</p>}
      {error && (
        <p className="directory-import-error" role="alert">
          {error}
        </p>
      )}
      {preview && (
        <>
          <div className="directory-import-summary" role="status">
            <strong>{filename}</strong>
            <p>
              {preview.rows.length - invalid} siap diimpor · {invalid} perlu
              diperbaiki
            </p>
          </div>
          {preview.errors.length > 0 && (
            <ul className="directory-import-error" role="alert">
              {preview.errors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {!!preview.rows.length && (
            <div
              className="directory-preview"
              role="region"
              aria-label="Pratinjau impor pesurvei"
              tabIndex={0}
            >
              <table className="directory-table">
                <caption className="directory-sr-only">
                  Periksa setiap baris sebelum membuat akun
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Baris</th>
                    <th scope="col">Nama dan email</th>
                    <th scope="col">Organisasi / kompetensi</th>
                    <th scope="col">Pemeriksaan</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map(({ row, input, errors }) => (
                    <tr key={row}>
                      <th scope="row">{row}</th>
                      <td>
                        <strong>{input.name || 'Nama kosong'}</strong>
                        <span>{input.email || 'Email kosong'}</span>
                      </td>
                      <td>
                        {input.organization}
                        <span>{input.qualification}</span>
                      </td>
                      <td>
                        {errors.length ? (
                          <ul className="directory-import-error">
                            {errors.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="directory-status">Siap diimpor</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!ready && (
            <p>
              Perbaiki file lalu pilih ulang. Akun belum dibuat sampai semua
              baris valid.
            </p>
          )}
        </>
      )}
      <div className="directory-import-footer">
        <p>
          Sandi sementara dibuat otomatis. Setiap pesurvei wajib menggantinya
          saat masuk pertama.
        </p>
        <button
          type="button"
          className="ws-primary"
          disabled={!ready}
          onClick={submit}
        >
          Buat {preview?.rows.length || ''} akun pesurvei
        </button>
      </div>
    </div>
  );
}
