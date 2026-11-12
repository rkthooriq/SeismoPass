import RvsForm from './RvsForm';
import QrPanel from './QrPanel';
import RvsResult from './RvsResult';
import { parseRvsDemoPath } from '../../lib/rvsQr';
import '../workspace/workspace.css';
import '../reports/reports.css';
import './rvs.css';

export default function RvsLab({ path }: { path: string }) {
  const shared = path.startsWith('rvs-demo') ? parseRvsDemoPath(path) : null;
  return (
    <div className="workspace report-workspace">
      <header className="report-top">
        <a href="#" className="ws-logo">
          SeismoPass
        </a>
        <a href="#/dashboard" className="ws-secondary">
          Dashboard
        </a>
        <a href="#/rvs-lab" className="ws-secondary">
          Latihan RVS
        </a>
      </header>
      <main className="ws-main">
        <div className="ws-demo-strip">
          <strong>SIMULASI PENDIDIKAN · BUKAN PENILAIAN RESMI</strong>
        </div>
        {shared ? (
          <section className="ws-panel">
            <h1>Profil simulasi SeismoPass</h1>
            <p>
              Halaman contoh QR tanpa identitas bangunan atau pemilik. Data dari
              tautan dapat diubah; tidak ada pengesahan ahli atau tanda tangan
              digital.
            </p>
            {shared.kind === 'inputs' ? (
              <RvsResult inputs={shared.inputs} />
            ) : (
              <>
                <p>
                  {shared.kind === 'invalid'
                    ? 'Tautan simulasi tidak valid atau versinya tidak didukung. Tidak ada hasil yang ditampilkan.'
                    : 'Belum ada hasil RVS. Ini contoh halaman tujuan QR.'}
                </p>
                <p className="ws-disclaimer">
                  RVS adalah penyaringan awal, bukan sertifikat aman.
                </p>
              </>
            )}
            <a className="ws-primary" href="#/rvs-lab">
              Coba input RVS
            </a>
          </section>
        ) : (
          <>
            <section className="ws-panel">
              <h1>Latihan input dan hasil RVS</h1>
              <p>
                Latihan ini berdiri sendiri dan tidak terkait bangunan nyata.
                Untuk menyimpan input pada laporan, masuk sebagai pesurvei, buka
                laporan yang ditugaskan admin, pilih Mulai survei, lalu isi
                formulir RVS di detailnya.
              </p>
              <RvsForm />
            </section>
            <QrPanel />
          </>
        )}
      </main>
    </div>
  );
}
