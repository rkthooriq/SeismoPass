import { useState } from 'react';
import { reportBuildingFields } from '../../lib/reportDemo';
import type { Report } from '../../lib/reportDemo';
import SavedRvsResult from '../rvs/SavedRvsResult';
import QrPanel from '../rvs/QrPanel';
import '../rvs/rvs.css';

// limitsOnly renders only the saved RVS simulation (with its QR preview),
// for the owner's closed report: that page lists the status and the RVS
// limits itself, so the passport's heading, facts and journey are left out.
export default function ReportPassport({
  report,
  limitsOnly = false,
}: {
  report: Report;
  limitsOnly?: boolean;
}) {
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
  const saved = report.rvs && (
    <SavedRvsResult record={report.rvs} reportTitle={report.title} />
  );
  if (limitsOnly) return saved || null;
  return (
    <section
      className="report-passport"
      aria-label={`Profil digital ${report.title}`}
    >
      <div className="ws-section-head">
        <div>
          <span className="ws-badge">PROFIL DIGITAL</span>
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
      {saved}
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
