import { demoId } from '../../lib/demoId';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  reportBuildingFields,
  validateReportRegistration,
} from '../../lib/reportDemo';
import type { Report } from '../../lib/reportDemo';
import BuildingLocation from './BuildingLocation';
import BuildingPhotos from './BuildingPhotos';
import type { BuildingPoint } from '../../lib/ownerProgress';
import { clearBuildingPhotos } from '../../lib/buildingPhotos';
import { focusAndReveal } from '../../lib/reveal';
import './owner-workspace.css';

function fieldStep(key: string): number {
  if (
    [
      'title',
      'location',
      ...reportBuildingFields.map(([name]) => name),
    ].includes(key)
  )
    return 0;
  return ['address', 'landmark', 'contactPhone'].includes(key) ? 1 : 2;
}

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
  const [step, setStep] = useState(0);
  const [reportId] = useState(() => initial?.id ?? `LAP-${demoId()}`);
  const [point, setPoint] = useState<BuildingPoint | undefined>(
    initial?.ownerProgress?.point,
  );
  const [review, setReview] = useState<Report | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const saved = useRef(false);
  useEffect(
    () => () => {
      if (!initial && !saved.current)
        void clearBuildingPhotos(`${reporterId}/${reportId}`).catch(() => {});
    },
    [initial, reporterId, reportId],
  );
  const summary = useRef<HTMLDivElement>(null);
  const visibleErrors = Object.entries(errors).filter(
    ([key]) => fieldStep(key) === step,
  );
  function changeStep(next: number) {
    setErrors({});
    setStep(next);
  }
  function updateFieldError(event: FormEvent<HTMLFormElement>) {
    const field = event.target;
    if (
      !(
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement
      )
    )
      return;
    if (!errors[field.name]) return;
    const next = validateReportRegistration(readReport(event.currentTarget));
    setErrors((current) => {
      const updated = { ...current };
      if (next[field.name]) updated[field.name] = next[field.name];
      else delete updated[field.name];
      return updated;
    });
  }
  function readReport(element: HTMLFormElement): Report {
    const form = new FormData(element);
    const read = (key: string) => String(form.get(key) ?? '').trim();
    return {
      ...initial,
      id: reportId,
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
      ownerProgress: { ...initial?.ownerProgress, point },
    };
  }
  function goNext() {
    if (!formRef.current) return;
    const report = readReport(formRef.current);
    const all = validateReportRegistration(report);
    const current = Object.fromEntries(
      Object.entries(all).filter(([key]) => fieldStep(key) === step),
    );
    setErrors(current);
    if (Object.keys(current).length) {
      requestAnimationFrame(() => focusAndReveal(summary.current));
      return;
    }
    setReview(report);
    setStep(Math.min(step + 1, 2));
    requestAnimationFrame(() =>
      focusAndReveal(document.getElementById('owner-form-heading')),
    );
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const draft =
      submitter instanceof HTMLButtonElement && submitter.value === 'draft';
    if (!draft && step < 2) {
      goNext();
      return;
    }
    const send = !draft && step === 2;
    const report = readReport(event.currentTarget);
    setReview(report);
    const next = validateReportRegistration(report, !send);
    setErrors(next);
    if (Object.keys(next).length) {
      setStep(Math.min(...Object.keys(next).map(fieldStep)));
      requestAnimationFrame(() => focusAndReveal(summary.current));
      return;
    }
    saved.current = true;
    onSave(report, send);
  }
  const inputs = [
    ['title', 'Nama bangunan'],
    ['location', 'Kawasan (desa/kelurahan, kecamatan)'],
    ...reportBuildingFields,
  ] as const;
  return (
    <form
      ref={formRef}
      className="ws-panel report-form owner-registration"
      onSubmit={submit}
      onChange={updateFieldError}
      noValidate
    >
      <div className="owner-section-title">
        <div>
          <span className="owner-kicker">Catatan bangunan</span>
          <h2 id="owner-form-heading" tabIndex={-1}>
            {initial ? 'Lengkapi catatan bangunanmu' : 'Mulai dari bangunanmu'}
          </h2>
        </div>
        <span className="owner-chip">Langkah {step + 1} dari 3</span>
      </div>
      <p>
        Isi data dasar untuk menghubungkan laporan dengan profil bangunan. Pilih
        “Belum diketahui” untuk material atau struktur jika belum yakin.
      </p>
      <ol className="owner-form-steps" aria-label="Tahap pencatatan bangunan">
        {['Data bangunan', 'Lokasi & akses', 'Periksa & kirim'].map(
          (label, index) => (
            <li
              key={label}
              className={
                step === index
                  ? 'is-current'
                  : step > index
                    ? 'is-complete'
                    : ''
              }
            >
              <button
                type="button"
                aria-current={step === index ? 'step' : undefined}
                disabled={index > step}
                onClick={() => changeStep(index)}
              >
                <span>{index + 1}</span>
                {label}
              </button>
            </li>
          ),
        )}
      </ol>
      {!!visibleErrors.length && (
        <div
          ref={summary}
          tabIndex={-1}
          role="alert"
          className="ws-errors owner-validation"
        >
          <strong>
            Periksa {visibleErrors.length} isian pada langkah ini.
          </strong>
          <ul>
            {visibleErrors.map(([key, error]) => (
              <li key={key}>
                <a
                  href={`#report-${key}`}
                  onClick={(event) => {
                    event.preventDefault();
                    focusAndReveal(
                      document.getElementById(`report-${key}`),
                      'center',
                    );
                  }}
                >
                  {error}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div hidden={step !== 0} className="owner-form-section">
        <h3>Kenali data dasarnya</h3>
        <p className="owner-footnote">
          Tidak harus tahu semuanya. Tahun boleh dikosongkan; material dan
          struktur dapat dipilih “Belum diketahui”.
        </p>
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
                inputMode={
                  ['year', 'floors'].includes(key) ? 'numeric' : 'text'
                }
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
                aria-describedby={
                  errors[key] ? `report-error-${key}` : undefined
                }
              />
              {errors[key] && (
                <small className="ws-error" id={`report-error-${key}`}>
                  {errors[key]}
                </small>
              )}
            </label>
          ))}
        </div>
      </div>
      <div hidden={step !== 1} className="owner-form-section">
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
            Alamat, patokan, dan nomor hanya terlihat oleh admin dan pesurvei
            yang ditugaskan ke laporan ini. Data ini tidak tampil di profil
            bangunan maupun QR. Nomor boleh milik penghuni atau pengelola
            bangunan.
          </p>
        </fieldset>
        {step === 1 && <BuildingLocation value={point} onChange={setPoint} />}
      </div>
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
      <div hidden={step !== 2} className="owner-form-section">
        <div className="owner-review">
          <span className="owner-kicker">Periksa sebelum mengirim</span>
          <h3>{review?.title || initial?.title || 'Bangunanmu'}</h3>
          <p>{review?.address || initial?.address || 'Alamat belum diisi'}</p>
          <div>
            <span>
              {review?.function || initial?.function || 'Fungsi belum diisi'}
            </span>
            <span>{review?.floors || initial?.floors || '—'} lantai</span>
            <span>{point ? 'Titik lokasi dicatat' : 'Tanpa titik peta'}</span>
          </div>
        </div>
        {step === 2 && (
          <BuildingPhotos reportId={reportId} ownerId={reporterId} />
        )}
        <p className="owner-footnote">
          Simpan draf untuk mempertahankan catatan dan foto sebelum melanjutkan
          nanti. Dokumentasi pada pencatatan baru yang dibatalkan akan dihapus
          dari browser.
        </p>
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
                aria-describedby={
                  errors[key] ? `report-error-${key}` : undefined
                }
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
      </div>
      <div className="report-actions">
        {step > 0 && (
          <button
            type="button"
            className="ws-secondary"
            onClick={() => changeStep(step - 1)}
          >
            Sebelumnya
          </button>
        )}
        {step === 2 ? (
          <button type="submit" value="send" className="ws-primary">
            Simpan dan kirim laporan
          </button>
        ) : (
          <button type="submit" value="next" className="ws-primary">
            Lanjutkan
          </button>
        )}
        <button type="submit" value="draft" className="ws-secondary">
          Simpan draf
        </button>
        <button type="button" className="ws-secondary" onClick={onCancel}>
          Batal
        </button>
      </div>
    </form>
  );
}
