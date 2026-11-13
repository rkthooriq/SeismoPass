import { actorRoles, getActor } from '../../lib/actorAccess';
import type { ActorRole } from '../../lib/actorAccess';

export function ActorDashboard({ role }: { role: ActorRole }) {
  const actor = getActor(role);
  const noun = 'penugasan';
  return (
    <>
      <section className="ws-feature-hero">
        <span className="ws-feature-icon" aria-hidden="true">
          {actor.symbol}
        </span>
        <span className="ws-badge">RUANG {actor.shortName.toUpperCase()}</span>
        <h2>{actor.focus}</h2>
        <p>{actor.description}</p>
      </section>
      <section className="ws-panel">
        <div className="ws-section-head">
          <h2>Ruang lingkup peran</h2>
          <a href="#/access">Lihat matriks akses ↗</a>
        </div>
        <p className="ws-muted">{actor.boundary}</p>
        <div className="actor-actions">
          {actor.actions.map(([page, label]) => (
            <a className="ws-secondary" key={page} href={`#/${page}`}>
              {label} ↗
            </a>
          ))}
        </div>
      </section>
      <section className="ws-panel ws-empty">
        <span className="ws-empty-icon" aria-hidden="true">
          {actor.symbol}
        </span>
        <h2>Belum ada {noun}</h2>
        <p>
          Ruang ini belum memiliki penugasan, keputusan, atau layanan
          operasional. Data bangunan pemilik tidak otomatis dibagikan ke peran
          ini.
        </p>
      </section>
      <section className="ws-panel">
        <h2>Sebelum layanan operasional</h2>
        <ol className="ws-timeline">
          {[
            'Tetapkan kewenangan dan kerja sama peran',
            'Verifikasi identitas dan persetujuan akses',
            'Terapkan penugasan serta otorisasi di server',
            'Uji akses dan alur bersama pengguna',
          ].map((text, i) => (
            <li key={text}>
              <span>{i + 1}</span>
              <div>
                <strong>{text}</strong>
                <p>Belum tersedia</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

export function AccessMatrix({ role }: { role: ActorRole }) {
  return (
    <>
      <section className="ws-panel">
        <span className="ws-badge">
          USULAN AKSES · BELUM MENJADI KEBIJAKAN PRODUKSI
        </span>
        <h2 className="ws-data-title">Tiap peran, ruang lingkup yang jelas.</h2>
        <p className="ws-muted">
          Aktor mengikuti sumber kebutuhan. Pembagian akun dan batas akses di
          bawah adalah usulan UI untuk ditinjau tim. Peran aktif:{' '}
          <strong>{getActor(role).name}</strong>.
        </p>
        <div className="ws-table-scroll">
          <table>
            <caption className="actor-table-caption">
              Usulan akses enam aktor SeismoPass
            </caption>
            <thead>
              <tr>
                <th>Aktor</th>
                <th>Ruang kerja</th>
                <th>Batas akses yang diusulkan</th>
              </tr>
            </thead>
            <tbody>
              {actorRoles.map((actor) => (
                <tr key={actor.id}>
                  <td>
                    <strong>{actor.name}</strong>
                    {role === actor.id && <small>Peran aktif</small>}
                  </td>
                  <td className="actor-wrap-cell">{actor.description}</td>
                  <td className="actor-wrap-cell">{actor.boundary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <aside className="ws-disclaimer">
        <p>
          <strong>Pembatasan UI bukan perlindungan data.</strong> Simulasi hanya
          menyaring halaman dan data di browser. Identitas, penugasan,
          persetujuan, dan otorisasi per bangunan harus diverifikasi di server
          sebelum layanan nyata.
        </p>
      </aside>
    </>
  );
}
