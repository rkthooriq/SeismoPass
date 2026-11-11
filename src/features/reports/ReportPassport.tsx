import { useState } from 'react';
import { reportBuildingFields } from '../../lib/reportDemo';
import type { Report } from '../../lib/reportDemo';
import RvsResult from '../rvs/RvsResult';
import QrPanel from '../rvs/QrPanel';
import { observationFields, hazardFields } from '../../lib/rvs';
import '../rvs/rvs.css';

export default function ReportPassport({ report }: { report: Report }) {
  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const steps = [
    [
      'Registrasi bangunan',
      report.status === 'Draf' ? 'Draf data dasar' : 'Data dikirim',
      'Pemilik atau instansi mencatat bangunan dan memberi persetujuan.',
    ],
    [
      'Screening awal RVS',
      report.rvs ? 'Simulasi tersimpan · belum divalidasi' : 'Belum dinilai',
      report.visitDate
        ? 'Catatan kunjungan tersedia. Catatan ini bukan hasil RVS; penilaian memerlukan protokol dan supervisi ahli.'
        : 'Menunggu petugas terlatih, protokol yang disahkan, dan supervisi ahli.',
    ],
    [
      'Profil risiko digital',
      'Hasil belum tersedia',
      'Skor, kategori risiko, dan rekomendasi hanya dapat ditampilkan setelah penilaian yang sah.',
    ],
    [
      'Rujukan ahli',
      'Belum ditentukan',
      'Hanya bangunan yang diprioritaskan berdasarkan hasil screening yang dirujuk. Belum dirujuk tidak berarti aman.',
    ],
    [
      'Rencana retrofit',
      'Menunggu evaluasi ahli',
      'Ahli menentukan metode, estimasi biaya, kebutuhan material, dan prioritas. Pemilik memutuskan pelaksanaan.',
    ],
    [
      'Insentif dan evaluasi',
      'Belum tersedia',
      'Dukungan mengikuti program dan kerja sama yang tersedia. Pelaksanaan perkuatan perlu diverifikasi dan dicatat.',
    ],
  ];
  return (
    <section
      className="report-passport"
      aria-label={`Profil digital ${report.title}`}
    >
      <div className="ws-section-head">
        <div>
          <span className="ws-badge">PROFIL DIGITAL DEMO</span>
          <h3>Perjalanan bangunan</h3>
        </div>
        <span className="ws-badge">
          {report.rvs ? 'Simulasi · belum divalidasi' : 'Belum dinilai'}
        </span>
      </div>
      <dl className="report-facts">
        {reportBuildingFields.map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>
              {report[key] ||
                (key === 'year' ? 'Belum diketahui' : 'Belum diisi')}
            </dd>
          </div>
        ))}
      </dl>
      {report.rvs && (
        <details className="rvs-saved">
          <summary>Lihat input dan hasil simulasi tersimpan</summary>
          <p>Dicatat oleh {report.rvs.recordedBy}. Belum divalidasi ahli.</p>
          <RvsResult inputs={report.rvs.inputs} />
          <dl className="report-facts">
            <div>
              <dt>Tipe FEMA</dt>
              <dd>{report.rvs.inputs.buildingType}</dd>
            </div>
            <div>
              <dt>Tanah</dt>
              <dd>{report.rvs.inputs.soil}</dd>
            </div>
          </dl>
          <details>
            <summary>Data survei dan catatan yang disimpan</summary>
            <dl className="report-facts">
              {hazardFields.map(([key, label]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>
                    {report.rvs!.inputs[key] === 'DNK'
                      ? 'Belum diketahui'
                      : report.rvs!.inputs[key] === 'yes'
                        ? 'Ya'
                        : 'Tidak'}
                  </dd>
                </div>
              ))}
              {observationFields.map(([key, label]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{report.rvs!.observations[key] || 'Belum diisi'}</dd>
                </div>
              ))}
            </dl>
          </details>
          <QrPanel inputs={report.rvs.inputs} />
        </details>
      )}
      <ol className="report-journey">
        {steps.map(([title, status, description], index) => (
          <li key={title}>
            <span className="report-step-number" aria-hidden="true">
              0{index + 1}
            </span>
            <div>
              <h4>{title}</h4>
              <strong>{status}</strong>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="ws-disclaimer">
        <strong>RVS adalah penyaringan awal, bukan sertifikat aman.</strong>{' '}
        Status laporan “Selesai” hanya menutup proses administrasi; tidak
        menyelesaikan penilaian, retrofit, atau verifikasi bangunan.
      </p>
      <p>
        Penilai dan penyedia retrofit memiliki fungsi terpisah. Pemilik tidak
        diwajibkan memakai penyedia tertentu. Dukungan nonfiskal diusulkan
        sebagai fondasi pilot; ketersediaannya tetap perlu kesepakatan mitra.
      </p>
      <button
        className="ws-secondary"
        type="button"
        aria-expanded={showPublicPreview}
        onClick={() => setShowPublicPreview(!showPublicPreview)}
      >
        {showPublicPreview ? 'Tutup pratinjau QR' : 'Pratinjau informasi QR'}
      </button>
      {showPublicPreview && <QrPanel inputs={report.rvs?.inputs} />}
    </section>
  );
}
