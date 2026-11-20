import type { ReactNode } from 'react';
import { validateReportRegistration } from '../../lib/reportDemo';
import type { Report } from '../../lib/reportDemo';
import BuildingPhotos from './BuildingPhotos';
import PointPreviewMap from './PointPreviewMap';
import './owner-workspace.css';
import { formatDate } from '../../lib/dateFormat';

function osmLink(latitude: number, longitude: number) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
}

type PreviewRow = {
  label: string;
  value?: ReactNode;
  // Field key checked by validateReportRegistration, for "Wajib diisi".
  field?: string;
  empty?: string;
};

export default function ReportSubmissionDetails({
  report,
  markMissing = false,
}: {
  report: Report;
  markMissing?: boolean;
}) {
  const point = report.ownerProgress?.point;
  const missing = markMissing ? validateReportRegistration(report) : {};
  const steps: [string, PreviewRow[]][] = [
    [
      'Data bangunan',
      [
        { label: 'Nama bangunan', value: report.title, field: 'title' },
        { label: 'Kawasan', value: report.location, field: 'location' },
        { label: 'Fungsi bangunan', value: report.function, field: 'function' },
        {
          label: 'Tahun pembangunan',
          value: report.year,
          empty: 'Belum diketahui',
        },
        {
          label: 'Jumlah lantai',
          value: report.floors && `${report.floors} lantai`,
          field: 'floors',
        },
        { label: 'Material utama', value: report.material, field: 'material' },
        {
          label: 'Sistem struktur',
          value: report.structure,
          field: 'structure',
        },
      ],
    ],
    [
      'Lokasi & akses',
      [
        { label: 'Alamat lengkap', value: report.address, field: 'address' },
        { label: 'Patokan', value: report.landmark, empty: 'Tidak diisi' },
        {
          label: 'Nomor kontak',
          value: report.contactPhone,
          empty: 'Tidak diisi',
        },
        {
          label: 'Titik peta',
          value: point ? (
            <a
              href={osmLink(point.latitude, point.longitude)}
              target="_blank"
              rel="noreferrer"
            >
              {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}{' '}
              <span aria-hidden="true">↗</span>
            </a>
          ) : undefined,
          empty: 'Tidak ditandai',
        },
        {
          label: 'Waktu kunjungan',
          value: report.ownerProgress?.availability
            ? `${formatDate(report.ownerProgress.availability.date)} · ${report.ownerProgress.availability.slot}${report.ownerProgress.availability.note ? ` · ${report.ownerProgress.availability.note}` : ''}`
            : undefined,
          empty: 'Belum dipilih',
        },
      ],
    ],
  ];
  const consents: [string, boolean | undefined, string][] = [
    [
      'Data boleh dipakai untuk pencatatan dan penugasan survei',
      report.demoConsent,
      'demoConsent',
    ],
    [
      'Memahami bahwa RVS penyaringan awal, bukan sertifikat aman',
      report.understandsRvs,
      'understandsRvs',
    ],
  ];
  const row = ({ label, value, field, empty }: PreviewRow) => {
    const required = !!field && !!missing[field];
    return (
      <div key={label} className={required ? 'is-missing' : undefined}>
        <dt>{label}</dt>
        <dd>
          {value ||
            (required ? (
              <span className="owner-missing">Wajib diisi</span>
            ) : (
              <span className="owner-empty-value">
                {empty ?? 'Belum diisi'}
              </span>
            ))}
        </dd>
      </div>
    );
  };
  return (
    <ol className="owner-preview-steps report-submission">
      {steps.map(([title, rows], index) => (
        <li className="owner-preview-step" key={title}>
          <h3>
            <span aria-hidden="true">{index + 1}</span>
            {title}
          </h3>
          <dl className="owner-sent-facts">{rows.map(row)}</dl>
          {title === 'Lokasi & akses' && (
            <>
              {point && <PointPreviewMap point={point} />}
              <p className="owner-preview-note">
                Alamat, patokan, dan nomor hanya terlihat oleh admin dan
                pesurvei yang ditugaskan. Data ini tidak tampil di profil
                bangunan maupun QR.
              </p>
            </>
          )}
        </li>
      ))}
      <li className="owner-preview-step is-wide">
        <h3>
          <span aria-hidden="true">3</span>
          Periksa & kirim
        </h3>
        <dl className="owner-sent-facts">
          {row({
            label: 'Catatan laporan',
            value: report.description,
            field: 'description',
          })}
          <div>
            <dt>Persetujuan</dt>
            <dd>
              <ul className="owner-consents">
                {consents.map(([text, given, field]) => (
                  <li
                    key={field}
                    className={
                      given ? 'is-given' : missing[field] ? 'is-missing' : ''
                    }
                  >
                    <span aria-hidden="true">{given ? '✓' : '–'}</span>
                    <span>
                      {text}
                      <small className="report-consent-state">
                        {given === undefined
                          ? 'Tidak tercatat'
                          : given
                            ? 'Dicentang'
                            : 'Belum dicentang'}
                      </small>
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
        <BuildingPhotos
          reportId={report.id}
          ownerId={report.reporterId}
          readOnly
        />
      </li>
    </ol>
  );
}
