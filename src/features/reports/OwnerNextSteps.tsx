import { ownerStep, sortByOwnerTurn } from '../../lib/ownerNextStep';
import type { Report } from '../../lib/reportDemo';

export default function OwnerNextSteps({ reports }: { reports: Report[] }) {
  if (!reports.length)
    return (
      <section className="ws-panel owner-steps">
        <h2>Mulai dari sini</h2>
        <p>
          Belum ada laporan. Catat data dasar bangunan, lalu tunggu admin dan
          pesurvei menindaklanjutinya.
        </p>
        <a className="ws-primary" href="#/dashboard/new">
          Buat laporan →
        </a>
      </section>
    );
  const items = sortByOwnerTurn(reports).slice(0, 3);
  return (
    <section className="ws-panel owner-steps" aria-label="Langkah berikutnya">
      <h2>Langkah berikutnya</h2>
      <ul>
        {items.map((report) => {
          const step = ownerStep(report.status);
          return (
            <li key={report.id}>
              <span
                className={`ws-badge owner-turn ${step.turn === 'owner' ? 'is-you' : ''}`}
              >
                {step.turn === 'owner' ? 'GILIRANMU' : 'MENUNGGU'}
              </span>
              <div>
                <strong>{report.title}</strong>
                <span className="owner-step-title">{step.title}</span>
                <small>{step.text}</small>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
