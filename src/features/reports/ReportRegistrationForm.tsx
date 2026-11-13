import { demoId } from '../../lib/demoId';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  reportBuildingFields,
  validateReportRegistration,
} from '../../lib/reportDemo';
import type { Report } from '../../lib/reportDemo';

export default function ReportRegistrationForm({
  initial,
  reporterId,
  onSave,
  onCancel,
}: {
  initial: Report | null;
  reporterId: string;
  onSave: (report: Report, send: boolean) => void;
  onCancel: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const summary = useRef<HTMLDivElement>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const send =
      submitter instanceof HTMLButtonElement && submitter.value === 'send';
    const read = (key: string) => String(form.get(key) ?? '').trim();
    const report: Report = {
      ...initial,
      id: initial?.id ?? `LAP-${demoId()}`,
      reporterId,
      title: read('title'),
      location: read('location'),
      address: read('address'),
      landmark: read('landmark'),
      contactPhone: read('contactPhone'),
      description: read('description'),
      function: read('function'),
      year: read('year'),
      floors: read('floors'),
      material: read('material'),
      structure: read('structure'),
      demoConsent: form.get('demoConsent') === 'on',
      understandsRvs: form.get('understandsRvs') === 'on',
      status: initial?.status ?? 'Draf',
    };
    const next = validateReportRegistration(report, !send);
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    onSave(report, send);
  }
  const inputs = [
    ['title', 'Nama bangunan'],
    ['location', 'Kawasan (desa/kelurahan, kecamatan)'],
    ...reportBuildingFields,
  ] as const;
  return (
    <form className="ws-panel report-form" onSubmit={submit} noValidate>
      <span className="ws-badge">TAHAP 01 · REGISTRASI BANGUNAN</span>
      <h2>{initial ? 'Ubah data laporan' : 'Daftarkan bangunan contoh'}</h2>
      <p>
        Isi data dasar untuk menghubungkan laporan dengan profil bangunan. Pilih
        “Belum diketahui” untuk material atau struktur jika belum yakin.
      </p>
      {!!Object.keys(errors).length && (
        <div ref={summary} tabIndex={-1} role="alert" className="ws-errors">
          <strong>Periksa kembali isian.</strong>
          <ul>
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>
                <a
                  href={`#report-${key}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById(`report-${key}`)?.focus();
                  }}
                >
                  {error}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="report-registration-grid">
        {inputs.map(([key, label]) => (
          <label key={key} htmlFor={`report-${key}`}>
            {label}
            {key === 'year' ? ' (opsional)' : ' *'}
            <input
              id={`report-${key}`}
              name={key}
              defaultValue={initial?.[key] ?? ''}
              maxLength={
                key === 'location'
                  ? 200
                  : key === 'year'
                    ? 4
                    : key === 'floors'
                      ? 3
                      : 100
              }
              inputMode={['year', 'floors'].includes(key) ? 'numeric' : 'text'}
              list={
                ['function', 'material', 'structure'].includes(key)
                  ? `options-${key}`
                  : undefined
              }
              placeholder={
                key === 'location'
                  ? 'Contoh: Desa Jambudipa, Kecamatan Cisarua'
                  : key === 'year'
                    ? 'Kosongkan jika belum diketahui'
                    : undefined
              }
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `report-error-${key}` : undefined}
            />
            {errors[key] && (
              <small className="ws-error" id={`report-error-${key}`}>
                {errors[key]}
              </small>
            )}
          </label>
        ))}
      </div>
      <fieldset className="report-visit-fields">
        <legend>Alamat untuk kunjungan survei</legend>
        <label htmlFor="report-address">
          Alamat lengkap *
          <textarea
            id="report-address"
            name="address"
            rows={2}
            maxLength={300}
            defaultValue={initial?.address ?? ''}
            placeholder="Nama jalan atau gang, nomor, RT/RW, desa/kelurahan, kecamatan"
            aria-invalid={!!errors.address}
            aria-describedby={
              errors.address ? 'report-error-address' : 'report-visit-privacy'
            }
          />
          {errors.address && (
            <small className="ws-error" id="report-error-address">
              {errors.address}
            </small>
          )}
        </label>
        <label htmlFor="report-landmark">
          Patokan (opsional)
          <input
            id="report-landmark"
            name="landmark"
            maxLength={150}
            defaultValue={initial?.landmark ?? ''}
            placeholder="Contoh: pagar biru, seberang masjid, tanya Pak RT"
          />
        </label>
        <label htmlFor="report-contactPhone">
          Nomor yang bisa dihubungi pesurvei (opsional)
          <input
            id="report-contactPhone"
            name="contactPhone"
            type="tel"
            inputMode="tel"
            maxLength={20}
            defaultValue={initial?.contactPhone ?? ''}
            placeholder="Contoh: 0812 3456 7890"
            aria-invalid={!!errors.contactPhone}
            aria-describedby={
              errors.contactPhone
                ? 'report-error-contactPhone'
                : 'report-visit-privacy'
            }
          />
          {errors.contactPhone && (
            <small className="ws-error" id="report-error-contactPhone">
              {errors.contactPhone}
            </small>
          )}
        </label>
        <p className="ws-muted" id="report-visit-privacy">
          Alamat, patokan, dan nomor hanya terlihat oleh admin dan pesurvei yang
          ditugaskan ke laporan ini. Data ini tidak tampil di profil bangunan
          maupun QR. Nomor boleh milik penghuni atau pengelola bangunan.
        </p>
      </fieldset>
      <datalist id="options-function">
        {[
          'Rumah tinggal',
          'Hunian sewa',
          'Tempat usaha',
          'Fasilitas pendidikan',
          'Fasilitas kesehatan',
          'Fasilitas umum',
          'Lainnya',
        ].map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
      <datalist id="options-material">
        {['Bata', 'Beton', 'Kayu', 'Baja', 'Campuran', 'Belum diketahui'].map(
          (value) => (
            <option key={value} value={value} />
          ),
        )}
      </datalist>
      <datalist id="options-structure">
        {[
          'Rangka beton',
          'Rangka baja',
          'Rangka kayu',
          'Dinding pemikul',
          'Belum diketahui',
        ].map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
      <label htmlFor="report-description">
        Catatan laporan *
        <textarea
          id="report-description"
          name="description"
          maxLength={1000}
          defaultValue={initial?.description ?? ''}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? 'report-error-description' : undefined
          }
        />
      </label>
      {errors.description && (
        <small className="ws-error" id="report-error-description">
          {errors.description}
        </small>
      )}
      <p className="ws-muted">
        * Wajib saat mengirim. Draf cukup berisi nama dan persetujuan data.
        Pilihan isian adalah bantuan pencatatan, bukan formulir penilaian RVS.
      </p>
      {(
        [
          [
            'demoConsent',
            'Saya setuju data laporan ini dipakai untuk pencatatan dan penugasan survei.',
          ],
          [
            'understandsRvs',
            'Saya memahami bahwa RVS adalah penyaringan awal, bukan sertifikat aman, dan tidak menggantikan evaluasi ahli.',
          ],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <label className="report-checkbox">
            <input
              type="checkbox"
              id={`report-${key}`}
              name={key}
              defaultChecked={initial?.[key] ?? false}
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `report-error-${key}` : undefined}
            />
            <span>{label}</span>
          </label>
          {errors[key] && (
            <small className="ws-error" id={`report-error-${key}`}>
              {errors[key]}
            </small>
          )}
        </div>
      ))}
      <div className="report-actions">
        <button type="submit" value="draft" className="ws-secondary">
          Simpan draf
        </button>
        <button type="submit" value="send" className="ws-primary">
          Simpan dan kirim laporan
        </button>
        <button type="button" className="ws-secondary" onClick={onCancel}>
          Batal
        </button>
      </div>
    </form>
  );
}
